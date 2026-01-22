/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import * as net from 'node:net'

import { CustomResourceAttributes } from '@ibm/telemetry-attributes-js'
import { ConfigSchema } from '@ibm/telemetry-config-schema'
import configSchemaJson from '@ibm/telemetry-config-schema/config.schema.json' assert { type: 'json' }

import { IbmTelemetry } from '../ibm-telemetry.js'
import { processFile } from '../scopes/js/process-file.js'
import { isCdnLink } from '../scopes/wc/utils/is-cdn-link.js'
import { parseCdnImport, parseCdnImportWithExpansion } from '../scopes/wc/utils/parse-cdn-import.js'
import { WcElementAccumulator } from '../scopes/wc/wc-element-accumulator.js'
import { wcNodeHandlerMap } from '../scopes/wc/wc-node-handler-map.js'
import { hash } from './anonymize/hash.js'
import { fetchCdnPackageConfig } from './cdn-config-fetcher.js'
import { CdnRegistry } from './cdn-registry.js'
import { ConfigValidator } from './config-validator.js'
import { Environment, EnvironmentConfig } from './environment.js'
import { getRepositoryRoot } from './get-repository-root.js'
import { getTrackedSourceFiles } from './get-tracked-source-files.js'
import { GitInfoProvider } from './git-info-provider.js'
import { Loggable } from './log/loggable.js'
import type { Logger } from './log/logger.js'
import { Trace } from './log/trace.js'
import { parseYamlFile, parseYamlString } from './parse-yaml-file.js'

const MAX_RETRIES = 3
const MAX_BACKLOG = 64

// Objects of this type will have hashed values
interface GitInfo {
  [CustomResourceAttributes.ANALYZED_COMMIT]: string
  [CustomResourceAttributes.ANALYZED_HOST]: string | undefined
  [CustomResourceAttributes.ANALYZED_OWNER]: string | undefined
  [CustomResourceAttributes.ANALYZED_PATH]: string
  [CustomResourceAttributes.ANALYZED_OWNER_PATH]: string
  [CustomResourceAttributes.ANALYZED_REPOSITORY]: string | undefined
  [CustomResourceAttributes.ANALYZED_REFS]: string[]
}

interface LogPayload {
  date: string
  message: string
  projectId: string
  gitInfo: GitInfo
  environment: EnvironmentConfig
  error?:
    | {
        message?: string
        stack?: string | undefined
      }
    | {
        message?: string
        stderr?: string | undefined
      }
    | string
  isCompleted?: boolean
  scanId: string
  totalPackages?: number
  totalDuration?: number
}

interface Work {
  cwd: string
  configFilePath: string
  parsedConfig?: Record<string, unknown> & ConfigSchema
}

import * as os from 'node:os'
import * as path from 'node:path'

import * as fs from 'fs'

const LOCK_FILE = path.join(os.tmpdir(), 'ibmtelemetry.lock')
const WC_LOCK_FILE = path.join(os.tmpdir(), 'ibmtelemetry-wc.lock')

const IPC_ADDR = path.join(os.tmpdir(), 'ibmtelemetry-ipc')
const WC_IPC_ADDR = path.join(os.tmpdir(), 'ibmtelemetry-wc-ipc')

/**
 * Encapsulates all logic for orchestrating the running of multiple telemetry processes.
 */
export class ChooChooTrain extends Loggable {
  private readonly workQueue: Work[] = []
  private ipcAddr: string
  private analyzedCommit?: string
  private analyzedPath?: string
  private configPath: string
  private date?: string
  private environment?: Environment
  private gitInfo?: GitInfo
  private parsedConfig?: Record<string, unknown> & ConfigSchema
  private projectId?: string
  private scanId?: string
  private logEndpoint?: string
  private totalDuration?: number
  private totalPackages?: number
  private isConductor: boolean

  /**
   * Constructs a new ChooChooTrain instance.
   *
   * @param environment - Environment variable configuration for this run.
   * @param configFilePath - Path to a config file.
   * @param logger - A logger instance.
   */
  public constructor(environment: Environment, configFilePath: string, logger: Logger) {
    super(logger)

    this.isConductor = false
    this.ipcAddr = IPC_ADDR

    this.logger.debug('Working environment:', environment.cwd)
    this.configPath = configFilePath

    this.workQueue.push({ cwd: environment.cwd, configFilePath })
  }

  /**
   * Establishes ourself as either the conductor or a client.
   * Attempts connection to an existing conductor up to `MAX_RETRIES` times.
   * If not connection is made, it attempts to become a client instead.
   *
   * If we are the conductor, run all work in the queue (including our work).
   * If we are a client, send our work to the conductor.
   */
  public async run(): Promise<void> {
    let connection: net.Socket | net.Server | undefined
    let lockFileName: string = LOCK_FILE

    this.logger.debug('Starting ChooChooTrain Run()', this.configPath)

    this.parsedConfig = await this.getPackageData(this.configPath)

    // is now using the Web Components server
    const wc = this.parsedConfig?.collect?.wc

    if (wc !== undefined) {
      this.logger.debug('Package has web components scope')
      this.ipcAddr = WC_IPC_ADDR
      lockFileName = WC_LOCK_FILE
    }

    // Try to acquire the lock
    try {
      const fd = fs.openSync(lockFileName, 'wx') // atomic creation
      fs.writeSync(fd, `${process.pid}`)
      fs.closeSync(fd)
      this.isConductor = true
      this.logger.debug('Created lock file', lockFileName)
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code === 'EEXIST') {
        this.isConductor = false // another process already owns the lock
        this.logger.debug('Lock file already exists:', lockFileName)
      } else {
        throw err
      }
    }

    try {
      if (this.isConductor) {
        try {
          this.logger.debug('Creating server socket...')
          connection = await this.createServerSocket(this.handleServerConnection.bind(this))
        } catch (err) {
          // Fallback to client if someone else created server first
          if ((err as NodeJS.ErrnoException)?.code === 'EADDRINUSE') {
            this.logger.debug('Address is in use, however we try to connect')
            try {
              connection = await this.tryConnectToServerWithBackoff()
            } catch {
              // give up 🥲
              this.logger.debug('Could not establish server or client connection. Exiting')
              return
            }
          } else if (err instanceof Error) {
            this.logger.error(err)
            return
          }
        }
      } else {
        try {
          connection = await this.tryConnectToServerWithBackoff()
        } catch {
          this.logger.debug('Could not connect to conductor. Exiting')
          return
        }
      }

      if (!connection) {
        this.logger.debug('Could not establish server or client connection. Exiting')
        return
      }

      try {
        if (connection instanceof net.Server) {
          await this.doWork(connection)
        } else {
          await this.sendWorkToConductor(connection)
        }
      } finally {
        await this.logger.close()
      }
    } finally {
      // Always clean up lock and IPC files if we are the conductor
      if (this.isConductor) {
        this.cleanupLockFiles(lockFileName)
      }
    }
  }

  @Trace({ argFormatter: () => '[onConnect]' })
  private async createServerSocket(onConnect: (socket: net.Socket) => void): Promise<net.Server> {
    return new Promise((resolve, reject) => {
      const server = net.createServer({})
      this.logger.debug('Server created at', this.ipcAddr)

      server.on('connection', onConnect)
      server.on('listening', () => {
        resolve(server)
      })

      server.on('error', (error: Error) => {
        this.sendLogs(
          `Conductor experienced error on project ${this.projectId} against ` +
            `analyzed path ${this.analyzedPath} at commit ${this.analyzedCommit}`,
          error
        )
          .then(() => reject(error))
          .catch(() => reject(error)) // in case sending logs fails, we still reject promise
      })

      // Set up signal handler to gracefully close the IPC socket
      process.on('exit', () => this.handleSignal(server, 'exit'))
      process.on('SIGINT', () => this.handleSignal(server, 'SIGINT'))
      process.on('SIGTERM', () => this.handleSignal(server, 'SIGTERM'))

      server.listen(this.ipcAddr, MAX_BACKLOG)
    })
  }

  private async tryConnectToServerWithBackoff(): Promise<net.Socket | undefined> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await this.createClientSocket()
      } catch {
        // randomized delay to avoid all connecting at the same time
        await new Promise((r) => setTimeout(r, Math.random() * 50 + 50))
      }
    }
    this.logger.error('Unable to connect to conductor after retries')
    return
  }

  @Trace()
  private createClientSocket(): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
      const socket = net.connect(this.ipcAddr)

      socket.on('connect', () => {
        this.logger.debug('Client connected to conductor at', this.ipcAddr)
        resolve(socket)
      })

      socket.on('error', (error: Error) => {
        this.sendLogs(
          `Wagon experienced error on project ${this.projectId} against ` +
            `analyzed path ${this.analyzedPath} at commit ${this.analyzedCommit}`,
          error
        )
          .then(() => reject(error))
          .catch(() => reject(error)) // in case sending logs fails, we still reject promise
      })
    })
  }

  @Trace({ argFormatter: () => '[socket]' })
  private handleServerConnection(socket: net.Socket) {
    let buf = ''

    socket.on('data', (data) => {
      buf += data.toString()
    })

    socket.on('close', () => {
      const obj = JSON.parse(buf)

      this.workQueue.push(obj)
    })
  }

  /**
   * We are the client. Send work through the IPC pipe to the conductor.
   *
   * @param socket - Client socket connection to use to communicate to server.
   * @returns Void.
   */
  @Trace({ argFormatter: () => '[socket]' })
  private sendWorkToConductor(socket: net.Socket) {
    return new Promise((resolve, reject) => {
      const work = this.workQueue.shift()

      if (work !== undefined && this.parsedConfig !== undefined) {
        work['parsedConfig'] = this.parsedConfig
      }

      this.logger.debug(`Sending work through IPC ${this.ipcAddr}:  ${JSON.stringify(work)}`)

      socket.on('close', resolve)
      socket.on('error', (error: Error) => {
        this.sendLogs(
          `Wagon experienced error sending work to conductor on project ${this.projectId} ` +
            `against analyzed path ${this.analyzedPath} at commit ${this.analyzedCommit}`,
          error
        )
          .then(() => reject(error))
          .catch(() => reject(error)) // in case sending logs fails, we still reject promise
      })
      socket.on('timeout', reject)

      socket.write(Buffer.from(JSON.stringify(work)))
      socket.end()
    })
  }

  @Trace({ argFormatter: () => '[server]' })
  private async doWork(server: net.Server) {
    this.logger.debug(
      'We are the conductor of the choo-choo train. Running all available work in queue'
    )

    const start = performance.now()

    // Both server and clients will have the same data due to being provided from git,
    // thus we obtain the data from the conductor's first job before the loop
    const conductorWork = this.workQueue?.[0]
    if (conductorWork && this.parsedConfig !== undefined) {
      this.environment = new Environment({ cwd: conductorWork.cwd })
      this.gitInfo = await this.getRepoData(conductorWork)
      conductorWork['parsedConfig'] = this.parsedConfig

      this.sendLogs(
        `The ChooChooTrain ride for analyzed path ${this.analyzedPath} at commit ${this.analyzedCommit} has started`
      )
    }

    // Pre-scan HTML files for CDN imports in parallel with processing packages
    // This will check if packages are installed and defer CDN metrics if needed
    const cdnPrescanPromise = (async () => {
      let cdnPackages = 0
      const startTime = performance.now()
      cdnPackages = await this.preScanHtmlForCdn()
      const endTime = performance.now()
      const duration = endTime - startTime
      this.logger.debug(`preScanHtmlForCdn() took ${duration.toFixed(2)}ms`)
      return cdnPackages
    })()

    // Initialize package counter
    this.totalPackages = 0

    // Consume work until the queue is empty
    while (this.workQueue.length > 0) {
      this.logger.debug('Queue length', this.workQueue.length)
      this.logger.debug('Current queue:', JSON.stringify(this.workQueue))

      const currentWork = this.workQueue.shift()
      if (!currentWork) {
        return
      }

      this.logger.debug('Current work is ', JSON.stringify(currentWork))

      const config = currentWork.parsedConfig
      this.environment = new Environment({ cwd: currentWork.cwd })

      if (config !== undefined) {
        // collect for current work
        await this.collect(this.environment, config)
        this.totalPackages++
      }
    }

    // Wait for CDN prescan to complete and add to total packages
    const cdnPackages = await cdnPrescanPromise
    this.totalPackages += cdnPackages

    this.totalDuration = Number((performance.now() - start).toFixed(2))

    this.sendLogs(
      `The ChooChooTrain ride with ${this.totalPackages} packages at analyzed path ${this.analyzedPath} ` +
        `at commit ${this.analyzedCommit} took ${this.totalDuration}ms`,
      undefined,
      true
    )

    server.close(() => {
      this.logger.debug('Server closing')
      // Lock cleanup is now handled by the finally block in run()
      // This ensures cleanup happens even if doWork() completes normally
    })
  }

  @Trace()
  private async getRepoData(work: Work) {
    const gitInfo = await new GitInfoProvider(work.cwd, this.logger).getGitInfo()

    const { repository, commitHash, commitTags, commitBranches } = gitInfo
    const refs = [...commitTags, ...commitBranches]
    const analyzedPath = `${repository.host ?? ''}/${
      repository.owner ?? ''
    }/${repository.repository ?? ''}`

    this.date = new Date().toISOString()
    const simpleDate = this.date.split('T')[0] as string
    this.scanId = simpleDate + analyzedPath + commitHash + refs

    const scanHash = createHash('sha256')
    scanHash.update(this.scanId)
    this.scanId = scanHash.digest('hex')

    // saving data to hash later
    const envName = this.environment?.name

    const hashedData = hash(
      {
        [CustomResourceAttributes.ANALYZED_COMMIT]: commitHash,
        [CustomResourceAttributes.ANALYZED_HOST]: repository.host,
        [CustomResourceAttributes.ANALYZED_OWNER]: repository.owner,
        [CustomResourceAttributes.ANALYZED_PATH]: analyzedPath,
        [CustomResourceAttributes.ANALYZED_OWNER_PATH]: `${repository.host ?? ''}/${
          repository.owner ?? ''
        }`,
        [CustomResourceAttributes.ANALYZED_REPOSITORY]: repository.repository,
        [CustomResourceAttributes.ANALYZED_REFS]: refs,
        [CustomResourceAttributes.ENVIRONMENT_NAME]: envName,
        [CustomResourceAttributes.SCAN_ID]: this.scanId
      },
      [
        CustomResourceAttributes.ANALYZED_COMMIT,
        CustomResourceAttributes.ANALYZED_HOST,
        CustomResourceAttributes.ANALYZED_OWNER,
        CustomResourceAttributes.ANALYZED_PATH,
        CustomResourceAttributes.ANALYZED_OWNER_PATH,
        CustomResourceAttributes.ANALYZED_REPOSITORY,
        CustomResourceAttributes.ANALYZED_REFS
      ]
    )

    this.analyzedCommit = hashedData[CustomResourceAttributes.ANALYZED_COMMIT]
    this.analyzedPath = hashedData[CustomResourceAttributes.ANALYZED_PATH]

    return hashedData
  }

  @Trace()
  private async getPackageData(configFilePath: string) {
    const config = existsSync(configFilePath)
      ? await parseYamlFile(configFilePath)
      : parseYamlString(configFilePath)
    const configValidator: ConfigValidator = new ConfigValidator(configSchemaJson, this.logger)
    configValidator.validate(config)

    this.projectId = config.projectId
    if (this.logEndpoint === undefined) {
      this.logEndpoint = config.endpoint.split('/metrics')[0] + '/logs'
      this.logger.debug('Log endpoint: ' + this.logEndpoint)
    }

    return config
  }

  /**
   * Parses and validates a config file without modifying instance properties.
   * Used for CDN configs to avoid overwriting conductor's projectId and endpoint.
   *
   * @param configFilePath - Path to config file or YAML string.
   * @returns Parsed and validated config object.
   */
  @Trace()
  private async parseAndValidateConfig(configFilePath: string) {
    const config = existsSync(configFilePath)
      ? await parseYamlFile(configFilePath)
      : parseYamlString(configFilePath)
    const configValidator: ConfigValidator = new ConfigValidator(configSchemaJson, this.logger)
    configValidator.validate(config)

    return config
  }

  /**
   * This is the main entrypoint for telemetry collection.
   *
   * @param environment - Environment variable configuration for this run.
   * @param config - Parsed configFile object.
   */
  @Trace()
  private async collect(
    environment: Environment,
    config: Record<string, unknown> & ConfigSchema,
    cdnMode?: boolean
  ) {
    const ibmTelemetry = new IbmTelemetry(
      config,
      environment,
      this.gitInfo ?? {},
      this.logger,
      this.date ?? new Date().toISOString(),
      cdnMode
    )

    try {
      await ibmTelemetry.run()
    } catch (err) {
      // Catch any exception thrown, log it, and quietly exit
      if (err instanceof Error) {
        this.logger.error(err)
        this.sendLogs('Telemetry runner error: ', err)
      } else {
        this.logger.error(String(err))
        this.sendLogs('Telemetry runner error: ', String(err))
      }
    }
  }

  /**
   * Cleans up lock file and IPC socket file.
   * Safe to call multiple times - ignores errors if files don't exist.
   *
   * @param lockFileName - Path to the lock file to remove.
   */
  private cleanupLockFiles(lockFileName: string): void {
    try {
      if (fs.existsSync(lockFileName)) {
        fs.unlinkSync(lockFileName)
        this.logger.debug('Removed lock file', lockFileName)
      }
      if (fs.existsSync(this.ipcAddr)) {
        fs.unlinkSync(this.ipcAddr)
        this.logger.debug('Removed IPC socket', this.ipcAddr)
      }
    } catch (err) {
      // Ignore cleanup errors - best effort
      if (err instanceof Error) {
        this.logger.debug('Error during lock cleanup (ignored):', err.message)
      } else {
        this.logger.debug('Error during lock cleanup (ignored):', String(err))
      }
    }
  }

  @Trace()
  private handleSignal(server: net.Server, type: string) {
    if (this.isConductor) {
      // Determine which lock file to clean up based on IPC address
      const lockFileName = this.ipcAddr === WC_IPC_ADDR ? WC_LOCK_FILE : LOCK_FILE
      this.cleanupLockFiles(lockFileName)
    }

    server.close((err) => {
      if (err && type !== 'exit') {
        this.sendLogs(`Process ${type} signal error: `, err).catch((sendErr) => {
          if (sendErr instanceof Error) {
            this.logger.error(sendErr)
          } else {
            this.logger.error(String(sendErr))
          }
        })
      }
    })
  }

  /**
   * Checks which packages are listed in the root package.json dependencies.
   * Marks these packages in the CDN registry so we can skip CDN metrics for them.
   *
   * @param root - Root directory of the project.
   */
  @Trace()
  private async checkRootDependencies(root: string): Promise<void> {
    const registry = CdnRegistry.getInstance()

    try {
      const { readFile } = await import('node:fs/promises')
      const { join } = await import('node:path')

      // Read the root package.json
      const packageJsonPath = join(root, 'package.json')
      const packageJsonContent = await readFile(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(packageJsonContent)

      // Collect all dependencies (dependencies, devDependencies, peerDependencies, optionalDependencies)
      const allDependencies = new Set<string>()

      if (packageJson.dependencies) {
        Object.keys(packageJson.dependencies).forEach((dep) => allDependencies.add(dep))
      }
      if (packageJson.devDependencies) {
        Object.keys(packageJson.devDependencies).forEach((dep) => allDependencies.add(dep))
      }
      if (packageJson.peerDependencies) {
        Object.keys(packageJson.peerDependencies).forEach((dep) => allDependencies.add(dep))
      }
      if (packageJson.optionalDependencies) {
        Object.keys(packageJson.optionalDependencies).forEach((dep) => allDependencies.add(dep))
      }

      // Mark all dependencies as installed in the registry
      for (const pkg of allDependencies) {
        registry.markPackageAsInstalled(pkg)
      }

      this.logger.debug(`Found ${allDependencies.size} packages in package.json dependencies`)
    } catch (error) {
      // If we can't read package.json, we'll just process all CDN metrics immediately
      this.logger.debug('Could not read package.json, will process all CDN metrics immediately')
      if (error instanceof Error) {
        this.logger.debug(error.message)
      }
    }
  }

  /**
   * Pre-scans HTML files for CDN imports before processing packages.
   * This ensures CDN usage is captured even when WC packages aren't installed.
   * Runs only once per conductor process. Reuses existing WC infrastructure.
   *
   * If a CDN package is also installed via npm, the CDN metrics will be deferred
   * and appended when the installed package is processed to avoid rate limiting.
   */
  @Trace()
  private async preScanHtmlForCdn(): Promise<number> {
    const registry = CdnRegistry.getInstance()
    let totalCdnPackages = 0

    // Attempt to claim the pre-scan work
    const shouldRunPreScan = registry.claimPreScan()
    if (!shouldRunPreScan) {
      this.logger.debug(
        'HTML CDN pre-scan already completed or in progress by another conductor, skipping'
      )
      return 0
    }

    this.logger.debug('Starting HTML CDN pre-scan at conductor level')

    try {
      if (!this.environment) {
        this.logger.debug('Environment not initialized, skipping CDN pre-scan')
        return 0
      }

      // Get repository root for file discovery
      const root = await getRepositoryRoot(this.environment.cwd, this.logger)

      // Check which packages are installed by examining the dependency tree
      await this.checkRootDependencies(root)

      // Find all tracked HTML files in the project
      // Note: We use getTrackedSourceFiles directly here because we want ALL HTML files
      // regardless of package dependencies, unlike findRelevantSourceFiles which filters
      // based on installed packages
      const htmlFiles = await getTrackedSourceFiles(this.environment.cwd, root, this.logger, [
        '.html',
        '.htm'
      ])

      if (htmlFiles.length === 0) {
        this.logger.debug('No HTML files found for CDN pre-scan')
        registry.releasePreScan()
        return 0
      }

      this.logger.debug(`Found ${htmlFiles.length} HTML files for CDN pre-scan`)

      // Group elements and CDN imports by package
      const packageData = new Map<string, { elements: any[]; cdnImports: any[] }>()

      // Process each HTML file using existing WC infrastructure
      for (const htmlFile of htmlFiles) {
        let sourceFile
        try {
          sourceFile = await htmlFile.createSourceFile()
        } catch {
          this.logger.debug(`Failed to create source file for ${htmlFile.fileName}`)
          continue
        }
        const accumulator = new WcElementAccumulator()

        // Reuse existing processFile with WC node handlers
        processFile(accumulator, sourceFile, wcNodeHandlerMap, this.logger)

        // Extract CDN imports from script sources
        const cdnLinks = accumulator.scriptSources.filter((src) => isCdnLink(src))

        // Filter to only non-installed packages BEFORE expanding
        const cdnLinksToExpand = cdnLinks.filter((src) => {
          const basicImport = parseCdnImport(src)
          return basicImport.package && !registry.isPackageInstalled(basicImport.package)
        })

        this.logger.debug(
          `Found ${cdnLinks.length} CDN links, expanding ${cdnLinksToExpand.length} ` +
            `(skipped ${cdnLinks.length - cdnLinksToExpand.length} for installed packages)`
        )

        // Expand each CDN import individually to keep them separate
        for (let i = 0; i < cdnLinksToExpand.length; i++) {
          const cdnUrl = cdnLinksToExpand[i]
          if (!cdnUrl) continue

          // Parse basic import info to get package and version
          const basicImport = parseCdnImport(cdnUrl)

          // Fetch telemetry config to resolve the version (e.g., "v2/canary" -> "2.46.0")
          // This call is cached, so the later call at line ~801 will hit the cache
          const { resolvedVersion } = await fetchCdnPackageConfig(
            basicImport.package,
            basicImport.version,
            this.logger
          )

          this.logger.debug(
            `Resolved CDN version ${basicImport.version} to ${resolvedVersion} for ${basicImport.package}`
          )

          // Pass the collector endpoint and resolved version for efficient component map fetching
          const expandedImports = await parseCdnImportWithExpansion(
            cdnUrl,
            this.logger,
            this.logEndpoint,
            resolvedVersion
          )

          // Filter valid imports
          const validExpandedImports = expandedImports.filter((cdn) => cdn.package && cdn.version)

          if (validExpandedImports.length > 0) {
            // Register each CDN URL's expanded imports separately
            // This keeps components from different URLs isolated
            registry.registerCdnImports(htmlFile.fileName, validExpandedImports)
            registry.registerExpandedCdnImports(htmlFile.fileName, validExpandedImports)

            this.logger.debug(
              `Registered ${validExpandedImports.length} expanded CDN imports for ${cdnUrl}`
            )

            // Group by package for metric collection
            for (const cdnImport of validExpandedImports) {
              if (!packageData.has(cdnImport.package)) {
                packageData.set(cdnImport.package, { elements: [], cdnImports: [] })
              }
              const pkgData = packageData.get(cdnImport.package)
              if (!pkgData) continue
              pkgData.cdnImports.push(cdnImport)
              pkgData.elements.push(...accumulator.elements)
            }
          }
        }
      }

      registry.markPreScanCompleted()
      this.logger.debug('HTML CDN pre-scan completed at conductor level')

      if (registry.hasCdnImports()) {
        const packageVersions = registry.getDiscoveredPackageVersions()
        this.logger.debug(
          `Discovered CDN package versions: ${packageVersions.map((pv) => `${pv.package}@${pv.version}`).join(', ')}`
        )

        // Group CDN versions by package to consolidate into single payload
        const packageVersionsMap = new Map<string, string[]>()
        for (const { package: pkg, version } of packageVersions) {
          if (!packageVersionsMap.has(pkg)) {
            packageVersionsMap.set(pkg, [])
          }
          packageVersionsMap.get(pkg)?.push(version)
        }

        // this.logger.debug(
        //   'Current CDN package version map',
        //   JSON.stringify(Object.fromEntries(packageVersionsMap), undefined, 2)
        // )

        // this.logger.debug(
        //   `Package data`,
        //   JSON.stringify(Object.fromEntries(packageData), undefined, 2)
        // )

        // Process each unique package
        for (const [pkg, versions] of packageVersionsMap.entries()) {
          this.logger.debug(`Processing CDN package: ${pkg} with versions: ${versions.join(', ')}`)

          // Check if this package is installed via npm
          const isInstalled = registry.isPackageInstalled(pkg)

          if (isInstalled) {
            this.logger.debug(
              `Package ${pkg} is installed via npm. Skipping CDN metrics (will be captured via npm install).`
            )

            // Skip this package entirely - it will be processed when the installed package runs
            continue
          }

          this.logger.debug(`Package ${pkg} is NOT installed. Processing CDN metrics immediately.`)

          // Fetch configs and resolve versions for ALL versions upfront
          const configs: Array<{ version: string; config: any; hasWc: boolean }> = []

          for (const cdnVersion of versions) {
            const { config, resolvedVersion } = await fetchCdnPackageConfig(
              pkg,
              cdnVersion,
              this.logger
            )

            this.logger.debug(
              `CDN attribute config for ${pkg}@${cdnVersion} (resolved: ${resolvedVersion})`
            )

            // Update all CDN imports for this package@version with the resolved version
            registry.updateCdnImportVersions(pkg, cdnVersion, resolvedVersion)

            // Parse and store each config
            if (config) {
              try {
                const parsedConfig = await this.parseAndValidateConfig(config)
                const hasWc = parsedConfig?.collect?.wc !== undefined
                configs.push({ version: resolvedVersion, config: parsedConfig, hasWc })
                this.logger.debug(`Config for ${pkg}@${resolvedVersion} has WC scope: ${hasWc}`)
              } catch (error) {
                this.logger.debug(
                  `Failed to parse config for ${pkg}@${resolvedVersion}: ${String(error)}`
                )
              }
            }
          }

          // Find configs with WC scope
          // Find configs with WC scope - we need at least one to process WC metrics
          const configsWithWc = configs.filter((c) => c.hasWc)

          if (configsWithWc.length === 0) {
            this.logger.debug(
              `No configs with WC scope found for ${pkg}, skipping (npm metrics will be collected via npm scope)`
            )
            continue
          }

          // Enable CDN-only mode ONCE for the entire package (not per version)
          registry.enableCdnOnlyMode(pkg, versions[0] ?? '')
          this.logger.debug(`Enabled CDN-only mode for package: ${pkg}`)

          // Merge all WC configs to get the union of all allowed attributes
          const mergedConfig = configsWithWc[0]?.config
          if (!mergedConfig) {
            this.logger.debug(`No valid config found for ${pkg}`)
            continue
          }

          // Merge allowedAttributeNames and allowedAttributeStringValues from all configs
          const allAllowedAttributeNames = new Set<string>()
          const allAllowedAttributeStringValues = new Set<string>()

          for (const { config } of configsWithWc) {
            const wcConfig = config?.collect?.wc
            if (wcConfig?.elements?.allowedAttributeNames) {
              wcConfig.elements.allowedAttributeNames.forEach((name: string) =>
                allAllowedAttributeNames.add(name)
              )
            }
            if (wcConfig?.elements?.allowedAttributeStringValues) {
              wcConfig.elements.allowedAttributeStringValues.forEach((value: string) =>
                allAllowedAttributeStringValues.add(value)
              )
            }
          }

          // Apply merged attributes to the config
          if (mergedConfig.collect?.wc?.elements) {
            mergedConfig.collect.wc.elements.allowedAttributeNames =
              Array.from(allAllowedAttributeNames)
            mergedConfig.collect.wc.elements.allowedAttributeStringValues = Array.from(
              allAllowedAttributeStringValues
            )
          }

          this.logger.debug(
            `Merged ${configsWithWc.length} WC configs for ${pkg}: ` +
              `${allAllowedAttributeNames.size} total attribute names, ` +
              `${allAllowedAttributeStringValues.size} total string values`
          )

          // Process CDN metrics for ALL versions in a SINGLE collection burst
          if (mergedConfig && this.environment) {
            // Filter config to only include WC and NPM scopes for CDN packages
            const wc = mergedConfig?.collect?.wc
            const npm = mergedConfig?.collect?.npm

            if (wc || npm) {
              mergedConfig.collect = {}
              if (wc) {
                mergedConfig.collect.wc = wc
              }
              if (npm) {
                mergedConfig.collect.npm = npm
              }

              // Testing purpose only
              if (1 + 1 == 2) {
                mergedConfig.endpoint = 'http://localhost:3000/v1/metrics'
              }
              this.logger.debug(`Collecting for package ${pkg} (all versions in single burst)`)

              // This single collect() call will process ALL versions of the package
              await this.collect(this.environment, mergedConfig, true)
            }
          }

          // Disable CDN-only mode after collection completes
          registry.disableCdnOnlyMode()
          this.logger.debug(`Disabled CDN-only mode for package: ${pkg}`)

          // Only count once per package, not per version
          totalCdnPackages++
          this.logger.debug('Scope succeeded: cdn')
        }
        return totalCdnPackages
      } else {
        this.logger.debug('No CDN imports found in HTML files')
      }

      // Mark pre-scan as completed
      registry.releasePreScan()
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error)
      } else {
        this.logger.error(`HTML CDN pre-scan failed: ${String(error)}`)
      }
      // Mark as completed even on error to avoid retrying
      registry.releasePreScan()
      return totalCdnPackages
    }
    return totalCdnPackages
  }

  /**
   * This function handles sending logs to the collector.
   * There are two types of logs this function can send out:
   *   1. ChooChooTrain start and end logs
   *   2. Error logs.
   *
   * @param message - The message to send to collector.
   * @param error - The optional error that caused the train to crash.
   * @param isCompleted - The boolean to signify if ride is over.
   */
  @Trace()
  private async sendLogs(message: string, error?: Error | string, isCompleted: boolean = false) {
    if (
      this.date === undefined ||
      this.logEndpoint === undefined ||
      this.gitInfo === undefined ||
      this.projectId === undefined ||
      this.scanId === undefined ||
      this.environment === undefined
    ) {
      return
    }

    // Necessary payload data
    const payload: LogPayload = {
      date: this.date,
      environment: this.environment.getConfig(),
      gitInfo: this.gitInfo,
      message: message,
      projectId: this.projectId,
      scanId: this.scanId,
      isCompleted: isCompleted
    }

    // Conditional payload data
    if (this.totalDuration !== undefined && this.totalPackages !== undefined) {
      payload.totalDuration = this.totalDuration
      payload.totalPackages = this.totalPackages
    }

    if (error != undefined) {
      if (error instanceof Error) {
        payload.error = {
          message: error.message
        }
      } else {
        payload.error = error
      }
    }

    this.logger.debug('Current log payload: ', JSON.stringify(payload))

    try {
      const response = await fetch(this.logEndpoint ?? '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        this.logger.error(`Failed to send log: ${response.statusText}`)
      }
    } catch (sendErr) {
      if (sendErr instanceof Error) {
        this.logger.error(sendErr)
      } else {
        this.logger.error(String(sendErr))
      }
    }
  }
}

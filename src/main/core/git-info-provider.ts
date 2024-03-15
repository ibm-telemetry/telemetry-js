/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Logger } from './log/logger.js'
import { Trace } from './log/trace.js'
import { runCommand } from './run-command.js'
import { tokenizeRepository } from './tokenize-repository.js'

/**
 * Instantiable class capable of collecting info about a surrounding git environment.
 */
export class GitInfoProvider {
  private readonly cwd: string
  private readonly logger: Logger

  /**
   * Constructs a new telemetry collector.
   *
   * @param cwd - Current working directory in which to run the git commands.
   * @param logger - A logger instance.
   */
  public constructor(cwd: string, logger: Logger) {
    this.cwd = cwd
    this.logger = logger
  }

  /**
   * Gets git-related information for the provided working directory.
   *
   * @returns An object containing git info.
   */
  @Trace()
  public async getGitInfo() {
    // TODO: handle non-existent remote
    const gitOrigin = (await runCommand('git remote get-url origin', this.logger)).stdout
    const commitHash = (await runCommand('git rev-parse HEAD', this.logger)).stdout
    const commitBranches = await this.getCommitBranches(commitHash, this.cwd, this.logger)
    const commitTags = await this.getCommitTags(commitHash, this.cwd, this.logger)
    const repository = tokenizeRepository(gitOrigin)

    return { gitOrigin, commitHash, commitBranches, commitTags, repository }
  }

  /**
   * Finds and returns the list of branches that point to the HEAD commit.
   *
   * @param commitHash - The hash of the commit to obtain branches for.
   * @param cwd - Current working directory to use as the basis for finding the branches. This
   * is an absolute path.
   * @param logger - Logger instance.
   * @throws An exception if no usable branch data was obtained.
   * @returns The list of branches that point to the head commit, as an array.
   */
  private async getCommitBranches(
    commitHash: string,
    cwd: string,
    logger: Logger
  ): Promise<string[]> {
    const allBranches = (
      await runCommand(
        `git branch --points-at=${commitHash} --format='%(refname:short)'`,
        logger,
        { cwd },
        true
      )
    ).stdout
      .split(/\r?\n/g)
      .filter((file) => file !== '')

    return allBranches
  }

  /**
   * Finds and returns the list of branches that point to the HEAD commit.
   *
   * @param commitHash - The hash of the commit to obtain tags for.
   * @param cwd - Current working directory to use as the basis for finding the branches. This
   * is an absolute path.
   * @param logger - Logger instance.
   * @throws An exception if no usable branch data was obtained.
   * @returns The list of branches that point to the head commit, as an array.
   */
  private async getCommitTags(commitHash: string, cwd: string, logger: Logger): Promise<string[]> {
    const allTags = (
      await runCommand(
        `git tag --points-at=${commitHash} --format='%(refname:short)'`,
        logger,
        { cwd },
        true
      )
    ).stdout
      .split(/\r?\n/g)
      .filter((file) => file !== '')

    return allTags
  }
}

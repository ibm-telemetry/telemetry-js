/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

interface InstallingPackage {
  name: string
  // TODO: define the format of an installing package based on the shape of the objects coming from
  // the `npm ls` command.
}

/**
 * Given a package name and version, finds the package(s) that installed it.
 *
 * @param packageName - The name of the package to query.
 * @param packageVersion - The exact semantic version string of the package to query.
 * @returns A list of dependent package objects.
 */
export function getInstallingPackages(
  packageName: string,
  packageVersion: string
): InstallingPackage[] {
  // TODO

  /*
   * Nested dependency considerations:
   *
   * Given the following hierarchy (assume "b" is an instrumented package):
   *
   * "Root"
   *  └── "a"
   *       └── "b".
   *
   * When "b" gets installed for the first time in the project (as a part of "a"), it will be
   * installed into the same node_modules folder into which "a" was installed (the Root's
   * node_modules folder), even though it is a dependency of "a" and not of the Root project.
   *
   * This nested dependency is not shown in an `npm ls` command run from the Root folder, even
   * though "b" is present in the Root node_modules folder.
   *
   * To solve this, we run `npm ls --all` which will show all installed packages, rather than only
   * those directly depended upon by the Root project.
   */

  return 'TODO'
}

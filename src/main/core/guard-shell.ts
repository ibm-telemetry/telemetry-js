/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 *  Checks a command for certain disallowed characters and throws an exception if they are found.
 *
 * @param cmd - The command to check.
 * @throws Upon encountering forbidden characters in the command.
 */
export function guardShell(cmd: string) {
  if (/[\\$;`]/.exec(cmd) != null) {
    throw new Error(
      'Shell guard prevented a command from running because it contained special characters: ' + cmd
    )
  }
}

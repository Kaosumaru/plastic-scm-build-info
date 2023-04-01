/* eslint-disable no-console */
import {existsSync} from 'node:fs'
import util from 'util'
import {exec as execNonPromise} from 'child_process'
const execAsync = util.promisify(execNonPromise)

export async function cm(params: string, printOut = true): Promise<string> {
  if (printOut) {
    console.log(`> cm ${params}`)
  }

  try {
    let exitCode = -1
    const command = execAsync(`cm ${params}`, {maxBuffer: 10 * 1024 * 1024})
    command.child.on('exit', (code: number) => (exitCode = code))
    const {stdout, stderr} = await command

    if (printOut) {
      console.log(stdout)
      console.log(stderr)
    }

    if (exitCode !== 0) {
      throw new Error(`cm exited with code ${exitCode}`)
    }
    return stdout
  } catch (error) {
    console.error(error)
    throw error
  }
}

function workspaceNameForDirectory(directory: string): string {
  directory = directory.replace('/', '\\')
  directory = directory.replace(':', '_')
  return directory
}

async function createAnonymousWorkspace(): Promise<void> {
  // check if workspace already exists in this directory
  // TODO getworkspacefrompath could be used
  if (existsSync('.plastic')) return

  const name = workspaceNameForDirectory(process.cwd())
  await cm(`workspace create ${name} .`)
}

export async function getChangeset(): Promise<string> {
  const status = await cm(`status`, false)
  const statusRegex = /\(cs:(\d+) - head\)/g
  const matches = statusRegex.exec(status)
  if (!matches || matches.length < 2) return ''
  return matches[1]
}

export async function checkoutRepo(
  repository: string,
  branch = '/main'
): Promise<void> {
  await createAnonymousWorkspace()
  await cm(`unco --all`)
  await cm(`switch br:${branch} --repository=${repository}`)
}

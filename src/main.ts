import * as core from '@actions/core'
import {checkoutRepo, getStatus} from './plastic'

async function run(): Promise<void> {
  try {
    const repository: string = core.getInput('repository')
    const branch: string = core.getInput('branch') || '/main'

    await checkoutRepo(repository, branch)

    const changeset = await getStatus()
    core.setOutput('changeset', changeset)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

import * as core from '@actions/core'
import {createAndSendChangelog} from './summary'

async function run(): Promise<void> {
  try {

    await createAndSendChangelog({
      version: core.getInput('version'),
      jiraUsername: core.getInput('jiraUsername'),
      jiraToken: core.getInput('jiraToken'),
      jiraHost: core.getInput('jiraHost'),
      jiraPrefix: core.getInput('jiraPrefix'),
      checkinTags: core.getInput('checkinTags').split('|'),
      discordWebhook: core.getInput('discordWebhook')
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

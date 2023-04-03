import {changesToChangelog} from './changelog'
import {sendChangelog} from './discord'
import {info} from './info'
import JiraApi from 'jira-client'
import {cm, getStatus} from './plastic'

export interface SummaryConfiguration {
  version: string

  jiraUsername: string
  jiraToken: string
  jiraHost: string
  jiraPrefix: string

  checkinTags: string[]

  discordWebhook: string
}

export async function createAndSendChangelog(
  config: SummaryConfiguration
): Promise<void> {
  const jira = new JiraApi({
    protocol: 'https',
    host: config.jiraHost,
    username: config.jiraUsername,
    password: config.jiraToken,
    apiVersion: '2',
    strictSSL: true
  })

  const status = await getStatus()
  const branch = status.branch
  const currentChangeset = status.changesetid

  const data = await info(branch, currentChangeset)
  const changelog = await changesToChangelog({
    host: config.jiraHost,
    jira,
    info: data,
    checkinTags: config.checkinTags,
    jiraPrefix: config.jiraPrefix
  })

  if (changelog.entries.length > 0) {
    await sendChangelog(config.version, changelog, config.discordWebhook)
  }

  // update last_build attribute on current branch
  await cm(`att set att:last_build br:/${branch} ${currentChangeset}`, false)
}

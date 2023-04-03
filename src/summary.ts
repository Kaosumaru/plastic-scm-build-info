import {changesToChangelog} from './changelog'
import {sendChangelog} from './discord'
import {info} from './info'
import JiraApi from 'jira-client'

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

  const data = await info()
  const changelog = await changesToChangelog({
    host: config.jiraHost,
    jira,
    info: data,
    checkinTags: config.checkinTags,
    jiraPrefix: config.jiraPrefix
  })

  await sendChangelog(config.version, changelog, config.discordWebhook)
}

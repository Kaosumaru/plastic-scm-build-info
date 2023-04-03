import JiraApi from 'jira-client'
import {InfoData} from './info'

export interface ChangelogEntry {
  url?: string
  description: string
}

export interface Changelog {
  entries: ChangelogEntry[]
}

async function mergeToChangelogEntry(
  options: Options,
  merge: string
): Promise<ChangelogEntry> {
  const jiraRegex = /(RAISE-\d+)/g
  const matches = jiraRegex.exec(merge)
  let description = merge

  if (!matches || matches.length < 2) {
    return {
      description
    }
  }

  const issueNumber = matches[1]
  const url = `https://${options.host}/browse/${issueNumber}`

  try {
    const issue = await options.jira.findIssue(issueNumber)
    description = `${issueNumber} ${issue.fields.summary}`
    // eslint-disable-next-line no-empty
  } catch {}

  return {
    url,
    description
  }
}

async function mergesToJira(options: Options): Promise<ChangelogEntry[]> {
  const awaitableResult = options.info.merges
    .filter(entry => entry.includes(options.jiraPrefix))
    .map(async entry => mergeToChangelogEntry(options, entry))

  return await Promise.all(awaitableResult)
}

export interface Options {
  host: string
  jira: JiraApi
  commitTag: string
  jiraPrefix: string
  info: InfoData
}

export async function changesToChangelog(options: Options): Promise<Changelog> {
  const entries: ChangelogEntry[] = []

  entries.concat(await mergesToJira(options))

  return {
    entries
  }
}

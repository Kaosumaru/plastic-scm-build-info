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

async function checkinToChangelogEntry(
  options: Options,
  checkin: string
): Promise<ChangelogEntry> {
  const jiraRegex = /(RAISE-\d+)/g
  const matches = jiraRegex.exec(checkin)
  let description = checkin

  if (!matches || matches.length < 2) {
    return {
      description
    }
  }

  const issueNumber = matches[1]
  const url = `https://${options.host}/browse/${issueNumber}`

  try {
    const issue = await options.jira.findIssue(issueNumber)
    description = `${issueNumber} ${issue.fields.summary} - ${checkin}`
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

function shouldIncludeCheckin(options: Options, checkin: string): boolean {
  if (checkin.includes(options.jiraPrefix)) return true
  if (options.checkinTags.some(tag => checkin.includes(tag))) return true
  return false
}

async function commitsToJira(options: Options): Promise<ChangelogEntry[]> {
  const awaitableResult = options.info.checkins
    .filter(entry => shouldIncludeCheckin(options, entry))
    .map(async entry => checkinToChangelogEntry(options, entry))

  return await Promise.all(awaitableResult)
}

export interface Options {
  host: string
  jira: JiraApi
  jiraPrefix: string
  checkinTags: string[]
  info: InfoData
}

export async function changesToChangelog(options: Options): Promise<Changelog> {
  let entries: ChangelogEntry[] = []

  entries = entries.concat(await mergesToJira(options))
  entries = entries.concat(await commitsToJira(options))

  return {
    entries
  }
}

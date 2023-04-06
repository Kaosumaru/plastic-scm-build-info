import {cm} from './plastic'

async function cmSingleLine(params: string): Promise<string> {
  let result = await cm(params, false)
  result = result.replace(/(\r\n|\n|\r)/gm, '')
  return result
}

async function getBranchId(branch: string): Promise<string> {
  return await cmSingleLine(
    `find branches "where name='${branch}'" --format="{id}" --nototal`
  )
}

async function getLastBuildChangeset(branch: string): Promise<string> {
  const branchId = await getBranchId(branch)
  return await cmSingleLine(
    `find attributes "where srcobj = ${branchId} and type='last_build'" --format="{value}" --nototal`
  )
}

function cmResultToArray(result: string): string[] {
  return result.split('\r\n').filter(n => n)
}

async function getCheckinsSinceLastBuild(
  branch: string,
  lastBuildChangeset: string,
  currentChangeset: string
): Promise<string[]> {
  const result = await cm(
    `find changeset "where branch = '${branch}' and changesetid > ${lastBuildChangeset} and changesetid <= ${currentChangeset}" --format="{comment}" --nototal`,
    false
  )
  return cmResultToArray(result)
}

async function getMergesSinceLastBuild(
  branch: string,
  lastBuildChangeset: string,
  currentChangeset: string
): Promise<string[]> {
  const result = await cm(
    `find merge "where dstbranch = '${branch}' and dstchangeset > ${lastBuildChangeset} and dstchangeset <= ${currentChangeset}" --format="{srcbranch}" --nototal`,
    false
  )
  return cmResultToArray(result)
}

export interface InfoData {
  checkins: string[]
  merges: string[]
}

export async function info(
  branch: string,
  currentChangeset: string
): Promise<InfoData> {
  const lastBuildChangeset = await getLastBuildChangeset(branch)
  // eslint-disable-next-line no-console
  console.log(`lastBuildChangeset: '${lastBuildChangeset}'`)
  if (lastBuildChangeset.trim() === '') {
    return {
      checkins: [],
      merges: []
    }
  }

  const checkins = await getCheckinsSinceLastBuild(
    branch,
    lastBuildChangeset,
    currentChangeset
  )

  const merges = await getMergesSinceLastBuild(
    branch,
    lastBuildChangeset,
    currentChangeset
  )

  return {
    checkins,
    merges
  }
}

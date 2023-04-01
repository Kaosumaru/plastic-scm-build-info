import {cm, getChangeset} from './plastic'

export async function cmSingleLine(params: string): Promise<string> {
  let result = await cm(params, false)
  result = result.replace(/(\r\n|\n|\r)/gm, '')
  return result
}

export async function getBranchId(branch: string): Promise<string> {
  return await cmSingleLine(
    `find branches "where name='${branch}'" --format="{id}" --nototal`
  )
}

export async function getLastBuildChangeset(branch: string): Promise<string> {
  const branchId = await getBranchId(branch)
  return await cmSingleLine(
    `find attributes "where srcobj = ${branchId} and type='last_build'" --format="{value}" --nototal`
  )
}

export async function getCheckinsSinceLastBuild(
  branch: string,
  lastBuildChangeset: string,
  currentChangeset: string
): Promise<string> {
  return await cm(
    `find changeset "where branch = '${branch}' and changesetid > ${lastBuildChangeset} and changesetid <= ${currentChangeset}" --format="{date} - {comment}" --nototal`, 
    false
  )
}

export async function getMergesSinceLastBuild(
  branch: string,
  lastBuildChangeset: string,
  currentChangeset: string
): Promise<string> {
  return await cm(
    `find merge "where dstbranch = '${branch}' and dstchangeset > ${lastBuildChangeset} and dstchangeset <= ${currentChangeset}" --format="{srcbranch}" --nototal`, 
    false
  )
}

export async function info(branch: string): Promise<string> {
  const lastBuildChangeset = await getLastBuildChangeset(branch)
  const currentChangeset = await getChangeset()

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

  return checkins + merges
}

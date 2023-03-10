import {GitHub} from '@actions/github/lib/utils'

type Parameters = {
  owner: string
  repo: string
  issue_number: number
  body: string
}
export const createComment = (octokit: InstanceType<typeof GitHub>) => {
  return async ({owner, repo, issue_number, body}: Parameters) => {
    try {
      return await octokit.rest.issues.createComment({
        issue_number,
        owner,
        repo,
        body
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

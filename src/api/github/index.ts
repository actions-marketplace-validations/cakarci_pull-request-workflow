import * as core from '@actions/core'
import * as github from '@actions/github'
import {createComment} from './create-comment'
import {requestReviewers} from './request-reviewers'

const token = core.getInput('github-token')
const octokit = github.getOctokit(token)

export const githubService = {
  createComment: createComment(octokit),
  requestReviewers: requestReviewers(octokit)
}

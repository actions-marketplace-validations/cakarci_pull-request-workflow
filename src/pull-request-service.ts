import * as core from '@actions/core'
import * as github from '@actions/github'
import {githubService} from './api/github'
import {Slack} from './api/slack'
import {getFileContent, getRandomListItems} from './utils'

export const PullRequestService = async (): Promise<void> => {
  try {
    if (!github.context.eventName.startsWith('pull_request')) {
      core.warning(
        `eventName should be "pull_request*" but received: ${github.context.eventName} `
      )
      return
    }
    core.setOutput('action', github.context.payload.action)
    const {reviewers, slack} = await getFileContent()
    const [firstReviewer, secondReviewer] = getRandomListItems(
      reviewers,
      github.context.actor
    )
    if (github.context.payload.action === 'labeled') {
      await Slack.postMessage({
        channel: core.getInput('slack-channel-id'),
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Hi <@${slack[firstReviewer]}> & <@${slack[secondReviewer]}>`
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `A new label \`${github.context.payload.label?.name}\` added to <${github.context.payload.pull_request?.html_url}|the pull request>`
            }
          }
        ]
      })
    }
    if (
      github.context.payload.action === 'opened' &&
      github.context.payload.pull_request
    ) {
      await githubService.requestReviewers({
        owner: github.context.actor,
        repo: github.context.issue.repo,
        pull_number: github.context.payload.pull_request.number,
        reviewers: [firstReviewer, secondReviewer]
      })
      await Slack.postMessage({
        channel: core.getInput('slack-channel-id'),
        text: `Hey <@${slack[firstReviewer]}> & <@${
          slack[secondReviewer]
        }> a new PR ${
          github.context.payload.pull_request?.html_url
        } created by ${slack[github.context.actor]}. Let's add your reviews!`
      })
    }
    if (
      github.context.eventName === 'pull_request_review' &&
      github.context.payload.action === 'submitted'
    ) {
      await Slack.postMessage({
        channel: core.getInput('slack-channel-id'),
        text: `Hey <@${
          slack[github.context.payload.pull_request?.user.login]
        }>, your pull request ${
          github.context.payload.pull_request?.html_url
        } got reviewed by <@${slack[github.context.actor]}> check the review ${
          github.context.payload.review?.html_url
        }`
      })
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
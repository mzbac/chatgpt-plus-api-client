import * as core from '@actions/core'
import {Octokit} from '@octokit/action'
import {sendPostRequest} from '../src'
import {addCommentToPR, getRawFileContent} from './client'
import {addLineNumbers, extractCommitHash} from './utils'

const octokit = new Octokit()

async function run(): Promise<void> {
  try {
    const extensions = core.getInput('extensions').split(',')
    const pullNumber = parseInt(core.getInput('number'))

    const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/')

    const files = await octokit.request(
      `GET /repos/${owner}/${repo}/pulls/${pullNumber}/files`
    )

    for (const file of files.data) {
      const extension = file.filename.split('.').pop()

      if (extensions.includes(extension)) {
        const text = await getRawFileContent(file.raw_url)
        const textWithLineNumber = addLineNumbers(text!)
        const response = await sendPostRequest({
          prompt: `Act as a code guard that has deep knowledge of frontend software development, you will review the pull request files change below for a project is written in Typescript. Always start your suggestions with 'As a codeguard, here are my suggestions'. Please provide suggestions for making the code more readable, maintainable and secure, mentioning line numbers with each suggestion and only provide suggestions and one line code snippets corresponding to those lines of suggestion:
                        \`\`\`ts
                        ${textWithLineNumber}
                        \`\`\``
        })

        await addCommentToPR(
          owner,
          repo,
          pullNumber,
          file.filename,
          response.message.content.parts[0],
          extractCommitHash(file.raw_url)!,
          octokit
        )
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

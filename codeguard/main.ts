import * as core from "@actions/core";
import { Octokit } from "@octokit/action";
import { sendPostRequest } from "../src";
import { addCommentToPR, getRawFileContent, postCommentToPR } from "./client";
import { promptForJson, promptForText } from "./prompt";
import {
  addLineNumbers,
  extractCommitHash,
  getChangedLineNumbers,
  isSuggestions,
} from "./utils";

const octokit = new Octokit();
const extensions = ["ts", "tsx"];

async function run(): Promise<void> {
  try {
    const pullNumber = parseInt(process.env.PULL_NUMBER!);

    const [owner, repo] = process.env.GITHUB_REPOSITORY!.split("/");

    const files = await octokit.request(
      `GET /repos/${owner}/${repo}/pulls/${pullNumber}/files`
    );

    for (const file of files.data) {
      const extension = file.filename.split(".").pop();

      if (extensions.includes(extension)) {
        const text = await getRawFileContent(file.raw_url);
        const textWithLineNumber = addLineNumbers(text!);
        if (process.env.CODEGUARD_COMMENT_BY_LINE) {
          const response = await sendPostRequest({
            prompt: promptForJson(textWithLineNumber),
          });
          let suggestions;
          try {
            suggestions = JSON.parse(response.message.content.parts[0]);
          } catch (err) {
            throw new Error(
              `ChatGPT response is not a valid json:\n ${response.message.content.parts[0]}`
            );
          }
          if (!isSuggestions(suggestions)) {
            throw new Error(
              `ChatGPT response is not of type Suggestions\n${JSON.stringify(
                suggestions
              )}`
            );
          }
          const changedLines = getChangedLineNumbers(file.patch);
          for (const line in suggestions) {
            if (
              changedLines.find(
                ({ start, end }) => start <= Number(line) && Number(line) <= end
              )
            ) {
              await addCommentToPR(
                owner,
                repo,
                pullNumber,
                file.filename,
                `
## CodeGuard Suggestions
**Suggestion:** ${suggestions[line].suggestion}
**Reason:** ${suggestions[line].reason}\n
                `,
                extractCommitHash(file.raw_url)!,
                +line,
                octokit
              );
            }
          }
        } else {
          const response = await sendPostRequest({
            prompt: promptForText(file.filename, textWithLineNumber),
          });

          await postCommentToPR(
            owner,
            repo,
            pullNumber,
            response.message.content.parts[0],
            octokit
          );
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();

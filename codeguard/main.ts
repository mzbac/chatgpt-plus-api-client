import * as core from "@actions/core";
import { Octokit } from "@octokit/action";
import { sendPostRequest } from "../src";
import {
  getRawFileContent,
  postCommentToPR,
  processSuggestions,
} from "./client";
import { getSuggestions } from "./chatgptClient";
import { promptForText } from "./prompt";
import {
  addLineNumbers,
  validateSuggestions,
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
          const suggestions = await getSuggestions(textWithLineNumber);

          validateSuggestions(suggestions);

          await processSuggestions(
            file,
            suggestions,
            owner,
            repo,
            pullNumber,
            octokit
          );
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
    if (error instanceof Error) core.debug(error.message);
  }
}

run();

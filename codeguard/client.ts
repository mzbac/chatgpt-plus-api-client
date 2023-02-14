import * as core from "@actions/core";
import { Octokit } from "@octokit/action";
import { getChangedLineNumbers, extractCommitHash, Suggestions } from "./utils";

export async function getRawFileContent(
  url: string
): Promise<string | undefined> {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return text;
  } catch (error) {
    core.error(JSON.stringify(error));
  }
}

export async function addCommentToPR(
  owner: string,
  repo: string,
  pullNumber: number,
  filePath: string,
  comment: string,
  commitId: string,
  line: number,
  octokit: Octokit
): Promise<void> {
  try {
    await octokit.request(
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      {
        owner,
        repo,
        pull_number: pullNumber,
        body: comment,
        path: filePath,
        line: line,
        side: "RIGHT",
        commit_id: commitId,
      }
    );
  } catch (error) {
    core.error(JSON.stringify(error, null, 2));
  }
}

export async function postCommentToPR(
  owner: string,
  repo: string,
  pullNumber: number,
  comment: string,
  octokit: Octokit
) {
  try {
    const result = await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner,
        repo,
        issue_number: pullNumber,
        body: comment,
      }
    );
    console.log(`Comment posted successfully: ${result.data.html_url}`);
  } catch (error) {
    console.error(`Failed to post comment: ${error}`);
  }
}

export type GitFile = {
  sha: string;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch: string;
};

export async function processSuggestions(
  file: GitFile,
  suggestions: Suggestions,
  owner: string,
  repo: string,
  pullNumber: number,
  octokit: Octokit
) {
  const changedLines = getChangedLineNumbers(file.patch);
  for (const line in suggestions) {
    if (
      changedLines.some(
        ({ start, end }) => start <= Number(line) && Number(line) <= end
      )
    ) {
      await addCommentToPR(
        owner,
        repo,
        pullNumber,
        file.filename,
        `
### Line ${line}
## CodeGuard Suggestions
**Suggestion:** ${suggestions[line].suggestion}
**Reason:** ${suggestions[line].reason}\n
`,
        extractCommitHash(file.raw_url)!,
        Number(line),
        octokit
      );
    }
  }
}

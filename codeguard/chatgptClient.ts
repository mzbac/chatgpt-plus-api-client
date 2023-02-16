import { sendPostRequest } from "../src";
import { promptForJson } from "./prompt";
import { extractJsonString } from "./utils";

export async function getSuggestions(
  textWithLineNumber: string,
  linesToReview: { start: number; end: number }[]
) {
  const response = await sendPostRequest({
    prompt: promptForJson(
      textWithLineNumber,
      linesToReview.map(({ start, end }) => `line ${start}-${end}`).join(",")
    ),
  });

  let suggestions;
  try {
    suggestions = JSON.parse(
      extractJsonString(response.message.content.parts[0])
    );
  } catch (err) {
    throw new Error(
      `ChatGPT response is not a valid json:\n ${response.message.content.parts[0]}`
    );
  }
  return suggestions;
}

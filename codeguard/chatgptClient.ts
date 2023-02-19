import { sendPostRequest } from "../src";
import { promptForJson } from "./prompt";

export async function getSuggestions(
  textWithLineNumber: string,
  linesToReview: { start: number; end: number }[]
) {
  const response = await sendPostRequest({
    prompt: promptForJson(
      textWithLineNumber,
      linesToReview.map(({ start, end }) => `line ${start}-${end}`).join(",")
    ),
    model: "Legacy",
  });

  const str = response.message.content.parts[0];
  const startIndex = str.indexOf("{");
  const endIndex = str.lastIndexOf("}");
  let json;
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    json = str.substring(startIndex, endIndex + 1);
  }

  let suggestions;
  try {
    suggestions = JSON.parse(json);
  } catch (err) {
    throw new Error(
      `ChatGPT response is not a valid json:\n ${response.message.content.parts[0]}`
    );
  }
  return suggestions;
}

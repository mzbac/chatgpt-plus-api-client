import { sendPostRequest } from "../src";
import { promptForJson } from "./prompt";

export async function getSuggestions(textWithLineNumber: string) {
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
    return suggestions;
  }
  
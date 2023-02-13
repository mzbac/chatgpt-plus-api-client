import dotenv from "dotenv";
import { generateUUID } from "./uuid";
import { ChatGPTResponse } from "./chatgpt";

dotenv.config();

const API_ENDPOINT = "https://chat.openai.com/backend-api/conversation";
const HEADERS = {
  "Content-Type": "application/json",
  Accept: "text/event-stream",
  cookie: process.env.CHATGPT_COOKIES ?? "",
  Authorization: process.env.CHATGPT_AUTH_TOKEN ?? ""
};

type ModelOption = "Default" | "Turbo";
type MODEL = "text-davinci-002-render-paid" | "text-davinci-002-render-sha";

type SendPostRequestOptions = {
  parentMessageId?: string;
  conversationId?: string;
  prompt?: string;
  model?: ModelOption;
};

const MODEL_ID_MAP: { [key in ModelOption]: MODEL } = {
  Default: "text-davinci-002-render-paid",
  Turbo: "text-davinci-002-render-sha",
};
/**
 * Sends a POST request to the ChatGPT API with the given prompt and parent message ID.
 *
 * @param options The options for the request.
 * @returns A Promise that resolves to a ChatGPTResponse object.
 */
export async function sendPostRequest(
  options: SendPostRequestOptions = {}
): Promise<ChatGPTResponse> {
  const {
    parentMessageId = generateUUID(),
    conversationId,
    prompt = "hello world",
    model = "Default",
  } = options;

  const modelId = MODEL_ID_MAP[model];
  if (!modelId) {
    throw new Error(`Invalid model option: ${model}`);
  }

  try {
    const messageId = generateUUID();
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        action: "next",
        messages: [
          {
            id: messageId,
            role: "user",
            content: {
              content_type: "text",
              parts: [prompt],
            },
          },
        ],
        parent_message_id: parentMessageId,
        conversation_id: conversationId,
        model: modelId,
      }),
    });

    if (response.status !== 200) {
      throw new Error(`Request failed with status code: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    const chunks: string[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      chunks.push(chunk);
    }

    const finalChunk = chunks[chunks.length - 2];
    const jsonString = finalChunk.replace(/^data:/, "");
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error sending POST request to ChatGPT API:", error);
    throw error;
  }
}

import dotenv from "dotenv";
import { randomUUID } from "crypto";
import { ChatGPTResponse } from "./chatgpt";
import { getModelId } from "./utils";

dotenv.config();

const API_ENDPOINT = "https://chat.openai.com/backend-api/conversation";
const HEADERS = {
  "Content-Type": "application/json",
  Accept: "text/event-stream",
  cookie: process.env.CHATGPT_COOKIES ?? "",
  Authorization: process.env.CHATGPT_AUTH_TOKEN ?? "",
};

export type ModelOption = "Default" | "Legacy" | "gpt-4";

type SendPostRequestOptions = {
  parentMessageId?: string;
  conversationId?: string;
  prompt?: string;
  model?: ModelOption;
};

/**
 * Sends a POST request to the ChatGPT API with the given prompt and parent message ID.
 *
 * @param options The options for the request.
 * @returns A Promise that resolves to a ChatGPTResponse object.
 */
export async function sendPostRequest(
  options: SendPostRequestOptions = {},
  header = {}
): Promise<ChatGPTResponse> {
  const {
    parentMessageId = randomUUID(),
    conversationId,
    prompt = "hello world",
    model = "Default",
  } = options;

  const modelId = getModelId(model);

  try {
    const messageId = randomUUID();
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { ...HEADERS, ...header },
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

    switch (response.status) {
      case 200:
        break;
      case 400:
        throw new Error("Bad Request");
      case 401:
        throw new Error("Unauthorized");
      default:
        throw new Error(
          `Request failed with status code ${
            response.status
          }: ${await response.text()}`
        );
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

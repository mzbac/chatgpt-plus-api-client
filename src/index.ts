import dotenv from "dotenv";
import { generateUUID } from "./uuid";
import { ChatGPTResponse } from "./chatgpt";

dotenv.config();

const API_ENDPOINT = "https://chat.openai.com/backend-api/conversation";
const MODEL = "text-davinci-002-render-paid";
const HEADERS = {
  "Content-Type": "application/json",
  Accept: "text/event-stream",
  cookie: process.env.CHATGPT_COOKIES ?? "",
  Authorization: process.env.CHATGPT_AUTH_TOEKN ?? "",
};

type SendPostRequestOptions = {
  parentMessageId?: string;
  conversationId?: string;
  prompt?: string;
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
  } = options;
  console.log("cookie env :" + process.env.CHATGPT_COOKIES);
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
        model: MODEL,
      }),
    });

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

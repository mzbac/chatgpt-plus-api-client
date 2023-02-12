import * as dotenv from "dotenv";
import { generateUUID } from "./uuid";
import { ChatGPTResponse } from "./chatgpt";
import nodeFetch from "node-fetch";

dotenv.config();

const API_ENDPOINT = "https://chat.openai.com/backend-api/conversation";
const MODEL = "text-davinci-002-render-paid";
const HEADERS = {
  "Content-Type": "application/json",
  Accept: "text/event-stream",
  cookie: process.env.CHATGPT_COOKIES || "",
  Authorization: process.env.CHATGPT_AUTH_TOEKN || "",
};

interface SendPostRequestOptions {
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

  try {
    const messageId = generateUUID();

    const response = await nodeFetch(API_ENDPOINT, {
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

    const responseText = await response.text();
    const chunks =responseText.split("\n").filter(s=>!!s)
    const finalChunk = chunks[chunks.length - 2];
    const jsonString = finalChunk.replace(/^data:/, '');
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing response from ChatGPT API:", error);
      throw error;
    }
  } catch (error) {
    throw new Error(`Error sending POST request to ChatGPT API: ${error}`);
  }
}

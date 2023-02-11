import dotenv from "dotenv";
import { generateUUID } from "./uuid";
import { ChatGPTResponse } from "./chatgpt";

dotenv.config();

export async function sendPostRequest(
  parentMessageId: string = generateUUID(),
  prompt: string = "hello world"
): Promise<ChatGPTResponse> {
  const response = await fetch(
    "https://chat.openai.com/backend-api/conversation",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        cookie: process.env.CHATGPT_COOKIES ?? "",
        Authorization: process.env.CHATGPT_AUTH_TOEKN ?? "",
      },
      body: JSON.stringify({
        action: "next",
        messages: [
          {
            id: generateUUID(),
            role: "user",
            content: {
              content_type: "text",
              parts: [prompt],
            },
          },
        ],
        parent_message_id: parentMessageId,
        model: "text-davinci-002-render-paid",
      }),
    }
  );

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  const result: string[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const chunk = decoder.decode(value, { stream: true });
    result.push(chunk);
  }

  const final = result[result.length - 2];
  const index = final.indexOf("data:");
  const jsonString = final.substring(index + 6);
  return JSON.parse(jsonString);
}
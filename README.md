# ChatGPT API Client

This is a Node.js Open Source project for making API calls to ChatGPT. The project uses the paid version of ChatGPT (AKA ChatGPT Plus), making it easier to use without having to worry about the limitations of the free version.

## Prerequisites

- Node.js v18 or higher

## Installation

To install the project, run the following command in your terminal:

```bash
npm install chatgpt-plus-api-client
```

## Usage

To make API calls to ChatGPT in TypeScript, use the following code in your project:

```typescript
import { sendPostRequest } from "chatgpt-plus-api-client";

async function talk() {
  let conversationId, parentMessageId;

  let response = await sendPostRequest({
    prompt: "for loop in js?",
  });
  parentMessageId = response.message.id;
  conversationId = response.conversation_id;
  console.log(response.message.content.parts[0]);

  response = await sendPostRequest({
    prompt: "rewrite it in typescript",
    parentMessageId,
    conversationId,
  });
  parentMessageId = response.message.id;
  console.log(response.message.content.parts[0]);
}

talk();
```

By default, the API client uses the Default model. There are 3 available models to choose from:

- `Default`
- `Legacy`
- `gpt-4`

To choose a different model, simply pass in the model option in the sendPostRequest function, like so:

```ts
async function talk() {
  const response = await sendPostRequest({
    prompt: "for loop in js?",
    model: "Legacy",
  });
  console.log(response.message.content.parts[0]);
}
talk();
```

```ts
async function talk() {
  const response = await sendPostRequest({
    prompt: `[Text from :https://medium.com/@anchen.li/creating-custom-shortcuts-on-your-mac-to-check-grammar-using-chatgpt-809c78715eda]
    What is the article about?`,
    model: "gpt-4",
  });
  console.log(response.message.content.parts[0]);
}
talk();
```

Before using the API client, you must set the CHATGPT_COOKIES and CHATGPT_AUTH_TOKEN environment variables. These values can be obtained by manually copying the cookies and authentication token from your browser requests.

## Getting CHATGPT_COOKIES from cookies

1. Open Google Chrome and navigate to the website you need to retrieve the cookies from.
2. Press F12 or right-click anywhere on the page and select "Inspect" from the context menu to open the Developer Tools.
3. Click on the "Application" tab in the Developer Tools.
4. In the left sidebar, expand the "Cookies" section and select the domain for the website you are working with.
5. You should see the list of cookies for the selected domain. Look for the following cookie:
   - _puid
6. Copy the value of the "Value" field for the `_puid` cookie.
7. Set the value of the `CHATGPT_COOKIES` environment variable to the string `_puid=[value]`.

Note that these steps are specific to Google Chrome. If you are using a different web browser, the process for retrieving cookies may be slightly different.

### Getting CHATGPT_AUTH_TOKEN from Authorization Headers

1. Open the website you want to inspect in Google Chrome.
2. Right-click on the page and select "Inspect".
3. Click on the "Network" tab in the DevTools panel.
4. Refresh the page to initiate a network request.
5. Click on one of the requests in the list to inspect its details.
6. In the right-side panel, scroll down to the "Headers" section.
7. The "Authorization" header, if present, will be listed under "Request Headers".

Note that the exact steps may vary slightly between different browsers, but the overall process should be similar.

## Contributing

We welcome contributions to this project! If you have an idea for a new feature or a bug fix, please open a pull request.

## License

This project is licensed under the MIT License.

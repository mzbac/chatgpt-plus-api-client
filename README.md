# ChatGPT API Client

This is a Node.js Open Source project for making API calls to ChatGPT. The project uses the paid version of ChatGPT (AKA ChatGPT Plus), making it easier to use without having to worry about the limitations of the free version.

## Prerequisites

- Node.js v18 or higher

## Installation

To install the project, run the following command in your terminal:

```bash
npm install
```

## Usage

To make API calls to ChatGPT in TypeScript, use the following code in your project:

```typescript
import { ChatGPTClient } from "chatgpt-plus-api-client";

const chatgpt = new ChatGPTClient();

chatgpt.sendRequest("Hello, how are you?").then((response) => {
  console.log(response);
});
```

Before using the API client, you must set the CHATGPT_COOKIES and CHATGPT_AUTH_TOKEN environment variables. These values can be obtained by manually copying the cookies and authentication token from your browser requests.

## Contributing

We welcome contributions to this project! If you have an idea for a new feature or a bug fix, please open a pull request.

## License

This project is licensed under the MIT License.

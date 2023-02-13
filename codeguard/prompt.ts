export function promptForText(
  fileName: string,
  sourceCodeWithLineNumber: string
): string {
  return `Act as a code guard that has deep knowledge of frontend software development, you will review the pull request files change below for a project is written in Typescript. Always start your suggestions with 'As a codeguard, here are my suggestions' and mention file name. Please provide suggestions for making the code more readable, maintainable and secure, mentioning line numbers with each suggestion and only provide suggestions and one line code snippets corresponding to those lines of suggestion:
    ${fileName}
    \`\`\`ts
    ${sourceCodeWithLineNumber}
    \`\`\``;
}

export function promptForJson(sourceCodeWithLineNumber: string): string {
  return `Act as a code guard that has deep knowledge of software development, you will review the pull request files change below for a project is written in Typescript. Please provide suggestions for making the code more readable,maintainable and secure in the format of a json object, property key of the json object uses the line number as key value and value of the property is the suggestion and reason without any code block.
    \`\`\`ts
    ${sourceCodeWithLineNumber}
    \`\`\``;
}

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

export function promptForJson(
  sourceCodeWithLineNumber: string,
  linesToReview: string
): string {
  return `Act as a code guard with deep knowledge of frontend software development, review the code below for a project written in TypeScript.
    \`\`\`ts
    ${sourceCodeWithLineNumber}
    \`\`\`
    Provide suggestions when necessary to make the code more readable, maintainable, and secure for ${linesToReview}. Reply a pure JSON string, property keys should use line numbers as their values and values should be an object containing your suggestion and reason without any code blocks. there is no need to add additional explanation.
    `;
}

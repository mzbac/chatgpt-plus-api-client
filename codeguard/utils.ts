export function addLineNumbers(text: string): string {
  const lines = text.split("\n");
  let result = "";

  for (let i = 0; i < lines.length; i++) {
    result += `${i + 1}: ${lines[i]}\n`;
  }

  return result;
}

export function extractCommitHash(url: string): string | null {
  const regex = /\/raw\/([a-z0-9]+)\//i;
  const result = url.match(regex);
  if (result) {
    return result[1];
  }
  return null;
}

export function getChangedLineNumbers(
  filePatch: string
): { start: number; end: number }[] {
  const lines = filePatch.split("\n");
  const changedLineNumbers: { start: number; end: number }[] = [];
  for (const line of lines) {
    if (line.startsWith("@@")) {
      const match = line.match(/@@ \-(\d+),(\d+) \+(\d+),(\d+) @@/);
      if (match) {
        const [, oldStart, oldLength, newStart, newLength] = match;
        changedLineNumbers.push({
          start: +newStart,
          end: +newStart + +newLength - 1,
        });
      }
    }
  }
  return changedLineNumbers;
}

export type Suggestion = {
  suggestion: string;
  reason: string;
};

export type Suggestions = {
  [line: string]: Suggestion;
};

export function isSuggestions(obj: any): obj is Suggestions {
  if (typeof obj === 'object' && obj === null) {
    return false;
  }

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    const line = obj[key];
    if (typeof line !== "object") {
      return false;
    }

    if (typeof line.suggestion !== "string") {
      return false;
    }

    if (typeof line.reason !== "string") {
      return false;
    }
  }

  return true;
}

export function fixMultiLineSuggestions(suggestions: Suggestions): Record<string, Suggestion> {
  const fixedSuggestions: Record<string, Suggestion> = {};

  for (const [key, suggestion] of Object.entries(suggestions)) {
    const index = key.includes("-") ? Number(key.split("-")[0]) : Number(key);
    fixedSuggestions[index] = suggestion;
  }

  return fixedSuggestions;
}

export function validateSuggestions(suggestions: Suggestions) {
  if (!isSuggestions(fixMultiLineSuggestions(suggestions))) {
    throw new Error(
      `ChatGPT response is not of type Suggestions\n${JSON.stringify(
        suggestions
      )}`
    );
  }
}
export function addLineNumbers(text: string): string {
  const lines = text.split('\n')
  let result = ''

  for (let i = 0; i < lines.length; i++) {
    result += `${i + 1}: ${lines[i]}\n`
  }

  return result
}

export function extractCommitHash(url: string): string | null {
  const regex = /\/raw\/([a-z0-9]+)\//i
  const result = url.match(regex)
  if (result) {
    return result[1]
  }
  return null
}

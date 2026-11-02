/**
 * Code-Mixed Tokenizer for IndicNLP Neural Studio
 * Preserves hyphenated enclitics (e.g., "College-ge") while separating punctuation
 */

export function tokenizeText(input: string): string[] {
  if (!input) return [];

  // Match words with internal hyphens (like "College-ge", "Open-maadi"),
  // standalone words (Kannada script or Latin), and punctuation as individual tokens
  const tokenRegex = /[\w\u0C80-\u0CFF]+(?:-[\w\u0C80-\u0CFF]+)*|[^\s\w\u0C80-\u0CFF]/gu;

  const matches = input.match(tokenRegex);
  return matches ? matches : [];
}

/**
 * Preprocessing module for IndicNLP Neural Studio
 * Handles Unicode NFC normalization, whitespace cleaning, and hyphen preservation
 */

export function preprocessText(input: string): string {
  if (!input) return '';

  return input
    // Normalize Unicode to canonical decomposition / composition
    .normalize('NFC')
    // Remove zero-width non-joiner / joiner artifacts if orphaned
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Normalize various hyphen/dash characters to standard hyphen-minus
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    // Replace multiple spaces/tabs with single space
    .replace(/[ \t]+/g, ' ')
    // Trim leading/trailing whitespace
    .trim();
}

export function isKannadaUnicode(text: string): boolean {
  // Kannada Unicode block is U+0C80 to U+0CFF
  return /[\u0C80-\u0CFF]/.test(text);
}

export function isPureKannadaUnicode(text: string): boolean {
  return /^[\u0C80-\u0CFF\s\p{P}]+$/u.test(text);
}

export function isEnglishAlphabet(text: string): boolean {
  return /^[a-zA-Z\s\p{P}]+$/u.test(text);
}

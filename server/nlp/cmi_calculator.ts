/**
 * Code-Switching Index (CMI) Calculator
 * Implements Gambäck & Das (2014) peer-reviewed multilingual index
 * Formula: CMI = 100 * [1 - max(w_k, w_e) / (N - u)]
 */

import { CMIAnalysis, TokenEntity } from './types.js';

export function calculateCMI(tokens: TokenEntity[]): CMIAnalysis {
  let kannadaCount = 0;
  let englishCount = 0;
  let hybridCount = 0;
  let otherCount = 0;

  for (const t of tokens) {
    switch (t.language) {
      case 'kannada':
        kannadaCount++;
        break;
      case 'english':
        englishCount++;
        break;
      case 'hybrid':
        hybridCount++;
        break;
      case 'punct':
      case 'unknown':
      default:
        otherCount++;
        break;
    }
  }

  const totalTokens = tokens.length;
  // Language tokens excluding punctuation / symbols (N - u)
  const languageTokens = totalTokens - otherCount;

  let cmiScore = 0;
  let formulaDescription = '';

  if (languageTokens <= 0) {
    cmiScore = 0;
    formulaDescription = 'No valid lexical language tokens detected (all punctuation/symbols). CMI = 0.0%';
  } else {
    // In code-mixed Dravidian NLP, hybrid tokens contain both Kannada enclitics and English stems
    // Effective language weights:
    const effectiveKannada = kannadaCount + (hybridCount * 0.5);
    const effectiveEnglish = englishCount + (hybridCount * 0.5);

    const maxLanguageWeight = Math.max(effectiveKannada, effectiveEnglish);

    // Gambäck & Das (2014) standard formulation
    const rawCMI = (1 - (maxLanguageWeight / languageTokens)) * 100;
    cmiScore = Math.max(0, Math.min(100, Number(rawCMI.toFixed(1))));

    const dominantLang = effectiveKannada >= effectiveEnglish ? 'Kannada' : 'English';
    formulaDescription = `Gambäck & Das (2014): CMI = 100 × [1 - max(W_kn, W_en) / (N - u)] = 100 × [1 - ${maxLanguageWeight.toFixed(1)} / ${languageTokens}] = ${cmiScore.toFixed(1)}% (Dominant: ${dominantLang}).`;
  }

  // Count switch points
  let switchPoints = 0;
  let prevLang = '';
  for (const t of tokens) {
    if (t.language === 'punct') continue;
    if (t.language === 'hybrid') {
      switchPoints++; // Intra-word switch point
    }
    if (prevLang && prevLang !== t.language) {
      switchPoints++;
    }
    prevLang = t.language;
  }

  return {
    cmiScore,
    totalTokens,
    kannadaCount,
    englishCount,
    hybridCount,
    otherCount,
    switchPoints,
    formulaDescription,
  };
}

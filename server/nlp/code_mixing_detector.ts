/**
 * Code-Mixing Detector
 * Detects language transitions, switch points, and burstiness
 */

import { TokenEntity } from './types.js';

export interface SwitchPoint {
  index: number;
  fromToken: string;
  fromLang: string;
  toToken: string;
  toLang: string;
  isIntraWord: boolean; // e.g. "College" (en) -> "-ge" (kn)
}

export function detectCodeMixing(tokens: TokenEntity[]): {
  switchCount: number;
  switchPoints: SwitchPoint[];
  burstiness: number;
} {
  const switchPoints: SwitchPoint[] = [];
  let previousLang = '';
  let previousToken = '';

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    // Skip punctuation tokens when tracking linguistic switches
    if (t.language === 'punct') continue;

    // Check intra-word switch (e.g. Hybrid tokens like "College-ge")
    if (t.language === 'hybrid' && t.morphology.suffix) {
      switchPoints.push({
        index: i,
        fromToken: t.morphology.root,
        fromLang: t.morphology.rootLanguage,
        toToken: t.morphology.suffix,
        toLang: t.morphology.suffixLanguage || 'kannada',
        isIntraWord: true,
      });
    }

    // Check inter-word switch
    if (previousLang && previousLang !== t.language) {
      // Don't duplicate if hybrid already handled
      if (previousLang !== 'hybrid' && t.language !== 'hybrid') {
        switchPoints.push({
          index: i,
          fromToken: previousToken,
          fromLang: previousLang,
          toToken: t.surface,
          toLang: t.language,
          isIntraWord: false,
        });
      }
    }

    previousLang = t.language;
    previousToken = t.surface;
  }

  // Burstiness = standard deviation / mean of inter-switch intervals
  const burstiness = calculateBurstiness(tokens.length, switchPoints.length);

  return {
    switchCount: switchPoints.length,
    switchPoints,
    burstiness,
  };
}

function calculateBurstiness(totalTokens: number, switches: number): number {
  if (totalTokens <= 2 || switches === 0) return 0;
  // Normalized transition density
  const density = switches / (totalTokens - 1);
  return Number(density.toFixed(3));
}

/**
 * Master Linguistic Pipeline Coordinator for IndicNLP Neural Studio
 * Integrates preprocessing, tokenization, sequence context, morphological analysis,
 * phonotactics, language identification, PoS tagging, transliteration,
 * bidirectional context smoothing (w ± 2), and CMI.
 */

import { calculateCMI } from './cmi_calculator.js';
import { analyzeSentenceContext } from './context_analyzer.js';
import { identifyLanguageWithContext } from './language_identifier.js';
import { DEFAULT_KANNADA_SUFFIX_RULES, parseMorphology } from './morphological_parser.js';
import { tagPOS } from './pos_tagger.js';
import { isKannadaUnicode, preprocessText } from './preprocessing.js';
import { tokenizeText } from './tokenizer.js';
import { transliterateToKannada, transliterateToLatin } from './transliterator.js';
import { KannadaSuffixRule, SentenceAnalysis, TokenEntity } from './types.js';

export function analyzeSentence(
  rawInput: string,
  customRules?: KannadaSuffixRule[]
): SentenceAnalysis {
  const cleaned = preprocessText(rawInput);
  const rawTokens = tokenizeText(cleaned);
  const activeRules = customRules || DEFAULT_KANNADA_SUFFIX_RULES;

  // Step 1: Sequence-Level Contextual Analysis
  const contextCues = analyzeSentenceContext(rawTokens);

  // Step 2: Per-Token Hybrid Morphological & Language Processing
  const tokens: TokenEntity[] = rawTokens.map((rawToken, idx) => {
    // Morphological Decomposition
    const morphology = parseMorphology(rawToken, activeRules);

    // Multi-tier Context-Aware Language Identification
    const langResult = identifyLanguageWithContext(
      rawToken,
      morphology,
      idx,
      cleaned,
      contextCues
    );

    // Part-of-Speech Tagging
    const contextCue = contextCues.get(idx);
    const posTag = tagPOS(rawToken, langResult.language, morphology, contextCue?.inferredPos);

    // Script & Transliteration Synchronization
    let kannadaUnicode = '';
    let romanized = '';

    if (isKannadaUnicode(rawToken)) {
      kannadaUnicode = rawToken;
      romanized = transliterateToLatin(rawToken);
    } else {
      romanized = rawToken;
      kannadaUnicode = transliterateToKannada(rawToken);
    }

    // Semantic Meaning / Gloss Generation
    let meaning = '';
    if (morphology.suffix && morphology.suffixDescription) {
      meaning = `${morphology.root} + [${morphology.suffixDescription}]`;
    } else if (langResult.language === 'kannada') {
      if (langResult.detectionDetails.normalizedForm) {
        meaning = `Kannada word (${langResult.detectionDetails.normalizedForm})`;
      } else {
        meaning = `Dravidian Kannada token`;
      }
    } else if (langResult.language === 'english') {
      meaning = `Standard English lexicon`;
    } else if (langResult.language === 'hybrid') {
      meaning = `Code-mixed agglutinated compound`;
    }

    return {
      id: `tok_${idx}_${rawToken.replace(/[^a-zA-Z0-9]/g, '')}`,
      surface: rawToken,
      kannadaUnicode,
      romanized,
      language: langResult.language,
      posTag,
      morphology,
      meaning,
      processingMethod: langResult.processingMethod,
      confidence: langResult.confidence,
      detectionDetails: langResult.detectionDetails,
    };
  });

  // Step 3: Bidirectional Context Window Smoothing (w ± 2)
  // For tokens with ambiguous/unknown classification, evaluate the neighborhood window
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.language === 'unknown' || tok.language === 'ambiguous' || tok.confidence < 0.65) {
      let kannadaNeighbors = 0;
      let englishNeighbors = 0;

      for (let offset = -2; offset <= 2; offset++) {
        if (offset === 0) continue;
        const neighbor = tokens[i + offset];
        if (!neighbor || neighbor.language === 'punct') continue;
        if (neighbor.language === 'kannada') kannadaNeighbors++;
        if (neighbor.language === 'english') englishNeighbors++;
      }

      // If predominantly surrounded by Kannada syntax (e.g. postpositions, verbalizers)
      if (kannadaNeighbors >= 2 && englishNeighbors === 0) {
        tok.language = 'kannada';
        tok.processingMethod = 'nlp_model';
        tok.confidence = 0.72;
        tok.detectionDetails = {
          ...tok.detectionDetails,
          contextReason: 'Context Window Smoothing: Surrounded by Kannada syntactic constituents (w ± 2)',
        };
      } else if (englishNeighbors >= 2 && kannadaNeighbors === 0) {
        tok.language = 'english';
        tok.processingMethod = 'nlp_model';
        tok.confidence = 0.72;
        tok.detectionDetails = {
          ...tok.detectionDetails,
          contextReason: 'Context Window Smoothing: Surrounded by English phrase constituents (w ± 2)',
        };
      }
    }
  }

  // Step 4: Peer-Reviewed Gambäck & Das (2014) CMI Calculation
  const cmi = calculateCMI(tokens);

  return {
    id: `sent_${Date.now()}`,
    rawText: rawInput,
    tokens,
    cmi,
    processingMethod: 'rule_based',
  };
}

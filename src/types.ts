export type LanguageClass = 'kannada' | 'english' | 'hybrid' | 'unknown' | 'punct' | 'ambiguous';
export type ProcessingMethod = 'rule_based' | 'nlp_model' | 'ai_interpreted' | 'user_corrected' | 'ground_truth';
export type SuffixType = 'dative' | 'locative' | 'instrumental' | 'accusative' | 'verbalizer' | 'auxiliary' | 'modal' | 'genitive' | 'plural';

export interface KannadaSuffixRule {
  id: string;
  suffix: string;
  grammaticalCase: SuffixType;
  description: string;
  examples: string[];
  enabled: boolean;
}

export interface MorphologyDetails {
  root: string;
  rootLanguage: 'kannada' | 'english' | 'unknown';
  suffix?: string;
  suffixLanguage?: 'kannada';
  suffixType?: SuffixType;
  suffixDescription?: string;
  isAmbiguous?: boolean;
  ambiguityReason?: string;
}

export interface TokenEntity {
  id: string;
  surface: string;
  kannadaUnicode: string;
  romanized: string;
  language: LanguageClass;
  posTag: string;
  morphology: MorphologyDetails;
  meaning?: string;
  processingMethod: ProcessingMethod;
  confidence: number;
  detectionDetails?: {
    phonotacticScore?: number;
    normalizedForm?: string;
    isSpellingVariant?: boolean;
    contextReason?: string;
  };
}

export interface CMIAnalysis {
  cmiScore: number;
  totalTokens: number;
  kannadaCount: number;
  englishCount: number;
  hybridCount: number;
  otherCount: number;
  switchPoints: number;
  formulaDescription: string;
}

export interface SentenceAnalysis {
  id: string;
  rawText: string;
  tokens: TokenEntity[];
  cmi: CMIAnalysis;
  translationEnglish?: string;
  formalKannada?: string;
  aiNuance?: string;
  processingMethod: ProcessingMethod;
}

export interface GroundTruthToken {
  surface: string;
  language: LanguageClass;
  root?: string;
  suffix?: string;
}

export interface CorpusEntry {
  id: string;
  title: string;
  domain: string;
  text: string;
  analysis: SentenceAnalysis;
  groundTruth: GroundTruthToken[];
}

export interface TokenClassificationError {
  surface: string;
  sentence: string;
  groundTruth: LanguageClass;
  predicted: LanguageClass;
  processingMethod: ProcessingMethod;
}

export interface EvaluationMetrics {
  totalTokensEvaluated: number;
  accuracy: number;
  precision: { kannada: number; english: number; hybrid: number; macro: number };
  recall: { kannada: number; english: number; hybrid: number; macro: number };
  f1Score: { kannada: number; english: number; hybrid: number; macro: number };
  confusionMatrix: { [groundTruth: string]: { [predicted: string]: number } };
  errors?: TokenClassificationError[];
}

export interface UserCorrection {
  id: string;
  surface: string;
  sentenceContext: string;
  originalPrediction: LanguageClass;
  correctedLanguage: LanguageClass;
  correctedRoot?: string;
  correctedSuffix?: string;
  correctedPos?: string;
  timestamp: number;
}

export type SocialRegister = 'colloquial' | 'professional' | 'civic';
export type AgglutinationStyle = 'hyphenated' | 'fluid';

export interface MorphologicalBreakdownItem {
  root: string;
  rootLanguage: 'english' | 'kannada' | 'unknown';
  suffix?: string;
  suffixLanguage?: 'kannada';
  suffixCase?: string;
  explanation?: string;
}

export interface GenerationRequest {
  prompt: string;
  sourceLanguage?: 'english' | 'kannada';
  mixingLevel: 'light' | 'moderate' | 'heavy';
  domainContext?: string;
  socialRegister?: SocialRegister;
  agglutinationStyle?: AgglutinationStyle;
  targetSuffixes?: string[];
}

export interface GenerationResponse {
  kanglishSentence: string;
  kannadaUnicodeSentence: string;
  englishTranslation: string;
  nuanceExplanation: string;
  morphologicalBreakdown?: MorphologicalBreakdownItem[];
  processingMethod: ProcessingMethod;
  analysis: SentenceAnalysis;
}

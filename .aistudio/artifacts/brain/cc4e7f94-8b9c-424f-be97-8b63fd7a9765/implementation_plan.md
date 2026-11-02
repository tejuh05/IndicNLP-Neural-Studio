# IndicNLP Neural Studio — Engineering Implementation Plan

IndicNLP Neural Studio is a specialized developer and research workspace engineered for cross-lingual NLP, focusing on code-mixed Kannada-English (Kanglish) linguistic data with agglutinated enclitic parsing, morphological decomposition, dataset annotation, and generative AI synthesis.

---

## 1. Component Evolution Matrix (Retained, Modified & Newly Introduced)

### Retained Components
- **Identity & Name**: "IndicNLP Neural Studio" maintained across metadata, page headers, and documentation.
- **Visual Identity & Design System**:
  - Dark slate glassmorphism palette: Canvas void `#090D16`, elevated surface `#0F172A`, floating glass panels `#131D31` at 75% opacity with `16px` backdrop blur and `1px` subtle highlight borders (`rgba(255, 255, 255, 0.1)`).
  - Semantic linguistic categorization colors:
    - Kannada (Dravidian Lexicon & Script): Warm Saffron / Amber Coral (`#F59E0B` / `#FBBF24`).
    - English (Latin Lexicon): Electric Cyan (`#06B6D4` / `#38BDF8`).
    - Code-Mixed & Hybrid Enclitics: Radiant Fuchsia / Violet (`#C026D3` / `#E879F9`).
    - Punctuation & Unknown: Muted Slate (`#64748B` / `#94A3B8`).
  - Typography: `Plus Jakarta Sans` for UI, navigation, and body; `JetBrains Mono` for token matrices, PoS tags, and raw JSON inspectors; Indic system cascade with minimum line-height `1.6` for Kannada script (`ಕನ್ನಡ`).
  - Layout: Three-panel desktop workbench (Left Navigation & Presets, Center Linguistic Canvas, Right Token Attribution & Inspector).
- **Technology Stack**: React 19 + TypeScript + Vite + Tailwind CSS v4 on the frontend, Express + Node.js with `@google/genai` on the backend.
- **Module Set**: All 4 core modules preserved: Token Inspector, Morphological Parser, Dataset Annotation Hub, and Generative Playground.

### Modified Components
- **Inference Engine (Hybrid Architecture)**:
  - Transitioned from pure LLM generation to a **Hybrid Engine**:
    - *Rule-Based Engine*: Fast, deterministic processing for tokenization, language identification, suffix detection, transliteration, and CMI calculation.
    - *Gemini 3.8 Flash AI Integration*: Server-side contextual sentence interpretation, cultural nuance notes, and synthetic code-mixed Kanglish generation.
  - *Linguistic Distinction*: Clear visual badge distinguishing verified rule-based parsing (`rule_based`) from AI-generated interpretations (`ai_interpreted`). AI explanations are explicitly disclaimed as contextual interpretations rather than absolute linguistic dogma.
- **Token Inspector**:
  - Expanded dual-layer support for:
    1. Kannada Unicode words (`ಕನ್ನಡ`).
    2. Romanized Kannada words (`namaskara`, `hegiddira`).
    3. English words (`laptop`, `deployment`, `meeting`).
    4. English roots with Kannada suffixes / enclitics (`college-ge`, `meeting-alli`, `open-maadi`).
    5. Unknown or ambiguous words (`buffer-inda`, `orange`).
  - Interactive token inspection drawer displaying language, root, suffix, root language, suffix language, Universal Dependencies PoS tag, and meaning.
- **Code-Switching Index (CMI) Calculation**:
  - Formalized Gambäck & Das (2014) mathematical definition with explicit display of Kannada token count, English token count, Hybrid token count, and language-switch transition points.
  - Dedicated interactive calculation modal explaining the exact formula and methodology.
- **Confidence Scoring Policy**:
  - Removed arbitrary, fabricated confidence float numbers. Only ground-truth verified matches or real test metric distributions are displayed.

### Newly Introduced Components
- **Modular Backend NLP Architecture (10 Discrete Services)**:
  1. `preprocessing`: Text normalization, Unicode NFC, whitespace preservation, punctuation isolation.
  2. `tokenizer`: Code-mixed regex tokenizer preserving enclitic hyphens and Kannada unicode conjuncts.
  3. `language_identifier`: Lexicon-based and Unicode-range language classifier (Kannada Unicode, Romanized Kannada, English, Hybrid, Punct, Unknown).
  4. `code_mixing_detector`: Transition point detection and burstiness metric calculation.
  5. `morphological_parser`: Configurable Kannada suffix rule engine with ambiguity heuristics.
  6. `pos_tagger`: Universal Dependencies Part-of-Speech tagger (NOUN, VERB, ADJ, ADV, AUX, PRON, ADP, PUNCT).
  7. `transliterator`: Bidirectional ISO 15919 phonetic mapping between Kannada script and Romanized Latin.
  8. `cmi_calculator`: Formal Gambäck & Das CMI engine.
  9. `gemini_service`: Server-side `@google/genai` handler using `gemini-3.8-flash` with structured JSON output and fallback resilience.
  10. `evaluation`: Ground-truth test suite calculator computing Accuracy, Precision, Recall, and Macro F1 only when verified labels exist.
- **Configurable Kannada Morphological Suffix Engine**:
  - Dedicated parser for the 7 primary Kannada suffixes:
    - `-ge` / `-ige` (Dative marker, e.g., *College-ge*, *Room-ge*)
    - `-alli` (Locative marker, e.g., *Office-alli*, *Bengaluru-alli*)
    - `-inda` (Instrumental/Ablative marker, e.g., *Bus-inda*, *Train-inda*)
    - `-annu` / `-na` (Accusative marker, e.g., *File-annu*, *Link-annu*)
    - `-maadi` / `-maado` (Verbalizer imperative, e.g., *Open-maadi*, *Call-maadi*)
    - `-aagide` / `-aaythu` (Stative auxiliary, e.g., *Finish-aagide*, *Complete-aaythu*)
    - `-beku` (Modal obligation, e.g., *Send-maadbeku*, *Go-aagbeku*)
  - Lexical ambiguity protection (distinguishes English nouns ending in letters "ge" like *Orange*, *Package*, *Message* from true Kannada dative affixes).
- **Dataset Hub Enhancements**:
  - Curated baseline Kanglish corpus with verified linguistic annotations.
  - In-browser manual token-label correction (re-tag language, root, or suffix with automatic provenance tracking).
  - CSV file upload, CSV export, and JSON export.
  - Evaluation panel with confusion matrix and P/R/F1-score computed against ground-truth datasets.

---

## 2. Updated Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       IndicNLP Neural Studio (Frontend)                     │
│                                                                             │
│  ┌───────────────────────┐  ┌────────────────────────────────────────────┐  │
│  │ Navigation Sidebar    │  │ Header: Single-line Wordmark & Preset Bar  │  │
│  │ - Primary Modules:    │  └────────────────────────────────────────────┘  │
│  │   • Token Inspector   │                                                  │
│  │   • Morpho-Parser     │  ┌────────────────────────┐ ┌──────────────────┐ │
│  │ - Advanced Modules:   │  │ Central Canvas Area    │ │ Token Detail     │ │
│  │   • Dataset Hub       │  │ - Dual-Layer Chips     │ │ - Root & Suffix  │ │
│  │   • Generative Lab    │  │ - Suffix Rule Controls │ │ - Root / Suffix  │ │
│  │                       │  │ - CMI Summary & Switch │ │   Language       │ │
│  │                       │  │ - Script Sync Preview  │ │ - PoS Tag & Role │ │
│  │                       │  │ - Dataset Editor Table │ │ - Provenance Tag │ │
│  └───────────────────────┘  └────────────────────────┘ └──────────────────┘ │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP REST API (/api/nlp/*)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Express Backend Pipeline (server.ts & modules)              │
│                                                                             │
│  ┌────────────────────────┐  ┌───────────────────────┐  ┌────────────────┐  │
│  │ 1. Preprocessing       │  │ 2. Tokenizer          │  │ 3. Lang ID     │  │
│  │ (Normalization)        │  │ (Hyphen & Unicode)    │  │ (Lexicon/Char) │  │
│  └───────────┬────────────┘  └───────────┬───────────┘  └────────┬───────┘  │
│              ▼                           ▼                       ▼          │
│  ┌────────────────────────┐  ┌───────────────────────┐  ┌────────────────┐  │
│  │ 4. Code-Mix Detector   │  │ 5. Morpho-Parser      │  │ 6. PoS Tagger  │  │
│  │ (Switch Boundaries)    │  │ (7 Kannada Suffixes)  │  │ (Universal PoS)│  │
│  └───────────┬────────────┘  └───────────┬───────────┘  └────────┬───────┘  │
│              ▼                           ▼                       ▼          │
│  ┌────────────────────────┐  ┌───────────────────────┐  ┌────────────────┐  │
│  │ 7. Transliterator      │  │ 8. CMI Calculator     │  │ 9. Evaluator   │  │
│  │ (ISO 15919 Engine)     │  │ (Gambäck-Das Math)    │  │ (P/R/F1 Metrics│  │
│  └────────────────────────┘  └───────────────────────┘  └────────────────┘  │
│                                          │                                  │
│                                          ▼                                  │
│                      ┌───────────────────────────────────────┐              │
│                      │ 10. Gemini Service (gemini-3.8-flash) │              │
│                      │ (Contextual Meaning & Kanglish Synth) │              │
│                      └───────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Models Specification

```typescript
export type LanguageClass = 'kannada' | 'english' | 'hybrid' | 'unknown' | 'punct';
export type ProcessingMethod = 'rule_based' | 'ai_interpreted' | 'ground_truth';

export interface KannadaSuffixRule {
  id: string;
  suffix: string; // e.g., "-ge", "-alli", "-inda", "-annu", "-maadi", "-aagide", "-beku"
  grammaticalCase: 'dative' | 'locative' | 'instrumental' | 'accusative' | 'verbalizer' | 'auxiliary' | 'modal';
  description: string;
  examples: string[];
  enabled: boolean;
}

export interface MorphologyDetails {
  root: string;
  rootLanguage: 'kannada' | 'english' | 'unknown';
  suffix?: string;
  suffixLanguage?: 'kannada';
  suffixType?: 'dative' | 'locative' | 'instrumental' | 'accusative' | 'verbalizer' | 'auxiliary' | 'modal';
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
  posTag: string; // Universal Dependencies: NOUN, VERB, ADJ, ADV, AUX, PRON, ADP, PUNCT
  morphology: MorphologyDetails;
  meaning?: string;
  processingMethod: ProcessingMethod;
}

export interface CMIAnalysis {
  cmiScore: number; // 0 to 100 percentage
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

export interface CorpusEntry {
  id: string;
  text: string;
  domain: string;
  tokens: TokenEntity[];
  groundTruth?: {
    tokens: { surface: string; language: LanguageClass; root?: string; suffix?: string }[];
  };
}

export interface EvaluationMetrics {
  totalTokensEvaluated: number;
  accuracy: number;
  precision: { kannada: number; english: number; hybrid: number; macro: number };
  recall: { kannada: number; english: number; hybrid: number; macro: number };
  f1Score: { kannada: number; english: number; hybrid: number; macro: number };
  confusionMatrix: { [groundTruth: string]: { [predicted: string]: number } };
}
```

---

## 4. Mathematical Definition of Code-Switching Index (CMI)

The studio computes Code-Switching Index using the peer-reviewed **Gambäck & Das (2014)** formulation adapted for multilingual Dravidian-English code-mixing:

$$CMI = 100 \times \left(1 - \frac{\max(w_k, w_e)}{N - u}\right) \quad \text{when } (N - u) > 0$$

Where:
- $N$: Total number of tokens in the sentence.
- $w_k$: Number of Kannada tokens (including native Dravidian words and hybrid enclitic components).
- $w_e$: Number of English tokens.
- $u$: Language-independent tokens (punctuation, numbers, special symbols).
- $\max(w_k, w_e)$: Count of the majority matrix language.

When all tokens belong to a single language ($w_k = N - u$ or $w_e = N - u$), $CMI = 0\%$. When Kannada and English are in equal equilibrium ($w_k = w_e$), $CMI = 50\%$. If hybrid tokens bridge the two, the enclitic distribution and switch frequency ($S$) are reported directly alongside CMI.

---

## 5. Implementation Priorities

1. **Phase 3A: Backend Modular Engine & Suffix Parser (Primary)**
   - Implement the 10 NLP services in `server/nlp/`.
   - Implement the 7 configurable Kannada suffix rules with ambiguity filters.
   - Implement Gambäck & Das CMI calculator and evaluation engine.
   - Wire server-side `@google/genai` proxy in `server.ts`.
2. **Phase 3B: Primary Modules UI (Primary)**
   - Token Inspector with dual-layer Kannada/Romanized chips, color-coded badges, and real-time detail inspector.
   - Morphological Parser view displaying root vs suffix separation, root language vs suffix language, and ambiguity explanations.
3. **Phase 3C: Advanced Modules UI (Advanced)**
   - Dataset Annotation Hub with verified corpus, inline label correction, CSV import, CSV/JSON export, and real evaluation metrics.
   - Generative AI Playground with Gemini 3.8 Flash synthesis, adjustable mixing intensity, and distinct AI-interpretation badges.
   - CMI formula explainer modal.
4. **Phase 3D: Verification & Quality Assurance**
   - Run compilation and tests, verify responsive design, ensure zero baseline clipping on Kannada Unicode.

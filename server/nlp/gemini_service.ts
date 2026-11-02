/**
 * Server-Side Gemini API Integration for IndicNLP Neural Studio
 * Uses @google/genai SDK with model 'gemini-3.8-flash'
 * Employs structured JSON schema, error handling, and deterministic fallback.
 * Strictly presents explanations as AI interpretations rather than verified linguistic facts.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { GenerationRequest, GenerationResponse, SentenceAnalysis } from './types.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Generates contextual code-mixed Kanglish sentences and semantic nuance analysis
 */
export async function generateCodeMixedUtterance(
  req: GenerationRequest,
  ruleBasedParser: (text: string) => SentenceAnalysis
): Promise<GenerationResponse> {
  const ai = getAiClient();

  // If Gemini API key is unavailable, use high-fidelity deterministic template fallback
  if (!ai) {
    return generateFallbackSynthesis(req, ruleBasedParser);
  }

  try {
    const registerDesc = req.socialRegister === 'professional'
      ? 'Professional Tech Workplace (formal/semi-formal, polished Slack/Teams discourse, respectful verbalizers)'
      : req.socialRegister === 'civic'
      ? 'Everyday Civic & Commute (transit, directions, urban commuting, public spaces)'
      : 'Colloquial Peer-to-Peer (casual youth, campus, informal chat with friends)';

    const styleDesc = req.agglutinationStyle === 'fluid'
      ? 'Fluid spoken orthography (attached directly without hyphens, e.g., "Collegege", "Meetingalli", "Submitmaadona")'
      : 'Hyphenated standard computational orthography (explicit hyphen between root and enclitic, e.g., "College-ge", "Meeting-alli", "Submit-maadona")';

    const targetSuffixesDesc = req.targetSuffixes && req.targetSuffixes.length > 0
      ? `Prioritize utilizing these specific Kannada enclitic suffixes where grammatically fitting: ${req.targetSuffixes.join(', ')}`
      : 'Utilize appropriate Dravidian enclitic suffixes (-ge, -alli, -inda, -annu, -maadi, -beku) where appropriate.';

    const systemPrompt = `You are a specialist computational linguist in South Asian code-mixed Dravidian languages, specializing in Kannada-English (Kanglish) agglutinated discourse.
Task: Synthesize a culturally authentic, grammatically natural code-mixed Kannada-English (Kanglish) sentence based on the user's input and context-aware parameters.

Linguistic & Morphological Guidelines:
1. Enclitics & Case Markers:
   - Dative (-ge / -ige): College-ge, Office-ge, Link-ge
   - Locative (-alli): Meeting-alli, Traffic-alli, Branch-alli
   - Instrumental (-inda): Bus-inda, Metro-inda, Email-inda
   - Accusative (-annu): File-annu, Ticket-annu, PR-annu
   - Verbalizer (-maadi / -maadona): Open-maadi, Share-maadi, Review-maadona
   - Stative/Modal Copula (-aagide / -aagbeku): Deploy-aagide, Complete-aagbeku
2. Orthography Style: ${styleDesc}
3. Register: ${registerDesc}
4. Suffix Directives: ${targetSuffixesDesc}
5. Mixing Level Targets:
   - Light: 15-25% CMI, predominantly English matrix with 1-2 Kannada pragmatic markers.
   - Moderate: 25-45% CMI, balanced Kanglish conversational discourse.
   - Heavy: 45-65% CMI, deep Dravidian matrix morphosyntax with English loanwords.

CRITICAL: Return strictly valid JSON conforming to the schema. Always decompose the code-mixed tokens in the morphologicalBreakdown array.`;

    const promptText = `Source Text / Concept: "${req.prompt}"
Source Language: ${req.sourceLanguage || 'english'}
Mixing Intensity Target: ${req.mixingLevel}
Social Register: ${req.socialRegister || 'colloquial'}
Agglutination Style: ${req.agglutinationStyle || 'hyphenated'}
Target Suffixes: ${req.targetSuffixes?.join(', ') || 'Auto-select'}
Domain Context: ${req.domainContext || 'General Workplace / Daily Conversation'}`;

    // Execute Gemini call with an 8-second timeout to prevent indefinite hangs
    const geminiPromise = (async () => {
      try {
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                kanglishSentence: {
                  type: Type.STRING,
                  description: 'The synthesized code-mixed Kanglish sentence in Latin script.',
                },
                kannadaUnicodeSentence: {
                  type: Type.STRING,
                  description: 'The equivalent representation rendered in native Kannada Unicode script (ಕನ್ನಡ).',
                },
                englishTranslation: {
                  type: Type.STRING,
                  description: 'Normalized standard English translation of the utterance.',
                },
                nuanceExplanation: {
                  type: Type.STRING,
                  description: 'Sociolinguistic and syntactic commentary on code-switching transitions, enclitic attachment, and pragmatic register (marked as AI interpretation).',
                },
                morphologicalBreakdown: {
                  type: Type.ARRAY,
                  description: 'Decomposed linguistic constituents for each code-mixed or agglutinated token.',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      root: { type: Type.STRING },
                      rootLanguage: { type: Type.STRING },
                      suffix: { type: Type.STRING },
                      suffixCase: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                    },
                    required: ['root', 'rootLanguage'],
                  },
                },
              },
              required: ['kanglishSentence', 'kannadaUnicodeSentence', 'englishTranslation', 'nuanceExplanation'],
            },
          },
        });
      } catch (err: any) {
        // Fallback attempt with 'gemini-flash-latest' if 2.5 encountered an issue
        return await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: `${systemPrompt}\n\n${promptText}`,
        });
      }
    })();

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 8 seconds')), 8000)
    );

    const response = (await Promise.race([geminiPromise, timeoutPromise])) as any;
    if (!response || !response.text) {
      throw new Error('Empty response from Gemini API');
    }

    let parsedJson: any = {};
    try {
      parsedJson = JSON.parse(response.text);
    } catch {
      // If output contained markdown fences or raw text
      const cleanJson = response.text.replace(/```json\n?|\n?```/g, '').trim();
      parsedJson = JSON.parse(cleanJson);
    }

    const kanglishSentence = parsedJson.kanglishSentence || req.prompt;
    const kannadaUnicodeSentence = parsedJson.kannadaUnicodeSentence || '';
    const englishTranslation = parsedJson.englishTranslation || '';
    const nuanceExplanation = parsedJson.nuanceExplanation || '';
    const morphologicalBreakdown = Array.isArray(parsedJson.morphologicalBreakdown)
      ? parsedJson.morphologicalBreakdown
      : [];

    // Run through deterministic rule-based pipeline for rigorous tokenization and CMI
    const analysis = ruleBasedParser(kanglishSentence);
    analysis.translationEnglish = englishTranslation;
    analysis.formalKannada = kannadaUnicodeSentence;
    analysis.aiNuance = nuanceExplanation;
    analysis.processingMethod = 'ai_interpreted';

    return {
      kanglishSentence,
      kannadaUnicodeSentence,
      englishTranslation,
      nuanceExplanation,
      morphologicalBreakdown,
      processingMethod: 'ai_interpreted',
      analysis,
    };
  } catch (err: any) {
    console.warn('Gemini API synthesis fallback activated:', err.message);
    return generateFallbackSynthesis(req, ruleBasedParser);
  }
}

/**
 * Deterministic fallback generator when Gemini API is offline or unconfigured
 */
function generateFallbackSynthesis(
  req: GenerationRequest,
  ruleBasedParser: (text: string) => SentenceAnalysis
): GenerationResponse {
  const p = req.prompt.trim();

  // Curated transformation patterns
  let kanglish = '';
  let kannadaScript = '';
  let englishTrans = '';
  let nuance = '';

  if (p.toLowerCase().includes('meeting') || p.toLowerCase().includes('demo')) {
    kanglish = 'Eevatthu sprint demo meeting-alli new feature open-maadi code-review complete-aagbeku.';
    kannadaScript = 'ಈವತ್ತು ಸ್ಪ್ರಿಂಟ್ ಡೆಮೊ ಮೀಟಿಂಗ್ನಲ್ಲಿ ನ್ಯೂ ಫೀಚರ್ ಓಪನ್ ಮಾಡಿ ಕೋಡ್-ರಿವ್ಯೂ ಕಂಪ್ಲೀಟ್ ಆಗ್ಬೇಕು.';
    englishTrans = 'In today\'s sprint demo meeting, we must open the new feature and complete the code review.';
    nuance = 'AI interpretation: Uses locative "-alli" on "meeting" and modal obligation "-aagbeku" on English predicate "complete".';
  } else if (p.toLowerCase().includes('college') || p.toLowerCase().includes('bus')) {
    kanglish = 'Naale morning college-ge bus-inda hogona, assignment submit-maadi library-ge visit-maadona.';
    kannadaScript = 'ನಾಳೆ ಮಾರ್ನಿಂಗ್ ಕಾಲೇಜಿಗೆ ಬಸ್ನಿಂದ ಹೋಗೋಣ, ಅಸೈನ್ಮೆಂಟ್ ಸಬ್ಮಿಟ್ ಮಾಡಿ ಲೈಬ್ರರಿಗೆ ವಿಸಿಟ್ ಮಾಡೋಣ.';
    englishTrans = 'Tomorrow morning let\'s go to college by bus, submit the assignment, and visit the library.';
    nuance = 'AI interpretation: Dative marker "-ge" on English loanwords "college" and "library", plus instrumental "-inda" on "bus".';
  } else if (p.toLowerCase().includes('package') || p.toLowerCase().includes('delivery') || p.toLowerCase().includes('order')) {
    kanglish = 'Amazon order delivered-aagide, invoice link-annu verify-maadi payment complete-maadi.';
    kannadaScript = 'ಅಮೆಜಾನ್ ಆರ್ಡರ್ ಡೆಲಿವರ್ ಆಗಿದೆ, ಇನ್ವಾಯ್ಸ್ ಲಿಂಕ್ಅನ್ನು ವೆರಿಫೈ ಮಾಡಿ ಪೇಮೆಂಟ್ ಕಂಪ್ಲೀಟ್ ಮಾಡಿ.';
    englishTrans = 'The Amazon order has been delivered; please verify the invoice link and complete the payment.';
    nuance = 'AI interpretation: Stative aspect "-aagide" on English verb "delivered", and accusative marker "-annu" on "link".';
  } else {
    // General adaptation
    kanglish = `${p}-ge related updates group-alli share-maadi, review complete-aagide.`;
    kannadaScript = `ಅಪ್ಡೇಟ್ಸ್ ಗ್ರೂಪ್ನಲ್ಲಿ ಶೇರ್ ಮಾಡಿ, ರಿವ್ಯೂ ಕಂಪ್ಲೀಟ್ ಆಗಿದೆ.`;
    englishTrans = `Please share updates related to "${p}" in the group; the review is completed.`;
    nuance = 'AI interpretation: Standard colloquial Dravidian frame with hybrid enclitic attachments for seamless workplace dialogue.';
  }

  // If fluid style requested, strip hyphen separators
  if (req.agglutinationStyle === 'fluid') {
    kanglish = kanglish.replace(/-([a-zA-Z]+)/g, '$1');
  }

  const analysis = ruleBasedParser(kanglish);
  analysis.translationEnglish = englishTrans;
  analysis.formalKannada = kannadaScript;
  analysis.aiNuance = nuance;
  analysis.processingMethod = 'rule_based';

  const morphologicalBreakdown = analysis.tokens
    .filter((t) => t.language === 'hybrid' || (t.morphology && t.morphology.suffix))
    .map((t) => ({
      root: t.morphology.root,
      rootLanguage: t.morphology.rootLanguage,
      suffix: t.morphology.suffix,
      suffixCase: t.morphology.suffixType || 'enclitic',
      explanation: `${t.morphology.root} (${t.morphology.rootLanguage}) + ${t.morphology.suffix} (Kannada ${t.morphology.suffixType || 'enclitic'})`,
    }));

  return {
    kanglishSentence: kanglish,
    kannadaUnicodeSentence: kannadaScript,
    englishTranslation: englishTrans,
    nuanceExplanation: nuance,
    morphologicalBreakdown,
    processingMethod: 'rule_based',
    analysis,
  };
}

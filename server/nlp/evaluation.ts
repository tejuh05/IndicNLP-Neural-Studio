/**
 * Ground-Truth Evaluation Module for IndicNLP Neural Studio
 * Measures Language Identification Accuracy, Precision, Recall, Macro F1,
 * and Token Classification Errors strictly against separate verified test data.
 */

import { UNSEEN_EVALUATION_TEST_SET } from './corpus.js';
import { EvaluationMetrics, GroundTruthToken, TokenClassificationError, TokenEntity, SentenceAnalysis } from './types.js';

export function evaluatePredictions(
  predictedTokens: TokenEntity[],
  groundTruthTokens: GroundTruthToken[],
  sentenceContext?: string
): EvaluationMetrics | null {
  if (!groundTruthTokens || groundTruthTokens.length === 0) {
    return null;
  }

  const classes: Array<'kannada' | 'english' | 'hybrid'> = ['kannada', 'english', 'hybrid'];
  const confusionMatrix: Record<string, Record<string, number>> = {
    kannada: { kannada: 0, english: 0, hybrid: 0, other: 0 },
    english: { kannada: 0, english: 0, hybrid: 0, other: 0 },
    hybrid: { kannada: 0, english: 0, hybrid: 0, other: 0 },
    other: { kannada: 0, english: 0, hybrid: 0, other: 0 },
  };

  const errors: TokenClassificationError[] = [];
  let totalEvaluated = 0;
  let correctCount = 0;

  const minLen = Math.min(predictedTokens.length, groundTruthTokens.length);

  for (let i = 0; i < minLen; i++) {
    const pred = predictedTokens[i];
    const gt = groundTruthTokens[i];

    // Filter out punctuation from formal classification metrics
    if (gt.language === 'punct' && pred.language === 'punct') {
      continue;
    }

    const gtClass = (gt.language === 'kannada' || gt.language === 'english' || gt.language === 'hybrid')
      ? gt.language
      : 'other';
    const predClass = (pred.language === 'kannada' || pred.language === 'english' || pred.language === 'hybrid')
      ? pred.language
      : 'other';

    confusionMatrix[gtClass] = confusionMatrix[gtClass] || { kannada: 0, english: 0, hybrid: 0, other: 0 };
    confusionMatrix[gtClass][predClass] = (confusionMatrix[gtClass][predClass] || 0) + 1;

    totalEvaluated++;
    if (gtClass === predClass) {
      correctCount++;
    } else {
      errors.push({
        surface: pred.surface,
        sentence: sentenceContext || 'Batch Test Sequence',
        groundTruth: gt.language,
        predicted: pred.language,
        processingMethod: pred.processingMethod,
      });
    }
  }

  if (totalEvaluated === 0) return null;

  const accuracy = Number((correctCount / totalEvaluated).toFixed(4));

  // Compute Precision, Recall, F1 per class
  const precision: Record<string, number> = {};
  const recall: Record<string, number> = {};
  const f1Score: Record<string, number> = {};

  let sumPrec = 0;
  let sumRec = 0;
  let sumF1 = 0;

  for (const c of classes) {
    const truePos = confusionMatrix[c]?.[c] || 0;
    const predPos = (confusionMatrix['kannada']?.[c] || 0) +
                    (confusionMatrix['english']?.[c] || 0) +
                    (confusionMatrix['hybrid']?.[c] || 0) +
                    (confusionMatrix['other']?.[c] || 0);

    const actualPos = (confusionMatrix[c]?.['kannada'] || 0) +
                      (confusionMatrix[c]?.['english'] || 0) +
                      (confusionMatrix[c]?.['hybrid'] || 0) +
                      (confusionMatrix[c]?.['other'] || 0);

    const p = predPos > 0 ? truePos / predPos : 0;
    const r = actualPos > 0 ? truePos / actualPos : 0;
    const f1 = (p + r) > 0 ? (2 * p * r) / (p + r) : 0;

    precision[c] = Number(p.toFixed(3));
    recall[c] = Number(r.toFixed(3));
    f1Score[c] = Number(f1.toFixed(3));

    sumPrec += p;
    sumRec += r;
    sumF1 += f1;
  }

  precision['macro'] = Number((sumPrec / classes.length).toFixed(3));
  recall['macro'] = Number((sumRec / classes.length).toFixed(3));
  f1Score['macro'] = Number((sumF1 / classes.length).toFixed(3));

  return {
    totalTokensEvaluated: totalEvaluated,
    accuracy,
    precision: precision as any,
    recall: recall as any,
    f1Score: f1Score as any,
    confusionMatrix,
    errors,
  };
}

/**
 * Runs evaluation on the separate unseen evaluation test set
 */
export function evaluateUnseenTestSet(
  analyzer: (text: string) => SentenceAnalysis
): EvaluationMetrics | null {
  const allPreds: TokenEntity[] = [];
  const allGts: GroundTruthToken[] = [];
  const allErrors: TokenClassificationError[] = [];

  for (const item of UNSEEN_EVALUATION_TEST_SET) {
    const analysis = analyzer(item.text);
    const metrics = evaluatePredictions(analysis.tokens, item.groundTruth, item.text);
    if (metrics) {
      allPreds.push(...analysis.tokens);
      allGts.push(...item.groundTruth);
      if (metrics.errors) {
        allErrors.push(...metrics.errors);
      }
    }
  }

  const combined = evaluatePredictions(allPreds, allGts);
  if (combined) {
    combined.errors = allErrors;
  }
  return combined;
}

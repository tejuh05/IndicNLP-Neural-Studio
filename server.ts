import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEVELOPMENT_EXAMPLES, UNSEEN_EVALUATION_TEST_SET } from './server/nlp/corpus.js';
import { evaluatePredictions, evaluateUnseenTestSet } from './server/nlp/evaluation.js';
import { generateCodeMixedUtterance } from './server/nlp/gemini_service.js';
import { analyzeSentence } from './server/nlp/pipeline.js';
import { transliterateToKannada, transliterateToLatin } from './server/nlp/transliterator.js';
import { addUserCorrection, getUserCorrections, removeUserCorrection } from './server/nlp/user_corrections.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Dev server must run on port 3000 in AI Studio environment.
  // Avoid binding to Cloud Run container PORT (8080) which is reserved by nginx.
  const portArgIndex = process.argv.indexOf('--port');
  const port = portArgIndex !== -1 && process.argv[portArgIndex + 1]
    ? parseInt(process.argv[portArgIndex + 1], 10)
    : (process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000);

  app.use(express.json({ limit: '10mb' }));

  // API Route: Get Curated Benchmark Development Corpus
  app.get('/api/nlp/corpus', (_req: Request, res: Response) => {
    try {
      const corpusWithAnalyses = DEVELOPMENT_EXAMPLES.map((c) => ({
        ...c,
        analysis: analyzeSentence(c.text),
      }));
      res.json({ corpus: corpusWithAnalyses });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch corpus' });
    }
  });

  // API Route: Get Separate Unseen Test Set
  app.get('/api/nlp/unseen-testset', (_req: Request, res: Response) => {
    try {
      res.json({ testSet: UNSEEN_EVALUATION_TEST_SET });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch test set' });
    }
  });

  // API Route: Parse Sentence with Generalizable, Context-Aware Pipeline
  app.post('/api/nlp/parse', (req: Request, res: Response) => {
    try {
      const { text, customRules } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text string is required in request body' });
        return;
      }
      const analysis = analyzeSentence(text, customRules);
      res.json(analysis);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Linguistic parsing error' });
    }
  });

  // API Route: Generative Code-Mixed Synthesis with Gemini & Context-Aware Engine
  app.post('/api/nlp/synthesize', async (req: Request, res: Response) => {
    try {
      const {
        prompt,
        sourceLanguage = 'english',
        mixingLevel = 'moderate',
        domainContext,
        socialRegister = 'colloquial',
        agglutinationStyle = 'hyphenated',
        targetSuffixes,
      } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt string is required in request body' });
        return;
      }

      const result = await generateCodeMixedUtterance(
        {
          prompt,
          sourceLanguage,
          mixingLevel,
          domainContext,
          socialRegister,
          agglutinationStyle,
          targetSuffixes,
        },
        analyzeSentence
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Synthesis error' });
    }
  });

  // API Route: Bidirectional Transliteration
  app.post('/api/nlp/transliterate', (req: Request, res: Response) => {
    try {
      const { text, targetScript = 'kannada' } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text is required' });
        return;
      }

      const result = targetScript === 'kannada'
        ? transliterateToKannada(text)
        : transliterateToLatin(text);

      res.json({ result, targetScript, original: text });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Transliteration error' });
    }
  });

  // API Route: Evaluate against Ground Truth
  app.post('/api/nlp/evaluate', (req: Request, res: Response) => {
    try {
      const { predictedTokens, groundTruthTokens, sentenceContext } = req.body;
      if (!predictedTokens || !groundTruthTokens) {
        res.status(400).json({ error: 'Both predictedTokens and groundTruthTokens are required' });
        return;
      }

      const metrics = evaluatePredictions(predictedTokens, groundTruthTokens, sentenceContext);
      if (!metrics) {
        res.status(400).json({ error: 'Evaluation failed: insufficient or mismatched token data' });
        return;
      }

      res.json(metrics);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Evaluation error' });
    }
  });

  // API Route: Run Evaluation on Separate Unseen Evaluation Test Set (Supports GET and POST)
  app.all('/api/nlp/evaluate-unseen', (_req: Request, res: Response) => {
    try {
      const metrics = evaluateUnseenTestSet(analyzeSentence);
      if (!metrics) {
        res.status(400).json({ error: 'Failed to evaluate unseen test set' });
        return;
      }
      res.json(metrics);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Unseen test set evaluation error' });
    }
  });

  // API Routes: User Corrections & Learning Memory Store
  app.get('/api/nlp/corrections', (_req: Request, res: Response) => {
    try {
      res.json({ corrections: getUserCorrections() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/nlp/corrections', (req: Request, res: Response) => {
    try {
      const { surface, sentenceContext, originalPrediction, correctedLanguage, correctedRoot, correctedSuffix, correctedPos } = req.body;
      if (!surface || !correctedLanguage) {
        res.status(400).json({ error: 'surface and correctedLanguage are required' });
        return;
      }

      const saved = addUserCorrection({
        surface,
        sentenceContext: sentenceContext || '',
        originalPrediction: originalPrediction || 'unknown',
        correctedLanguage,
        correctedRoot,
        correctedSuffix,
        correctedPos,
      });

      res.json({ success: true, correction: saved, allCorrections: getUserCorrections() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/nlp/corrections/:id', (req: Request, res: Response) => {
    try {
      const removed = removeUserCorrection(req.params.id);
      res.json({ success: removed, allCorrections: getUserCorrections() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite Integration in Development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Static Files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`IndicNLP Neural Studio server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

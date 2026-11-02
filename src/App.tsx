import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TokenInspectorView } from './components/TokenInspectorView';
import { MorphologicalParserView } from './components/MorphologicalParserView';
import { DatasetHub } from './components/DatasetHub';
import { GenerativePlayground } from './components/GenerativePlayground';
import { TokenDetailInspector } from './components/TokenDetailInspector';
import { CmiExplainerModal } from './components/CmiExplainerModal';
import {
  CorpusEntry,
  EvaluationMetrics,
  GenerationRequest,
  GenerationResponse,
  KannadaSuffixRule,
  LanguageClass,
  SentenceAnalysis,
  TokenEntity,
  UserCorrection,
} from './types';

const INITIAL_RULES: KannadaSuffixRule[] = [
  {
    id: 'dative_ge',
    suffix: '-ge',
    grammaticalCase: 'dative',
    description: 'Dative case marker ("to", "for", direction or recipient)',
    examples: ['College-ge', 'Bengaluru-ge', 'Room-ge', 'Team-ge', 'Manege'],
    enabled: true,
  },
  {
    id: 'locative_alli',
    suffix: '-alli',
    grammaticalCase: 'locative',
    description: 'Locative case marker ("in", "at", spatial/temporal enclosure)',
    examples: ['Meeting-alli', 'Office-alli', 'Folder-alli', 'Bengaluru-alli'],
    enabled: true,
  },
  {
    id: 'instrumental_inda',
    suffix: '-inda',
    grammaticalCase: 'instrumental',
    description: 'Instrumental / Ablative case marker ("from", "by", "with", source)',
    examples: ['Bus-inda', 'Train-inda', 'Code-inda', 'Error-inda'],
    enabled: true,
  },
  {
    id: 'accusative_annu',
    suffix: '-annu',
    grammaticalCase: 'accusative',
    description: 'Accusative direct object marker ("whom", "what")',
    examples: ['File-annu', 'Link-annu', 'Doc-annu', 'Ticket-annu'],
    enabled: true,
  },
  {
    id: 'verbalizer_maadi',
    suffix: '-maadi',
    grammaticalCase: 'verbalizer',
    description: 'Agglutinated verbalizer / imperative auxiliary ("do", "perform", "make")',
    examples: ['Open-maadi', 'Share-maadi', 'Submit-maadi', 'Check-maadi'],
    enabled: true,
  },
  {
    id: 'auxiliary_aagide',
    suffix: '-aagide',
    grammaticalCase: 'auxiliary',
    description: 'Stative / Perfective copula auxiliary ("has happened", "is completed")',
    examples: ['Finish-aagide', 'Deliver-aagide', 'Cancel-aagide'],
    enabled: true,
  },
  {
    id: 'modal_beku',
    suffix: '-beku',
    grammaticalCase: 'modal',
    description: 'Modal auxiliary denoting obligation, necessity, or intention ("must", "need")',
    examples: ['Complete-aagbeku', 'Submit-maadbeku', 'Send-maadbeku', 'Learn-beku'],
    enabled: true,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'inspector' | 'parser' | 'datasets' | 'playground'>('inspector');
  const [suffixRules, setSuffixRules] = useState<KannadaSuffixRule[]>(INITIAL_RULES);
  const [analysis, setAnalysis] = useState<SentenceAnalysis | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenEntity | null>(null);
  const [corpus, setCorpus] = useState<CorpusEntry[]>([]);
  const [evaluationMetrics, setEvaluationMetrics] = useState<EvaluationMetrics | null>(null);
  const [unseenEvaluationMetrics, setUnseenEvaluationMetrics] = useState<EvaluationMetrics | null>(null);
  const [userCorrections, setUserCorrections] = useState<UserCorrection[]>([]);
  const [cmiModalOpen, setCmiModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initial Load: Fetch Corpus, Unseen Test Evaluation & User Corrections
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        // 1. Fetch Development Benchmark Corpus
        const res = await fetch('/api/nlp/corpus');
        const data = await res.json();
        if (data.corpus && data.corpus.length > 0) {
          setCorpus(data.corpus);
          const firstItem = data.corpus[0];
          setAnalysis(firstItem.analysis);
          if (firstItem.analysis.tokens.length > 0) {
            setSelectedToken(firstItem.analysis.tokens[0]);
          }

          // Initial evaluation calculation against benchmark ground truth
          const allPreds = data.corpus.flatMap((c: CorpusEntry) => c.analysis.tokens);
          const allGts = data.corpus.flatMap((c: CorpusEntry) => c.groundTruth);
          if (allPreds.length > 0 && allGts.length > 0) {
            const evalRes = await fetch('/api/nlp/evaluate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ predictedTokens: allPreds, groundTruthTokens: allGts }),
            });
            const evalData = await evalRes.json();
            setEvaluationMetrics(evalData);
          }
        }

        // 2. Fetch User Corrections Store
        const corrRes = await fetch('/api/nlp/corrections');
        const corrData = await corrRes.json();
        if (corrData.corrections) {
          setUserCorrections(corrData.corrections);
        }

        // 3. Pre-load Unseen Test Set Evaluation
        const unseenRes = await fetch('/api/nlp/evaluate-unseen', { method: 'POST' });
        const unseenData = await unseenRes.json();
        setUnseenEvaluationMetrics(unseenData);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Parse Text Handler with Generalizable Context Engine
  const handleAnalyzeText = async (text: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/nlp/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, customRules: suffixRules }),
      });
      const data: SentenceAnalysis = await res.json();
      setAnalysis(data);
      if (data.tokens && data.tokens.length > 0) {
        setSelectedToken(data.tokens[0]);
      }
    } catch (err) {
      console.error('Parsing error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Suffix Rule
  const handleToggleRule = (ruleId: string) => {
    const updated = suffixRules.map((r) =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    );
    setSuffixRules(updated);
    if (analysis?.rawText) {
      fetch('/api/nlp/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: analysis.rawText, customRules: updated }),
      })
        .then((res) => res.json())
        .then((data: SentenceAnalysis) => {
          setAnalysis(data);
          if (selectedToken) {
            const match = data.tokens.find((t) => t.surface === selectedToken.surface);
            if (match) setSelectedToken(match);
          }
        });
    }
  };

  // Generative AI Synthesis Handler with Context-Aware Parameters
  const handleSynthesize = async (
    request: GenerationRequest
  ): Promise<GenerationResponse | null> => {
    setLoading(true);
    try {
      const res = await fetch('/api/nlp/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const data: GenerationResponse = await res.json();
      return data;
    } catch (err) {
      console.error('Synthesis error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add Synthesized Utterance to Corpus in Dataset Hub
  const handleAddToCorpus = (newEntry: CorpusEntry) => {
    setCorpus((prev) => [newEntry, ...prev]);
  };

  // Manual Token Label Correction & Learning Store Update
  const handleUpdateCorpusToken = async (
    entryId: string,
    tokenId: string,
    newLang: LanguageClass
  ) => {
    const targetEntry = corpus.find((e) => e.id === entryId);
    const targetToken = targetEntry?.analysis.tokens.find((t) => t.id === tokenId);

    if (targetToken && targetEntry) {
      // 1. Post to Active User Corrections Learning Memory
      try {
        const corrRes = await fetch('/api/nlp/corrections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            surface: targetToken.surface,
            sentenceContext: targetEntry.text,
            originalPrediction: targetToken.language,
            correctedLanguage: newLang,
            correctedRoot: targetToken.morphology.root,
            correctedSuffix: targetToken.morphology.suffix,
            correctedPos: targetToken.posTag,
          }),
        });
        const corrData = await corrRes.json();
        if (corrData.allCorrections) {
          setUserCorrections(corrData.allCorrections);
        }
      } catch (err) {
        console.error('Failed to save correction to exemplar memory:', err);
      }
    }

    // 2. Update Corpus State
    const updatedCorpus = corpus.map((entry) => {
      if (entry.id !== entryId) return entry;
      const updatedTokens = entry.analysis.tokens.map((tok) => {
        if (tok.id === tokenId) {
          return {
            ...tok,
            language: newLang,
            processingMethod: 'user_corrected' as const,
          };
        }
        return tok;
      });
      return {
        ...entry,
        analysis: {
          ...entry.analysis,
          tokens: updatedTokens,
        },
      };
    });
    setCorpus(updatedCorpus);

    // 3. If the currently viewed sentence matches, refresh active analysis
    if (analysis && targetEntry && analysis.rawText === targetEntry.text) {
      handleAnalyzeText(analysis.rawText);
    }
  };

  // Delete User Correction from Learning Memory
  const handleDeleteCorrection = async (id: string) => {
    try {
      const res = await fetch(`/api/nlp/corrections/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.allCorrections) {
        setUserCorrections(data.allCorrections);
      }
    } catch (err) {
      console.error('Failed to delete correction:', err);
    }
  };

  // Direct User Correction Handler from Token Inspector
  const handleSaveUserCorrection = async (corr: {
    surface: string;
    sentenceContext: string;
    originalPrediction: LanguageClass;
    correctedLanguage: LanguageClass;
    correctedRoot?: string;
    correctedSuffix?: string;
    correctedPos?: string;
  }) => {
    try {
      const res = await fetch('/api/nlp/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corr),
      });
      const data = await res.json();
      if (data.allCorrections) {
        setUserCorrections(data.allCorrections);
      }
      if (analysis?.rawText) {
        handleAnalyzeText(analysis.rawText);
      }
    } catch (err) {
      console.error('Failed to save user correction:', err);
    }
  };

  // Re-run Evaluation across development corpus
  const handleRunEvaluation = async () => {
    try {
      const allPreds = corpus.flatMap((c) => c.analysis.tokens);
      const allGts = corpus.flatMap((c) => c.groundTruth || []);
      const evalRes = await fetch('/api/nlp/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictedTokens: allPreds, groundTruthTokens: allGts }),
      });
      const evalData = await evalRes.json();
      setEvaluationMetrics(evalData);
    } catch (err) {
      console.error('Evaluation error:', err);
    }
  };

  // Run Separate Unseen Test Set Evaluation Suite
  const handleRunUnseenEvaluation = async () => {
    try {
      const res = await fetch('/api/nlp/evaluate-unseen', { method: 'POST' });
      const data = await res.json();
      setUnseenEvaluationMetrics(data);
    } catch (err) {
      console.error('Unseen evaluation error:', err);
    }
  };

  // Import CSV Rows into Dataset Hub
  const handleImportCsv = async (rows: { text: string; domain: string }[]) => {
    setLoading(true);
    try {
      const newEntries: CorpusEntry[] = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const res = await fetch('/api/nlp/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: r.text }),
        });
        const anal: SentenceAnalysis = await res.json();
        newEntries.push({
          id: `custom_${Date.now()}_${i}`,
          title: `Custom Upload ${i + 1}`,
          domain: r.domain || 'User Imported',
          text: r.text,
          analysis: anal,
          groundTruth: anal.tokens.map((t) => ({
            surface: t.surface,
            language: t.language,
            root: t.morphology.root,
            suffix: t.morphology.suffix,
          })),
        });
      }
      setCorpus([...newEntries, ...corpus]);
    } catch (err) {
      console.error('CSV import error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-[#dfe2ef] flex flex-col font-sans selection:bg-[#7c3aed]/40 selection:text-white">
      {/* 3-Zone Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenCmiModal={() => setCmiModalOpen(true)}
        currentCmiScore={analysis?.cmi?.cmiScore}
      />

      {/* Main 3-Pane Responsive Layout */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Central Workbench (8 Columns on Desktop) */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === 'inspector' && analysis && (
              <TokenInspectorView
                analysis={analysis}
                onAnalyze={handleAnalyzeText}
                selectedToken={selectedToken}
                onSelectToken={(token) => setSelectedToken(token)}
                onOpenCmiModal={() => setCmiModalOpen(true)}
                loading={loading}
              />
            )}

            {activeTab === 'parser' && analysis && (
              <MorphologicalParserView
                analysis={analysis}
                rules={suffixRules}
                onToggleRule={handleToggleRule}
                selectedToken={selectedToken}
                onSelectToken={(token) => setSelectedToken(token)}
              />
            )}

            {activeTab === 'datasets' && (
              <DatasetHub
                corpus={corpus}
                onSelectSentence={(text) => {
                  handleAnalyzeText(text);
                  setActiveTab('inspector');
                }}
                onUpdateCorpusToken={handleUpdateCorpusToken}
                onImportCsv={handleImportCsv}
                evaluationMetrics={evaluationMetrics}
                onRunEvaluation={handleRunEvaluation}
                unseenEvaluationMetrics={unseenEvaluationMetrics}
                onRunUnseenEvaluation={handleRunUnseenEvaluation}
                userCorrections={userCorrections}
                onDeleteCorrection={handleDeleteCorrection}
              />
            )}

            {activeTab === 'playground' && (
              <GenerativePlayground
                onSynthesize={handleSynthesize}
                onInspectInTokenizer={(sentence) => {
                  handleAnalyzeText(sentence);
                  setActiveTab('inspector');
                }}
                onAddToCorpus={handleAddToCorpus}
                loading={loading}
              />
            )}
          </div>

          {/* Right-Hand Attribution Inspector Panel (4 Columns on Desktop) */}
          <div className="lg:col-span-4 sticky top-20 h-[calc(100vh-6.5rem)]">
            <TokenDetailInspector
              token={selectedToken}
              sentenceContext={analysis?.rawText || ''}
              onSaveCorrection={handleSaveUserCorrection}
              onClose={() => setSelectedToken(null)}
            />
          </div>
        </div>
      </main>

      {/* CMI Explainer Modal */}
      <CmiExplainerModal
        isOpen={cmiModalOpen}
        onClose={() => setCmiModalOpen(false)}
        cmiData={analysis?.cmi}
      />
    </div>
  );
}

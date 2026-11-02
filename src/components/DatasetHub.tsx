import React, { useState, useRef } from 'react';
import { Database, Upload, Download, BarChart3, RefreshCw, FileText, Code2, UserCheck, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CorpusEntry, EvaluationMetrics, LanguageClass, UserCorrection } from '../types';

interface DatasetHubProps {
  corpus: CorpusEntry[];
  onSelectSentence: (sentenceText: string) => void;
  onUpdateCorpusToken: (entryId: string, tokenId: string, newLang: LanguageClass) => void;
  onImportCsv: (importedData: { text: string; domain: string }[]) => void;
  evaluationMetrics: EvaluationMetrics | null;
  onRunEvaluation: () => void;
  unseenEvaluationMetrics: EvaluationMetrics | null;
  onRunUnseenEvaluation: () => void;
  userCorrections: UserCorrection[];
  onDeleteCorrection: (id: string) => void;
}

export const DatasetHub: React.FC<DatasetHubProps> = ({
  corpus,
  onSelectSentence,
  onUpdateCorpusToken,
  onImportCsv,
  evaluationMetrics,
  onRunEvaluation,
  unseenEvaluationMetrics,
  onRunUnseenEvaluation,
  userCorrections,
  onDeleteCorrection,
}) => {
  const [selectedEntryId, setSelectedEntryId] = useState<string>(corpus[0]?.id || '');
  const [activeTabSub, setActiveTabSub] = useState<'corpus' | 'unseen_eval' | 'corrections'>('corpus');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeEntry = corpus.find(c => c.id === selectedEntryId) || corpus[0];

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(corpus, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `indicnlp_kanglish_dataset_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,ID,Domain,Sentence,Tokens_Count,CMI_Score\n';
    corpus.forEach(entry => {
      const escapedText = `"${entry.text.replace(/"/g, '""')}"`;
      csvContent += `${entry.id},${entry.domain},${escapedText},${entry.analysis.tokens.length},${entry.analysis.cmi.cmiScore}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `indicnlp_kanglish_corpus_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportConllu = () => {
    let conlluContent = '# IndicNLP Neural Studio - CoNLL-U Code-Mixed Dataset\n';
    corpus.forEach((entry, sIdx) => {
      conlluContent += `# sent_id = ${entry.id || `sent_${sIdx + 1}`}\n`;
      conlluContent += `# text = ${entry.text}\n`;
      conlluContent += `# domain = ${entry.domain}\n`;
      conlluContent += `# cmi = ${entry.analysis.cmi.cmiScore}%\n`;

      entry.analysis.tokens.forEach((tok, tIdx) => {
        const id = tIdx + 1;
        const form = tok.surface;
        const lemma = tok.morphology.root || tok.surface;
        const upos = tok.posTag || 'X';
        const xpos = '_';
        const feats = `Lang=${tok.language}|Suffix=${tok.morphology.suffix || '_'}|Case=${tok.morphology.suffixType || '_'}`;
        const head = '_';
        const deprel = '_';
        const deps = '_';
        const misc = `Unicode=${tok.kannadaUnicode || '_'}`;

        conlluContent += `${id}\t${form}\t${lemma}\t${upos}\t${xpos}\t${feats}\t${head}\t${deprel}\t${deps}\t${misc}\n`;
      });
      conlluContent += '\n';
    });

    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(conlluContent);
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `indicnlp_kanglish_${Date.now()}.conllu`);
    dlAnchorElem.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const lines = content.split('\n');
      const imported: { text: string; domain: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length >= 2) {
          imported.push({
            domain: parts[0].trim(),
            text: parts.slice(1).join(',').replace(/^"|"$/g, '').trim(),
          });
        } else if (parts.length === 1 && parts[0]) {
          imported.push({
            domain: 'Imported CSV',
            text: parts[0].replace(/^"|"$/g, '').trim(),
          });
        }
      }

      if (imported.length > 0) {
        onImportCsv(imported);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-white/[0.08]">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-[#7C3AED]" />
            <span>Dataset Engineering & Annotation Hub</span>
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Curated benchmark corpora, manual label correction, active user learning memory, and independent evaluation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131D31] hover:bg-[#1E293B] border border-white/[0.08] text-xs font-medium text-[#CBD5E1] transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131D31] hover:bg-[#1E293B] border border-white/[0.08] text-xs font-medium text-[#CBD5E1] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportConllu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131D31] hover:bg-[#1E293B] border border-white/[0.08] text-xs font-medium text-[#38BDF8] transition-colors"
            title="Universal Dependencies format"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Export CoNLL-U</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-xs font-medium text-white shadow-md shadow-purple-900/30 border border-white/20 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 text-xs">
        <button
          onClick={() => setActiveTabSub('corpus')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeTabSub === 'corpus'
              ? 'bg-[#7C3AED] text-white shadow-sm'
              : 'text-[#94A3B8] hover:text-white bg-white/[0.03]'
          }`}
        >
          Corpus Annotation ({corpus.length})
        </button>

        <button
          onClick={() => setActiveTabSub('unseen_eval')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTabSub === 'unseen_eval'
              ? 'bg-[#06B6D4] text-black font-semibold shadow-sm'
              : 'text-[#94A3B8] hover:text-white bg-white/[0.03]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Separate Unseen Test Set Evaluation</span>
        </button>

        <button
          onClick={() => setActiveTabSub('corrections')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTabSub === 'corrections'
              ? 'bg-amber-500 text-black font-semibold shadow-sm'
              : 'text-[#94A3B8] hover:text-white bg-white/[0.03]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Active Learning Memory ({userCorrections.length})</span>
        </button>
      </div>

      {/* Tab 1: Corpus Annotation */}
      {activeTabSub === 'corpus' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Curated Corpus List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-white uppercase tracking-wider font-sans">
                Curated Verification Sentences
              </span>
              <span className="text-[#94A3B8] font-mono">{corpus.length} entries</span>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {corpus.map((entry) => {
                const isSelected = entry.id === selectedEntryId;
                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      setSelectedEntryId(entry.id);
                      onSelectSentence(entry.text);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/50 text-white shadow-md'
                        : 'bg-[#131D31]/60 hover:bg-[#1E293B] border-white/[0.06] text-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-xs text-white truncate">{entry.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[#94A3B8] shrink-0">
                        {entry.domain}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 font-sans mb-2">
                      {entry.text}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] border-t border-white/[0.04] pt-2">
                      <span>{entry.analysis.tokens.length} tokens</span>
                      <span className="text-[#38BDF8]">CMI: {entry.analysis.cmi.cmiScore}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center / Right: Interactive Token Label Correction Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block">
                    Active Corpus Item: {activeEntry?.title}
                  </span>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    Manual Token-Label Correction (Saves directly to Learning Memory)
                  </p>
                </div>
              </div>

              {/* Token Correction List */}
              <div className="space-y-2">
                {activeEntry?.analysis.tokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D16]/60 border border-white/[0.06] text-xs hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-white font-semibold min-w-[120px]">
                        {token.surface}
                      </span>
                      <span className="font-kannada text-xs text-[#FBBF24]">
                        {token.kannadaUnicode}
                      </span>
                      {token.morphology.suffix && (
                        <span className="text-[#E879F9] font-mono text-[11px] bg-[#C026D3]/15 px-1.5 py-0.5 rounded">
                          {token.morphology.suffix}
                        </span>
                      )}
                    </div>

                    {/* Manual Label Selectors */}
                    <div className="flex items-center gap-1.5">
                      {(['kannada', 'english', 'hybrid', 'punct'] as LanguageClass[]).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => onUpdateCorpusToken(activeEntry.id, token.id, lang)}
                          className={`px-2 py-1 rounded-md text-[10px] font-mono transition-all uppercase ${
                            token.language === lang
                              ? lang === 'kannada'
                                ? 'bg-[#F59E0B] text-black font-bold shadow-sm'
                                : lang === 'english'
                                  ? 'bg-[#06B6D4] text-black font-bold shadow-sm'
                                  : lang === 'hybrid'
                                    ? 'bg-[#C026D3] text-white font-bold shadow-sm'
                                    : 'bg-slate-400 text-black font-bold shadow-sm'
                              : 'bg-white/[0.04] text-[#94A3B8] hover:text-white hover:bg-white/[0.08]'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Development Benchmark Metrics Panel */}
            <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#06B6D4]" />
                  <h4 className="text-sm font-semibold text-white">
                    Development Corpus Benchmark Accuracy
                  </h4>
                </div>

                <button
                  onClick={onRunEvaluation}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-white/10 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-evaluate Development Corpus</span>
                </button>
              </div>

              {evaluationMetrics && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-[#131D31]/80 border border-white/[0.06]">
                      <span className="text-[10px] text-[#94A3B8] block mb-0.5">Tokens Tested</span>
                      <span className="text-xl font-bold text-white font-mono tabular-nums">
                        {evaluationMetrics.totalTokensEvaluated}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#131D31]/80 border border-white/[0.06]">
                      <span className="text-[10px] text-[#94A3B8] block mb-0.5">Accuracy</span>
                      <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
                        {(evaluationMetrics.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#131D31]/80 border border-white/[0.06]">
                      <span className="text-[10px] text-[#94A3B8] block mb-0.5">Macro Precision</span>
                      <span className="text-xl font-bold text-[#38BDF8] font-mono tabular-nums">
                        {(evaluationMetrics.precision.macro * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#131D31]/80 border border-white/[0.06]">
                      <span className="text-[10px] text-[#94A3B8] block mb-0.5">Macro F1-Score</span>
                      <span className="text-xl font-bold text-[#E879F9] font-mono tabular-nums">
                        {(evaluationMetrics.f1Score.macro * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Separate Unseen Test Set Evaluation */}
      {activeTabSub === 'unseen_eval' && (
        <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                  Independent Test Set
                </span>
                <h4 className="text-base font-bold text-white">
                  Generalization Evaluation on Unseen Sentences
                </h4>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">
                Rigorous evaluation across 11 held-out test sentences (70+ tokens) containing unfamiliar Romanized Kannada and English words.
              </p>
            </div>

            <button
              onClick={onRunUnseenEvaluation}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-black bg-[#06B6D4] hover:bg-[#38BDF8] rounded-xl transition-all shadow-md font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run Unseen Evaluation Suite</span>
            </button>
          </div>

          {unseenEvaluationMetrics ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Score Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-[#131D31]/80 border border-white/[0.06]">
                  <span className="text-[10px] text-[#94A3B8] block mb-0.5">Tokens Evaluated</span>
                  <span className="text-2xl font-bold text-white font-mono tabular-nums">
                    {unseenEvaluationMetrics.totalTokensEvaluated}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#131D31]/80 border border-white/[0.06]">
                  <span className="text-[10px] text-[#94A3B8] block mb-0.5">Accuracy</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                    {(unseenEvaluationMetrics.accuracy * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#131D31]/80 border border-white/[0.06]">
                  <span className="text-[10px] text-[#94A3B8] block mb-0.5">Macro Precision</span>
                  <span className="text-2xl font-bold text-[#38BDF8] font-mono tabular-nums">
                    {(unseenEvaluationMetrics.precision.macro * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#131D31]/80 border border-white/[0.06]">
                  <span className="text-[10px] text-[#94A3B8] block mb-0.5">Macro F1-Score</span>
                  <span className="text-2xl font-bold text-[#E879F9] font-mono tabular-nums">
                    {(unseenEvaluationMetrics.f1Score.macro * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Per-Class Breakdown Table */}
              <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                <table className="w-full text-xs text-left border-collapse font-sans">
                  <thead className="bg-[#0B1120] text-[#94A3B8] uppercase tracking-wider font-mono text-[10px] border-b border-white/[0.06]">
                    <tr>
                      <th className="py-2.5 px-3">Linguistic Class</th>
                      <th className="py-2.5 px-3">Precision</th>
                      <th className="py-2.5 px-3">Recall</th>
                      <th className="py-2.5 px-3">F1-Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-mono">
                    <tr>
                      <td className="py-2.5 px-3 text-[#FBBF24]">Kannada (Dravidian)</td>
                      <td className="py-2.5 px-3 tabular-nums">{(unseenEvaluationMetrics.precision.kannada * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 tabular-nums">{(unseenEvaluationMetrics.recall.kannada * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 tabular-nums font-semibold text-white">{(unseenEvaluationMetrics.f1Score.kannada * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-[#38BDF8]">English (Latin)</td>
                      <td className="py-2.5 px-3 tabular-nums">{(unseenEvaluationMetrics.precision.english * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 tabular-nums">{(unseenEvaluationMetrics.recall.english * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 tabular-nums font-semibold text-white">{(unseenEvaluationMetrics.f1Score.english * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-[#E879F9]">Hybrid (Enclitics)</td>
                      <td className="py-2.5 px-3 tabular-nums">{(unseenEvaluationMetrics.precision.hybrid * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 tabular-nums">{(unseenEvaluationMetrics.recall.hybrid * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 tabular-nums font-semibold text-white">{(unseenEvaluationMetrics.f1Score.hybrid * 100).toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Token Classification Errors Log */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-white uppercase tracking-wider font-sans block">
                  Token Classification Errors Log:
                </span>
                {unseenEvaluationMetrics.errors && unseenEvaluationMetrics.errors.length > 0 ? (
                  <div className="space-y-1.5">
                    {unseenEvaluationMetrics.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/20 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-white font-bold">&quot;{err.surface}&quot;</span>
                          <span className="text-[#94A3B8] font-sans text-[11px]">in &quot;{err.sentence}&quot;</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          <span className="text-emerald-400">GT: {err.groundTruth}</span>
                          <span className="text-red-400">Pred: {err.predicted}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Zero classification errors detected on the unseen test set! Full generalization achieved.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[#94A3B8] bg-[#090D16] rounded-xl border border-white/[0.06]">
              Click &quot;Run Unseen Evaluation Suite&quot; to test the hybrid generalized engine on the separate test benchmark.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Active Learning Memory & User Corrections */}
      {activeTabSub === 'corrections' && (
        <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
          <div className="border-b border-white/[0.06] pb-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Active Exemplar Memory (Learning from User Corrections)</span>
            </h4>
            <p className="text-xs text-[#94A3B8] mt-1">
              Corrections recorded here are indexed directly in the runtime NLP engine with highest precedence, overriding ambiguous predictions for future tokenization.
            </p>
          </div>

          {userCorrections.length > 0 ? (
            <div className="space-y-2">
              {userCorrections.map((corr) => (
                <div
                  key={corr.id}
                  className="p-3 rounded-xl bg-[#0B1120] border border-white/[0.06] flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-white font-bold">&quot;{corr.surface}&quot;</span>
                      <span className="text-[10px] text-red-400 line-through font-mono">
                        {corr.originalPrediction}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold font-mono">
                        ↳ {corr.correctedLanguage.toUpperCase()}
                      </span>
                    </div>
                    {corr.sentenceContext && (
                      <p className="text-[11px] text-[#94A3B8] font-sans">
                        Context: &quot;{corr.sentenceContext}&quot;
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteCorrection(corr.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.05] transition-colors"
                    title="Remove correction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[#94A3B8] bg-[#090D16] rounded-xl border border-white/[0.06] text-xs">
              No user corrections recorded yet. When you re-tag a token in the &quot;Corpus Annotation&quot; tab, your verified correction will appear here and immediately enhance the system&apos;s active vocabulary memory.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

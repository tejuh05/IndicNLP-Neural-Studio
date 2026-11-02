import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, ChevronRight, Layers, ArrowRight, ArrowLeftRight, Brain, UserCheck } from 'lucide-react';
import { SentenceAnalysis, TokenEntity } from '../types';

interface TokenInspectorViewProps {
  analysis: SentenceAnalysis;
  onAnalyze: (text: string) => void;
  selectedToken: TokenEntity | null;
  onSelectToken: (token: TokenEntity) => void;
  onOpenCmiModal: () => void;
  loading: boolean;
}

// Curated presets including the 8 prompt-specified test sentences
const PRESET_SENTENCES = [
  {
    label: '1. Nale nivu office ge bartira?',
    text: 'Nale nivu office ge bartira?',
  },
  {
    label: '2. Nanu college ge hogtini.',
    text: 'Nanu college ge hogtini.',
  },
  {
    label: '3. Meeting mugithu, manege hogona.',
    text: 'Meeting mugithu, manege hogona.',
  },
  {
    label: '4. I am manege hogtini.',
    text: 'I am manege hogtini.',
  },
  {
    label: '5. Tomorrow exam ide.',
    text: 'Tomorrow exam ide.',
  },
  {
    label: '6. Nivu assignment submit madidira?',
    text: 'Nivu assignment submit madidira?',
  },
  {
    label: '7. Avanu project complete madilla.',
    text: 'Avanu project complete madilla.',
  },
  {
    label: '8. Ivattu class ide but nanu baralla.',
    text: 'Ivattu class ide but nanu baralla.',
  },
  {
    label: 'Sprint Demo & Code Review',
    text: 'Eevatthu meeting-alli new release open-maadi code-review complete-aagbeku.',
  },
  {
    label: 'Amazon Delivery & Link',
    text: 'Amazon package delivered-aagide, invoice link-annu check-maadi verify-maadbeku.',
  },
];

export const TokenInspectorView: React.FC<TokenInspectorViewProps> = ({
  analysis,
  onAnalyze,
  selectedToken,
  onSelectToken,
  onOpenCmiModal,
  loading,
}) => {
  const [inputText, setInputText] = useState(analysis.rawText || PRESET_SENTENCES[0].text);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onAnalyze(inputText.trim());
    }
  };

  const handleSelectPreset = (text: string) => {
    setInputText(text);
    onAnalyze(text);
  };

  const getTokenStyle = (token: TokenEntity, isSelected: boolean) => {
    let base = 'transition-all duration-150 cursor-pointer text-left ';
    if (isSelected) {
      base += 'ring-2 ring-white shadow-lg scale-105 z-10 ';
    } else {
      base += 'hover:scale-[1.02] hover:shadow-md ';
    }

    switch (token.language) {
      case 'kannada':
        return base + 'bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/35 text-[#FBBF24]';
      case 'english':
        return base + 'bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20 border border-[#06B6D4]/35 text-[#38BDF8]';
      case 'hybrid':
        return base + 'bg-[#C026D3]/12 hover:bg-[#C026D3]/25 border border-[#C026D3]/40 text-[#E879F9]';
      case 'ambiguous':
      case 'unknown':
        return base + 'bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/40 text-amber-300';
      case 'punct':
        return base + 'bg-slate-800/40 hover:bg-slate-800/70 border border-white/10 text-[#94A3B8]';
      default:
        return base + 'bg-slate-800/30 hover:bg-slate-800/50 border border-white/10 text-[#CBD5E1]';
    }
  };

  const renderMethodIcon = (token: TokenEntity) => {
    switch (token.processingMethod) {
      case 'user_corrected':
        return <span title="User Corrected Exemplar"><UserCheck className="w-2.5 h-2.5 text-amber-300" /></span>;
      case 'nlp_model':
        return <span title="Subword NLP Model"><Brain className="w-2.5 h-2.5 text-sky-400" /></span>;
      case 'ai_interpreted':
        return <span title="AI Assisted Context"><Sparkles className="w-2.5 h-2.5 text-purple-400" /></span>;
      case 'rule_based':
      default:
        return <span title="Deterministic Rule"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /></span>;
    }
  };

  const lexicalTokens = analysis.tokens.filter((t) => t.language !== 'punct');

  return (
    <div className="space-y-6 text-left">
      {/* Preset Selector Strip */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-[#94A3B8] font-medium text-[11px] uppercase tracking-wider">
            Verification Test Sentences (1-8 & Unseen Corpora):
          </span>
          <span className="text-[10px] text-[#38BDF8] font-mono">10 Presets</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {PRESET_SENTENCES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset.text)}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap text-xs shrink-0 ${
                analysis.rawText === preset.text
                  ? 'bg-purple-950/50 border-purple-400 text-white font-medium shadow-sm'
                  : 'bg-[#131D31]/70 hover:bg-[#1E293B] border-white/[0.08] text-[#CBD5E1] hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 rounded-2xl glass-panel border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#7C3AED]" />
            <span>Code-Mixed Sentence Input (Latin Kanglish, Spelling Variants or Kannada Unicode)</span>
          </label>
          <span className="text-[11px] text-[#94A3B8] font-mono">
            {inputText.length} chars
          </span>
        </div>

        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-white/10 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-white placeholder-slate-500 font-sans text-sm resize-none kannada-text transition-all outline-none"
            placeholder="Type any new, unseen code-mixed sentence (e.g. Nale nivu office ge bartira?)..."
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <Brain className="w-3.5 h-3.5 text-sky-400" />
            <span>Context-Aware & Phonotactic Engine Active (Handles Unseen Words)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setInputText('');
              }}
              className="px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors border border-transparent"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] hover:from-[#6D28D9] hover:to-[#4338CA] rounded-lg transition-all shadow-md shadow-purple-900/30 border border-white/20 active:scale-[0.98] disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Analyzing...' : 'Parse & Tokenize'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl glass-panel border border-white/[0.08]">
          <span className="text-[11px] text-[#94A3B8] font-sans block mb-1">Total Tokens</span>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {analysis.tokens.length}
          </div>
          <span className="text-[10px] text-[#94A3B8] block mt-0.5">
            {lexicalTokens.length} lexical words
          </span>
        </div>

        <div
          onClick={onOpenCmiModal}
          className="p-3.5 rounded-xl glass-panel border border-[#06B6D4]/30 hover:border-[#06B6D4]/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[#38BDF8] font-sans">Code-Switch Index</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#38BDF8] group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums flex items-baseline gap-1">
            <span>{analysis.cmi.cmiScore}%</span>
          </div>
          <span className="text-[10px] text-[#94A3B8] block mt-0.5">Gambäck & Das (2014)</span>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-white/[0.08]">
          <span className="text-[11px] text-[#94A3B8] font-sans block mb-1">Language Mix</span>
          <div className="flex items-center gap-1.5 mt-1 font-mono text-xs">
            <span className="text-[#FBBF24] font-bold">{analysis.cmi.kannadaCount} KN</span>
            <span className="text-slate-500">/</span>
            <span className="text-[#38BDF8] font-bold">{analysis.cmi.englishCount} EN</span>
            <span className="text-slate-500">/</span>
            <span className="text-[#E879F9] font-bold">{analysis.cmi.hybridCount} HYB</span>
          </div>
          <span className="text-[10px] text-[#94A3B8] block mt-1.5">
            {analysis.cmi.switchPoints} switch points
          </span>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-white/[0.08]">
          <span className="text-[11px] text-[#94A3B8] font-sans block mb-1">Inference Architecture</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-sky-300 font-semibold text-xs flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-sky-400" />
              Hybrid Generalizer
            </span>
          </div>
          <span className="text-[10px] text-[#94A3B8] block mt-1">
            Phonotactics + Sequence Context
          </span>
        </div>
      </div>

      {/* Dual-Layer Token Matrix */}
      <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Interactive Dual-Layer Token Matrix</h3>
            <p className="text-xs text-[#94A3B8]">
              Top: Kannada script (`ಕನ್ನಡ`) · Bottom: Romanized transliteration. Click any token to inspect morphology.
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-[#FBBF24]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> Kannada
            </span>
            <span className="flex items-center gap-1 text-[#38BDF8]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]"></span> English
            </span>
            <span className="flex items-center gap-1 text-[#E879F9]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C026D3]"></span> Hybrid (Enclitic)
            </span>
          </div>
        </div>

        {/* Tokens Container */}
        <div className="flex flex-wrap gap-2.5 items-stretch py-2">
          {analysis.tokens.map((token) => {
            const isSelected = selectedToken?.id === token.id;
            const conf = token.confidence !== undefined ? Math.round(token.confidence * 100) : 95;
            const barColor = conf >= 90 ? 'bg-emerald-400' : conf >= 75 ? 'bg-sky-400' : 'bg-amber-400';
            return (
              <div
                key={token.id}
                onClick={() => onSelectToken(token)}
                className={`rounded-xl px-3 py-2 min-w-[96px] ${getTokenStyle(token, isSelected)}`}
              >
                {/* Native Kannada Script */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-kannada text-xs font-semibold leading-relaxed">
                    {token.kannadaUnicode || token.surface}
                  </span>
                  <div className="opacity-80">
                    {renderMethodIcon(token)}
                  </div>
                </div>

                {/* Sub-hairline separator */}
                <div className="border-t border-current/20 my-1"></div>

                {/* Romanized Surface + PoS */}
                <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                  <span className="font-medium truncate max-w-[80px]">{token.surface}</span>
                  <span className="text-[9px] opacity-75 uppercase tracking-wider bg-black/20 px-1 rounded">
                    {token.posTag}
                  </span>
                </div>

                {/* Real Confidence Progress Bar */}
                <div className="mt-1.5 flex items-center gap-1.5 pt-0.5">
                  <div className="flex-1 bg-black/30 rounded-full h-1 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${conf}%` }}></div>
                  </div>
                  <span className="text-[8px] font-mono opacity-80 tabular-nums">{conf}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code-Switching Transition Boundary Flow Strip */}
      <div className="p-4 rounded-xl glass-panel border border-white/[0.08] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Code-Switching Transition Path ({analysis.cmi.switchPoints} switches detected)</span>
          </span>
          <span className="text-[10px] text-[#94A3B8] font-mono">Sequence Flow</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 font-mono text-[11px]">
          {lexicalTokens.map((token, idx) => {
            const nextToken = lexicalTokens[idx + 1];
            const isSwitch = nextToken && nextToken.language !== token.language;

            return (
              <React.Fragment key={token.id}>
                <button
                  onClick={() => onSelectToken(token)}
                  className={`px-2.5 py-1 rounded-md transition-all shrink-0 border ${
                    token.language === 'kannada'
                      ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#FBBF24]'
                      : token.language === 'english'
                        ? 'bg-[#06B6D4]/10 border-[#06B6D4]/30 text-[#38BDF8]'
                        : 'bg-[#C026D3]/15 border-[#C026D3]/35 text-[#E879F9]'
                  }`}
                >
                  <span>{token.surface}</span>
                  <span className="text-[9px] opacity-60 ml-1">({token.language.slice(0, 2).toUpperCase()})</span>
                </button>

                {isSwitch && (
                  <div className="flex items-center px-0.5 text-purple-400 shrink-0" title="Language switch boundary">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Translations & Nuances if present */}
      {(analysis.translationEnglish || analysis.formalKannada || analysis.aiNuance) && (
        <div className="p-4 rounded-xl glass-panel border border-white/[0.08] space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-purple-300 font-semibold font-sans">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Contextual Meaning & Interpretation</span>
          </div>
          {analysis.translationEnglish && (
            <div className="text-slate-300">
              <strong className="text-white">English Translation:</strong> {analysis.translationEnglish}
            </div>
          )}
          {analysis.formalKannada && (
            <div className="text-slate-300 kannada-text">
              <strong className="text-white">Formal Kannada:</strong> {analysis.formalKannada}
            </div>
          )}
          {analysis.aiNuance && (
            <div className="text-[#94A3B8] italic pt-1 border-t border-white/[0.06]">
              {analysis.aiNuance}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

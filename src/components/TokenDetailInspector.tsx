import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, CheckCircle2, AlertTriangle, Code, Copy, Check, Brain, UserCheck, ShieldCheck, Edit3, Save } from 'lucide-react';
import { TokenEntity, LanguageClass } from '../types';

interface TokenDetailInspectorProps {
  token: TokenEntity | null;
  sentenceContext?: string;
  onSaveCorrection?: (correction: {
    surface: string;
    sentenceContext: string;
    originalPrediction: LanguageClass;
    correctedLanguage: LanguageClass;
    correctedRoot?: string;
    correctedSuffix?: string;
    correctedPos?: string;
  }) => void;
  onClose?: () => void;
}

export const TokenDetailInspector: React.FC<TokenDetailInspectorProps> = ({
  token,
  sentenceContext = '',
  onSaveCorrection,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageClass>('kannada');
  const [editedPos, setEditedPos] = useState('');
  const [editedRoot, setEditedRoot] = useState('');
  const [editedSuffix, setEditedSuffix] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      setSelectedLang(token.language);
      setEditedPos(token.posTag || '');
      setEditedRoot(token.morphology.root || token.surface);
      setEditedSuffix(token.morphology.suffix || '');
      setIsEditing(false);
      setSavedSuccess(false);
    }
  }, [token]);

  if (!token) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#94A3B8] glass-panel rounded-2xl border border-white/[0.08]">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3 text-[#64748B]">
          <Tag className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-white">No Token Selected</p>
        <p className="text-xs text-[#94A3B8] mt-1 max-w-[200px]">
          Click any word in the Token Matrix to inspect its morphological root, enclitic affix, confidence score, and detection origin.
        </p>
      </div>
    );
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(token, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveCorrection && token) {
      onSaveCorrection({
        surface: token.surface,
        sentenceContext,
        originalPrediction: token.language,
        correctedLanguage: selectedLang,
        correctedRoot: editedRoot.trim() || undefined,
        correctedSuffix: editedSuffix.trim() || undefined,
        correctedPos: editedPos.trim() || undefined,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setIsEditing(false);
      }, 1500);
    }
  };

  const getLangBadge = (lang: string) => {
    switch (lang) {
      case 'kannada':
        return 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/35';
      case 'english':
        return 'bg-[#06B6D4]/15 text-[#38BDF8] border-[#06B6D4]/35';
      case 'hybrid':
        return 'bg-[#C026D3]/15 text-[#E879F9] border-[#C026D3]/40';
      case 'ambiguous':
      case 'unknown':
        return 'bg-amber-950/40 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-700/30 text-[#94A3B8] border-white/10';
    }
  };

  const renderProcessingMethodBadge = () => {
    switch (token.processingMethod) {
      case 'user_corrected':
        return (
          <span className="text-amber-300 font-mono text-[11px] flex items-center gap-1 font-semibold">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Active Exemplar Store
          </span>
        );
      case 'nlp_model':
        return (
          <span className="text-sky-300 font-mono text-[11px] flex items-center gap-1 font-semibold">
            <Brain className="w-3.5 h-3.5 text-sky-400" /> Subword NLP Model
          </span>
        );
      case 'ai_interpreted':
        return (
          <span className="text-purple-400 font-mono text-[11px] flex items-center gap-1 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI-Assisted Context
          </span>
        );
      case 'rule_based':
      default:
        return (
          <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Rule & Core Lexicon Defense
          </span>
        );
    }
  };

  const confValue = token.confidence !== undefined ? Math.round(token.confidence * 100) : 95;
  const confColor =
    confValue >= 90
      ? 'text-emerald-400 bg-emerald-500'
      : confValue >= 75
        ? 'text-sky-400 bg-sky-500'
        : 'text-amber-400 bg-amber-500';

  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl border border-white/[0.08] overflow-hidden text-left">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.08] bg-[#131D31]/40 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
            Token Attribution Inspector
          </span>
          <h3 className="text-lg font-bold text-white font-mono mt-0.5 flex items-center gap-2">
            <span>{token.surface}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${getLangBadge(token.language)}`}>
              {token.language.toUpperCase()}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {onSaveCorrection && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              title="Manual Token Label Correction"
              className={`p-1.5 rounded-lg border transition-colors ${
                isEditing
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white border-white/[0.06]'
              }`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleCopyJson}
            title="Copy Token JSON"
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white transition-colors border border-white/[0.06]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* Real Probabilistic Confidence Meter */}
        <div className="p-3 rounded-xl bg-[#0B1120] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-mono">
              Inference Confidence
            </span>
            <span className={`font-mono font-bold text-xs ${confColor.split(' ')[0]}`}>
              {confValue}%
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${confColor.split(' ')[1]}`}
              style={{ width: `${confValue}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-mono">
              Provenance:
            </span>
            {renderProcessingMethodBadge()}
          </div>

          {token.detectionDetails?.contextReason && (
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1.5 border-t border-white/[0.04]">
              {token.detectionDetails.contextReason}
            </p>
          )}
        </div>

        {/* User Correction & Active Exemplar Form (if active) */}
        {isEditing && (
          <form onSubmit={handleSaveCorrectionSubmit} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                Active Learning Override
              </span>
              <span className="text-[10px] text-slate-400">Stored with Conf=1.0</span>
            </div>

            <div>
              <label className="text-[10px] text-[#94A3B8] block mb-1">Target Language Class:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['kannada', 'english', 'hybrid'] as LanguageClass[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLang(lang)}
                    className={`py-1 text-center rounded text-[11px] font-mono capitalize border transition-all ${
                      selectedLang === lang
                        ? 'bg-amber-500/30 border-amber-400 text-white font-bold'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#94A3B8] block mb-0.5">Root Stem:</label>
                <input
                  type="text"
                  value={editedRoot}
                  onChange={(e) => setEditedRoot(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#090D16] border border-white/10 text-white text-xs font-mono outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#94A3B8] block mb-0.5">Suffix (Optional):</label>
                <input
                  type="text"
                  value={editedSuffix}
                  onChange={(e) => setEditedSuffix(e.target.value)}
                  placeholder="-ge, -alli"
                  className="w-full px-2 py-1 rounded bg-[#090D16] border border-white/10 text-white text-xs font-mono outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#94A3B8] block mb-0.5">Part-of-Speech Tag:</label>
              <input
                type="text"
                value={editedPos}
                onChange={(e) => setEditedPos(e.target.value)}
                placeholder="NOUN, VERB, PRON..."
                className="w-full px-2 py-1 rounded bg-[#090D16] border border-white/10 text-white text-xs font-mono outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-[11px] text-[#94A3B8] hover:text-white rounded hover:bg-white/[0.05]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded text-[11px] flex items-center gap-1 shadow-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Correction
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Dual Script Comparison */}
        <div className="p-3.5 rounded-xl bg-[#090D16] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-[11px] font-sans">Kannada Script (ಕನ್ನಡ):</span>
            <span className="font-kannada text-base text-[#FBBF24] font-semibold">
              {token.kannadaUnicode || token.surface}
            </span>
          </div>
          <div className="border-t border-white/[0.06] pt-2 flex items-center justify-between text-[#94A3B8]">
            <span className="text-[11px] font-sans">Romanized Phonetic:</span>
            <span className="font-mono text-xs text-[#38BDF8] font-medium">
              {token.romanized || token.surface}
            </span>
          </div>
        </div>

        {/* Spelling Variation / Canonicalization */}
        {token.detectionDetails?.isSpellingVariant && token.detectionDetails.normalizedForm && (
          <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/20 space-y-1">
            <span className="text-[10px] font-mono text-sky-300 uppercase tracking-wider font-semibold block">
              Spelling Variant Detected:
            </span>
            <div className="flex items-center justify-between text-xs font-mono text-white">
              <span>Input: &quot;{token.surface}&quot;</span>
              <span className="text-sky-400 font-bold">↳ Canonical: &quot;{token.detectionDetails.normalizedForm}&quot;</span>
            </div>
          </div>
        )}

        {/* Morphological Decomposition Box */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-sans">
              Dravidian Morphology
            </span>
            {token.morphology.isAmbiguous && (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                <AlertTriangle className="w-3 h-3" />
                Ambiguous
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-lg bg-[#131D31]/80 border border-white/[0.06]">
              <span className="text-[10px] text-[#94A3B8] block mb-1">Root Stem</span>
              <div className="font-mono text-sm text-white font-semibold">
                {token.morphology.root || token.surface}
              </div>
              <div className="text-[10px] text-[#94A3B8] mt-1 capitalize">
                Language: <strong className="text-white">{token.morphology.rootLanguage}</strong>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#131D31]/80 border border-white/[0.06]">
              <span className="text-[10px] text-[#94A3B8] block mb-1">Enclitic Suffix</span>
              <div className="font-mono text-sm text-[#E879F9] font-semibold">
                {token.morphology.suffix || 'None (Bare stem)'}
              </div>
              <div className="text-[10px] text-[#94A3B8] mt-1 capitalize">
                Language: <strong className="text-white">{token.morphology.suffixLanguage || 'N/A'}</strong>
              </div>
            </div>
          </div>

          {token.morphology.suffixDescription && (
            <div className="p-2.5 rounded-lg bg-[#131D31]/40 border border-white/[0.06] text-[#CBD5E1]">
              <span className="text-[10px] text-[#94A3B8] block mb-0.5 uppercase tracking-wider">
                Grammatical Role:
              </span>
              <span>{token.morphology.suffixDescription}</span>
            </div>
          )}
        </div>

        {/* Syntactic & PoS Tagging */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-white uppercase tracking-wider font-sans">
            Universal PoS & Syntax
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-lg bg-[#131D31]/60 border border-white/[0.06]">
              <span className="text-[10px] text-[#94A3B8] block">Universal PoS:</span>
              <span className="font-mono text-xs text-[#38BDF8] font-bold">{token.posTag}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#131D31]/60 border border-white/[0.06]">
              <span className="text-[10px] text-[#94A3B8] block">Phonotactic Bias:</span>
              <span className="font-mono text-xs font-semibold text-purple-300">
                {token.detectionDetails?.phonotacticScore !== undefined
                  ? `${token.detectionDetails.phonotacticScore > 0 ? '+KN' : '-EN'} (${token.detectionDetails.phonotacticScore})`
                  : 'N/A (Lexicon/Rule)'}
              </span>
            </div>
          </div>
        </div>

        {/* Meaning / Semantic Gloss */}
        {token.meaning && (
          <div className="p-3 rounded-lg bg-[#131D31]/40 border border-white/[0.06] text-[#CBD5E1]">
            <span className="text-[10px] text-[#94A3B8] block mb-0.5 uppercase tracking-wider">
              Semantic Meaning:
            </span>
            <span className="font-sans text-xs">{token.meaning}</span>
          </div>
        )}

        {/* Raw JSON View */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <Code className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider font-mono">Raw Node Structure</span>
          </div>
          <pre className="p-2.5 rounded-lg bg-[#090D16] border border-white/[0.06] text-[10px] font-mono text-[#94A3B8] overflow-x-auto max-h-36">
            {JSON.stringify(token, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  ArrowLeftRight,
  Check,
  AlertCircle,
  Copy,
  Cpu,
  ShieldCheck,
  BookOpen,
  Sliders,
  Database,
  CheckCircle2,
  Share2,
  Workflow,
  Info,
} from 'lucide-react';
import {
  CorpusEntry,
  GenerationRequest,
  GenerationResponse,
  GroundTruthToken,
  SocialRegister,
  AgglutinationStyle,
} from '../types';
import { preprocessSentence, PreprocessingSentenceResult } from '../nlp/language_detector';

interface GenerativePlaygroundProps {
  onSynthesize: (request: GenerationRequest) => Promise<GenerationResponse | null>;
  onInspectInTokenizer: (sentence: string) => void;
  onAddToCorpus?: (entry: CorpusEntry) => void;
  loading: boolean;
}

interface PresetScenario {
  id: string;
  title: string;
  category: string;
  prompt: string;
  domain: string;
  register: SocialRegister;
  mixingLevel: 'light' | 'moderate' | 'heavy';
  agglutinationStyle: AgglutinationStyle;
  targetSuffixes: string[];
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'tech_workplace',
    title: 'Code Review & Sprint Meeting',
    category: 'Workplace Tech',
    prompt: 'Please open the meeting, share the design doc link, and submit the review.',
    domain: 'Software Engineering',
    register: 'professional',
    mixingLevel: 'moderate',
    agglutinationStyle: 'hyphenated',
    targetSuffixes: ['-alli', '-annu', '-maadi', '-beku'],
  },
  {
    id: 'campus_life',
    title: 'College Bus & Assignment',
    category: 'Campus Life',
    prompt: 'Tomorrow morning let us go to college by bus and submit the assignment.',
    domain: 'Campus & Student Life',
    register: 'colloquial',
    mixingLevel: 'moderate',
    agglutinationStyle: 'hyphenated',
    targetSuffixes: ['-ge', '-inda', '-annu', '-maadi'],
  },
  {
    id: 'ecommerce_delivery',
    title: 'Amazon Package & Payment',
    category: 'E-Commerce',
    prompt: 'The Amazon package is delivered, please check the invoice link and verify payment.',
    domain: 'E-Commerce & Orders',
    register: 'professional',
    mixingLevel: 'heavy',
    agglutinationStyle: 'hyphenated',
    targetSuffixes: ['-aagide', '-annu', '-maadi'],
  },
  {
    id: 'urban_transit',
    title: 'Metro Transit & Road Traffic',
    category: 'Civic Transit',
    prompt: 'There is heavy traffic on the road, so take the metro to reach the office early.',
    domain: 'Civic Commute & Transit',
    register: 'civic',
    mixingLevel: 'light',
    agglutinationStyle: 'fluid',
    targetSuffixes: ['-alli', '-ge', '-inda'],
  },
  {
    id: 'casual_dining',
    title: 'Weekend Dining & Bill Split',
    category: 'Casual Social',
    prompt: 'Let us order food online now and split the payment on UPI immediately.',
    domain: 'Social & Daily Casual',
    register: 'colloquial',
    mixingLevel: 'moderate',
    agglutinationStyle: 'hyphenated',
    targetSuffixes: ['-maadona', '-alli', '-annu'],
  },
  {
    id: 'tech_bug_report',
    title: 'Production Incident & Deployment',
    category: 'Tech Incident',
    prompt: 'The server has crashed in the staging branch, we need to deploy the hotfix immediately.',
    domain: 'Software Engineering',
    register: 'professional',
    mixingLevel: 'heavy',
    agglutinationStyle: 'hyphenated',
    targetSuffixes: ['-alli', '-aagide', '-beku', '-maadi'],
  },
];

const AVAILABLE_SUFFIXES = [
  { id: '-ge', label: '-ge', caseType: 'Dative', desc: 'Recipient / direction ("to", "for")' },
  { id: '-alli', label: '-alli', caseType: 'Locative', desc: 'Location / context ("in", "at")' },
  { id: '-inda', label: '-inda', caseType: 'Instrumental', desc: 'Instrument / source ("by", "from")' },
  { id: '-annu', label: '-annu', caseType: 'Accusative', desc: 'Direct object' },
  { id: '-maadi', label: '-maadi', caseType: 'Verbalizer', desc: 'Imperative / action ("do", "perform")' },
  { id: '-beku', label: '-beku', caseType: 'Modal', desc: 'Obligation / necessity ("must", "should")' },
];

export const GenerativePlayground: React.FC<GenerativePlaygroundProps> = ({
  onSynthesize,
  onInspectInTokenizer,
  onAddToCorpus,
  loading,
}) => {
  // Synthesis parameters
  const [prompt, setPrompt] = useState('Please open the meeting, share the design doc link, and submit the review.');
  const [socialRegister, setSocialRegister] = useState<SocialRegister>('professional');
  const [mixingLevel, setMixingLevel] = useState<'light' | 'moderate' | 'heavy'>('moderate');
  const [agglutinationStyle, setAgglutinationStyle] = useState<AgglutinationStyle>('hyphenated');
  const [targetSuffixes, setTargetSuffixes] = useState<string[]>(['-alli', '-annu', '-maadi', '-beku']);
  const [domainContext, setDomainContext] = useState('Software Engineering');

  // Outputs & states
  const [generatedResult, setGeneratedResult] = useState<GenerationResponse | null>(null);
  const [preprocessedOutput, setPreprocessedOutput] = useState<PreprocessingSentenceResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedToCorpus, setSavedToCorpus] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'configure' | 'results'>('configure');

  // Transliteration sandbox
  const [translitInput, setTranslitInput] = useState('bengaluru-ge hogona');
  const [translitOutput, setTranslitOutput] = useState('ಬೆಂಗಳೂರಿಗೆ ಹೋಗೋಣ');
  const [translitLoading, setTranslitLoading] = useState(false);

  // Agglutination sandbox root test
  const [sandboxRoot, setSandboxRoot] = useState('Meeting');
  const [sandboxSuffix, setSandboxSuffix] = useState('-alli');

  // Update pre-processing live preview on prompt change
  useEffect(() => {
    if (prompt.trim()) {
      const res = preprocessSentence(prompt.trim());
      setPreprocessedOutput(res);
    } else {
      setPreprocessedOutput(null);
    }
  }, [prompt]);

  const handleApplyPreset = (p: PresetScenario) => {
    setPrompt(p.prompt);
    setDomainContext(p.domain);
    setSocialRegister(p.register);
    setMixingLevel(p.mixingLevel);
    setAgglutinationStyle(p.agglutinationStyle);
    setTargetSuffixes(p.targetSuffixes);
    setErrorNotice(null);
  };

  const handleToggleSuffix = (suffix: string) => {
    setTargetSuffixes((prev) =>
      prev.includes(suffix) ? prev.filter((s) => s !== suffix) : [...prev, suffix]
    );
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    setErrorNotice(null);
    setSavedToCorpus(false);

    try {
      const request: GenerationRequest = {
        prompt: prompt.trim(),
        sourceLanguage: 'english',
        mixingLevel,
        domainContext,
        socialRegister,
        agglutinationStyle,
        targetSuffixes,
      };

      const res = await onSynthesize(request);
      if (res && res.kanglishSentence) {
        setGeneratedResult(res);
        setActiveWorkflowTab('results');
      } else {
        setErrorNotice('Synthesis encountered an issue. Please try again or check API configuration.');
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to generate code-mixed utterance');
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToCorpus = () => {
    if (!generatedResult || !onAddToCorpus) return;

    const groundTruthTokens: GroundTruthToken[] = generatedResult.analysis.tokens.map((t) => ({
      surface: t.surface,
      language: t.language,
      root: t.morphology.root,
      suffix: t.morphology.suffix,
    }));

    const newCorpusEntry: CorpusEntry = {
      id: `gen_${Date.now()}`,
      title: `Generated: ${prompt.slice(0, 32)}...`,
      domain: domainContext,
      text: generatedResult.kanglishSentence,
      analysis: generatedResult.analysis,
      groundTruth: groundTruthTokens,
    };

    onAddToCorpus(newCorpusEntry);
    setSavedToCorpus(true);
  };

  const handleTransliterate = async (text: string) => {
    setTranslitInput(text);
    if (!text.trim()) {
      setTranslitOutput('');
      return;
    }
    setTranslitLoading(true);
    try {
      const response = await fetch('/api/nlp/transliterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetScript: 'kannada' }),
      });
      const data = await response.json();
      setTranslitOutput(data.result || '');
    } catch (err) {
      console.error(err);
    } finally {
      setTranslitLoading(false);
    }
  };

  // CMI target range description
  const targetRangeDesc =
    mixingLevel === 'light'
      ? { min: 15, max: 25, label: '15% – 25%' }
      : mixingLevel === 'moderate'
      ? { min: 25, max: 45, label: '25% – 45%' }
      : { min: 45, max: 65, label: '45% – 65%' };

  const actualCmi = generatedResult ? generatedResult.analysis.cmi.cmiScore : 0;
  const isCmiInRange =
    actualCmi >= targetRangeDesc.min - 5 && actualCmi <= targetRangeDesc.max + 5;

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner with Architecture Summary */}
      <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  Generative Code-Mixing Laboratory
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Gemini API Active
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Hybrid Pre-Processing
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Context-aware Kanglish sentence synthesis governed by social register, grammatical enclitic constraints, and Gambäck & Das (2014) CMI parity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] font-mono bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
              <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Engine: gemini-2.5-flash</span>
            </div>
          </div>
        </div>

        {/* Structured Workflow Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-white/[0.06]">
          {[
            { step: '01', title: 'Context & Directives', desc: 'Register, intensity, suffixes' },
            { step: '02', title: 'Pre-Processing Gate', desc: 'Hybrid pattern & loanword scan' },
            { step: '03', title: 'Structured Inference', desc: 'Gemini JSON code-mixing' },
            { step: '04', title: 'Empirical Verification', desc: 'CMI parity & Dataset Hub' },
          ].map((s, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg border text-xs transition-all ${
                idx === 0
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  : 'bg-white/[0.02] border-white/[0.05] text-[#94A3B8]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-purple-400 font-bold">
                <Workflow className="w-3 h-3" /> Step {s.step}
              </div>
              <div className="font-semibold text-white mt-0.5">{s.title}</div>
              <div className="text-[10px] opacity-75">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Preset Quick Scenarios */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#64748B] font-mono uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-[#38BDF8]" />
            Context-Aware Scenarios:
          </span>
          <span className="text-[11px] text-[#94A3B8]">Click any preset to load complete parameters</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_SCENARIOS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="p-2.5 rounded-xl text-left bg-[#0B1120] hover:bg-[#131D31] border border-white/[0.08] hover:border-[#7C3AED]/50 transition-all group cursor-pointer"
            >
              <div className="text-[10px] font-mono text-purple-400 font-medium truncate">
                {p.category}
              </div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate mt-0.5">
                {p.title}
              </div>
              <div className="text-[10px] text-[#64748B] capitalize mt-1">
                {p.register} • {p.mixingLevel}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Parameter Controls & Synthesis Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Parameter Controls & Pre-Processing Gate */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#7C3AED]" />
                Context-Aware Parameters
              </h4>
              <span className="text-[11px] text-[#94A3B8] font-mono">Step 1 & 2</span>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Prompt Input */}
              <div>
                <label className="text-xs font-semibold text-white block mb-1 font-sans">
                  Source Concept / English Sentence:
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-white/10 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-white placeholder-slate-500 font-sans text-xs resize-none transition-all outline-none"
                  placeholder="Enter source English sentence to synthesize into authentic Kanglish..."
                />
                <div className="flex justify-between text-[10px] text-[#64748B] mt-1 font-mono">
                  <span>Characters: {prompt.length}</span>
                  <span>Will be scanned by pre-processing layer</span>
                </div>
              </div>

              {/* Social Register Selector */}
              <div>
                <label className="text-xs font-semibold text-white block mb-1 font-sans">
                  Social Register (Pragmatic Tone):
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'colloquial', label: 'Colloquial', desc: 'Peer-to-peer / Youth' },
                    { id: 'professional', label: 'Professional', desc: 'Tech Workplace' },
                    { id: 'civic', label: 'Civic', desc: 'Commute & Public' },
                  ].map((reg) => (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => setSocialRegister(reg.id as SocialRegister)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        socialRegister === reg.id
                          ? 'bg-[#7C3AED]/20 border-purple-400 text-white shadow-sm'
                          : 'bg-[#0B1120] border-white/[0.06] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-semibold">{reg.label}</div>
                      <div className="text-[9px] opacity-75 truncate">{reg.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code-Mixing Intensity Level */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-white font-sans">
                    Mixing Intensity Target:
                  </label>
                  <span className="text-[10px] font-mono text-purple-300">
                    Target CMI: {targetRangeDesc.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'light', label: 'Light', desc: '15-25% CMI' },
                    { id: 'moderate', label: 'Moderate', desc: '25-45% CMI' },
                    { id: 'heavy', label: 'Heavy', desc: '45-65% CMI' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setMixingLevel(lvl.id as any)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        mixingLevel === lvl.id
                          ? 'bg-[#7C3AED]/20 border-purple-400 text-white shadow-sm'
                          : 'bg-[#0B1120] border-white/[0.06] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-semibold">{lvl.label}</div>
                      <div className="text-[9px] opacity-75">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agglutination Style */}
              <div>
                <label className="text-xs font-semibold text-white block mb-1 font-sans">
                  Agglutination Style:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAgglutinationStyle('hyphenated')}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      agglutinationStyle === 'hyphenated'
                        ? 'bg-[#7C3AED]/20 border-purple-400 text-white'
                        : 'bg-[#0B1120] border-white/[0.06] text-[#94A3B8]'
                    }`}
                  >
                    <div className="text-xs font-semibold">Hyphenated Standard</div>
                    <div className="text-[10px] opacity-75 font-mono">College-ge, Meeting-alli</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAgglutinationStyle('fluid')}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      agglutinationStyle === 'fluid'
                        ? 'bg-[#7C3AED]/20 border-purple-400 text-white'
                        : 'bg-[#0B1120] border-white/[0.06] text-[#94A3B8]'
                    }`}
                  >
                    <div className="text-xs font-semibold">Fluid Spoken</div>
                    <div className="text-[10px] opacity-75 font-mono">Collegege, Meetingalli</div>
                  </button>
                </div>
              </div>

              {/* Target Suffix Directives */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-white font-sans">
                    Target Kannada Suffixes:
                  </label>
                  <span className="text-[10px] text-[#94A3B8]">
                    {targetSuffixes.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {AVAILABLE_SUFFIXES.map((s) => {
                    const active = targetSuffixes.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleToggleSuffix(s.id)}
                        className={`p-1.5 rounded-lg border text-left transition-all ${
                          active
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                            : 'bg-[#0B1120] border-white/[0.06] text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <div className="text-[11px] font-mono font-bold flex items-center justify-between">
                          <span>{s.label}</span>
                          {active && <Check className="w-3 h-3 text-amber-400" />}
                        </div>
                        <div className="text-[9px] opacity-75 truncate">{s.caseType}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Domain Context */}
              <div>
                <label className="text-xs font-semibold text-white block mb-1 font-sans">
                  Domain Context:
                </label>
                <select
                  value={domainContext}
                  onChange={(e) => setDomainContext(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-white/10 text-white text-xs outline-none focus:border-[#7C3AED]"
                >
                  <option value="Software Engineering">Software Engineering & Tech</option>
                  <option value="Campus & Student Life">Campus Life & College</option>
                  <option value="Civic Commute & Transit">Urban Transit & Traffic</option>
                  <option value="E-Commerce & Orders">E-Commerce & Delivery</option>
                  <option value="Social & Daily Casual">Casual Workplace Dialogue</option>
                  <option value="Clinical & Healthcare">Clinical & Healthcare</option>
                </select>
              </div>

              {errorNotice && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorNotice}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium text-white bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] hover:from-[#6D28D9] hover:to-[#4338CA] rounded-xl transition-all shadow-md shadow-purple-900/30 border border-white/20 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Synthesizing with Gemini AI...'
                    : 'Execute Synthesis Workflow'}
                </span>
              </button>
            </form>
          </div>

          {/* Pre-Processing Gate Card (Live Scan of Prompt) */}
          {preprocessedOutput && (
            <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Pre-Processing Gate Analysis
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Confidence: {(preprocessedOutput.overallConfidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Hybrid detection scanned {preprocessedOutput.tokens.length} words from source prompt.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {preprocessedOutput.tokens.map((tok, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      tok.language === 'kannada'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : tok.language === 'english'
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        : tok.language === 'hybrid'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-slate-800 text-slate-400 border-white/[0.06]'
                    }`}
                  >
                    {tok.surface}: {tok.language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Transliteration & Agglutination Sandbox */}
          <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Agglutination Sandbox</span>
              </div>
              <span className="text-[10px] text-[#94A3B8] font-mono">Live Tester</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#94A3B8] block mb-1">English Root:</span>
                <input
                  type="text"
                  value={sandboxRoot}
                  onChange={(e) => setSandboxRoot(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B1120] border border-white/10 text-white font-mono text-xs outline-none focus:border-[#38BDF8]"
                  placeholder="e.g. Project"
                />
              </div>

              <div>
                <span className="text-[10px] text-[#94A3B8] block mb-1">Kannada Enclitic:</span>
                <select
                  value={sandboxSuffix}
                  onChange={(e) => setSandboxSuffix(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B1120] border border-white/10 text-white font-mono text-xs outline-none focus:border-[#38BDF8]"
                >
                  <option value="-ge">-ge (Dative: to)</option>
                  <option value="-alli">-alli (Locative: in)</option>
                  <option value="-inda">-inda (Instrumental: by)</option>
                  <option value="-annu">-annu (Accusative)</option>
                  <option value="-maadi">-maadi (Verbalizer)</option>
                  <option value="-beku">-beku (Modal: must)</option>
                </select>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#090D16] border border-white/[0.06] space-y-1">
              <div className="text-[10px] text-[#94A3B8] font-mono">Agglutinated Result:</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-purple-300 font-semibold">
                  {sandboxRoot}{sandboxSuffix}
                </span>
                <button
                  type="button"
                  onClick={() => handleTransliterate(`${sandboxRoot}${sandboxSuffix}`)}
                  className="text-[10px] text-[#38BDF8] hover:underline"
                >
                  Transliterate →
                </button>
              </div>
            </div>

            {/* Quick transliteration input */}
            <div className="space-y-1 pt-1 border-t border-white/[0.04]">
              <span className="text-[10px] text-[#94A3B8] block">Bidirectional Script Preview:</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={translitInput}
                  onChange={(e) => handleTransliterate(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#0B1120] border border-white/10 text-white font-mono text-[11px] outline-none"
                  placeholder="Type latin..."
                />
                <div className="px-2 py-1 rounded bg-[#090D16] border border-white/[0.08] text-[#FBBF24] font-kannada text-xs truncate">
                  {translitLoading ? '...' : translitOutput || '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Multi-Representation Output, Morphological Breakdown & CMI Verification */}
        <div className="lg:col-span-7 space-y-4">
          {generatedResult ? (
            <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-5 animate-in fade-in duration-200">
              {/* Header Status */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Interpretation
                  </span>
                  <span className="text-xs text-[#94A3B8]">
                    Register: <strong className="text-white capitalize">{socialRegister}</strong> • Style: <strong className="text-white capitalize">{agglutinationStyle}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyText(generatedResult.kanglishSentence)}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white transition-colors border border-white/[0.06] flex items-center gap-1 text-xs"
                    title="Copy Utterance"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {onAddToCorpus && (
                    <button
                      onClick={handleSaveToCorpus}
                      disabled={savedToCorpus}
                      className={`p-1.5 px-2.5 rounded-lg transition-colors border flex items-center gap-1 text-xs cursor-pointer ${
                        savedToCorpus
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white border-white/[0.06]'
                      }`}
                      title="Save to Dataset Hub"
                    >
                      {savedToCorpus ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Saved to Hub</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>Save to Dataset Hub</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Synthesized Utterance Card */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-mono">
                    Synthesized Kanglish Utterance:
                  </span>
                  <span className="text-[10px] font-mono text-purple-400">
                    {generatedResult.analysis.tokens.length} tokens detected
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#090D16] border border-purple-500/30 text-white font-mono text-sm leading-relaxed shadow-inner">
                  {generatedResult.kanglishSentence}
                </div>
              </div>

              {/* Kannada Unicode Script Card */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-mono">
                  Kannada Unicode Script (ಕನ್ನಡ):
                </span>
                <div className="p-3.5 rounded-xl bg-[#090D16] border border-white/[0.06] text-[#FBBF24] font-kannada text-base leading-relaxed">
                  {generatedResult.kannadaUnicodeSentence}
                </div>
              </div>

              {/* Normalized English Translation */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-mono">
                  Normalized English Translation:
                </span>
                <div className="p-3 rounded-xl bg-[#131D31]/40 border border-white/[0.06] text-slate-200 text-xs">
                  {generatedResult.englishTranslation}
                </div>
              </div>

              {/* Morphological Breakdown Decomposition Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
                    Morphological Decomposition of Code-Mixed Tokens:
                  </span>
                  <span className="text-[10px] text-[#64748B] font-mono">
                    Root + Dravidian Enclitic
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#090D16]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[10px] text-[#94A3B8] font-mono uppercase bg-white/[0.02]">
                        <th className="p-2.5 pl-3">Root Constituent</th>
                        <th className="p-2.5">Root Lang</th>
                        <th className="p-2.5">Suffix Enclitic</th>
                        <th className="p-2.5">Grammatical Case</th>
                        <th className="p-2.5 pr-3">Function / Meaning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {generatedResult.morphologicalBreakdown && generatedResult.morphologicalBreakdown.length > 0 ? (
                        generatedResult.morphologicalBreakdown.map((item, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02]">
                            <td className="p-2.5 pl-3 font-mono font-medium text-white">
                              {item.root}
                            </td>
                            <td className="p-2.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                  item.rootLanguage === 'english'
                                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                }`}
                              >
                                {item.rootLanguage}
                              </span>
                            </td>
                            <td className="p-2.5 font-mono text-purple-300 font-semibold">
                              {item.suffix || '—'}
                            </td>
                            <td className="p-2.5 text-[#94A3B8] capitalize">
                              {item.suffixCase || '—'}
                            </td>
                            <td className="p-2.5 pr-3 text-[#94A3B8] text-[11px]">
                              {item.explanation || 'Agglutinated enclitic'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        // Fallback to analysis tokens if breakdown wasn't explicitly returned
                        generatedResult.analysis.tokens
                          .filter((t) => t.language === 'hybrid' || t.morphology.suffix)
                          .map((t, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02]">
                              <td className="p-2.5 pl-3 font-mono font-medium text-white">
                                {t.morphology.root}
                              </td>
                              <td className="p-2.5">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                  {t.morphology.rootLanguage}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono text-purple-300 font-semibold">
                                {t.morphology.suffix || '—'}
                              </td>
                              <td className="p-2.5 text-[#94A3B8] capitalize">
                                {t.morphology.suffixType || '—'}
                              </td>
                              <td className="p-2.5 pr-3 text-[#94A3B8] text-[11px]">
                                {t.morphology.suffixDescription || 'Dravidian agglutinated marker'}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Empirical CMI Verification Card (Gambäck & Das 2014) */}
              <div className="p-4 rounded-xl bg-[#0B1120] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                      Gambäck & Das (2014) CMI Parity:
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        isCmiInRange
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isCmiInRange ? 'Within Target Band' : 'Near Target Band'}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-[#94A3B8]">
                    Actual CMI: <strong className="text-white">{actualCmi.toFixed(1)}%</strong> / Target: {targetRangeDesc.label}
                  </div>
                </div>

                {/* Visual Parity Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.min(100, actualCmi)}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
                    <span>0% (Monolingual)</span>
                    <span>Target Range: {targetRangeDesc.label}</span>
                    <span>100% (High Mix)</span>
                  </div>
                </div>

                {/* Token Distribution Metrics */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                    <div className="text-[10px] text-[#94A3B8]">Kannada</div>
                    <div className="text-xs font-mono font-bold text-amber-300">
                      {generatedResult.analysis.cmi.kannadaCount}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                    <div className="text-[10px] text-[#94A3B8]">English</div>
                    <div className="text-xs font-mono font-bold text-cyan-300">
                      {generatedResult.analysis.cmi.englishCount}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                    <div className="text-[10px] text-[#94A3B8]">Hybrid</div>
                    <div className="text-xs font-mono font-bold text-purple-300">
                      {generatedResult.analysis.cmi.hybridCount}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                    <div className="text-[10px] text-[#94A3B8]">Switch Points</div>
                    <div className="text-xs font-mono font-bold text-emerald-300">
                      {generatedResult.analysis.cmi.switchPoints}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sociolinguistic AI Nuance Commentary */}
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs space-y-1.5">
                <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block font-semibold">
                  Sociolinguistic Nuance Commentary (AI Interpretation):
                </span>
                <p className="text-[#CBD5E1] text-xs leading-relaxed italic">
                  {generatedResult.nuanceExplanation}
                </p>
                <div className="text-[10px] text-[#94A3B8] pt-1 border-t border-purple-500/20">
                  Attribution: This analysis is an AI-generated contextual interpretation from Gemini 2.5 Flash, distinct from deterministic rule-based linguistic facts.
                </div>
              </div>

              {/* Navigation Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onInspectInTokenizer(generatedResult.kanglishSentence)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-white/10 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Inspect in Primary Token Matrix</span>
                </button>

                {onAddToCorpus && (
                  <button
                    type="button"
                    onClick={handleSaveToCorpus}
                    disabled={savedToCorpus}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl transition-colors border cursor-pointer ${
                      savedToCorpus
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 border-purple-500/30'
                    }`}
                  >
                    {savedToCorpus ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Added to Benchmark Dataset</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5 text-purple-400" />
                        <span>Add to Corpus & Benchmark</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[460px] flex flex-col items-center justify-center p-8 text-center text-[#94A3B8] glass-panel rounded-2xl border border-white/[0.08]">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4 text-[#64748B]">
                <Sparkles className="w-7 h-7 text-purple-400" />
              </div>
              <h4 className="text-base font-semibold text-white">Generative Lab Ready</h4>
              <p className="text-xs text-[#94A3B8] mt-1.5 max-w-sm leading-relaxed">
                Configure your context-aware parameters on the left (Social Register, Intensity, Suffix Directives) or click any Quick Scenario, then click <strong className="text-white">Execute Synthesis Workflow</strong>.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-[#64748B] font-mono">
                <Info className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Supports Gemini 2.5 Flash inference with verified fallback templates</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

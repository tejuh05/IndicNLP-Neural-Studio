import React, { useState } from 'react';
import { GitBranch, Settings, Check, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { KannadaSuffixRule, SentenceAnalysis, TokenEntity } from '../types';

interface MorphologicalParserViewProps {
  analysis: SentenceAnalysis;
  rules: KannadaSuffixRule[];
  onToggleRule: (ruleId: string) => void;
  onSelectToken: (token: TokenEntity) => void;
  selectedToken: TokenEntity | null;
}

export const MorphologicalParserView: React.FC<MorphologicalParserViewProps> = ({
  analysis,
  rules,
  onToggleRule,
  onSelectToken,
  selectedToken,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="space-y-6 text-left">
      {/* Suffix Rule Configuration Header Card */}
      <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C026D3]/15 border border-[#C026D3]/30 flex items-center justify-center text-[#E879F9]">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Dravidian Morphological Suffix Engine
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Configurable rules for the 7 primary Kannada agglutination enclitics with ambiguity protection
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131D31] hover:bg-[#1E293B] border border-white/[0.08] text-xs font-medium text-[#CBD5E1] transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showConfig ? 'Hide Rules' : 'Configure Rules'} ({rules.filter(r => r.enabled).length}/{rules.length})</span>
          </button>
        </div>

        {/* Configurable Suffix Rule Chips */}
        {showConfig && (
          <div className="pt-2 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 animate-in fade-in duration-150">
            {rules.map((rule) => (
              <div
                key={rule.id}
                onClick={() => onToggleRule(rule.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  rule.enabled
                    ? 'bg-[#131D31]/90 border-purple-500/40 text-white'
                    : 'bg-[#090D16]/50 border-white/[0.04] text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-[#E879F9]">{rule.suffix}</span>
                  <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    rule.enabled ? 'bg-[#7C3AED] border-purple-400 text-white' : 'border-slate-700 bg-slate-900'
                  }`}>
                    {rule.enabled && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <div className="text-[11px] font-sans font-medium">{rule.description}</div>
                <div className="text-[10px] text-[#94A3B8] font-mono mt-1">
                  e.g., {rule.examples.slice(0, 2).join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Morphological Agglutination Decomposition Table */}
      <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">
              Agglutination Decomposition Table
            </h4>
            <p className="text-xs text-[#94A3B8]">
              Roots, enclitics, language classifications, and ambiguity indicators for current sentence tokens
            </p>
          </div>
          <span className="text-xs font-mono text-[#94A3B8]">
            {analysis.tokens.filter(t => t.language === 'hybrid').length} Hybrid Enclitic(s)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-xs text-left border-collapse font-sans">
            <thead className="bg-[#0B1120] text-[#94A3B8] uppercase tracking-wider font-mono text-[10px] border-b border-white/[0.06]">
              <tr>
                <th className="py-2.5 px-3">Surface Token</th>
                <th className="py-2.5 px-3">Root Stem</th>
                <th className="py-2.5 px-3">Enclitic Suffix</th>
                <th className="py-2.5 px-3">Root Lang</th>
                <th className="py-2.5 px-3">Suffix Lang</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Case / Role</th>
                <th className="py-2.5 px-3">Ambiguity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {analysis.tokens.map((token) => {
                const isSelected = selectedToken?.id === token.id;
                const isHybrid = token.language === 'hybrid';
                const hasSuffix = Boolean(token.morphology.suffix);

                return (
                  <tr
                    key={token.id}
                    onClick={() => onSelectToken(token)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-purple-950/40 text-white'
                        : 'hover:bg-white/[0.03] text-slate-300'
                    }`}
                  >
                    {/* Surface Token */}
                    <td className="py-2.5 px-3 font-mono font-semibold">
                      <span className={isHybrid ? 'text-[#E879F9]' : token.language === 'kannada' ? 'text-[#FBBF24]' : token.language === 'english' ? 'text-[#38BDF8]' : 'text-slate-400'}>
                        {token.surface}
                      </span>
                    </td>

                    {/* Root Stem */}
                    <td className="py-2.5 px-3 font-mono">
                      {token.morphology.root || token.surface}
                    </td>

                    {/* Suffix */}
                    <td className="py-2.5 px-3 font-mono">
                      {token.morphology.suffix ? (
                        <span className="text-[#E879F9] font-bold bg-[#C026D3]/15 px-1.5 py-0.5 rounded">
                          {token.morphology.suffix}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Root Language */}
                    <td className="py-2.5 px-3 capitalize">
                      <span className={token.morphology.rootLanguage === 'english' ? 'text-[#38BDF8]' : token.morphology.rootLanguage === 'kannada' ? 'text-[#FBBF24]' : 'text-slate-500'}>
                        {token.morphology.rootLanguage}
                      </span>
                    </td>

                    {/* Suffix Language */}
                    <td className="py-2.5 px-3 capitalize">
                      {token.morphology.suffixLanguage ? (
                        <span className="text-[#FBBF24]">
                          {token.morphology.suffixLanguage}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Classification */}
                    <td className="py-2.5 px-3 font-mono uppercase text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full border ${
                        token.language === 'hybrid'
                          ? 'bg-[#C026D3]/15 text-[#E879F9] border-[#C026D3]/40'
                          : token.language === 'kannada'
                            ? 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/35'
                            : token.language === 'english'
                              ? 'bg-[#06B6D4]/15 text-[#38BDF8] border-[#06B6D4]/35'
                              : 'bg-slate-800 text-slate-400 border-white/10'
                      }`}>
                        {token.language}
                      </span>
                    </td>

                    {/* Case / Role */}
                    <td className="py-2.5 px-3 text-[#CBD5E1]">
                      {token.morphology.suffixType ? (
                        <span className="capitalize">{token.morphology.suffixType}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Ambiguity */}
                    <td className="py-2.5 px-3">
                      {token.morphology.isAmbiguous ? (
                        <span className="flex items-center gap-1 text-amber-400 text-[10px]" title={token.morphology.ambiguityReason}>
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Ambiguous</span>
                        </span>
                      ) : hasSuffix ? (
                        <span className="text-emerald-400 text-[10px] font-mono">Verified</span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">Lexical</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lexical Disambiguation Heuristics Card */}
      <div className="p-4 rounded-xl bg-[#0F172A]/80 border border-white/[0.08] text-xs space-y-2">
        <div className="flex items-center gap-1.5 text-[#38BDF8] font-semibold font-sans">
          <Info className="w-4 h-4 text-[#06B6D4]" />
          <span>Ambiguity & False-Positive Suffix Safeguards:</span>
        </div>
        <p className="text-[#94A3B8] leading-relaxed">
          The parser distinguishes genuine Dravidian enclitics from English lexical endings. For instance, words such as <code className="text-white font-mono">Orange</code>, <code className="text-white font-mono">Cabbage</code>, <code className="text-white font-mono">Message</code>, and <code className="text-white font-mono">Package</code> naturally terminate in letters <code className="text-purple-300 font-mono">ge</code> but are protected by lexical dictionary validation to avoid false dative identification. Conversely, hyphenated enclitics like <code className="text-[#E879F9] font-mono">College-ge</code> or <code className="text-[#E879F9] font-mono">Office-alli</code> are cleanly parsed into root and suffix.
        </p>
      </div>
    </div>
  );
};

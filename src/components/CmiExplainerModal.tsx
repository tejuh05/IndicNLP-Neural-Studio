import React from 'react';
import { X, Calculator, HelpCircle, ArrowRight } from 'lucide-react';
import { CMIAnalysis } from '../types';

interface CmiExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cmiData?: CMIAnalysis;
}

export const CmiExplainerModal: React.FC<CmiExplainerModalProps> = ({
  isOpen,
  onClose,
  cmiData,
}) => {
  if (!isOpen) return null;

  const total = cmiData?.totalTokens || 1;
  const kannada = cmiData?.kannadaCount || 0;
  const english = cmiData?.englishCount || 0;
  const hybrid = cmiData?.hybridCount || 0;
  const other = cmiData?.otherCount || 0;
  const score = cmiData?.cmiScore || 0;
  const switches = cmiData?.switchPoints || 0;

  const knPct = Math.round((kannada / total) * 100);
  const enPct = Math.round((english / total) * 100);
  const hyPct = Math.round((hybrid / total) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#131D31]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-center text-[#38BDF8]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Code-Switching Index (CMI) Formulation
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Gambäck & Das (2014) standard methodology for Dravidian multilingual data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm">
          {/* Mathematical Equation Card */}
          <div className="p-4 rounded-xl bg-[#090D16] border border-white/[0.08] font-mono text-center">
            <span className="text-xs text-[#94A3B8] block mb-2 uppercase tracking-wider font-sans">
              Peer-Reviewed Equation
            </span>
            <div className="text-base md:text-lg text-white font-semibold flex items-center justify-center gap-3">
              <span className="text-[#38BDF8]">CMI</span>
              <span>=</span>
              <span>100 × [ 1 − ( max(W_kn, W_en) / (N − u) ) ]</span>
            </div>
          </div>

          {/* Breakdown Variables */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#131D31]/70 border border-[#F59E0B]/30">
              <span className="text-[#FBBF24] block font-semibold mb-1">W_kn (Kannada)</span>
              <span className="text-xl font-bold text-white tabular-nums">{kannada}</span>
              <span className="text-[10px] text-[#94A3B8] block mt-0.5">({knPct}% of tokens)</span>
            </div>

            <div className="p-3 rounded-lg bg-[#131D31]/70 border border-[#06B6D4]/30">
              <span className="text-[#38BDF8] block font-semibold mb-1">W_en (English)</span>
              <span className="text-xl font-bold text-white tabular-nums">{english}</span>
              <span className="text-[10px] text-[#94A3B8] block mt-0.5">({enPct}% of tokens)</span>
            </div>

            <div className="p-3 rounded-lg bg-[#131D31]/70 border border-[#C026D3]/30">
              <span className="text-[#E879F9] block font-semibold mb-1">W_hyb (Hybrid)</span>
              <span className="text-xl font-bold text-white tabular-nums">{hybrid}</span>
              <span className="text-[10px] text-[#94A3B8] block mt-0.5">({hyPct}% of tokens)</span>
            </div>

            <div className="p-3 rounded-lg bg-[#131D31]/70 border border-white/[0.08]">
              <span className="text-[#94A3B8] block font-semibold mb-1">Switch Points</span>
              <span className="text-xl font-bold text-white tabular-nums">{switches}</span>
              <span className="text-[10px] text-[#94A3B8] block mt-0.5">Language shifts</span>
            </div>
          </div>

          {/* Live Substitution */}
          <div className="space-y-2 text-xs text-[#CBD5E1]">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-sans">
              Live Sentence Calculation:
            </h4>
            <div className="p-3 rounded-lg bg-[#131D31]/50 border border-white/[0.06] font-mono leading-relaxed">
              {cmiData?.formulaDescription || 'Awaiting sentence parsing...'}
            </div>
          </div>

          {/* Theoretical Limits */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-purple-300 font-semibold font-sans">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>How to Interpret the CMI Range:</span>
            </div>
            <ul className="space-y-1.5 text-[#94A3B8] list-disc list-inside">
              <li><strong className="text-white">0.0%:</strong> Pure monolingual sentence (all Kannada or all English tokens).</li>
              <li><strong className="text-white">10% - 30%:</strong> Low code-mixing; single borrowed noun or isolated case enclitic.</li>
              <li><strong className="text-white">30% - 50%:</strong> High code-mixing; balanced matrix-language transition typical in urban Kanglish.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-[#131D31]/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-white/10"
          >
            Close Explainer
          </button>
        </div>
      </div>
    </div>
  );
};

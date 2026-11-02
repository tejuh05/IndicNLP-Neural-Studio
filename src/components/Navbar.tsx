import React from 'react';
import { Layers, GitBranch, Database, Sparkles, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: 'inspector' | 'parser' | 'datasets' | 'playground';
  onTabChange: (tab: 'inspector' | 'parser' | 'datasets' | 'playground') => void;
  onOpenCmiModal: () => void;
  currentCmiScore?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenCmiModal,
  currentCmiScore,
}) => {
  return (
    <header className="border-b border-white/[0.08] bg-[#090D16]/95 backdrop-blur-md sticky top-0 z-40">
      {/* 3-Zone Top Bar Contract */}
      <div className="flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-purple-500/20 border border-white/20">
            <span className="font-bold text-white text-sm font-mono">ಕ</span>
          </div>
          <span className="text-base font-bold tracking-tight text-white font-sans">
            IndicNLP Neural Studio
          </span>
        </div>

        {/* Zone 2: Single-line nav links with active state */}
        <nav className="hidden md:flex items-center gap-1 bg-[#131D31]/80 p-1 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => onTabChange('inspector')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'inspector'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-900/40'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Token Inspector</span>
          </button>

          <button
            onClick={() => onTabChange('parser')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'parser'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-900/40'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Morphological Parser</span>
          </button>

          <button
            onClick={() => onTabChange('datasets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'datasets'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-900/40'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Dataset Hub</span>
          </button>

          <button
            onClick={() => onTabChange('playground')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'playground'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-900/40'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generative Lab</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentCmiScore !== undefined && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#94A3B8] px-2.5 py-1 rounded-lg bg-[#0F172A] border border-white/[0.06]">
              <span>CMI:</span>
              <span className="text-[#38BDF8] font-semibold">{currentCmiScore}%</span>
            </div>
          )}
          <button
            onClick={onOpenCmiModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] hover:from-[#6D28D9] hover:to-[#4338CA] rounded-lg transition-all shadow-md shadow-purple-900/30 whitespace-nowrap shrink-0 border border-white/20 active:scale-[0.98]"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>CMI Explainer</span>
          </button>
        </div>
      </div>

      {/* Mobile Responsive Nav Strip */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto px-4 py-2 border-t border-white/[0.04] bg-[#0B1120]">
        {[
          { id: 'inspector', label: 'Tokenizer', icon: Layers },
          { id: 'parser', label: 'Morpho-Parser', icon: GitBranch },
          { id: 'datasets', label: 'Dataset Hub', icon: Database },
          { id: 'playground', label: 'Generative Lab', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg whitespace-nowrap font-medium transition-colors ${
                isActive
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white bg-white/[0.03]'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

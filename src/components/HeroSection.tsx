import React from 'react';
import { Search, Sparkles, BookOpen, Layers, Users, Film, ShieldCheck } from 'lucide-react';
import { KawaiiMascot, KawaiiRainbowArch, KawaiiSparkle, FullWidthRainbowPanorama } from './KawaiiIcons';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalWorks: number;
  totalRubriken: number;
  totalAuthors: number;
  onOpenAddModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  totalWorks,
  totalRubriken,
  totalAuthors,
  onOpenAddModal,
}) => {
  return (
    <section className="relative overflow-hidden pt-4 pb-10 sm:pb-14 border-b border-slate-200/80 bg-white">
      {/* Subtle Kawaii Rainbow Gradient Background Wash */}
      <div className="absolute inset-0 rainbow-soft-bg opacity-70 pointer-events-none" />

      {/* Magnificent Full-Width Rainbow spanning edge-to-edge across 100% of the website */}
      <div className="w-full overflow-hidden pointer-events-none mb-3 sm:mb-5">
        <FullWidthRainbowPanorama className="w-full h-20 sm:h-28 md:h-36 lg:h-44 drop-shadow-sm" />
      </div>

      {/* Floating Kawaii Sparkles & Stars */}
      <div className="absolute top-8 left-8 pointer-events-none opacity-70 hidden lg:block">
        <KawaiiSparkle className="w-8 h-8" color="#F472B6" />
      </div>
      <div className="absolute bottom-8 right-12 pointer-events-none opacity-60 hidden lg:block">
        <KawaiiSparkle className="w-8 h-8" color="#F472B6" />
      </div>
      <div className="absolute top-14 right-20 pointer-events-none opacity-50 hidden lg:block">
        <KawaiiSparkle className="w-7 h-7" color="#38BDF8" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Cute Kawaii Mascot Banner Header */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-pink-200/80 shadow-2xs mb-3">
            <KawaiiMascot className="w-6 h-6" />
            <span className="text-xs font-bold text-slate-800 tracking-tight font-display">
              Pulloutprogramm &bdquo;DIE SCAPES&ldquo; · Schule Saatlen
            </span>
          </div>

          {/* Focal Headline requested by user */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-display [text-wrap:balance]">
            Projekte und fertige Werke aus den SCAPES
          </h1>

          {/* Subtitle with exact user description */}
          <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-2xl mx-auto [text-wrap:balance]">
            In den Scapes suchen die Schülerinnen und Schüler in ihrer Landschaft ein Thema und erarbeiten ein Projekt. Ob Roman, Anleitung, Dokumentation oder sonst etwas – was sie erforschen und gestalten, wählen sie selbst.
          </p>

          {/* Interactive Search Bar */}
          <div className="mt-6 sm:mt-8 max-w-xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl border-2 border-pink-200 shadow-sm focus-within:border-pink-500 focus-within:ring-3 focus-within:ring-pink-500/15 transition-all">
              <div className="pl-4 text-slate-400">
                <Search className="w-5 h-5 text-pink-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Suche nach Titel, Autoren-ID (z.B. Sternfuchs-42) oder Thema..."
                className="w-full py-3 pl-3 pr-4 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="pr-4 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Löschen
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats: No classes, no 100% datenschutzkonform badge */}
          <div className="mt-7 flex items-center justify-center gap-6 sm:gap-10 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              <span>
                <strong className="text-slate-900 font-bold tabular-nums">{totalWorks}</strong> Werke
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>
                <strong className="text-slate-900 font-bold tabular-nums">{totalRubriken}</strong> Rubriken & Regale
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                <strong className="text-slate-900 font-bold tabular-nums">{totalAuthors}</strong> Autoren-IDs
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


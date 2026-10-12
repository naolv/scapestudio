import React from 'react';
import {
  BookOpen,
  Layers,
  ShieldCheck,
  LogOut,
  Plus,
  FolderPlus,
  FolderOpen,
  Download,
} from 'lucide-react';
import { KawaiiMascot } from './KawaiiIcons';

export type ActiveTab = 'katalog' | 'rubriken' | 'qualitaet';

interface NavbarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isTeacher: boolean;
  onOpenTeacherAuth: (action?: 'add' | 'rubrik' | 'backup') => void;
  onTeacherLogout: () => void;
  onOpenAddModal: () => void;
  onOpenNewRubrikModal: () => void;
  onOpenBackupModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isTeacher,
  onOpenTeacherAuth,
  onTeacherLogout,
  onOpenAddModal,
  onOpenNewRubrikModal,
  onOpenBackupModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="h-1.5 rainbow-bar w-full" />

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Logo & Brand Wordmark */}
        <button
          onClick={() => onSelectTab('katalog')}
          className="flex items-center gap-2.5 group shrink-0 cursor-pointer text-left"
          title="Zurück zur Bibliothek (Startseite)"
        >
          <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center p-1 border border-pink-200 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
            <KawaiiMascot className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 font-display leading-none">
              Scape<span className="text-pink-500">studio</span>
            </div>
            <div className="text-[10px] font-bold text-slate-500 font-display tracking-wider uppercase mt-0.5">
              DIE SCAPES · Schule Saatlen
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3 text-sm font-semibold">
          <button
            onClick={() => onSelectTab('katalog')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              currentTab === 'katalog'
                ? 'bg-pink-50 text-pink-700 border border-pink-200 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-pink-500" />
            <span>Bibliothek</span>
          </button>

          <button
            onClick={() => onSelectTab('rubriken')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              currentTab === 'rubriken'
                ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-purple-500" />
            <span>Rubriken</span>
          </button>

          <button
            onClick={() => onSelectTab('qualitaet')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              currentTab === 'qualitaet'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Qualitätsstandard</span>
          </button>
        </nav>

        {/* Teacher Upload & Controls: Unified Pink Plus Button */}
        <div className="flex items-center gap-2 shrink-0">
          {!isTeacher ? (
            /* Pink Plus button when not yet authenticated - clicking prompts for password and opens upload */
            <button
              onClick={() => onOpenTeacherAuth('add')}
              className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-white bg-pink-500 hover:bg-pink-600 active:scale-95 rounded-2xl shadow-xs transition-all cursor-pointer"
              title="Werk hochladen"
              aria-label="Werk hochladen"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            /* When Teacher is authenticated - Pink Plus button directly uploads */
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-white bg-pink-500 hover:bg-pink-600 active:scale-95 rounded-2xl shadow-xs transition-all cursor-pointer ring-2 ring-pink-300/60"
                title="Werk hochladen"
                aria-label="Werk hochladen"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* New Rubrik (Teacher Only) */}
              <button
                onClick={onOpenNewRubrikModal}
                className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
                title="Neue Rubrik anlegen"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
                <span>Rubrik</span>
              </button>

              {/* Backup (Teacher Only) */}
              <button
                onClick={onOpenBackupModal}
                className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Bibliothek sichern"
              >
                <Download className="w-3.5 h-3.5 text-pink-500" />
                <span>Backup</span>
              </button>

              {/* Logout */}
              <button
                onClick={onTeacherLogout}
                title="Als Lehrperson abmelden"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                aria-label="Abmelden"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Navigation Strip: ALWAYS visible so Regale, Bibliothek, and Qualitätsstandard NEVER disappear */}
      <div className="md:hidden px-3 py-2 bg-slate-50/90 border-t border-slate-200/70 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between gap-1.5 min-w-max mx-auto max-w-lg">
          <button
            onClick={() => onSelectTab('katalog')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentTab === 'katalog'
                ? 'bg-pink-500 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bibliothek</span>
          </button>

          <button
            onClick={() => onSelectTab('rubriken')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentTab === 'rubriken'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Rubriken</span>
          </button>

          <button
            onClick={() => onSelectTab('qualitaet')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentTab === 'qualitaet'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Qualitätsstandard</span>
          </button>
        </div>
      </div>
    </header>
  );
};

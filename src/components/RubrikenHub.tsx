import React, { useState } from 'react';
import { Rubrik, WorkItem } from '../types';
import { getRainbowClasses, getIconComponent } from '../utils/theme';
import {
  Folder,
  FolderOpen,
  FolderPlus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  ExternalLink,
  Edit3,
  Eye,
  Plus,
  Sparkles,
  Search,
} from 'lucide-react';
import { KawaiiMascot } from './KawaiiIcons';

interface RubrikenHubProps {
  rubriken: Rubrik[];
  works: WorkItem[];
  onSelectRubrikAndGoToCatalog: (rubrikId: string) => void;
  onOpenPreview: (work: WorkItem) => void;
  onEditWork?: (work: WorkItem) => void;
  onOpenNewRubrikModal?: () => void;
  onOpenAddWorkForRubrik?: (rubrikId: string) => void;
  isTeacher?: boolean;
}

export const RubrikenHub: React.FC<RubrikenHubProps> = ({
  rubriken,
  works,
  onSelectRubrikAndGoToCatalog,
  onOpenPreview,
  onEditWork,
  onOpenNewRubrikModal,
  onOpenAddWorkForRubrik,
  isTeacher,
}) => {
  // Currently active Akte / Folder (default to the first rubrik with works, or the first one)
  const [activeRubrikId, setActiveRubrikId] = useState<string>(() => {
    // Prefer a rubrik that has works (e.g. videos with Kurbeltheater)
    const rubrikWithWorks = rubriken.find((r) => works.some((w) => w.rubrikId === r.id));
    return rubrikWithWorks ? rubrikWithWorks.id : rubriken[0]?.id || 'videos';
  });

  // View Mode: 'folder' (single opened Akte - zero scroll) vs 'overview' (all folder jackets)
  const [viewMode, setViewMode] = useState<'folder' | 'overview'>('folder');

  // Active rubrik object
  const activeRubrik = rubriken.find((r) => r.id === activeRubrikId) || rubriken[0];
  const activeIndex = rubriken.findIndex((r) => r.id === activeRubrik?.id);

  // Works filed inside the currently open Akte
  const activeWorks = works.filter((w) => w.rubrikId === activeRubrik?.id);

  // Quick navigation between Akten
  const handlePrevAkte = () => {
    if (activeIndex > 0) {
      setActiveRubrikId(rubriken[activeIndex - 1].id);
    } else {
      setActiveRubrikId(rubriken[rubriken.length - 1].id);
    }
  };

  const handleNextAkte = () => {
    if (activeIndex < rubriken.length - 1) {
      setActiveRubrikId(rubriken[activeIndex + 1].id);
    } else {
      setActiveRubrikId(rubriken[0].id);
    }
  };

  const activeTheme = activeRubrik ? getRainbowClasses(activeRubrik.color) : getRainbowClasses('purple');
  const ActiveIcon = activeRubrik ? getIconComponent(activeRubrik.iconName) : FolderOpen;

  return (
    <section id="akten-hub" className="space-y-6">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold font-display mb-2">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Akten-Register & Sammelmappen</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <span>Rubriken</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-body">
            Klicke auf eine Akte, um sie sofort aufzuschlagen. Jede Akte sammelt spezifische Schülerarbeiten – ohne langes Scrollen!
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Mode toggle */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-semibold border border-slate-200">
            <button
              onClick={() => setViewMode('folder')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'folder'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>Geöffnete Akte</span>
            </button>
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'overview'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Alle Akten</span>
            </button>
          </div>

          {isTeacher && onOpenNewRubrikModal && (
            <button
              onClick={onOpenNewRubrikModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-2xl transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              title="Neue Rubrik anlegen"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Neue Akte</span>
            </button>
          )}
        </div>
      </div>

      {/* AKTEN-REGISTER TABS: Shaped like physical file folder tabs (kompaktere Fächerbuttons) */}
      <div className="relative pt-1">
        <div className="flex items-end gap-1 sm:gap-1.5 overflow-x-auto pb-0 px-1 no-scrollbar border-b-2 border-slate-300">
          {rubriken.map((rubrik, idx) => {
            const isSelected = viewMode === 'folder' && activeRubrikId === rubrik.id;
            const theme = getRainbowClasses(rubrik.color);
            const Icon = getIconComponent(rubrik.iconName);
            const rubrikWorksCount = works.filter((w) => w.rubrikId === rubrik.id).length;

            return (
              <button
                key={rubrik.id}
                onClick={() => {
                  setActiveRubrikId(rubrik.id);
                  setViewMode('folder');
                }}
                className={`group relative shrink-0 transition-all cursor-pointer px-2.5 sm:px-3 pt-2 pb-1.5 rounded-t-xl font-display flex items-center gap-1.5 border-t-2 border-x-2 ${
                  isSelected
                    ? `bg-[#FFFDF9] -mb-[2px] z-10 shadow-xs border-t-3 ${theme.border} text-slate-900 font-bold border-b-2 border-b-[#FFFDF9]`
                    : `bg-slate-100/90 hover:bg-slate-200/80 border-slate-300 text-slate-600 hover:text-slate-900 opacity-90 hover:opacity-100`
                }`}
                style={isSelected ? { borderTopColor: theme.spine } : undefined}
                title={`${rubrik.title} (${rubrikWorksCount} ${rubrikWorksCount === 1 ? 'Werk' : 'Werke'})`}
              >
                {/* File tab icon */}
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                    isSelected ? `${theme.bg} ${theme.text}` : 'bg-white/60 text-slate-500'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                </div>

                {/* Tab Label */}
                <span className="text-xs whitespace-nowrap">
                  {rubrik.title}
                </span>

                {/* Badge with count */}
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold tabular-nums shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : rubrikWorksCount > 0
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {rubrikWorksCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODE 1: GEÖFFNETE AKTE (Single Folder View - zero scroll) */}
      {viewMode === 'folder' && activeRubrik && (
        <div className="bg-[#FFFDF9] border-2 border-slate-300 rounded-b-3xl rounded-tr-3xl shadow-sm p-5 sm:p-8 space-y-6 transition-all animate-in fade-in duration-150 relative">
          {/* Akten-Kopfzeile / Folder Document Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3.5">
              <div
                className={`w-14 h-14 rounded-2xl ${activeTheme.bg} border-2 ${activeTheme.border} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <ActiveIcon className={`w-7 h-7 ${activeTheme.text}`} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                    AKTE #{activeRubrik.id.toUpperCase().slice(0, 6)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    Format: {activeRubrik.mediaType === 'video' ? 'Video & Animation' : activeRubrik.mediaType === 'audio' ? 'Hörspiel & Audio' : 'Buch & Dokument'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {activeWorks.length} {activeWorks.length === 1 ? 'Dokument abgelegt' : 'Dokumente abgelegt'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                  Akte: {activeRubrik.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-body leading-relaxed">
                  {activeRubrik.description}
                </p>
              </div>
            </div>

            {/* Folder Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              <button
                onClick={() => onSelectRubrikAndGoToCatalog(activeRubrik.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Diese Akte im Gesamtkatalog mit Suchfunktion anzeigen"
              >
                <span>Im Katalog ansehen</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {isTeacher && onOpenAddWorkForRubrik && (
                <button
                  onClick={() => onOpenAddWorkForRubrik(activeRubrik.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl transition-all cursor-pointer shadow-2xs"
                  title="Neues Werk direkt in dieser Akte ablegen"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Werk hier ablegen</span>
                </button>
              )}
            </div>
          </div>

          {/* AKTEN-INHALT / FILED WORKS LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-display">
                  Abgelegte Dokumente in dieser Akte ({activeWorks.length})
                </h4>
              </div>
              <span className="text-xs text-slate-400">
                Akte {activeIndex + 1} von {rubriken.length}
              </span>
            </div>

            {activeWorks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {activeWorks.map((work) => (
                  <div
                    key={work.id}
                    className="bg-white rounded-2xl border-2 border-slate-200/90 p-4 sm:p-5 flex flex-col justify-between hover:border-pink-300 hover:shadow-md transition-all group relative"
                  >
                    <div className="flex items-start gap-4">
                      {/* Document Thumbnail / Cover preview */}
                      <div
                        onClick={() => onOpenPreview(work)}
                        className={`w-28 sm:w-32 ${
                          work.format === 'landscape' ? 'aspect-16/10' : 'aspect-3/4'
                        } rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer relative shadow-2xs group-hover:scale-[1.02] transition-transform select-none`}
                      >
                        <img
                          src={
                            work.coverImage && work.coverImage.trim()
                              ? work.coverImage.startsWith('/src/assets/')
                                ? work.coverImage.replace('/src/assets/', '/assets/')
                                : work.coverImage
                              : work.projectUrl && work.projectUrl.includes('scratch.mit.edu/projects/')
                              ? `https://uploads.scratch.mit.edu/get_image/project/${work.projectUrl.match(/projects\/(\d+)/)?.[1] || ''}_480x360.png`
                              : '/assets/images/scapestudio_zauberwald_1791208919074.jpg'
                          }
                          alt={work.title}
                          referrerPolicy="no-referrer"
                          draggable={false}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-6 h-6 drop-shadow-md" />
                        </div>
                      </div>

                      {/* Document Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {work.schoolYear}
                          </span>
                          <span className="text-[10px] font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                            {work.creationTool}
                          </span>
                        </div>

                        <h5
                          onClick={() => onOpenPreview(work)}
                          className="text-base sm:text-lg font-bold text-slate-900 font-display group-hover:text-pink-600 transition-colors cursor-pointer truncate"
                          title={work.title}
                        >
                          {work.title}
                        </h5>

                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          Erstellt von: <strong className="text-slate-700">{work.authorId}</strong>
                        </p>

                        <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed font-body">
                          {work.summary}
                        </p>
                      </div>
                    </div>

                    {/* Action Bar inside dossier card */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ Geprüft
                        </span>
                        {work.format === 'landscape' && (
                          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            Querformat 16:9
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isTeacher && onEditWork && (
                          <button
                            onClick={() => onEditWork(work)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
                            title="Werk bearbeiten (Lehrperson)"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            <span>Bearbeiten</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPreview(work);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-pink-600 rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Vorschau öffnen</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Leere Akte (Empty Folder State) */
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
                <div
                  className={`w-16 h-16 rounded-2xl ${activeTheme.bg} ${activeTheme.border} border-2 flex items-center justify-center mx-auto`}
                >
                  <ActiveIcon className={`w-8 h-8 ${activeTheme.text}`} />
                </div>
                <div>
                  <h5 className="text-lg font-bold text-slate-900 font-display">
                    Diese Akte ist aktuell noch leer
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed font-body">
                    In der Rubrik &laquo;{activeRubrik.title}&raquo; wurden bisher noch keine Schülerarbeiten abgelegt.
                  </p>
                </div>

                {isTeacher && onOpenAddWorkForRubrik ? (
                  <div className="pt-2">
                    <button
                      onClick={() => onOpenAddWorkForRubrik(activeRubrik.id)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Erstes Werk in dieser Akte ablegen</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Sobald Schülerprojekte eingereicht und von der Lehrperson geprüft wurden, erscheinen sie hier.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Akten-Blättern Footer: Switch between Akten without scrolling */}
          <div className="pt-4 border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevAkte}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500" />
                <span>Vorherige Akte</span>
              </button>

              <button
                onClick={handleNextAkte}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <span>Nächste Akte</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="text-slate-500 text-center sm:text-right">
              Tipp: Klicke oben auf die Akten-Reiter, um direkt zwischen den Fächern zu springen.
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: ALLE AKTEN-MAPPEN (Overview Filing Cabinet Grid) */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {rubriken.map((rubrik) => {
            const theme = getRainbowClasses(rubrik.color);
            const Icon = getIconComponent(rubrik.iconName);
            const rubrikWorks = works.filter((w) => w.rubrikId === rubrik.id);

            return (
              <div
                key={rubrik.id}
                className="bg-white rounded-3xl border-2 border-slate-200/90 kawaii-card-shadow p-5 flex flex-col justify-between hover:border-pink-300 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Akten-Reiter am oberen Rand */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl ${theme.bg} ${theme.border} border-2 flex items-center justify-center`}
                    >
                      <Icon className={`w-6 h-6 ${theme.text}`} />
                    </div>
                    <span className="text-xs font-bold tabular-nums text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      {rubrikWorks.length} {rubrikWorks.length === 1 ? 'Ablage' : 'Ablagen'}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                    AKTE #{rubrik.id.toUpperCase().slice(0, 6)}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-display group-hover:text-pink-600 transition-colors">
                    {rubrik.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                    {rubrik.description}
                  </p>

                  {/* Preview of filed items */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-hidden h-14">
                    {rubrikWorks.length > 0 ? (
                      rubrikWorks.slice(0, 3).map((w, idx) => (
                        <div
                          key={w.id}
                          className="w-10 h-13 rounded-md overflow-hidden border border-slate-200 shadow-2xs shrink-0 relative bg-slate-100"
                          title={w.title}
                          style={{ transform: `rotate(${(idx - 1) * 3}deg)` }}
                        >
                          <img
                            src={w.coverImage}
                            alt={w.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Noch keine Dokumente abgelegt
                      </span>
                    )}
                  </div>
                </div>

                {/* Open this Akte */}
                <button
                  onClick={() => {
                    setActiveRubrikId(rubrik.id);
                    setViewMode('folder');
                  }}
                  className={`mt-4 w-full py-2.5 px-4 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${theme.bg} ${theme.text} ${theme.border} hover:opacity-90`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Diese Akte aufschlagen</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

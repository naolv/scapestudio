import React, { useState } from 'react';
import { Volume2, BookOpen, Eye, ShieldCheck, UserCheck, Edit3, ChevronDown, ChevronUp, Gamepad2 } from 'lucide-react';
import { WorkItem, Rubrik } from '../types';
import { getRainbowClasses, getIconComponent } from '../utils/theme';
import { detectEmbedDetails } from '../utils/embedHelper';

interface WorkCardProps {
  work: WorkItem;
  rubrik: Rubrik | undefined;
  onOpenPreview: (work: WorkItem) => void;
  onToggleLike?: (workId: string) => void;
  onEditWork?: (work: WorkItem) => void;
}

export const WorkCard: React.FC<WorkCardProps> = ({
  work,
  rubrik,
  onOpenPreview,
  onToggleLike,
  onEditWork,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const colorTheme = rubrik ? getRainbowClasses(rubrik.color) : getRainbowClasses('pink');
  const RubrikIcon = rubrik ? getIconComponent(rubrik.iconName) : BookOpen;
  const isGame = detectEmbedDetails(work.projectUrl, work.creationTool, work.rubrikId).isGame;

  // Resolve robust cover image: Prioritize custom uploaded cover, then Scratch thumbnail, then fallback
  const effectiveCover = React.useMemo(() => {
    if (work.coverImage && work.coverImage.trim()) {
      if (work.coverImage.startsWith('/src/assets/')) {
        return work.coverImage.replace('/src/assets/', '/assets/');
      }
      return work.coverImage;
    }
    if (work.projectUrl && work.projectUrl.includes('scratch.mit.edu/projects/')) {
      const match = work.projectUrl.match(/projects\/(\d+)/i);
      if (match) {
        return `https://uploads.scratch.mit.edu/get_image/project/${match[1]}_480x360.png`;
      }
    }
    return '/assets/images/scapestudio_zauberwald_1791208919074.jpg';
  }, [work.coverImage, work.projectUrl]);

  const isLandscape =
    work.format === 'landscape' ||
    (work.format !== 'portrait' &&
      (work.creationTool.includes('Video') ||
        work.rubrikId === 'videos' ||
        work.id.includes('kurbel') ||
        work.id === 'work-scapefolio'));

  return (
    <article className="group bg-white rounded-3xl border border-slate-200/90 kawaii-card-shadow hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Visual Presentation Container */}
      <div 
        onClick={() => onOpenPreview(work)}
        className="relative aspect-4/3 overflow-hidden bg-slate-100 cursor-pointer flex items-center justify-center p-3 select-none"
      >
        {/* Decorative subtle rainbow background wash */}
        <div className={`absolute inset-0 opacity-20 ${colorTheme.bg}`} />

        {/* 3D-effect Kawaii Book Cover Mockup - Adapts to landscape or portrait */}
        <div className={`relative ${
          isLandscape 
            ? 'w-48 h-36 sm:w-52 sm:h-38' 
            : 'w-40 h-52 sm:w-44 sm:h-56'
          } rounded-r-2xl rounded-l-md bg-white kawaii-book-shadow flex transition-transform duration-300 group-hover:scale-[1.03] group-hover:-rotate-1`}
        >
          {/* Spine with colorful bookmark vibe */}
          <div
            className="w-4.5 h-full rounded-l-md shrink-0 flex flex-col justify-between items-center py-3"
            style={{ backgroundColor: colorTheme.spine }}
          >
            <div className="w-1.5 h-6 bg-white/40 rounded-full" />
            <div className="w-1.5 h-8 bg-black/15 rounded-full" />
            <div className="w-1.5 h-6 bg-white/40 rounded-full" />
          </div>

          {/* Book Face Cover with object-contain to prevent cutting off */}
          <div className="flex-1 h-full overflow-hidden relative rounded-r-xl bg-slate-50 border-y border-r border-slate-200/60 flex flex-col items-center justify-center">
            {!imageError ? (
              <img
                src={effectiveCover}
                alt={`Cover von ${work.title}`}
                referrerPolicy="no-referrer"
                draggable={false}
                onError={() => setImageError(true)}
                className="w-full h-full object-contain p-0.5 rounded-r-xl pointer-events-none select-none"
              />
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center p-3 text-center ${colorTheme.bg}`}>
                <RubrikIcon className={`w-10 h-10 mb-2 ${colorTheme.text}`} />
                <span className="text-xs font-semibold text-slate-800 line-clamp-2">
                  {work.title}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 font-mono">
                  {work.authorId}
                </span>
              </div>
            )}

            {/* Subtle gloss overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-white/10 pointer-events-none" />

            {/* Audio Voiceover indicator overlay */}
            {work.audioNarration && (
              <div className="absolute bottom-2 right-2 bg-white/95 text-slate-800 p-1.5 rounded-lg shadow-sm flex items-center gap-1 border border-slate-200">
                <Volume2 className="w-3.5 h-3.5 text-pink-600" />
                <span className="text-[10px] font-bold">Audio</span>
              </div>
            )}

            {/* Interactive Game badge */}
            {isGame && (
              <div
                className="absolute bottom-2 left-2 bg-slate-900/90 text-emerald-300 p-1.5 rounded-lg shadow-sm flex items-center gap-1 border border-slate-700 text-[10px] font-bold"
                title="Interaktiv spielbar"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spielbar</span>
              </div>
            )}

            {/* Quality seal badge */}
            {work.qualityPassed && (
              <div 
                className="absolute top-2 left-2 bg-emerald-500 text-white p-1 rounded-md shadow-xs flex items-center"
                title="Geprüfter Qualitätsstandard"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>

        {/* Hover quick action overlay - fully clickable button */}
        <div className="absolute inset-0 bg-slate-900/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview(work);
            }}
            className="bg-white/95 hover:bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform cursor-pointer pointer-events-auto active:scale-95"
          >
            <Eye className="w-4 h-4 text-pink-500" />
            <span>Vorschau öffnen</span>
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Clean unboxed metadata: Privacy-compliant (No real names or class!) */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
            <span className={colorTheme.text}>{rubrik?.title || 'Projekt'}</span>
            <span aria-hidden="true">·</span>
            <span>{work.creationTool}</span>
            <span aria-hidden="true">·</span>
            <span>{work.pagesCount} {work.pagesCount === 1 ? 'Seite' : 'Seiten'}</span>
          </div>

          {/* Book Title */}
          <h3 
            onClick={() => onOpenPreview(work)}
            className="text-lg font-bold text-slate-900 tracking-tight leading-snug hover:text-pink-600 transition-colors cursor-pointer line-clamp-2"
          >
            {work.title}
          </h3>

          {/* Child Author ID (Anonymous & GDPR compliant) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-mono">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>ID: <strong className="text-slate-800 font-semibold">{work.authorId}</strong></span>
          </div>

          {/* Summary - full text readable through clicking or scrolling */}
          <div className="mt-2.5">
            <div
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-xs text-slate-600 leading-relaxed cursor-pointer rounded-lg p-1.5 -mx-1.5 hover:bg-slate-50 transition-colors ${
                isExpanded
                  ? 'max-h-56 overflow-y-auto pr-1 select-text scrollbar-thin'
                  : 'line-clamp-2'
              }`}
              title={isExpanded ? 'Klicken zum Einklappen' : 'Klicken, um den ganzen Text zu lesen'}
            >
              {work.summary}
            </div>
            {work.summary && work.summary.length > 80 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 hover:text-pink-700 cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    <span>Weniger anzeigen</span>
                    <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <span>Ganzen Text lesen</span>
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Card Footer with actions */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2">
          {onEditWork && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditWork(work);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors cursor-pointer"
              title="Werk & Texte bearbeiten"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Bearbeiten</span>
            </button>
          )}

          {/* Primary View Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview(work);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 border border-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            <span>{isGame ? 'Vorschau & Spielen' : 'Vorschau & Lesen'}</span>
            {isGame ? (
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};


import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Volume2,
  VolumeX,
  Share2,
  BookOpen,
  QrCode,
  Sparkles,
  Info,
  Check,
  ShieldCheck,
  UserCheck,
  Film,
  Play,
  Edit3,
  Layout,
  Maximize2,
  FileText,
  Gamepad2,
  RotateCcw,
} from 'lucide-react';
import { WorkItem, Rubrik } from '../types';
import { getRainbowClasses } from '../utils/theme';
import { KawaiiStar, KawaiiMascot } from './KawaiiIcons';
import { QUALITY_STANDARDS } from '../data/qualityStandards';
import { detectEmbedDetails } from '../utils/embedHelper';

interface BookPreviewModalProps {
  work: WorkItem | null;
  rubrik: Rubrik | undefined;
  onClose: () => void;
  onToggleLike: (workId: string) => void;
  onEditWork?: (work: WorkItem) => void;
}

export const BookPreviewModal: React.FC<BookPreviewModalProps> = ({
  work,
  rubrik,
  onClose,
  onToggleLike,
  onEditWork,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'preview' | 'external' | 'qr'>('preview');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [displayFormat, setDisplayFormat] = useState<'auto' | 'landscape' | 'portrait' | 'square'>('auto');
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [useTurboWarp, setUseTurboWarp] = useState(true);

  const embedInfo = useMemo(() => {
    return detectEmbedDetails(work?.projectUrl, work?.creationTool, work?.rubrikId);
  }, [work?.projectUrl, work?.creationTool, work?.rubrikId]);

  useEffect(() => {
    setCurrentPage(0);
    setViewMode('preview');
    setIsPlayingAudio(false);
    setCopiedLink(false);
    setDisplayFormat(work?.format || 'auto');
    setFitMode('contain');
  }, [work]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (!work) return;
      if (e.key === 'ArrowRight' && currentPage < (work.previewPages?.length || 1) - 1) {
        setCurrentPage((prev) => prev + 1);
      }
      if (e.key === 'ArrowLeft' && currentPage > 0) {
        setCurrentPage((prev) => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [work, currentPage, onClose]);

  if (!work) return null;

  const colorTheme = rubrik ? getRainbowClasses(rubrik.color) : getRainbowClasses('pink');
  const totalPages = work.previewPages && work.previewPages.length > 0 ? work.previewPages.length : 1;
  const activePage = work.previewPages?.[currentPage];

  const effectiveCover = useMemo(() => {
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

  const handleCopyLink = () => {
    const url = work.projectUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isVideo = work.creationTool.includes('Video') || work.rubrikId === 'videos';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Rainbow Accent Strip */}
        <div className="h-1.5 rainbow-bar w-full" />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-pink-600 font-bold font-display">DIE SCAPES</span>
              <span aria-hidden="true">·</span>
              <span className={colorTheme.text}>{rubrik?.title || 'Kategorie'}</span>
              <span aria-hidden="true">·</span>
              <span>{work.creationTool}</span>
              <span aria-hidden="true">·</span>
              <span>{work.schoolYear}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display mt-0.5">
              {work.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5 font-mono">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Autoren-ID: <strong className="font-semibold text-slate-800">{work.authorId}</strong></span>
              {work.qualityPassed && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full font-sans font-semibold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Qualitätsgeprüft
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Link kopieren"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            {onEditWork && (
              <button
                onClick={() => onEditWork(work)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="Werk & Texte bearbeiten"
              >
                <Edit3 className="w-3.5 h-3.5 text-pink-600" />
                <span className="hidden sm:inline">Bearbeiten</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer ml-1"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                viewMode === 'preview'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {embedInfo.isGame ? <Gamepad2 className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
              <span>{embedInfo.isGame ? 'Interaktiv spielen' : 'Interaktive Vorschau'}</span>
            </button>

            {work.projectUrl && (
              <button
                onClick={() => setViewMode('external')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  viewMode === 'external'
                    ? 'bg-pink-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{embedInfo.isGame ? 'Vollbild Player' : `${work.creationTool} Original`}</span>
              </button>
            )}

            <button
              onClick={() => setViewMode('qr')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                viewMode === 'qr'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Klassenzimmer QR-Code</span>
            </button>
          </div>

          {work.fileUrl && (
            <a
              href={work.fileUrl}
              target="_blank"
              download={work.fileName || `${work.title}.pdf`}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-emerald-200"
            >
              <span>Datei herunterladen {work.fileName ? `(${work.fileName})` : ''}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {work.projectUrl && (
            <a
              href={embedInfo.cleanProjectUrl || work.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-pink-200/70"
            >
              <span>Im Vollbild öffnen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-[#FAF9F6]">
          {viewMode === 'preview' && (
            <div className="space-y-6">
              {/* Native Video Player if work has video file or is Video/Film */}
              {(work.creationTool === 'Video & Film' ||
                work.fileUrl?.endsWith('.mp4') ||
                work.fileName?.toLowerCase().endsWith('.mp4') ||
                work.fileName?.toLowerCase().endsWith('.webm') ||
                work.fileType?.includes('video')) && (
                <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-800 p-4 sm:p-6 text-white space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold font-display text-white">
                          Video-Player &middot; {work.title}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {work.fileName || 'Original MP4 / Video'}
                        </span>
                      </div>
                    </div>
                    {work.fileUrl && (
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        HD Wiedergabe bereit
                      </span>
                    )}
                  </div>

                  {work.fileUrl ? (
                    <video
                      src={work.fileUrl}
                      controls
                      playsInline
                      className="w-full max-h-[440px] rounded-2xl bg-black shadow-inner"
                      poster={effectiveCover}
                    >
                      Dein Browser unterstützt das Video-Tag leider nicht.
                    </video>
                  ) : (
                    <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
                      <Play className="w-10 h-10 text-pink-400 mx-auto" />
                      <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                        Dieses Projekt ist als Video angelegt. Klicke oben auf «Im Vollbild öffnen», um das Video direkt im Browser oder in Microsoft 365 / YouTube anzusehen.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Game Player for Scratch, Chess (Schach), and Web Games */}
              {embedInfo.isGame && (
                <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 p-4 sm:p-6 text-white space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold font-display text-white flex items-center gap-2">
                          <span>{work.title}</span>
                          <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Live Spielbar
                          </span>
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {embedInfo.isScratch
                            ? 'Scratch Projekt'
                            : embedInfo.isLichess
                            ? 'Schachspiel (Lichess)'
                            : work.creationTool}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {embedInfo.isScratch && embedInfo.turboWarpUrl && (
                        <button
                          type="button"
                          onClick={() => setUseTurboWarp(!useTurboWarp)}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                          title="TurboWarp führt Scratch-Spiele flüssig und mit sofortiger Ton-Wiedergabe aus"
                        >
                          Player: {useTurboWarp ? 'TurboWarp (Schnell & Ton)' : 'Scratch Original'}
                        </button>
                      )}

                      {work.projectUrl && (
                        <a
                          href={embedInfo.cleanProjectUrl || work.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-300 hover:bg-amber-400 rounded-xl transition-all shadow-xs"
                        >
                          <span>{embedInfo.launcherLabel}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Audio tip banner for Scratch / interactive games */}
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-800/90 rounded-xl border border-slate-700/80 text-[11px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong>Ton einschalten:</strong> Klicke einmal mit der Maus oder dem Finger in das Spielfeld, damit dein Browser den Sound freigibt.
                      </span>
                    </div>
                  </div>

                  {/* Playable Canvas / Frame */}
                  <div className="w-full aspect-4/3 sm:aspect-16/10 min-h-[420px] max-h-[620px] rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner relative flex items-center justify-center">
                    {embedInfo.embedUrl ? (
                      <iframe
                        src={
                          embedInfo.isScratch
                            ? useTurboWarp && embedInfo.turboWarpUrl
                              ? embedInfo.turboWarpUrl
                              : embedInfo.scratchOfficialUrl || embedInfo.embedUrl
                            : embedInfo.embedUrl
                        }
                        className="w-full h-full min-h-[420px] border-0"
                        allowFullScreen
                        allow="autoplay *; fullscreen *; gamepad *; microphone *; camera *; clipboard-read; clipboard-write; encrypted-media; midi"
                        title={`Spiel - ${work.title}`}
                      />
                    ) : (
                      <div className="text-center p-8 space-y-3">
                        <KawaiiMascot className="w-16 h-16 mx-auto mb-2" />
                        <h4 className="text-base font-bold text-white font-display">Spiel bereit</h4>
                        <p className="text-xs text-slate-300 max-w-sm mx-auto">
                          Klicke auf den Button unten, um das Spiel in einem neuen Fenster zu starten.
                        </p>
                        {work.projectUrl && (
                          <a
                            href={work.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl transition-colors shadow-md"
                          >
                            <span>Spiel jetzt öffnen</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Game instructions & description */}
                  <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-pink-400 font-display flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Spielanleitung & Beschreibung:</span>
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-body">
                      {work.summary || 'Klicke in das Spielfeld, um mit Maus oder Tastatur zu spielen.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Interactive Book Page / Cover Display (Always shown so every uploaded work has a preview!) */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 relative">
                {/* Book header bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-600 font-display">
                      {totalPages > 1 ? 'Abschnitt / Doppelseite' : 'Projekt-Vorschau'}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-600 font-medium">
                      Seite {currentPage + 1} von {totalPages}
                    </span>
                  </div>

                  {work.audioNarration && (
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        isPlayingAudio
                          ? 'bg-pink-100 text-pink-700 border-pink-300 animate-pulse'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'text-pink-600' : 'text-slate-600'}`} />
                      <span>{isPlayingAudio ? 'Höraufnahme läuft...' : 'Sprachaufnahme anhören'}</span>
                    </button>
                  )}
                </div>

                {/* Simulated Audio Wave if playing */}
                {isPlayingAudio && (
                  <div className="mb-6 p-3 bg-pink-50 border border-pink-200 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 h-6">
                      <div className="w-1 bg-pink-500 h-3 animate-bounce rounded-full" />
                      <div className="w-1 bg-pink-500 h-6 animate-pulse rounded-full" />
                      <div className="w-1 bg-pink-500 h-4 animate-bounce rounded-full delay-75" />
                      <div className="w-1 bg-pink-500 h-5 animate-pulse rounded-full delay-100" />
                      <div className="w-1 bg-pink-500 h-2 animate-bounce rounded-full" />
                    </div>
                    <span className="text-xs text-pink-700 font-medium italic">
                      Originalaufnahme von {work.authorId}: &ldquo;{activePage?.title || work.title}&rdquo;
                    </span>
                    <button
                      onClick={() => setIsPlayingAudio(false)}
                      className="text-xs text-pink-600 hover:text-pink-800 font-semibold cursor-pointer underline"
                    >
                      Stopp
                    </button>
                  </div>
                )}

                {/* Format Anpassung Toolbar (Damit in der Vorschau nichts abgeschnitten wird) */}
                <div className="mb-4 p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <Layout className="w-4 h-4 text-pink-500" />
                    <span>Format anpassen:</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs">
                    {[
                      { id: 'auto', label: 'Automatisch' },
                      { id: 'landscape', label: 'Querformat 16:9' },
                      { id: 'portrait', label: 'Buch 3:4' },
                      { id: 'square', label: 'Quadrat 1:1' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setDisplayFormat(fmt.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          displayFormat === fmt.id
                            ? 'bg-pink-500 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setFitMode(fitMode === 'contain' ? 'cover' : 'contain')}
                    className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                      fitMode === 'contain'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Umschalten: Vollständiges Bild (nichts abgeschnitten) oder flächendeckend"
                  >
                    {fitMode === 'contain' ? '✓ Nichts abgeschnitten (Original)' : 'Fläche füllen'}
                  </button>
                </div>

                {/* Page Content Spreads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[280px]">
                  {/* Left: Illustration / Cover preview - Adapts to format and never cuts off */}
                  <div
                    className={`relative rounded-2xl overflow-hidden bg-slate-900/5 border border-slate-200/80 shadow-xs flex items-center justify-center p-2 transition-all ${
                      displayFormat === 'landscape'
                        ? 'aspect-16/9 sm:aspect-16/10'
                        : displayFormat === 'portrait'
                        ? 'aspect-3/4'
                        : displayFormat === 'square'
                        ? 'aspect-square'
                        : 'min-h-[260px] max-h-[380px] w-full'
                    }`}
                  >
                    {activePage?.videoUrl || (work.fileUrl && (work.fileUrl.endsWith('.m4v') || work.fileUrl.endsWith('.mp4'))) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <video
                          controls
                          playsInline
                          preload="metadata"
                          poster={activePage?.imageUrl || effectiveCover}
                          src={activePage?.videoUrl || work.fileUrl}
                          className="max-h-[360px] max-w-full w-auto h-auto rounded-xl drop-shadow-md mx-auto"
                        >
                          Dein Browser unterstützt dieses Videoformat nicht.
                        </video>
                      </div>
                    ) : (
                      <img
                        src={activePage?.imageUrl || effectiveCover}
                        alt={activePage?.title || work.title}
                        referrerPolicy="no-referrer"
                        className={`max-h-[360px] max-w-full w-auto h-auto rounded-xl drop-shadow-sm mx-auto transition-all ${
                          fitMode === 'cover' ? 'w-full h-full object-cover' : 'object-contain'
                        }`}
                      />
                    )}
                    {activePage?.illustrationDescription && (
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/75 backdrop-blur-xs text-white text-[11px] p-2 rounded-lg leading-tight">
                        {activePage.illustrationDescription}
                      </div>
                    )}
                  </div>

                  {/* Right: Child's Text & Description */}
                  <div className="flex flex-col justify-between h-full min-h-[260px]">
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800 font-display">
                          {activePage?.title || 'Aus dem Werk'}
                        </h3>
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                          Seite {currentPage + 1}
                        </span>
                      </div>

                      {/* Scrollable text box for full readability */}
                      <div className="max-h-[280px] sm:max-h-[340px] overflow-y-auto pr-2 scrollbar-thin rounded-xl p-1 bg-slate-50/50 border border-slate-100/80">
                        <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-body select-text">
                          {activePage?.text || work.summary}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>Erstellt mit {work.creationTool}</span>
                      <span>{work.schoolYear}</span>
                    </div>
                  </div>
                </div>

                {/* Navigation arrows */}
                {totalPages > 1 && (
                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Vorherige Seite</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx)}
                          className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                            currentPage === idx ? 'bg-pink-500 scale-125' : 'bg-slate-200 hover:bg-slate-300'
                          }`}
                          aria-label={`Gehe zu Seite ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      disabled={currentPage === totalPages - 1}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 cursor-pointer"
                    >
                      <span>Nächste Seite</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Full Project Description / Summary (Always accessible & completely readable) */}
              {work.summary && (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 text-slate-800 font-bold font-display text-sm">
                    <FileText className="w-4 h-4 text-pink-500" />
                    <span>Vollständige Projektbeschreibung & Zusammenfassung</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line select-text">
                      {work.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags & Metadata */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-semibold text-slate-500">Themen:</span>
                {work.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External / Original Viewer Tab */}
          {viewMode === 'external' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-xs text-blue-800">
                    Dieses Projekt wurde mit <strong>{work.creationTool}</strong> erstellt. Du kannst es direkt im Original-Format öffnen.
                  </p>
                </div>
                {work.projectUrl && (
                  <a
                    href={embedInfo.cleanProjectUrl || work.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-xs"
                  >
                    Vollbild öffnen
                  </a>
                )}
              </div>

              {/* Responsive Container */}
              {embedInfo.embedUrl ? (
                <div className="w-full aspect-16/10 min-h-[500px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner relative">
                  <iframe
                    src={
                      embedInfo.isScratch
                        ? useTurboWarp && embedInfo.turboWarpUrl
                          ? embedInfo.turboWarpUrl
                          : embedInfo.scratchOfficialUrl || embedInfo.embedUrl
                        : embedInfo.embedUrl
                    }
                    className="w-full h-full min-h-[500px] border-0"
                    allowFullScreen
                    allow="autoplay *; fullscreen *; gamepad *; microphone *; camera *; clipboard-read; clipboard-write; encrypted-media; midi"
                    title={`Original Viewer - ${work.title}`}
                  />
                </div>
              ) : (
                <div className="w-full aspect-16/10 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner relative flex flex-col items-center justify-center p-6 text-center text-white">
                  <KawaiiMascot className="w-16 h-16 mb-4" />
                  <h3 className="text-lg font-bold font-display">{work.title}</h3>
                  <p className="text-xs text-slate-300 max-w-md mt-1 mb-5">
                    Öffne das Projekt im Original-Viewer ({work.creationTool}) mit allen interaktiven Medien:
                  </p>
                  <a
                    href={embedInfo.cleanProjectUrl || work.projectUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-900 bg-amber-300 hover:bg-amber-400 rounded-xl transition-all shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Im Original-Viewer ansehen</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* QR Code Tab for Classroom Display */}
          {viewMode === 'qr' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 mx-auto flex items-center justify-center border border-pink-200">
                <QrCode className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                QR-Code für den Klassenraum
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diesen Code können Mitschülerinnen, Mitschüler und Eltern mit dem Schul-iPad oder Smartphone scannen, um direkt zum Werk von <strong>{work.authorId}</strong> zu gelangen.
              </p>

              {/* Stylized QR Code SVG */}
              <div className="p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl inline-block shadow-inner">
                <svg viewBox="0 0 120 120" className="w-48 h-48 mx-auto" fill="none">
                  <rect x="10" y="10" width="30" height="30" rx="4" fill="#0F172A" />
                  <rect x="16" y="16" width="18" height="18" rx="2" fill="#FFFFFF" />
                  <rect x="20" y="20" width="10" height="10" rx="1" fill="#0F172A" />

                  <rect x="80" y="10" width="30" height="30" rx="4" fill="#0F172A" />
                  <rect x="86" y="16" width="18" height="18" rx="2" fill="#FFFFFF" />
                  <rect x="90" y="20" width="10" height="10" rx="1" fill="#0F172A" />

                  <rect x="10" y="80" width="30" height="30" rx="4" fill="#0F172A" />
                  <rect x="16" y="86" width="18" height="18" rx="2" fill="#FFFFFF" />
                  <rect x="20" y="90" width="10" height="10" rx="1" fill="#0F172A" />

                  <rect x="46" y="14" width="6" height="6" rx="1" fill="#0F172A" />
                  <rect x="58" y="14" width="14" height="6" rx="1" fill="#0F172A" />
                  <rect x="46" y="26" width="10" height="6" rx="1" fill="#0F172A" />
                  <rect x="62" y="26" width="10" height="10" rx="1" fill="#F472B6" />
                  
                  <rect x="14" y="46" width="6" height="10" rx="1" fill="#0F172A" />
                  <rect x="26" y="46" width="14" height="6" rx="1" fill="#0F172A" />
                  <rect x="46" y="46" width="6" height="6" rx="1" fill="#0F172A" />
                  <rect x="58" y="46" width="10" height="6" rx="1" fill="#0F172A" />
                  <rect x="74" y="46" width="18" height="6" rx="1" fill="#0F172A" />
                  <rect x="98" y="46" width="8" height="6" rx="1" fill="#0F172A" />

                  <rect x="14" y="62" width="10" height="6" rx="1" fill="#0F172A" />
                  <rect x="30" y="58" width="8" height="10" rx="1" fill="#0F172A" />
                  <rect x="46" y="58" width="14" height="6" rx="1" fill="#0F172A" />
                  <rect x="66" y="58" width="6" height="14" rx="1" fill="#0F172A" />
                  <rect x="78" y="58" width="14" height="6" rx="1" fill="#0F172A" />
                  <rect x="98" y="58" width="8" height="14" rx="1" fill="#0F172A" />

                  <rect x="46" y="78" width="8" height="8" rx="1" fill="#0F172A" />
                  <rect x="60" y="78" width="10" height="8" rx="1" fill="#0F172A" />
                  <rect x="76" y="78" width="6" height="14" rx="1" fill="#0F172A" />
                  <rect x="88" y="78" width="18" height="6" rx="1" fill="#0F172A" />

                  <rect x="46" y="94" width="18" height="6" rx="1" fill="#0F172A" />
                  <rect x="70" y="98" width="8" height="8" rx="1" fill="#0F172A" />
                  <rect x="84" y="92" width="22" height="6" rx="1" fill="#0F172A" />
                  <rect x="92" y="104" width="14" height="6" rx="1" fill="#0F172A" />
                </svg>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Ausdrucken
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 text-xs font-semibold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors cursor-pointer"
                >
                  {copiedLink ? 'Link kopiert!' : 'Link kopieren'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


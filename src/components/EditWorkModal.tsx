import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Trash2,
  BookOpen,
  Volume2,
  Sparkles,
  Plus,
  ShieldCheck,
  Layout,
  Link as LinkIcon,
  UserCheck,
  FileText,
  AlertTriangle,
  Upload,
  Loader2,
} from 'lucide-react';
import { WorkItem, Rubrik, CreationTool, PreviewPage } from '../types';
import { uploadFileToFirebaseStorage } from '../firebase';

const PRESET_COVERS = [
  { id: 'cover-1', name: 'Zauberwald & Tiere', url: '/assets/images/scapestudio_zauberwald_1791208919074.jpg' },
  { id: 'cover-2', name: 'Insekten & Garten', url: '/assets/images/scapestudio_insektenhotel_1791208930406.jpg' },
  { id: 'cover-3', name: 'Weltall & Technik', url: '/assets/images/scapestudio_sonnensystem_1791208941220.jpg' },
];

interface EditWorkModalProps {
  isOpen: boolean;
  work: WorkItem | null;
  rubriken: Rubrik[];
  onClose: () => void;
  onSave: (updatedWork: WorkItem) => void;
  onDelete?: (workId: string) => void;
}

const CREATION_TOOLS: CreationTool[] = [
  'Book Creator',
  'Canva Kids',
  'Schreibwerkzeug',
  'Video & Film',
  'Audio & Podcast',
  'Scratch & Interaktiv',
  'Gezeichnetes Forscherheft',
  'Anderes Werkzeug',
];

export const EditWorkModal: React.FC<EditWorkModalProps> = ({
  isOpen,
  work,
  rubriken,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [rubrikId, setRubrikId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [schoolYear, setSchoolYear] = useState('2025/2026');
  const [creationTool, setCreationTool] = useState<CreationTool>('Book Creator');
  const [projectUrl, setProjectUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [summary, setSummary] = useState('');
  const [sources, setSources] = useState('');
  const [teacherNote, setTeacherNote] = useState('');
  const [audioNarration, setAudioNarration] = useState(false);
  const [pagesCount, setPagesCount] = useState(1);
  const [format, setFormat] = useState<'auto' | 'landscape' | 'portrait' | 'square'>('auto');
  const [tagsText, setTagsText] = useState('');
  const [previewPages, setPreviewPages] = useState<PreviewPage[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [coverMessage, setCoverMessage] = useState<string | null>(null);

  const handleProcessCoverFile = async (file: File) => {
    if (!file) return;
    setIsUploadingCover(true);
    setCoverMessage('Vorschaubild wird verarbeitet...');

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setCoverImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);

    try {
      const res = await uploadFileToFirebaseStorage(file, 'covers', file.name);
      if (res?.downloadUrl) {
        setCoverImage(res.downloadUrl);
      }
      setCoverMessage('Vorschaubild erfolgreich übernommen!');
      setTimeout(() => setCoverMessage(null), 3000);
    } catch (err) {
      console.warn('Cover upload to server failed:', err);
      setCoverMessage('Vorschaubild lokal übernommen!');
      setTimeout(() => setCoverMessage(null), 3000);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Sync state whenever work changes
  useEffect(() => {
    if (work) {
      setTitle(work.title || '');
      setRubrikId(work.rubrikId || rubriken[0]?.id || 'anleitungen');
      setAuthorId(work.authorId || '');
      setSchoolYear(work.schoolYear || '2025/2026');
      setCreationTool(work.creationTool || 'Book Creator');
      setProjectUrl(work.projectUrl || '');
      setCoverImage(work.coverImage || '');
      setSummary(work.summary || '');
      setSources(work.sources || '');
      setTeacherNote(work.teacherNote || '');
      setAudioNarration(!!work.audioNarration);
      setPagesCount(work.pagesCount || 1);
      setFormat(work.format || 'auto');
      setTagsText(work.tags ? work.tags.join(', ') : '');
      setPreviewPages(work.previewPages && work.previewPages.length > 0 ? [...work.previewPages] : [
        { pageNumber: 1, title: 'Seite 1', text: '' }
      ]);
      setShowDeleteConfirm(false);
      setError(null);
    }
  }, [work, rubriken]);

  if (!isOpen || !work) return null;

  const handleAddPreviewPage = () => {
    if (previewPages.length >= 8) return;
    setPreviewPages([
      ...previewPages,
      {
        pageNumber: previewPages.length + 1,
        title: `Abschnitt ${previewPages.length + 1}`,
        text: '',
      },
    ]);
  };

  const handleRemovePreviewPage = (index: number) => {
    if (previewPages.length <= 1) return;
    const updated = previewPages
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, pageNumber: i + 1 }));
    setPreviewPages(updated);
  };

  const handleUpdatePreviewPage = (index: number, field: keyof PreviewPage, val: any) => {
    const updated = [...previewPages];
    updated[index] = { ...updated[index], [field]: val };
    setPreviewPages(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Bitte gib einen Titel für das Projekt ein.');
      return;
    }

    const tagsArray = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updatedWork: WorkItem = {
      ...work,
      title: title.trim(),
      rubrikId,
      authorId: authorId.trim() || work.authorId || 'SCAPES-Autor',
      schoolYear,
      creationTool,
      summary: summary.trim(),
      coverImage: coverImage.trim() || work.coverImage,
      projectUrl: projectUrl.trim() || undefined,
      sources: sources.trim() || undefined,
      teacherNote: teacherNote.trim() || undefined,
      audioNarration,
      pagesCount: Math.max(1, pagesCount),
      format,
      tags: tagsArray.length > 0 ? tagsArray : work.tags,
      previewPages: previewPages.map((p, i) => ({
        pageNumber: i + 1,
        title: p.title?.trim() || `Seite ${i + 1}`,
        text: p.text?.trim() || '',
        illustrationDescription: p.illustrationDescription?.trim() || undefined,
        imageUrl: p.imageUrl?.trim() || undefined,
      })),
      qualityPassed: true,
      qualityChecksConfirmed: ['proofread', 'structure', 'cover', 'media_quality', 'copyright', 'sources'],
    };

    onSave(updatedWork);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && work) {
      onDelete(work.id);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Rainbow Accent Header */}
        <div className="h-2 rainbow-bar w-full" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center border border-pink-200 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                Werk & Texte bearbeiten
              </h2>
              <p className="text-xs text-slate-500">
                Passe Titel, Projektbeschreibung, Format und Vorschauseiten jederzeit an
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Title and Category */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-display">
                Titel des Werks / Projekts *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Kurbeltheater"
                className="w-full px-4 py-2.5 text-base font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-display"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Hier kannst du den Titel jederzeit ändern (z.B. &laquo;Kurbeltheater&raquo; statt Vorlage).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-display">
                  Kategorie / Rubrik
                </label>
                <select
                  value={rubrikId}
                  onChange={(e) => setRubrikId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all cursor-pointer"
                >
                  {rubriken.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-display">
                  Erstellungswerkzeug
                </label>
                <select
                  value={creationTool}
                  onChange={(e) => setCreationTool(e.target.value as CreationTool)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all cursor-pointer"
                >
                  {CREATION_TOOLS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Format / Aspect Ratio */}
          <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-purple-600" />
              <label className="text-xs font-bold text-purple-950 uppercase tracking-wider font-display">
                Format an das tatsächliche Werk anpassen (Damit nichts abgeschnitten wird)
              </label>
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              Wähle das Format des Werks, damit die Vorschau und das Titelbild vollständig und unbeschnitten dargestellt werden:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { id: 'auto', label: 'Automatisch', desc: 'Vollständig einpassen (Original)' },
                { id: 'landscape', label: 'Querformat', desc: '16:9 / 4:3 (Kurbeltheater, Videos)' },
                { id: 'portrait', label: 'Hochformat', desc: '3:4 / DIN A4 (Bücher, Portfolios)' },
                { id: 'square', label: 'Quadratisch', desc: '1:1 (Kompakt)' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setFormat(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    format === opt.id
                      ? 'bg-white border-purple-500 ring-2 ring-purple-400/30 text-purple-900 shadow-xs'
                      : 'bg-white/70 border-purple-200/70 text-slate-700 hover:bg-white'
                  }`}
                >
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Summary / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-display">
              Projektbeschreibung / Zusammenfassung
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Worum geht es in diesem Projekt? (z.B. Vorstellung des Projekts Kurbeltheater...)"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-body leading-relaxed"
            />
          </div>

          {/* Section 4: Web URL & Authors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-display">
                Projektlink (Scratch, Book Creator, Canva)
              </label>
              <input
                type="text"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://scratch.mit.edu/projects/... oder https://read.bookcreator.com/..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-display">
                Autoren-ID
              </label>
              <input
                type="text"
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                placeholder="z.B. Turboschnecke-00"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
          </div>

          {/* Section 4b: Titelbild / Cover & Drag & Drop */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                Titelbild / Vorschaubild (Cover)
              </label>
              <div className="flex items-center gap-2">
                {coverMessage && (
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 animate-in fade-in">
                    ✓ {coverMessage}
                  </span>
                )}
                {isUploadingCover && (
                  <span className="text-[11px] text-pink-600 font-semibold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Wird verarbeitet...
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Wähle eine Vorlage oder ziehe ein eigenes Bild hierher (Drag & Drop):
            </p>

            <div className="grid grid-cols-4 gap-3">
              {PRESET_COVERS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setCoverImage(preset.url)}
                  className={`relative aspect-3/4 rounded-xl overflow-hidden border-2 transition-all p-1 bg-slate-50 cursor-pointer ${
                    coverImage === preset.url
                      ? 'border-pink-500 ring-2 ring-pink-500/20 scale-102'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 text-white text-[9px] py-0.5 px-1 truncate text-center">
                    {preset.name}
                  </div>
                </button>
              ))}

              {/* Upload Tile */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingCover(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingCover(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingCover(false);
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    handleProcessCoverFile(files[0]);
                  }
                }}
                className={`relative aspect-3/4 rounded-xl border-2 border-dashed transition-all p-1.5 flex flex-col items-center justify-center text-center cursor-pointer ${
                  isDraggingCover
                    ? 'border-pink-500 bg-pink-100 ring-4 ring-pink-300 scale-105'
                    : coverImage && !PRESET_COVERS.some((p) => p.url === coverImage)
                    ? 'border-pink-500 bg-pink-50/50'
                    : 'border-slate-300 hover:border-pink-400 bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleProcessCoverFile(f);
                  }}
                  accept="image/*"
                  className="hidden"
                />
                {coverImage && !PRESET_COVERS.some((p) => p.url === coverImage) ? (
                  <div className="relative w-full h-full">
                    <img
                      src={coverImage}
                      alt="Aktuelles Cover"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/85 text-emerald-300 text-[8px] font-bold py-0.5 px-1 truncate text-center rounded-b-lg">
                      Aktives Bild
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className={`w-5 h-5 ${isDraggingCover ? 'text-pink-600 animate-bounce' : 'text-slate-400'} mb-1`} />
                    <span className="text-[10px] font-bold text-slate-700 leading-tight">
                      {isDraggingCover ? 'Hier loslassen!' : 'Eigenes Bild / Drag & Drop'}
                    </span>
                    <span className="text-[8px] text-pink-600 font-bold mt-1">
                      PNG, JPG, WebP
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Preview Pages */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                Vorschauseiten im Lesemodus ({previewPages.length})
              </label>
              {previewPages.length < 8 && (
                <button
                  type="button"
                  onClick={handleAddPreviewPage}
                  className="text-xs font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Seite hinzufügen</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {previewPages.map((page, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 font-display">
                      Abschnitt {idx + 1}
                    </span>
                    {previewPages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePreviewPage(idx)}
                        className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Seite entfernen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => handleUpdatePreviewPage(idx, 'title', e.target.value)}
                    placeholder="Abschnittsüberschrift"
                    className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                  />

                  <textarea
                    rows={2}
                    value={page.text}
                    onChange={(e) => handleUpdatePreviewPage(idx, 'text', e.target.value)}
                    placeholder="Beschreibungstext für diese Seite..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Delete confirmation section */}
          {onDelete && (
            <div className="pt-4 border-t border-slate-100">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Werk aus der Bibliothek löschen</span>
                </button>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3">
                  <span className="text-xs text-red-800 font-semibold">
                    Werk wirklich unwiderruflich löschen?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-2.5 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold cursor-pointer"
                    >
                      Ja, löschen
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Änderungen speichern</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

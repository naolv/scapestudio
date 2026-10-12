import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  BookOpen,
  Volume2,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  FileText,
  FileCheck,
  Loader2,
  Paperclip,
  Film,
  Music,
  Download,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { WorkItem, Rubrik, CreationTool } from '../types';
import { QUALITY_STANDARDS, generateAnonymousAuthorId } from '../data/qualityStandards';
import { uploadFileToFirebaseStorage } from '../firebase';
import { detectEmbedDetails } from '../utils/embedHelper';

interface AddWorkModalProps {
  isOpen: boolean;
  rubriken: Rubrik[];
  defaultRubrikId?: string;
  onClose: () => void;
  onAddWork: (work: WorkItem) => void;
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

const PRESET_COVERS = [
  { id: 'cover-1', name: 'Zauberwald & Tiere', url: '/assets/images/scapestudio_zauberwald_1791208919074.jpg' },
  { id: 'cover-2', name: 'Insekten & Garten', url: '/assets/images/scapestudio_insektenhotel_1791208930406.jpg' },
  { id: 'cover-3', name: 'Weltall & Technik', url: '/assets/images/scapestudio_sonnensystem_1791208941220.jpg' },
];

export const AddWorkModal: React.FC<AddWorkModalProps> = ({
  isOpen,
  rubriken,
  defaultRubrikId,
  onClose,
  onAddWork,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState(() => generateAnonymousAuthorId());
  const [schoolYear, setSchoolYear] = useState('2025/2026');
  const [creationTool, setCreationTool] = useState<CreationTool>('Book Creator');
  const [rubrikId, setRubrikId] = useState(() => defaultRubrikId || rubriken[0]?.id || 'geschichte');

  React.useEffect(() => {
    if (defaultRubrikId) {
      setRubrikId(defaultRubrikId);
    }
  }, [defaultRubrikId, isOpen]);
  const [projectUrl, setProjectUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [audioNarration, setAudioNarration] = useState(false);
  const [pagesCount, setPagesCount] = useState(8);
  const [teacherNote, setTeacherNote] = useState('');
  const [tagsInput, setTagsInput] = useState('Projekt, Schülerarbeit, Digital');
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0].url);
  const [customCoverPreview, setCustomCoverPreview] = useState<string | null>(null);
  const [isCustomCoverLocked, setIsCustomCoverLocked] = useState(false);
  const [coverSuccessMessage, setCoverSuccessMessage] = useState<string | null>(null);

  // Drag and Drop States
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const [isDraggingCoverTile, setIsDraggingCoverTile] = useState(false);
  const [isDraggingProjectFile, setIsDraggingProjectFile] = useState(false);

  // Firebase Storage File Upload State
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [format, setFormat] = useState<'auto' | 'landscape' | 'portrait' | 'square'>('auto');

  // Quality standards confirmation state (All 6 criteria in exact order, checked by default)
  const [confirmedStandards, setConfirmedStandards] = useState<Record<string, boolean>>({
    proofread: true,
    structure: true,
    cover: true,
    media_quality: true,
    copyright: true,
    sources: true,
  });

  const [sourcesText, setSourcesText] = useState('Quellen im Werk deklariert (Bücher, Webseiten und Bildnachweise).');

  // Handle URL change with auto-detection of title, description, and cover
  const handleProjectUrlChange = async (urlVal: string) => {
    setProjectUrl(urlVal);
    const trimmed = urlVal.trim();
    if (!trimmed) return;

    const embedInfo = detectEmbedDetails(trimmed);
    if (embedInfo.isScratch || embedInfo.gameType === 'scratch' || embedInfo.gameType === 'turbowarp') {
      setCreationTool('Scratch & Interaktiv');
      setRubrikId('games');
      setPagesCount(1);
      // ONLY set suggested Scratch cover if user has not explicitly locked/uploaded an own cover!
      if (!isCustomCoverLocked && !customCoverPreview && embedInfo.suggestedCover) {
        setSelectedCover(embedInfo.suggestedCover);
        setCustomCoverPreview(embedInfo.suggestedCover);
      }
      if (!title || title.trim() === '') {
        setTitle(embedInfo.suggestedTitle || 'Scratch Spiel');
      }
      if (!summary || summary.trim() === '') {
        setSummary('Interaktives Scratch-Spiel aus DIE SCAPES. Klicke auf «Spiel starten», um direkt im Browser loszulegen!');
      }
      setPreviewPages([
        {
          title: 'Scratch Spielvorschau',
          text: 'Interaktives Projekt aus dem Unterricht. Klicke im Player, um mit Tastatur oder Maus zu spielen!',
        },
      ]);
    } else if (embedInfo.isLichess || trimmed.toLowerCase().includes('schach') || trimmed.toLowerCase().includes('chess')) {
      setCreationTool('Scratch & Interaktiv');
      setRubrikId('games');
      setPagesCount(1);
      if (!title || title.trim() === '') {
        setTitle('Schachspiel');
      }
      if (!summary || summary.trim() === '') {
        setSummary('Interaktives Schachspiel und Denksportaufgabe. Kann direkt am Bildschirm gespielt werden!');
      }
      if (!isCustomCoverLocked && !customCoverPreview) {
        const chessCover = 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80';
        setSelectedCover(chessCover);
        setCustomCoverPreview(chessCover);
      }
    } else if (trimmed.includes('bookcreator.com')) {
      setCreationTool('Book Creator');
    } else if (trimmed.includes('canva.com')) {
      setCreationTool('Canva Kids');
    } else if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be') || trimmed.includes('vimeo.com')) {
      setCreationTool('Video & Film');
      setPagesCount(1);
    }

    if (trimmed.startsWith('http')) {
      try {
        const res = await fetch(`/api/fetch-link-metadata?url=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const meta = await res.json();
          if (meta.title && (!title || title.trim() === '' || title === 'Scratch Spiel')) {
            setTitle(meta.title);
          }
          if (meta.description && (!summary || summary.trim() === '')) {
            setSummary(meta.description);
          }
          if (meta.coverImage && !isCustomCoverLocked && !customCoverPreview) {
            setSelectedCover(meta.coverImage);
          }
          if (meta.authorId && (!authorId || authorId.trim() === '')) {
            setAuthorId(meta.authorId);
          } else if (!authorId || authorId.trim() === '') {
            setAuthorId(generateAnonymousAuthorId());
          }
        }
      } catch (e) {
        // quiet ignore
      }
    }
  };

  // Preview pages list
  const [previewPages, setPreviewPages] = useState<Array<{ title: string; text: string }>>([
    { title: 'Kapitel 1: Der Anfang', text: 'Hier beginnt unsere Geschichte, Dokumentation oder Anleitung...' },
  ]);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reusable processor for custom cover images (file dialog, drag & drop, paste)
  const handleProcessCoverFile = async (file: File) => {
    if (!file) return;
    setIsUploadingCover(true);
    setIsCustomCoverLocked(true);
    setCoverSuccessMessage('Vorschaubild wird verarbeitet...');

    // 1. Immediately read via FileReader for instant zero-latency UI preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setCustomCoverPreview(dataUrl);
        setSelectedCover(dataUrl);
        setPreviewPages((prev) =>
          prev.map((p) => ({
            ...p,
            imageUrl: dataUrl,
          }))
        );
      }
    };
    reader.readAsDataURL(file);

    // 2. Persist to server / Firebase storage
    try {
      const res = await uploadFileToFirebaseStorage(file, 'covers', file.name);
      if (res?.downloadUrl) {
        setCustomCoverPreview(res.downloadUrl);
        setSelectedCover(res.downloadUrl);
        setPreviewPages((prev) =>
          prev.map((p) => ({
            ...p,
            imageUrl: res.downloadUrl,
          }))
        );
      }
      setCoverSuccessMessage('Eigenes Vorschaubild erfolgreich übernommen!');
      setTimeout(() => setCoverSuccessMessage(null), 3500);
    } catch (err) {
      console.warn('Cover upload to server failed, using local preview data URL:', err);
      setCoverSuccessMessage('Eigenes Vorschaubild lokal übernommen!');
      setTimeout(() => setCoverSuccessMessage(null), 3500);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Handle Cover Upload from File Input Dialog
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessCoverFile(file);
    }
  };

  // Process Project File Upload (MP4, PDF, etc.)
  const handleProcessProjectFile = async (file: File) => {
    if (!file) return;
    setIsUploadingFile(true);
    setUploadProgress(0);
    setFormError(null);

    // If file is an image and no custom cover is set yet, also set it as cover!
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);
    if (isImage && !isCustomCoverLocked) {
      handleProcessCoverFile(file);
    }

    try {
      const result = await uploadFileToFirebaseStorage(
        file,
        'works',
        file.name,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      setUploadedFileUrl(result.downloadUrl);
      setUploadedFileName(file.name);
      setUploadedFileSize(file.size);
      setUploadedFileType(file.type || 'application/octet-stream');
      if (!title) {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanTitle);
      }
      if (file.type.includes('video') || file.name.toLowerCase().endsWith('.mp4') || file.name.toLowerCase().endsWith('.webm')) {
        setFormat('landscape');
        setCreationTool('Video & Film');
      }
    } catch (error) {
      console.error('File upload to Firebase Storage failed:', error);
      setFormError('Upload-Fehler bei Firebase Storage. Bitte versuche es erneut oder nutze einen Web-Link.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Handle Student Project File Upload from File Input Dialog
  const handleProjectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessProjectFile(file);
    }
  };

  // Global Drag & Drop handlers for the modal
  const handleModalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingModal) setIsDraggingModal(true);
  };

  const handleModalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingModal(false);
  };

  const handleModalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingModal(false);
    setIsDraggingCoverTile(false);
    setIsDraggingProjectFile(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name)) {
      handleProcessCoverFile(file);
    } else {
      handleProcessProjectFile(file);
    }
  };

  // Clipboard Paste support (Ctrl+V directly into modal)
  const handleModalPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          handleProcessCoverFile(file);
          break;
        }
      }
    }
  };

  if (!isOpen) return null;

  const handleRemoveUploadedFile = () => {
    setUploadedFileUrl(null);
    setUploadedFileName(null);
    setUploadedFileSize(null);
    setUploadedFileType(null);
    setUploadProgress(0);
  };

  const toggleStandard = (id: string) => {
    setConfirmedStandards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAllStandards = () => {
    setConfirmedStandards({
      proofread: true,
      structure: true,
      cover: true,
      media_quality: true,
      copyright: true,
      sources: true,
    });
  };

  const coreStandardsFulfilled =
    confirmedStandards['proofread'] &&
    confirmedStandards['structure'] &&
    confirmedStandards['cover'] &&
    confirmedStandards['media_quality'] &&
    confirmedStandards['copyright'] &&
    confirmedStandards['sources'];

  const handleAddPreviewPage = () => {
    if (previewPages.length >= 5) return;
    setPreviewPages([
      ...previewPages,
      { title: `Kapitel ${previewPages.length + 1}`, text: '' },
    ]);
  };

  const handleRemovePreviewPage = (index: number) => {
    setPreviewPages(previewPages.filter((_, i) => i !== index));
  };

  const handlePreviewPageChange = (index: number, field: 'title' | 'text', val: string) => {
    const updated = [...previewPages];
    updated[index][field] = val;
    setPreviewPages(updated);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError('Bitte gib einen Titel für die Schülerarbeit ein.');
      return;
    }

    const effectiveAuthorId = authorId.trim() || generateAnonymousAuthorId();
    if (!authorId.trim()) {
      setAuthorId(effectiveAuthorId);
    }

    setIsSubmitting(true);
    setFormError(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newWork: WorkItem = {
      id: `work-${Date.now()}`,
      title: title.trim(),
      rubrikId,
      authorId: effectiveAuthorId,
      schoolYear: schoolYear.trim() || '2025/2026',
      creationTool,
      summary: summary.trim() || 'Ein Projekt aus dem Pulloutprogramm DIE SCAPES der Schule Saatlen.',
      coverImage: selectedCover,
      sources: sourcesText.trim() || 'Quellen im Werk deklariert (Bücher, Webseiten und Bildnachweise).',
      audioNarration,
      pagesCount: Number(pagesCount) || 8,
      tags: tags.length > 0 ? tags : [creationTool, 'DIE SCAPES', 'Schule Saatlen'],
      date: 'Aktuell',
      createdAt: Date.now(),
      starsCount: 0,
      hasLiked: false,
      qualityPassed: true,
      qualityChecksConfirmed: ['proofread', 'structure', 'cover', 'media_quality', 'copyright', 'sources'],
      format,
      previewPages: previewPages.map((p, idx) => ({
        pageNumber: idx + 1,
        title: p.title || `Seite ${idx + 1}`,
        text: p.text || 'Inhalt der Buchseite...',
        imageUrl: selectedCover,
      })),
    };

    if (projectUrl.trim()) newWork.projectUrl = projectUrl.trim();
    if (uploadedFileUrl) newWork.fileUrl = uploadedFileUrl;
    if (uploadedFileName) newWork.fileName = uploadedFileName;
    if (uploadedFileSize) newWork.fileSize = uploadedFileSize;
    if (uploadedFileType) newWork.fileType = uploadedFileType;
    if (teacherNote.trim()) newWork.teacherNote = teacherNote.trim();

    onAddWork(newWork);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onDragOver={handleModalDragOver}
      onDragLeave={handleModalDragLeave}
      onDrop={handleModalDrop}
      onPaste={handleModalPaste}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Full-Modal Drag & Drop Overlay */}
        {isDraggingModal && (
          <div className="absolute inset-0 z-50 bg-pink-500/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center border-4 border-dashed border-white rounded-3xl animate-in fade-in duration-150 pointer-events-none">
            <Upload className="w-16 h-16 mb-3 animate-bounce" />
            <h3 className="text-2xl font-bold font-display">Vorschaubild oder Datei hier ablegen!</h3>
            <p className="text-sm max-w-md mt-2 font-medium opacity-95">
              Bilddateien (PNG, JPG, WebP) werden sofort als individuelles Vorschaubild übernommen. Dokumente oder Videos werden als Projektdatei verknüpft.
            </p>
          </div>
        )}

        {/* Top rainbow line */}
        <div className="h-1.5 rainbow-bar w-full" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center border border-pink-200">
              <BookOpen className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Neues Werk hochladen & veröffentlichen
              </h2>
              <p className="text-xs text-slate-500">
                DIE SCAPES · Schule Saatlen · Mit Firebase Storage & Auth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Privacy Note for Kids */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <strong>Datenschutz:</strong> Zum Schutz der Kinder werden keine echten Namen oder Schulklassen im Internet veröffentlicht. Jedes Kind verwendet seine geschützte Autoren-ID in der Du-Form.
            </div>
          </div>

          {/* Section 1: Title & Author ID in Du-Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
                Titel der Arbeit *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Das Geheimnis der Baumhöhle"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                  Deine Autoren-ID *
                </label>
                <button
                  type="button"
                  onClick={() => setAuthorId(generateAnonymousAuthorId())}
                  className="text-xs text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1 cursor-pointer"
                  title="Neue Idee für dich würfeln"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Idee würfeln</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                placeholder="z.B. Sternfuchs-42"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-bold text-pink-600"
              />
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                Tippe hier deine persönliche ID ein (z.B. <span className="font-mono font-bold text-slate-700">Sternfuchs-42</span>).
              </p>
            </div>
          </div>

          {/* Section 2: Creation Tool & Rubrik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
                Verwendetes Werkzeug / Format *
              </label>
              <select
                value={creationTool}
                onChange={(e) => setCreationTool(e.target.value as CreationTool)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              >
                {CREATION_TOOLS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
                Rubrik / Themenregal *
              </label>
              <select
                value={rubrikId}
                onChange={(e) => setRubrikId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              >
                {rubriken.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Firebase Storage File Upload (Direct project file) */}
          <div className="p-4 bg-gradient-to-r from-pink-50/70 via-purple-50/50 to-cyan-50/70 rounded-2xl border-2 border-dashed border-pink-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-pink-500 text-white flex items-center justify-center shadow-xs">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">
                    Datei hochladen (Firebase Storage)
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    PDF, Book Creator Datei, ePub, Video, Audio-Podcast oder ZIP
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                Firebase Cloud Storage
              </span>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={projectFileInputRef}
              onChange={handleProjectFileUpload}
              className="hidden"
              accept=".pdf,.epub,.zip,.mp3,.wav,.m4a,.mp4,.webm,.png,.jpg,.jpeg,.doc,.docx"
            />

            {/* Upload Area or Uploaded File Card */}
            {!uploadedFileUrl ? (
              <div
                onClick={() => projectFileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingProjectFile(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingProjectFile(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingProjectFile(false);
                  setIsDraggingModal(false);
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    handleProcessProjectFile(files[0]);
                  }
                }}
                className={`mt-2 p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
                  isDraggingProjectFile
                    ? 'border-pink-500 bg-pink-100/90 ring-4 ring-pink-300 scale-102'
                    : 'bg-white/80 hover:bg-white border-pink-200/80 hover:border-pink-400'
                }`}
              >
                {isUploadingFile ? (
                  <div className="py-2 space-y-2 w-full max-w-xs text-center">
                    <Loader2 className="w-6 h-6 text-pink-500 animate-spin mx-auto" />
                    <span className="text-xs font-semibold text-slate-700 block">
                      Wird in Firebase Storage hochgeladen... {uploadProgress}%
                    </span>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-pink-500 h-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <Paperclip className={`w-6 h-6 ${isDraggingProjectFile ? 'text-pink-600 animate-bounce' : 'text-pink-400 group-hover:text-pink-600'} mb-1 transition-colors`} />
                    <span className="text-xs font-bold text-slate-800">
                      {isDraggingProjectFile ? 'Projektdatei hier loslassen!' : 'Klicke hier oder ziehe deine Projektdatei hierher (Drag & Drop)'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Unterstützt PDF, Book Creator EPUB, Audio, Video, Bilder bis 50 MB
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-2 p-3 bg-white rounded-xl border border-emerald-300 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {uploadedFileName}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Hochgeladen
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {uploadedFileSize ? formatFileSize(uploadedFileSize) : 'Firebase Storage'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={uploadedFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-xs text-pink-600 hover:text-pink-800 bg-pink-50 rounded-lg"
                    title="Herunterladen / Öffnen"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveUploadedFile}
                    className="p-1.5 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Datei entfernen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Optional Web Link */}
            <div className="mt-3 pt-3 border-t border-pink-200/50">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 font-display flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-pink-500" />
                  <span>Oder Web-Link zum Projekt (Scratch-Spiel, Schach, Book Creator, YouTube, Canva etc.)</span>
                </span>
                <span className="text-[10px] text-pink-600 font-semibold">
                  Spiele & Web-Apps
                </span>
              </label>
              <input
                type="text"
                value={projectUrl}
                onChange={(e) => handleProjectUrlChange(e.target.value)}
                placeholder="https://... (z.B. https://scratch.mit.edu/projects/..., Schach auf Lichess oder Book Creator)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-mono"
              />
              {creationTool === 'Scratch & Interaktiv' && (
                <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium">
                  <span>Interaktives Spiel / Scratch erkannt: Wird für Kinder direkt spielbar eingebettet!</span>
                </div>
              )}
              <p className="text-[11px] text-slate-500 mt-1">
                Tipp für Videos: Du kannst MP4-Dateien bis 30 MB direkt oben hochladen oder einfach den Freigabelink aus deinem Microsoft 365 Schul-OneDrive / YouTube einfügen.
              </p>
            </div>
          </div>

          {/* Section 4: Sources Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                Quellenangaben *
              </label>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Pflicht für DIE SCAPES
              </span>
            </div>
            <textarea
              rows={2}
              value={sourcesText}
              onChange={(e) => setSourcesText(e.target.value)}
              placeholder="Welche Sachbücher, Webseiten, Lexika oder Bildquellen wurden verwendet? (z.B. 'WAS IST WAS Band 12', nasa.gov, eigene Fotos)"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all resize-none font-body"
            />
          </div>

          {/* Section 5: Cover Selection: Presets or Upload / Drag & Drop */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                Titelbild / Vorschaubild (Cover) auswählen oder hochladen
              </label>
              <div className="flex items-center gap-2">
                {coverSuccessMessage && (
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 animate-in fade-in">
                    ✓ {coverSuccessMessage}
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

            <p className="text-[11px] text-slate-500 mb-2">
              Wähle eine Vorlage oder ziehe dein eigenes Vorschaubild direkt hierher (Drag & Drop oder Datei auswählen):
            </p>

            <div className="grid grid-cols-4 gap-3">
              {PRESET_COVERS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => {
                    setSelectedCover(preset.url);
                    setCustomCoverPreview(null);
                    setIsCustomCoverLocked(false);
                  }}
                  className={`relative aspect-3/4 rounded-xl overflow-hidden border-2 transition-all p-1 bg-slate-50 cursor-pointer ${
                    selectedCover === preset.url && !customCoverPreview
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

              {/* Upload & Drag & Drop Tile */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingCoverTile(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingCoverTile(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingCoverTile(false);
                  setIsDraggingModal(false);
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    handleProcessCoverFile(files[0]);
                  }
                }}
                className={`relative aspect-3/4 rounded-xl border-2 border-dashed transition-all p-1.5 flex flex-col items-center justify-center text-center cursor-pointer ${
                  isDraggingCoverTile
                    ? 'border-pink-500 bg-pink-100 ring-4 ring-pink-300 scale-105 shadow-md'
                    : customCoverPreview
                    ? 'border-pink-500 bg-pink-50/50 shadow-xs'
                    : 'border-slate-300 hover:border-pink-400 bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCoverUpload}
                  accept="image/*"
                  className="hidden"
                />
                {customCoverPreview ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={customCoverPreview}
                      alt="Eigener Upload"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomCoverPreview(null);
                        setSelectedCover(PRESET_COVERS[0].url);
                        setIsCustomCoverLocked(false);
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-xs opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                      title="Eigenes Bild entfernen"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/85 text-emerald-300 text-[8px] font-bold py-0.5 px-1 truncate text-center rounded-b-lg">
                      ✓ Eigenes Bild aktiv
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className={`w-5 h-5 ${isDraggingCoverTile ? 'text-pink-600 animate-bounce' : 'text-slate-400'} mb-1`} />
                    <span className="text-[10px] font-bold text-slate-700 leading-tight">
                      {isDraggingCoverTile ? 'Hier loslassen!' : 'Eigenes Bild / Drag & Drop'}
                    </span>
                    <span className="text-[8px] text-pink-600 font-bold mt-1">
                      PNG, JPG, WebP
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick action to revert to Scratch thumbnail if detected */}
            {projectUrl.includes('scratch.mit.edu/projects/') && (
              <div className="mt-2.5 flex items-center justify-between text-xs p-2 bg-slate-100/80 rounded-xl border border-slate-200">
                <span className="text-slate-600 text-[11px]">
                  Scratch-Projekt erkannt
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const match = projectUrl.match(/projects\/(\d+)/i);
                    if (match) {
                      const scratchThumb = `https://uploads.scratch.mit.edu/get_image/project/${match[1]}_480x360.png`;
                      setSelectedCover(scratchThumb);
                      setCustomCoverPreview(scratchThumb);
                      setIsCustomCoverLocked(false);
                    }
                  }}
                  className="text-[11px] font-bold text-pink-600 hover:text-pink-700 hover:underline cursor-pointer"
                >
                  Scratch-Original-Titelbild laden
                </button>
              </div>
            )}
          </div>

          {/* Section 6: Lehrperson-Freigabe & Format-Auswahl */}
          <div className="space-y-4">
            {/* Teacher Verification Status (No checklist needed since teacher already approved) */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider font-display">
                    Durch Lehrperson geprüft & freigegeben
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Geprüft
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                  Dieses Werk wurde von der zuständigen Lehrperson vorab gesichtet. Qualitätsstandards, Urheberrechte und Quellen sind erfüllt.
                </p>
              </div>
            </div>

            {/* Format / Aspect Ratio Selector so preview doesn't cut off */}
            <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl space-y-2.5">
              <label className="text-xs font-bold text-purple-950 uppercase tracking-wider font-display block">
                Format an das tatsächliche Werk anpassen (Damit nichts abgeschnitten wird)
              </label>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Wähle die passende Ausrichtung für das Titelbild und die Vorschau:
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
          </div>

          {/* Section 7: Audio flag & Page count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-pink-600" />
                <span className="text-xs font-bold text-slate-800">
                  Audio-Aufnahme enthalten?
                </span>
              </div>
              <input
                type="checkbox"
                checked={audioNarration}
                onChange={(e) => setAudioNarration(e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded-md focus:ring-pink-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-display">
                Seitenanzahl
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={pagesCount}
                onChange={(e) => setPagesCount(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>

          {/* Section 8: Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
              Kurzbeschreibung / Worum geht es?
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Kurze Zusammenfassung für die Schulbibliothek..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all resize-none"
            />
          </div>

          {/* Section 9: Preview Pages Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                Vorschauseiten für den Lesemodus ({previewPages.length})
              </label>
              {previewPages.length < 5 && (
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
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 font-display">
                      Seite {idx + 1}
                    </span>
                    {previewPages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePreviewPage(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => handlePreviewPageChange(idx, 'title', e.target.value)}
                    placeholder="Kapiteltitel / Überschrift"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <textarea
                    rows={2}
                    value={page.text}
                    onChange={(e) => handlePreviewPageChange(idx, 'text', e.target.value)}
                    placeholder="Text der Kinder auf dieser Doppelseite..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Error feedback if fields are missing */}
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingFile}
              className="px-6 py-2.5 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 active:scale-95 disabled:opacity-50 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Wird veröffentlicht...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Werk im Scapestudio veröffentlichen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

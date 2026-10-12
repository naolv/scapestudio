export type MediaType = 'book' | 'video' | 'audio' | 'mixed' | 'document' | 'interactive';

export type RainbowColor = 'pink' | 'orange' | 'amber' | 'emerald' | 'cyan' | 'purple' | 'rose';

export type CreationTool = 
  | 'Book Creator'
  | 'Canva Kids'
  | 'Schreibwerkzeug'
  | 'Video & Film'
  | 'Audio & Podcast'
  | 'Scratch & Interaktiv'
  | 'Gezeichnetes Forscherheft'
  | 'Anderes Werkzeug';

export interface Rubrik {
  id: string;
  title: string;
  description: string;
  color: RainbowColor;
  iconName: string;
  mediaType: MediaType;
  isCustom?: boolean;
}

export interface PreviewPage {
  pageNumber: number;
  title: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  illustrationDescription?: string;
}

export interface FreeImageSource {
  name: string;
  domain: string;
  url: string;
  bestFor: string;
}

export interface QualityStandardCheck {
  id: string;
  number: number;
  label: string;
  emoji?: string;
  iconName?: string;
  shortTag: string;
  description: string;
  questions: string[];
  tips: string[];
  kidTip: string;
  hasFreeImagesTable?: boolean;
  citationGuide?: {
    example: string;
    explanation: string;
  };
}

export interface WorkItem {
  id: string;
  title: string;
  rubrikId: string;
  authorId: string; // Datenschutzkonforme Autoren-ID (z.B. "Sternfuchs-42")
  schoolYear: string;
  creationTool: CreationTool;
  summary: string;
  coverImage: string;
  projectUrl?: string; // Beliebiger Link: Book Creator, Video, Canva, Präsentation etc.
  fileUrl?: string; // Direkter Dateidownload oder Speicherlink aus Firebase Storage
  fileName?: string; // Name der hochgeladenen Datei (z.B. MeinBuch.pdf oder Projekt.epub)
  fileSize?: number; // Grösse der hochgeladenen Datei in Bytes
  fileType?: string; // Dateityp / MIME (z.B. application/pdf, audio/mpeg, video/mp4)
  sources?: string; // Quellenangaben (Sachbücher, Webseiten, Bildrechte)
  audioNarration?: boolean;
  pagesCount: number;
  tags: string[];
  date: string;
  createdAt?: number; // Millisekunden-Timestamp für exakte Sortierung nach Neueste
  starsCount: number;
  hasLiked?: boolean;
  teacherNote?: string;
  qualityPassed: boolean; // Qualitätskriterien erfüllt
  qualityChecksConfirmed?: string[]; // IDs der abgehakten Kriterien
  format?: 'auto' | 'landscape' | 'portrait' | 'square'; // Format / Seitenverhältnis des Werks
  previewPages: PreviewPage[];
}


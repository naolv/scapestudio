import React, { useState } from 'react';
import { X, FolderPlus, Sparkles, BookOpen, Video, Headphones, Palette, Star, Compass, FileText } from 'lucide-react';
import { Rubrik, RainbowColor, MediaType } from '../types';
import { getRainbowClasses } from '../utils/theme';

interface NewRubrikModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRubrik: (rubrik: Rubrik) => void;
}

const AVAILABLE_COLORS: { name: RainbowColor; label: string; bgClass: string }[] = [
  { name: 'pink', label: 'Zartrosa', bgClass: 'bg-pink-400' },
  { name: 'orange', label: 'Sonnenorange', bgClass: 'bg-orange-400' },
  { name: 'amber', label: 'Goldgelb', bgClass: 'bg-amber-400' },
  { name: 'emerald', label: 'Smaragdgrün', bgClass: 'bg-emerald-400' },
  { name: 'cyan', label: 'Himmelblau', bgClass: 'bg-cyan-400' },
  { name: 'purple', label: 'Lila Lavendel', bgClass: 'bg-purple-400' },
  { name: 'rose', label: 'Himbeerrot', bgClass: 'bg-rose-400' },
];

const AVAILABLE_ICONS = [
  { name: 'BookOpen', label: 'Buch', icon: BookOpen },
  { name: 'Video', label: 'Film / Video', icon: Video },
  { name: 'Headphones', label: 'Hörspiel / Audio', icon: Headphones },
  { name: 'Palette', label: 'Kunst & Malen', icon: Palette },
  { name: 'Sparkles', label: 'Forschung / Magie', icon: Sparkles },
  { name: 'Star', label: 'Auszeichnungen', icon: Star },
  { name: 'Compass', label: 'Entdeckungen', icon: Compass },
  { name: 'FileText', label: 'Dokumente', icon: FileText },
];

export const NewRubrikModal: React.FC<NewRubrikModalProps> = ({
  isOpen,
  onClose,
  onAddRubrik,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<RainbowColor>('purple');
  const [iconName, setIconName] = useState('Video');
  const [mediaType, setMediaType] = useState<MediaType>('video');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const id = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-') + `-${Date.now().toString().slice(-4)}`;

    const newRubrik: Rubrik = {
      id,
      title: title.trim(),
      description: description.trim() || `Werke der Kategorie ${title}`,
      color,
      iconName,
      mediaType,
      isCustom: true,
    };

    onAddRubrik(newRubrik);
    setTitle('');
    setDescription('');
    onClose();
  };

  const previewColorTheme = getRainbowClasses(color);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Rainbow Accent Strip */}
        <div className="h-1.5 rainbow-bar w-full" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center border border-amber-200">
              <FolderPlus className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Neue Rubrik eröffnen
              </h2>
              <p className="text-xs text-slate-500">
                z.B. für Videos, Hörspiele, Kunst oder Theater
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Rubrik Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
              Name der neuen Rubrik *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Animationsfilme & Videos oder Kunst & Werken"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
              Kurze Erklärung für die Schüler*innen
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z.B. Selbstgedrehte Filme, Animationen und Buchtrailer"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
            />
          </div>

          {/* Media Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
              Medientyp
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'video' as MediaType, label: 'Videos' },
                { type: 'book' as MediaType, label: 'Bücher' },
                { type: 'audio' as MediaType, label: 'Hörspiele' },
                { type: 'mixed' as MediaType, label: 'Gemischt' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setMediaType(item.type)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    mediaType === item.type
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rainbow Color Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-display">
              Regenbogen-Farbe
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  className={`w-7 h-7 rounded-full ${c.bgClass} transition-transform cursor-pointer relative ${
                    color === c.name ? 'scale-125 ring-2 ring-offset-2 ring-slate-900' : 'hover:scale-110'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-display">
              Symbol auswählen
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const Icon = item.icon;
                const isSelected = iconName === item.name;
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => setIconName(item.name)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? `${previewColorTheme.bg} ${previewColorTheme.border} ${previewColorTheme.text} ring-2 ring-pink-500/20`
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-semibold truncate max-w-full">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Rubrik eröffnen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

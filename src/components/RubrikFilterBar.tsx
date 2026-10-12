import React from 'react';
import { Plus, SlidersHorizontal, FolderPlus } from 'lucide-react';
import { Rubrik, RainbowColor } from '../types';
import { getRainbowClasses, getIconComponent } from '../utils/theme';

interface RubrikFilterBarProps {
  rubriken: Rubrik[];
  activeRubrikId: string | 'all';
  onSelectRubrik: (id: string | 'all') => void;
  worksCountByRubrik: Record<string, number>;
  totalWorksCount: number;
  sortBy: 'newest' | 'popular' | 'title' | 'tool';
  onSortChange: (sort: 'newest' | 'popular' | 'title' | 'tool') => void;
  onOpenNewRubrikModal: () => void;
  isTeacher?: boolean;
}

export const RubrikFilterBar: React.FC<RubrikFilterBarProps> = ({
  rubriken,
  activeRubrikId,
  onSelectRubrik,
  worksCountByRubrik,
  totalWorksCount,
  sortBy,
  onSortChange,
  onOpenNewRubrikModal,
  isTeacher,
}) => {
  return (
    <div className="space-y-4">
      {/* Category Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display">
            Bibliotheks-Katalog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Filtere alle Werke nach Genre oder durchstöbere das gesamte Sortiment
          </p>
        </div>

        {/* Sort & Manage Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Sortieren:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="newest">Neueste zuerst</option>
              <option value="popular">Beliebteste</option>
              <option value="title">Titel A-Z</option>
              <option value="tool">Nach Werkzeug / Format</option>
            </select>
          </div>

          {isTeacher && (
            <button
              onClick={onOpenNewRubrikModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
              <span>Rubrik hinzufügen</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Segmented Akten-Reiter Tabs (kompakt) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
        {/* All Folders Tab */}
        <button
          onClick={() => onSelectRubrik('all')}
          className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 border ${
            activeRubrikId === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
              : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
          }`}
          title="Gesamten Bestand aller Akten anzeigen"
        >
          <span>Alle Akten</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
              activeRubrikId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {totalWorksCount}
          </span>
        </button>

        {/* Dynamic Rubrik Tabs (Akten-Reiter / Fächerbuttons) */}
        {rubriken.map((rubrik) => {
          const isSelected = activeRubrikId === rubrik.id;
          const count = worksCountByRubrik[rubrik.id] || 0;
          const theme = getRainbowClasses(rubrik.color);
          const Icon = getIconComponent(rubrik.iconName);

          return (
            <button
              key={rubrik.id}
              onClick={() => onSelectRubrik(rubrik.id)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 border ${
                isSelected
                  ? `${theme.activeBg} border-transparent shadow-xs font-bold`
                  : `bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 ${theme.bg}`
              }`}
              title={`Akte: ${rubrik.title} (${count} ${count === 1 ? 'Dokument' : 'Dokumente'})`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span>{rubrik.title}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100/90 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};


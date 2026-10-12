import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Info,
  Image as ImageIcon,
} from 'lucide-react';
import { QUALITY_STANDARDS, FREE_IMAGE_SOURCES, generateAnonymousAuthorId } from '../data/qualityStandards';

export const QualityStandardsView: React.FC = () => {
  const [currentId, setCurrentId] = useState(() => generateAnonymousAuthorId());
  const [copied, setCopied] = useState(false);

  // Expanded criteria IDs (initially criteria 1 and 5 open, or user can toggle)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    proofread: true,
    copyright: true,
  });

  // Interactive self-check ticks for kids
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    QUALITY_STANDARDS.forEach((q) => (all[q.id] = true));
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  const toggleCheck = (itemId: string) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleRandomize = () => {
    setCurrentId(generateAnonymousAuthorId());
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="qualitaetsstandards" className="py-6 sm:py-8 space-y-8">
      {/* Header in Du-Form */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-display mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Deine Autoren-ID & Qualitätsstandard</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Qualitätsstandard für &ldquo;DIE SCAPES&rdquo;
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl font-body leading-relaxed">
          Klicke auf jeden der sechs Punkte, um praktische Tipps und deinen persönlichen Selbst-Check für die 4.–6. Klasse aufzuklappen.
        </p>
      </div>

      {/* Grid: Left 6 Interactive Standards, Right Interactive ID Inspiration Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Interactive Quality Standards List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Die sechs Kriterien für dein Werk</span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAll}
                className="text-xs font-semibold text-pink-600 hover:text-pink-700 px-2.5 py-1 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors cursor-pointer"
              >
                Alle Tipps aufklappen
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Zuklappen
              </button>
            </div>
          </div>

          <div className="space-y-3.5">
            {QUALITY_STANDARDS.map((standard) => {
              const isExpanded = !!expandedIds[standard.id];

              return (
                <div
                  key={standard.id}
                  className={`bg-white rounded-2xl border transition-all shadow-2xs overflow-hidden ${
                    isExpanded ? 'border-pink-300 ring-2 ring-pink-500/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Clickable Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(standard.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 border border-pink-200 flex items-center justify-center font-bold text-sm shrink-0 font-display shadow-2xs">
                        {standard.number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900 font-display flex items-center gap-1.5">
                            <span>{standard.label}</span>
                          </h4>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {standard.shortTag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {standard.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-center">
                      <span className="hidden sm:inline-block text-[11px] font-semibold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg">
                        {isExpanded ? 'Tipps zuklappen' : 'Tipps & Check ansehen'}
                      </span>
                      <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content with Tips, Checkpoints & Free Resources */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-[#FCFBF9] space-y-4 text-xs animate-in fade-in duration-150">
                      {/* Checkpoint questions with clickable checkboxes for children */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5 font-bold font-display text-slate-800 text-[11px] uppercase tracking-wider">
                          <HelpCircle className="w-3.5 h-3.5 text-pink-500" />
                          <span>Fragen an dich (Selbst-Check):</span>
                        </div>
                        <div className="space-y-2 pl-1">
                          {standard.questions.map((question, qIdx) => {
                            const checkKey = `${standard.id}-q-${qIdx}`;
                            const isChecked = !!checkedItems[checkKey];

                            return (
                              <label
                                key={qIdx}
                                onClick={() => toggleCheck(checkKey)}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                                  isChecked
                                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-pink-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                                />
                                <span className="leading-relaxed flex-1">{question}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Kid Tip Box */}
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-950">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-medium">{standard.kidTip}</span>
                      </div>

                      {/* General tips bullet points */}
                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                        <span className="font-bold text-slate-900 font-display block text-[11px] uppercase tracking-wider">
                          Konkrete Hilfen & Praxistipps:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed">
                          {standard.tips.map((tip, tIdx) => (
                            <li key={tIdx}>{tip}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Extra: Free Image Sources Table for Criterion 5 */}
                      {standard.hasFreeImagesTable && (
                        <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-pink-600" />
                            <h5 className="font-bold font-display text-slate-900 text-sm">
                              Wo finde ich freie Bilder für mein Projekt?
                            </h5>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Damit du keine fremden Rechte verletzt, schau am besten auf diesen kinderfreundlichen und kostenlosen Bildersammlungen nach:
                          </p>

                          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold font-display text-[11px] uppercase">
                                  <th className="py-2.5 px-3.5">Webseite / Plattform</th>
                                  <th className="py-2.5 px-3.5">Passt besonders gut für...</th>
                                  <th className="py-2.5 px-3">Link</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {FREE_IMAGE_SOURCES.map((source) => (
                                  <tr key={source.name} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="py-2.5 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                                      {source.name}
                                      <span className="block text-[10px] text-slate-400 font-mono font-normal">
                                        {source.domain}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3.5 text-slate-600 leading-relaxed">
                                      {source.bestFor}
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 hover:text-pink-700 underline"
                                      >
                                        <span>Öffnen</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Citation Guide & Example */}
                      {standard.citationGuide && (
                        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-950">
                          <div className="flex items-center gap-1.5 font-bold font-display text-emerald-800">
                            <Info className="w-3.5 h-3.5" />
                            <span>So gibst du die Quelle im Werk an:</span>
                          </div>
                          <p className="text-[11px] text-emerald-900 leading-relaxed">
                            {standard.citationGuide.explanation}
                          </p>
                          <div className="p-2 bg-white border border-emerald-300/80 rounded-lg font-mono text-emerald-800 text-[11px] font-bold select-all">
                            {standard.citationGuide.example}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Autoren-ID Inspiration Generator in Du-Form (1 Col) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 kawaii-card-shadow p-6 space-y-5 sticky top-20">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-pink-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Muster: [Wort]-[Zahl]
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Finde deine persönliche Autoren-ID
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Damit dein echter Name und deine Klasse geschützt bleiben, wählst du eine geheime Autoren-ID für deine Werke. Sie besteht immer aus einem Wort und einer Zahl (z.B. <strong className="text-pink-600 font-mono">Sternfuchs-42</strong>).
            </p>
          </div>

          {/* Live Preview Display of generated ID */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-display block">
              Deine ID-Idee:
            </span>
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-base font-bold text-slate-900 shadow-2xs">
              <span className="text-pink-600">{currentId}</span>
              <button
                onClick={handleCopyId}
                className="text-xs text-slate-500 hover:text-pink-600 p-1 cursor-pointer transition-colors"
                title="ID kopieren"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={handleRandomize}
              className="w-full py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-pink-500" />
              <span>Neue Idee für dich würfeln</span>
            </button>
          </div>

          {/* Du-Form Instructions for Kids */}
          <div className="p-4 bg-pink-50/70 border border-pink-200 rounded-2xl text-xs text-pink-950 space-y-2">
            <div className="flex items-center gap-1.5 font-bold font-display text-pink-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>So machst du mit:</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-slate-700 leading-relaxed text-[11px]">
              <li>
                <strong>Idee würfeln:</strong> Klicke auf ‹Neue Idee für dich würfeln›, bis dir eine Kombination gefällt – oder überlege dir selbst dein Lieblingswort und deine Zahl.
              </li>
              <li>
                <strong>Lieblings-ID merken:</strong> Merk dir deine ID gut (z.B. <span className="font-mono font-bold text-pink-600">{currentId}</span>).
              </li>
              <li>
                <strong>Der Lehrperson mitteilen:</strong> Wenn dein Werk fertig ist, sagst du deiner Lehrperson deine gewählte ID. Sie lädt dein Buch, Video oder Spiel damit im Scapestudio hoch!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

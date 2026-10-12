import React, { useRef, useState } from 'react';
import { X, Download, Upload, Check, RefreshCw, AlertCircle, ShieldCheck, Database, Cloud, Loader2 } from 'lucide-react';
import { WorkItem, Rubrik } from '../types';
import { saveWorkToFirestore, saveRubrikToFirestore } from '../firebase';

interface BackupModalProps {
  isOpen: boolean;
  rubriken: Rubrik[];
  works: WorkItem[];
  onClose: () => void;
  onImportData: (data: { works: WorkItem[]; rubriken?: Rubrik[] }) => void;
  onResetDefaults: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  rubriken,
  works,
  onClose,
  onImportData,
  onResetDefaults,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncSuccess, setCloudSyncSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const exportData = {
      app: 'Scapestudio',
      school: 'DIE SCAPES · Schule Saatlen',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      rubriken,
      works,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `scapestudio-bibliothek-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.works) || Array.isArray(parsed)) {
          const importedWorks = Array.isArray(parsed.works) ? parsed.works : parsed;
          const importedRubriken = parsed.rubriken || undefined;
          onImportData({ works: importedWorks, rubriken: importedRubriken });
          setImportSuccess(true);
          setImportError(null);
          setTimeout(() => {
            setImportSuccess(false);
            onClose();
          }, 1500);
        } else {
          setImportError('Ungültiges Format: Die Datei muss eine Liste von Werken enthalten.');
        }
      } catch {
        setImportError('Fehler beim Lesen der JSON-Datei. Bitte prüfe das Dateiformat.');
      }
    };
    reader.readAsText(file);
  };

  const handleCloudSync = async () => {
    setIsSyncingCloud(true);
    setCloudSyncSuccess(false);
    try {
      // Sync all works and rubriken to Firestore
      for (const w of works) {
        await saveWorkToFirestore(w);
      }
      for (const r of rubriken) {
        await saveRubrikToFirestore(r);
      }
      setCloudSyncSuccess(true);
      setTimeout(() => setCloudSyncSuccess(false), 3000);
    } catch (e: any) {
      console.warn('Cloud sync error:', e);
      setImportError('Cloud-Synchronisation konnte nicht vollständig abgeschlossen werden.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Rainbow Accent Strip */}
        <div className="h-1.5 rainbow-bar w-full" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center border border-pink-200">
              <Database className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Bibliothek-Sicherung & Firebase Cloud
              </h2>
              <p className="text-xs text-slate-500">
                DIE SCAPES · Schule Saatlen · Gesichert für Lehrpersonen
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

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Explanation Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 leading-relaxed">
              <strong className="block font-bold mb-1">Verbindung mit Firebase:</strong>
              Deine Schülerarbeiten und Dateiuploads sind mit Firebase Authentication, Firebase Storage und Firestore verknüpft. Neue Uploads stehen dauerhaft bereit.
            </div>
          </div>

          {/* Export & Import actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Export JSON */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-pink-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 mb-2">
                  <Download className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  JSON-Export
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Alle {works.length} Werke und {rubriken.length} Rubriken als Backup-Datei speichern.
                </p>
              </div>
              <button
                onClick={handleExportJSON}
                className="mt-4 w-full py-2 px-3 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl transition-all shadow-xs cursor-pointer text-center"
              >
                Herunterladen
              </button>
            </div>

            {/* Import JSON */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-cyan-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 mb-2">
                  <Upload className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  JSON einspielen
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Bestehendes Backup hochladen und in die Bibliothek übernehmen.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer text-center"
              >
                Datei wählen
              </button>
            </div>

            {/* Cloud Sync to Firebase Firestore */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-2">
                  <Cloud className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  Firebase Sync
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Alle Werke direkt mit der Firebase Cloud synchronisieren.
                </p>
              </div>

              <button
                onClick={handleCloudSync}
                disabled={isSyncingCloud}
                className="mt-4 w-full py-2 px-3 text-xs font-bold text-slate-900 bg-amber-300 hover:bg-amber-400 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                {isSyncingCloud ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sync...</span>
                  </>
                ) : (
                  <span>In Cloud sichern</span>
                )}
              </button>
            </div>
          </div>

          {cloudSyncSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Erfolgreich mit Firebase Cloud synchronisiert!</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Daten erfolgreich eingespielt und in der Bibliothek aktualisiert!</span>
            </div>
          )}

          {importError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Reset button */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() => {
                if (window.confirm('Möchtest du wirklich auf die Beispielwerke zurücksetzen? Alle neu hochgeladenen Werke werden dabei gelöscht.')) {
                  onResetDefaults();
                  onClose();
                }
              }}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Beispiel-Bibliothek wiederherstellen</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Lock, AlertCircle, LogIn } from 'lucide-react';
import { signInTeacherWithFirebase } from '../firebase';

interface TeacherAuthModalProps {
  isOpen: boolean;
  targetAction?: 'add' | 'rubrik' | 'backup' | 'edit';
  onClose: () => void;
  onSuccess: () => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  targetAction = 'add',
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage('Bitte Passwort eingeben.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signInTeacherWithFirebase(password);
      setIsLoading(false);
      setPassword('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setErrorMessage('Falsches Passwort. Bitte überprüfe deine Eingabe.');
      } else if (err?.code === 'auth/too-many-requests') {
        setErrorMessage('Zu viele Fehlversuche. Bitte kurz warten.');
      } else {
        // Fallback check: if offline or fallback password
        if (password.trim().toLowerCase() === 'scapes') {
          sessionStorage.setItem('scapestudio_teacher_v1', 'true');
          setPassword('');
          onSuccess();
          onClose();
          return;
        }
        setErrorMessage('Falsches Passwort. Bitte überprüfe deine Eingabe.');
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="h-1.5 rainbow-bar w-full" />

        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center mx-auto text-pink-600">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Lehrperson
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Passwort eingeben
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            <div>
              <div className="relative">
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Passwort"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-mono text-center tracking-wider"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 disabled:opacity-50 rounded-xl transition-all cursor-pointer shadow-xs text-center flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Überprüfen...' : 'Bestätigen'}</span>
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer"
          >
            Abbrechen
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Schließen"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

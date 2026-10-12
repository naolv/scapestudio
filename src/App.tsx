import React, { useState, useEffect, useMemo } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { RubrikFilterBar } from './components/RubrikFilterBar';
import { RubrikenHub } from './components/RubrikenHub';
import { QualityStandardsView } from './components/QualityStandardsView';
import { WorkCard } from './components/WorkCard';
import { BookPreviewModal } from './components/BookPreviewModal';
import { AddWorkModal } from './components/AddWorkModal';
import { NewRubrikModal } from './components/NewRubrikModal';
import { BackupModal } from './components/BackupModal';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { EditWorkModal } from './components/EditWorkModal';
import { INITIAL_RUBRIKEN, INITIAL_WORKS } from './data/initialData';
import { Rubrik, WorkItem } from './types';
import { KawaiiMascot } from './components/KawaiiIcons';
import { SearchX, Plus, ShieldCheck, Layers, BookOpen, Lock, Unlock } from 'lucide-react';
import {
  auth,
  onAuthStateChanged,
  type User,
  signOutTeacher,
  fetchWorksFromFirestore,
  saveWorkToFirestore,
  fetchRubrikenFromFirestore,
  saveRubrikToFirestore,
} from './firebase';

const STORAGE_KEY_WORKS = 'scapestudio_works_v3';
const STORAGE_KEY_RUBRIKEN = 'scapestudio_rubriken_v3';
const STORAGE_KEY_TEACHER = 'scapestudio_teacher_v1';

export default function App() {
  // Navigation View Tab: 'katalog' | 'rubriken' | 'qualitaet'
  const [currentTab, setCurrentTab] = useState<ActiveTab>('katalog');

  const handleSelectTab = (tab: ActiveTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Teacher Authentication state: synced with Firebase Auth
  const [isTeacher, setIsTeacher] = useState<boolean>(() => {
    try {
      return auth.currentUser !== null || sessionStorage.getItem(STORAGE_KEY_TEACHER) === 'true';
    } catch {
      return false;
    }
  });

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setIsTeacher(true);
        try {
          sessionStorage.setItem(STORAGE_KEY_TEACHER, 'true');
        } catch {}
      } else {
        // If not logged in to Firebase, ensure isTeacher is false
        setIsTeacher(false);
        try {
          sessionStorage.removeItem(STORAGE_KEY_TEACHER);
        } catch {}
      }
    });
    return () => unsubscribe();
  }, []);

  const [isTeacherAuthOpen, setIsTeacherAuthOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [workToEdit, setWorkToEdit] = useState<WorkItem | null>(null);
  const [pendingActionAfterAuth, setPendingActionAfterAuth] = useState<'add' | 'rubrik' | 'backup' | 'edit' | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // List of AI-generated sample IDs to exclude completely
  const SAMPLE_IDS = new Set(['work-1', 'work-2', 'work-3', 'work-4', 'work-5']);

  // Global sanitizer for student work items (handles iframe pastes, scratch urls, covers)
  const sanitizeWorkItem = (w: WorkItem): WorkItem => {
    let projectUrl = w.projectUrl;
    if (projectUrl && projectUrl.includes('<iframe')) {
      const match = projectUrl.match(/src=["']([^"']+)["']/i);
      if (match) {
        projectUrl = match[1];
      }
    }
    if (projectUrl && projectUrl.includes('scratch.mit.edu/projects/')) {
      const sMatch = projectUrl.match(/projects\/(\d+)/i);
      if (sMatch) {
        const pId = sMatch[1];
        const hasCustomCover =
          w.coverImage &&
          !w.coverImage.includes('uploads.scratch.mit.edu') &&
          w.coverImage.trim().length > 5;
        return {
          ...w,
          projectUrl: `https://scratch.mit.edu/projects/${pId}`,
          rubrikId: 'games',
          coverImage: hasCustomCover
            ? w.coverImage
            : `https://uploads.scratch.mit.edu/get_image/project/${pId}_480x360.png`,
        };
      }
    }
    return { ...w, projectUrl };
  };

  // Load initial works from localStorage or fallback, ensuring INITIAL_WORKS are always merged
  const [works, setWorks] = useState<WorkItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKS);
      if (saved) {
        const parsed: WorkItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, WorkItem>();
          // Defaults first
          INITIAL_WORKS.forEach((w) => {
            if (!SAMPLE_IDS.has(w.id)) map.set(w.id, sanitizeWorkItem(w));
          });
          // User's saved works overlay, strictly omitting sample works
          parsed.forEach((w) => {
            if (SAMPLE_IDS.has(w.id)) return;
            if (
              w.id === 'work-scapefolio' &&
              (w.title === 'Vorlage Scapefolio' ||
                !w.title.includes('Kurbeltheater') ||
                w.authorId !== 'Turboschnecke-00' ||
                w.summary.includes('Rollbühne') ||
                w.summary.includes('Einblick in die Entstehung'))
            ) {
              map.set(w.id, INITIAL_WORKS.find((x) => x.id === 'work-scapefolio') || w);
            } else {
              map.set(w.id, sanitizeWorkItem(w));
            }
          });
          return Array.from(map.values());
        }
      }
    } catch (e) {
      console.error('Failed to load works from localStorage', e);
    }
    return INITIAL_WORKS.filter((w) => !SAMPLE_IDS.has(w.id)).map(sanitizeWorkItem);
  });

  // Load initial rubriken from localStorage or fallback
  const [rubriken, setRubriken] = useState<Rubrik[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RUBRIKEN);
      if (saved) {
        const parsed: Rubrik[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, Rubrik>();
          parsed.forEach((r) => map.set(r.id, r));
          INITIAL_RUBRIKEN.forEach((r) => map.set(r.id, r));
          return Array.from(map.values());
        }
      }
    } catch (e) {
      console.error('Failed to load rubriken from localStorage', e);
    }
    return INITIAL_RUBRIKEN;
  });

  // Fetch persistent data from Firestore and server API on mount
  useEffect(() => {
    async function syncFromCloud() {
      // 1. Fetch from Server Storage /api/works
      try {
        const apiRes = await fetch('/api/works');
        if (apiRes.ok) {
          const apiWorks = await apiRes.json();
          if (Array.isArray(apiWorks) && apiWorks.length > 0) {
            setWorks((prev) => {
              const map = new Map<string, WorkItem>();
              prev.forEach((w) => {
                if (!SAMPLE_IDS.has(w.id)) map.set(w.id, w);
              });
              apiWorks.forEach((w: WorkItem) => {
                if (SAMPLE_IDS.has(w.id)) return;
                if (
                  w.id === 'work-scapefolio' &&
                  (w.title === 'Vorlage Scapefolio' ||
                    !w.title.includes('Kurbeltheater') ||
                    w.authorId !== 'Turboschnecke-00' ||
                    w.summary.includes('Rollbühne') ||
                    w.summary.includes('Einblick in die Entstehung'))
                ) {
                  const defaultKurbel = INITIAL_WORKS.find((x) => x.id === 'work-scapefolio') || INITIAL_WORKS[1];
                  map.set(w.id, defaultKurbel);
                } else {
                  map.set(w.id, sanitizeWorkItem(w));
                }
              });
              if (!map.has('work-scapefolio')) {
                const defaultKurbel = INITIAL_WORKS.find((x) => x.id === 'work-scapefolio') || INITIAL_WORKS[1];
                map.set('work-scapefolio', defaultKurbel);
              }
              return Array.from(map.values());
            });
          }
        }
      } catch (apiErr) {
        console.warn('API works sync note:', apiErr);
      }

      // 2. Fetch from Firestore Cloud Database
      try {
        const cloudWorks = await fetchWorksFromFirestore();
        if (cloudWorks && cloudWorks.length > 0) {
          setWorks((prev) => {
            const map = new Map<string, WorkItem>();
            prev.forEach((w) => {
              if (!SAMPLE_IDS.has(w.id)) map.set(w.id, w);
            });
            cloudWorks.forEach((w) => {
              if (SAMPLE_IDS.has(w.id)) return;
              if (
                w.id === 'work-scapefolio' &&
                (w.title === 'Vorlage Scapefolio' ||
                  !w.title.includes('Kurbeltheater') ||
                  w.authorId !== 'Turboschnecke-00' ||
                  w.summary.includes('Rollbühne') ||
                  w.summary.includes('Einblick in die Entstehung'))
              ) {
                const defaultKurbel = INITIAL_WORKS.find((x) => x.id === 'work-scapefolio') || INITIAL_WORKS[1];
                map.set(w.id, defaultKurbel);
              } else {
                map.set(w.id, sanitizeWorkItem(w));
              }
            });
            if (!map.has('work-scapefolio')) {
              const defaultKurbel = INITIAL_WORKS.find((x) => x.id === 'work-scapefolio') || INITIAL_WORKS[1];
              map.set('work-scapefolio', defaultKurbel);
            }
            return Array.from(map.values());
          });
        }
        const cloudRubriken = await fetchRubrikenFromFirestore();
        if (cloudRubriken && cloudRubriken.length > 0) {
          setRubriken((prev) => {
            const map = new Map<string, Rubrik>();
            prev.forEach((r) => map.set(r.id, r));
            cloudRubriken.forEach((r) => map.set(r.id, r));
            INITIAL_RUBRIKEN.forEach((r) => map.set(r.id, r));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('Initial Firestore sync error:', err);
      }
    }
    syncFromCloud();
  }, []);

  // Save to localStorage on state changes (safeguard against QuotaExceededError for large media)
  useEffect(() => {
    try {
      const sanitizedWorks = works.map((w) => {
        if (w.fileUrl && w.fileUrl.startsWith('data:') && w.fileUrl.length > 500000) {
          const { fileUrl, ...rest } = w;
          return rest;
        }
        return w;
      });
      localStorage.setItem(STORAGE_KEY_WORKS, JSON.stringify(sanitizedWorks));
    } catch (e) {
      console.warn('Failed to save works to localStorage (quota or size):', e);
    }
  }, [works]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RUBRIKEN, JSON.stringify(rubriken));
    } catch (e) {
      console.error('Failed to save rubriken to localStorage', e);
    }
  }, [rubriken]);

  // Filtering & Sorting State
  const [activeRubrikId, setActiveRubrikId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'title' | 'tool'>('newest');

  // Modals State
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRubrikForAdd, setSelectedRubrikForAdd] = useState<string | undefined>(undefined);
  const [isNewRubrikModalOpen, setIsNewRubrikModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Teacher login & logout
  const handleTeacherSuccess = () => {
    setIsTeacher(true);
    try {
      sessionStorage.setItem(STORAGE_KEY_TEACHER, 'true');
    } catch {}

    const action = pendingActionAfterAuth || 'add';
    if (action === 'backup') {
      setIsBackupModalOpen(true);
    } else if (action === 'rubrik') {
      setIsNewRubrikModalOpen(true);
    } else if (action === 'edit') {
      setIsEditModalOpen(true);
    } else {
      // Default: immediately open the upload modal so the teacher can upload right away!
      setIsAddModalOpen(true);
    }
    setPendingActionAfterAuth(null);
  };

  const handleTeacherLogout = async () => {
    setIsTeacher(false);
    try {
      await signOutTeacher();
      sessionStorage.removeItem(STORAGE_KEY_TEACHER);
      localStorage.removeItem(STORAGE_KEY_TEACHER);
    } catch {}
  };

  const handleOpenAddSecure = (rubrikId?: string) => {
    if (typeof rubrikId === 'string') {
      setSelectedRubrikForAdd(rubrikId);
    } else {
      setSelectedRubrikForAdd(undefined);
    }
    if (isTeacher) {
      setIsAddModalOpen(true);
    } else {
      setPendingActionAfterAuth('add');
      setIsTeacherAuthOpen(true);
    }
  };

  const handleOpenRubrikSecure = () => {
    if (isTeacher) {
      setIsNewRubrikModalOpen(true);
    } else {
      setPendingActionAfterAuth('rubrik');
      setIsTeacherAuthOpen(true);
    }
  };

  const handleOpenBackupSecure = () => {
    if (isTeacher) {
      setIsBackupModalOpen(true);
    } else {
      setPendingActionAfterAuth('backup');
      setIsTeacherAuthOpen(true);
    }
  };

  // Counts by Rubrik
  const worksCountByRubrik = useMemo(() => {
    const counts: Record<string, number> = {};
    works.forEach((w) => {
      counts[w.rubrikId] = (counts[w.rubrikId] || 0) + 1;
    });
    return counts;
  }, [works]);

  // Unique Anonymous Authors count (Privacy-compliant)
  const totalAuthors = useMemo(() => {
    const unique = new Set(works.map((w) => w.authorId));
    return unique.size;
  }, [works]);

  // Filtered & Sorted Works
  const filteredWorks = useMemo(() => {
    return works
      .filter((item) => {
        // Rubrik filter
        if (activeRubrikId !== 'all' && item.rubrikId !== activeRubrikId) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchAuthorId = item.authorId.toLowerCase().includes(q);
          const matchTool = item.creationTool.toLowerCase().includes(q);
          const matchSummary = item.summary.toLowerCase().includes(q);
          const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
          return matchTitle || matchAuthorId || matchTool || matchSummary || matchTags;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.starsCount - a.starsCount;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'tool') return a.creationTool.localeCompare(b.creationTool);
        // default: newest
        return b.id.localeCompare(a.id);
      });
  }, [works, activeRubrikId, searchQuery, sortBy]);

  // Handlers
  const handleAddWork = async (newWork: WorkItem) => {
    setWorks((prev) => [newWork, ...prev]);
    setActiveRubrikId('all');
    handleSelectTab('katalog');
    setSuccessNotification(`«${newWork.title}» wurde erfolgreich im Scapestudio veröffentlicht!`);
    setTimeout(() => {
      setSuccessNotification(null);
    }, 5000);

    // Save to Server persistent database
    try {
      await fetch('/api/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWork),
      });
    } catch (apiErr) {
      console.warn('Server API work save note:', apiErr);
    }

    // Save to Firestore cloud database
    try {
      await saveWorkToFirestore(newWork);
    } catch (e) {
      console.warn('Firestore cloud save note:', e);
    }
  };

  const handleOpenEditWork = (work: WorkItem) => {
    setWorkToEdit(work);
    if (isTeacher) {
      setIsEditModalOpen(true);
    } else {
      setPendingActionAfterAuth('edit');
      setIsTeacherAuthOpen(true);
    }
  };

  const handleUpdateWork = async (updatedWork: WorkItem) => {
    setWorks((prev) => prev.map((w) => (w.id === updatedWork.id ? updatedWork : w)));
    if (selectedWork && selectedWork.id === updatedWork.id) {
      setSelectedWork(updatedWork);
    }
    setSuccessNotification(`«${updatedWork.title}» wurde erfolgreich aktualisiert!`);
    setTimeout(() => {
      setSuccessNotification(null);
    }, 5000);

    // Save to Server persistent database
    try {
      await fetch('/api/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWork),
      });
    } catch (apiErr) {
      console.warn('Server API work update note:', apiErr);
    }

    // Save to Firestore cloud database
    try {
      await saveWorkToFirestore(updatedWork);
    } catch (e) {
      console.warn('Firestore cloud update note:', e);
    }
  };

  const handleDeleteWork = (workId: string) => {
    setWorks((prev) => prev.filter((w) => w.id !== workId));
    if (selectedWork && selectedWork.id === workId) {
      setSelectedWork(null);
    }
    setSuccessNotification('Das Werk wurde aus der Bibliothek entfernt.');
    setTimeout(() => {
      setSuccessNotification(null);
    }, 5000);
  };

  const handleAddRubrik = async (newRubrik: Rubrik) => {
    setRubriken((prev) => [...prev, newRubrik]);
    setActiveRubrikId(newRubrik.id);
    handleSelectTab('katalog');
    setSuccessNotification(`Neue Rubrik «${newRubrik.title}» wurde angelegt!`);
    setTimeout(() => {
      setSuccessNotification(null);
    }, 5000);

    try {
      await saveRubrikToFirestore(newRubrik);
    } catch (e) {
      console.warn('Firestore cloud save rubrik note:', e);
    }
  };

  const handleToggleLike = (workId: string) => {
    setWorks((prev) =>
      prev.map((item) => {
        if (item.id === workId) {
          const nextLiked = !item.hasLiked;
          return {
            ...item,
            hasLiked: nextLiked,
            starsCount: nextLiked ? item.starsCount + 1 : Math.max(0, item.starsCount - 1),
          };
        }
        return item;
      })
    );

    if (selectedWork && selectedWork.id === workId) {
      setSelectedWork((prev) => {
        if (!prev) return null;
        const nextLiked = !prev.hasLiked;
        return {
          ...prev,
          hasLiked: nextLiked,
          starsCount: nextLiked ? prev.starsCount + 1 : Math.max(0, prev.starsCount - 1),
        };
      });
    }
  };

  const handleImportData = (data: { works: WorkItem[]; rubriken?: Rubrik[] }) => {
    if (data.works && Array.isArray(data.works)) {
      setWorks(data.works);
    }
    if (data.rubriken && Array.isArray(data.rubriken)) {
      setRubriken(data.rubriken);
    }
  };

  const handleResetDefaults = () => {
    setWorks(INITIAL_WORKS);
    setRubriken(INITIAL_RUBRIKEN);
    setActiveRubrikId('all');
    localStorage.removeItem(STORAGE_KEY_WORKS);
    localStorage.removeItem(STORAGE_KEY_RUBRIKEN);
  };

  const selectedWorkRubrik = rubriken.find((r) => r.id === selectedWork?.rubrikId);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-800 select-none">
      {/* Top 3-Zone Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isTeacher={isTeacher}
        onOpenTeacherAuth={(action) => {
          setPendingActionAfterAuth(action || 'add');
          setIsTeacherAuthOpen(true);
        }}
        onTeacherLogout={handleTeacherLogout}
        onOpenAddModal={() => handleOpenAddSecure()}
        onOpenNewRubrikModal={handleOpenRubrikSecure}
        onOpenBackupModal={handleOpenBackupSecure}
      />

      {/* Success Notification Banner */}
      {successNotification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
                ✓
              </div>
              <div>
                <strong className="text-emerald-950 font-bold block text-sm">
                  Erfolgreich ausgeführt!
                </strong>
                <span className="text-xs text-emerald-800">
                  {successNotification}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSuccessNotification(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-950 p-1.5 rounded-lg hover:bg-emerald-100 cursor-pointer"
            >
              Ausblenden
            </button>
          </div>
        </div>
      )}

      {/* Hero Presentation & Live Search (nur auf der Hauptseite / Katalog sichtbar, damit Qualitätsstandard & Rubriken sofort oben erscheinen) */}
      {currentTab === 'katalog' && (
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalWorks={works.length}
          totalRubriken={rubriken.length}
          totalAuthors={totalAuthors}
          onOpenAddModal={() => handleOpenAddSecure()}
        />
      )}

      {/* Main View Area based on currentTab */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* VIEW 1: KATALOG / BIBLIOTHEK */}
        {currentTab === 'katalog' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Rubrik / Category Segmented Filter Bar */}
            <RubrikFilterBar
              rubriken={rubriken}
              activeRubrikId={activeRubrikId}
              onSelectRubrik={setActiveRubrikId}
              worksCountByRubrik={worksCountByRubrik}
              totalWorksCount={works.length}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onOpenNewRubrikModal={handleOpenRubrikSecure}
              isTeacher={isTeacher}
            />

            {/* Works Grid */}
            {filteredWorks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredWorks.map((work) => {
                  const rubrik = rubriken.find((r) => r.id === work.rubrikId);
                  return (
                    <WorkCard
                      key={work.id}
                      work={work}
                      rubrik={rubrik}
                      onOpenPreview={setSelectedWork}
                      onToggleLike={handleToggleLike}
                      onEditWork={handleOpenEditWork}
                    />
                  );
                })}
              </div>
            ) : (
              /* Friendly Empty State */
              <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-pink-50 flex items-center justify-center mx-auto mb-4 border border-pink-200">
                  <SearchX className="w-8 h-8 text-pink-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  Keine Werke gefunden
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Für deine Suche &ldquo;{searchQuery}&rdquo; gibt es in dieser Auswahl noch keine passenden Einträge.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveRubrikId('all');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Filter zurücksetzen
                  </button>
                  <button
                    onClick={() => handleOpenAddSecure()}
                    className="px-4 py-2 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Neues Werk erfassen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: RUBRIKEN & AKTEN (Aktenmappen-Hub) */}
        {currentTab === 'rubriken' && (
          <div className="animate-in fade-in duration-150">
            <RubrikenHub
              rubriken={rubriken}
              works={works}
              onSelectRubrikAndGoToCatalog={(rubrikId) => {
                setActiveRubrikId(rubrikId);
                handleSelectTab('katalog');
              }}
              onOpenPreview={setSelectedWork}
              onEditWork={handleOpenEditWork}
              onOpenNewRubrikModal={handleOpenRubrikSecure}
              onOpenAddWorkForRubrik={(rubrikId) => handleOpenAddSecure(rubrikId)}
              isTeacher={isTeacher}
            />
          </div>
        )}

        {/* VIEW 3: QUALITÄTS-KODEX & AUTOREN-ID */}
        {currentTab === 'qualitaet' && (
          <div className="animate-in fade-in duration-150">
            <QualityStandardsView />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <KawaiiMascot className="w-6 h-6" />
            <div>
              <span className="font-display font-bold text-slate-800 text-sm">
                Scape<span className="text-pink-500">studio</span>
              </span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="font-medium text-slate-600">DIE SCAPES · Schule Saatlen</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isTeacher && (
              <>
                <button
                  onClick={handleOpenBackupSecure}
                  className="hover:text-pink-600 transition-colors cursor-pointer font-medium"
                >
                  Bibliothek sichern & Backup
                </button>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Keine Schülerdownloads (Ausstellungsmodus)
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BookPreviewModal
        work={selectedWork}
        rubrik={selectedWorkRubrik}
        onClose={() => setSelectedWork(null)}
        onToggleLike={handleToggleLike}
        onEditWork={handleOpenEditWork}
      />

      <EditWorkModal
        isOpen={isEditModalOpen}
        work={workToEdit}
        rubriken={rubriken}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateWork}
        onDelete={handleDeleteWork}
      />

      <AddWorkModal
        isOpen={isAddModalOpen}
        rubriken={rubriken}
        defaultRubrikId={selectedRubrikForAdd}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedRubrikForAdd(undefined);
        }}
        onAddWork={handleAddWork}
      />

      <NewRubrikModal
        isOpen={isNewRubrikModalOpen}
        onClose={() => setIsNewRubrikModalOpen(false)}
        onAddRubrik={handleAddRubrik}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        rubriken={rubriken}
        works={works}
        onClose={() => setIsBackupModalOpen(false)}
        onImportData={handleImportData}
        onResetDefaults={handleResetDefaults}
      />

      <TeacherAuthModal
        isOpen={isTeacherAuthOpen}
        onClose={() => {
          setIsTeacherAuthOpen(false);
          setPendingActionAfterAuth(null);
        }}
        onSuccess={handleTeacherSuccess}
        targetAction={pendingActionAfterAuth || undefined}
      />
    </div>
  );
}



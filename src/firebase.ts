import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';
import { WorkItem, Rubrik } from './types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId as required by the environment
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export { onAuthStateChanged, type User };

// Connection check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing...');
    }
  }
}
testConnection();

// Standard Firestore error handler per specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// Firebase Storage Upload Helper
// ----------------------------------------------------
export interface UploadResult {
  downloadUrl: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
}

export function uploadFileToFirebaseStorage(
  file: File | Blob,
  folder: 'works' | 'covers',
  customFileName?: string,
  onProgress?: (progressPercent: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const sanitizedName = (customFileName || (file as File).name || 'file')
      .replace(/[^a-zA-Z0-9._-]/g, '_');

    // Primary: Upload via server endpoint /api/upload for guaranteed public access and MP4 streaming
    try {
      const formData = new FormData();
      formData.append('file', file, sanitizedName);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable && evt.total > 0) {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res?.url) {
              resolve({
                downloadUrl: res.url,
                storagePath: res.url,
                fileName: res.originalName || sanitizedName,
                fileSize: res.size || (file as File).size || 0,
              });
              return;
            }
          } catch (e) {
            // fallback
          }
        }
        // Fallback to Firebase Storage if server upload was rejected
        fallbackFirebaseUpload();
      };

      xhr.onerror = () => {
        fallbackFirebaseUpload();
      };

      xhr.send(formData);
      return;
    } catch (e) {
      fallbackFirebaseUpload();
    }

    function fallbackFirebaseUpload() {
      try {
        const uniqueFileName = `${Date.now()}_${sanitizedName}`;
        const storagePath = `${folder}/${uniqueFileName}`;
        const storageRef = ref(storage, storagePath);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0 && onProgress) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(Math.round(progress));
            }
          },
          (error) => {
            console.warn('Firebase Storage upload note:', error);
            if (file instanceof File || file instanceof Blob) {
              // Lightweight object URL fallback
              const objectUrl = URL.createObjectURL(file);
              resolve({
                downloadUrl: objectUrl,
                storagePath,
                fileName: sanitizedName,
                fileSize: file.size,
              });
            } else {
              reject(error);
            }
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                downloadUrl,
                storagePath,
                fileName: sanitizedName,
                fileSize: file.size,
              });
            } catch (err) {
              if (file instanceof File || file instanceof Blob) {
                resolve({
                  downloadUrl: URL.createObjectURL(file),
                  storagePath,
                  fileName: sanitizedName,
                  fileSize: file.size,
                });
              } else {
                reject(err);
              }
            }
          }
        );
      } catch (err) {
        if (file instanceof File || file instanceof Blob) {
          resolve({
            downloadUrl: URL.createObjectURL(file),
            storagePath: `${folder}/${Date.now()}`,
            fileName: sanitizedName,
            fileSize: file.size,
          });
        } else {
          reject(err);
        }
      }
    }
  });
}

// ----------------------------------------------------
// Authentication Helpers
// ----------------------------------------------------
const DEFAULT_TEACHER_EMAIL = 'lehrperson@saatlen.schule';

/**
 * Signs in teacher using email & password or just password with default school account.
 */
export async function signInTeacherWithFirebase(
  password: string,
  email: string = DEFAULT_TEACHER_EMAIL
): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
    return cred.user;
  } catch (err: any) {
    // If account doesn't exist yet, automatically register it with this password for the school
    if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
      try {
        const createCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        return createCred.user;
      } catch (createErr) {
        throw err;
      }
    }
    throw err;
  }
}

/**
 * Sign in teacher via Google Popup
 */
export async function signInTeacherWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

/**
 * Sign out teacher
 */
export async function signOutTeacher(): Promise<void> {
  await signOut(auth);
}

// ----------------------------------------------------
// Firestore Sync Helpers
// ----------------------------------------------------

export async function fetchWorksFromFirestore(): Promise<WorkItem[]> {
  try {
    const snap = await getDocs(collection(db, 'works'));
    const items: WorkItem[] = [];
    snap.forEach((doc) => {
      items.push(doc.data() as WorkItem);
    });
    return items;
  } catch (e) {
    console.warn('Could not fetch works from Firestore, using local fallback', e);
    return [];
  }
}

export async function saveWorkToFirestore(work: WorkItem): Promise<void> {
  try {
    const payload: any = {};
    for (const [key, value] of Object.entries(work)) {
      if (value !== undefined) {
        payload[key] = value;
      }
    }
    // Firestore has a 1MB max document size limit. Prevent crash if fileUrl is an oversized data URL.
    if (payload.fileUrl && typeof payload.fileUrl === 'string' && payload.fileUrl.startsWith('data:') && payload.fileUrl.length > 700000) {
      delete payload.fileUrl;
    }
    await setDoc(doc(db, 'works', work.id), payload);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `works/${work.id}`);
  }
}

export async function deleteWorkFromFirestore(workId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'works', workId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `works/${workId}`);
  }
}

export async function fetchRubrikenFromFirestore(): Promise<Rubrik[]> {
  try {
    const snap = await getDocs(collection(db, 'rubriken'));
    const items: Rubrik[] = [];
    snap.forEach((doc) => {
      items.push(doc.data() as Rubrik);
    });
    return items;
  } catch (e) {
    console.warn('Could not fetch rubriken from Firestore, using local fallback', e);
    return [];
  }
}

export async function saveRubrikToFirestore(rubrik: Rubrik): Promise<void> {
  try {
    await setDoc(doc(db, 'rubriken', rubrik.id), rubrik);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `rubriken/${rubrik.id}`);
  }
}

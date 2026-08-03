import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Enable persistent local cache so writes resolve immediately from IndexedDB
// and sync to server in the background — prevents indefinite hangs on slow networks.
// Falls back to default (memory) cache on SSR or if already initialized.
function initDb() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache(),
    });
  } catch {
    return getFirestore(app);
  }
}

export const auth = getAuth(app);
export const db = initDb();
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { GrowSpace } from "./types";

const COLLECTION = "spaces";

function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function createSpace(
  userId: string,
  data: Omit<GrowSpace, "id" | "userId" | "createdAt">
) {
  const ref = await addDoc(collection(db, COLLECTION), strip({
    ...data,
    userId,
    createdAt: serverTimestamp(),
  }));
  return ref.id;
}

export async function updateSpace(id: string, data: Partial<GrowSpace>) {
  await updateDoc(doc(db, COLLECTION, id), strip(data));
}

export async function deleteSpace(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getSpace(id: string): Promise<GrowSpace | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as GrowSpace;
}

export async function getUserSpaces(userId: string): Promise<GrowSpace[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GrowSpace));
}

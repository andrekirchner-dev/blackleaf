import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { DiaryEntry } from "./types";

const COLLECTION = "diary";

function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function createEntry(
  userId: string,
  data: Omit<DiaryEntry, "id" | "userId" | "createdAt">
) {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...strip(data),
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEntry(id: string, data: Partial<DiaryEntry>) {
  await updateDoc(doc(db, COLLECTION, id), strip(data));
}

export async function deleteEntry(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getUserEntries(userId: string): Promise<DiaryEntry[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DiaryEntry));
}

export async function getPlantEntries(plantId: string): Promise<DiaryEntry[]> {
  const q = query(
    collection(db, COLLECTION),
    where("plantId", "==", plantId),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DiaryEntry));
}

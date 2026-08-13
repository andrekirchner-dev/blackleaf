import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { HarvestLog } from "./types";

const COLLECTION = "harvest_logs";

function normalize(id: string, data: Record<string, unknown>): HarvestLog {
  return {
    ...data,
    id,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string) ?? new Date().toISOString(),
  } as HarvestLog;
}

function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function createHarvestLog(
  userId: string,
  data: Omit<HarvestLog, "id" | "userId" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...strip(data),
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserHarvests(userId: string): Promise<HarvestLog[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("harvestDate", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalize(d.id, d.data() as Record<string, unknown>));
}

export async function updateHarvestLog(
  id: string,
  data: Partial<Omit<HarvestLog, "id" | "userId" | "createdAt">>
): Promise<void> {
  await setDoc(doc(db, COLLECTION, id), data, { merge: true });
}

export async function deleteHarvestLog(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

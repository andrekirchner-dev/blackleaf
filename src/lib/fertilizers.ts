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
import type { Fertilizer } from "./types";

const COLLECTION = "fertilizers";

function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function createFertilizer(
  userId: string,
  data: Omit<Fertilizer, "id" | "userId" | "createdAt">
) {
  const ref = await addDoc(collection(db, COLLECTION), strip({
    ...data,
    userId,
    createdAt: serverTimestamp(),
  }));
  return ref.id;
}

export async function updateFertilizer(id: string, data: Partial<Fertilizer>) {
  await updateDoc(doc(db, COLLECTION, id), strip(data));
}

export async function deleteFertilizer(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getUserFertilizers(userId: string): Promise<Fertilizer[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Fertilizer));
}

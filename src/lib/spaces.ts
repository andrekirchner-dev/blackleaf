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
import type { GrowSpace } from "./types";

const COLLECTION = "spaces";

export async function createSpace(
  userId: string,
  data: Omit<GrowSpace, "id" | "userId" | "createdAt">
) {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSpace(id: string, data: Partial<GrowSpace>) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteSpace(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
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

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
} from "firebase/firestore";
import { db } from "./firebase";
import type { GrowEnvironment } from "./types";

const COLLECTION = "environments";

export async function createEnvironmentRecord(
  userId: string,
  data: Omit<GrowEnvironment, "id" | "userId">
) {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteEnvironmentRecord(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getUserEnvironmentRecords(userId: string): Promise<GrowEnvironment[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("recordedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GrowEnvironment));
}

export function calcVPD(tempC: number, rh: number): number {
  const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  return parseFloat((svp * (1 - rh / 100)).toFixed(2));
}

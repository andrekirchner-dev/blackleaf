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
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Plant, GrowStage } from "./types";

function tsToISO(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === "string") return val;
  return new Date().toISOString();
}

function normalizePlant(id: string, data: Record<string, unknown>): Plant {
  return {
    ...data,
    id,
    createdAt: tsToISO(data.createdAt),
    updatedAt: tsToISO(data.updatedAt),
  } as Plant;
}

const COLLECTION = "plants";

function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function createPlant(
  userId: string,
  data: Omit<Plant, "id" | "userId" | "createdAt" | "updatedAt">
) {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...strip(data),
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePlant(id: string, data: Partial<Plant>) {
  await updateDoc(doc(db, COLLECTION, id), {
    ...strip(data),
    updatedAt: serverTimestamp(),
  });
}

export async function deletePlant(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getPlant(id: string): Promise<Plant | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return normalizePlant(snap.id, snap.data() as Record<string, unknown>);
}

export async function getUserPlants(userId: string): Promise<Plant[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizePlant(d.id, d.data() as Record<string, unknown>));
}

export async function advanceStage(id: string, stage: GrowStage) {
  await updateDoc(doc(db, COLLECTION, id), {
    stage,
    stageChangedAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  });
}

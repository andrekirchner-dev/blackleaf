import {
  collection,
  addDoc,
  setDoc,
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
    stageChangedAt: data.stageChangedAt ? tsToISO(data.stageChangedAt) : new Date().toISOString(),
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
  await setDoc(doc(db, COLLECTION, id), {
    ...strip(data),
    updatedAt: serverTimestamp(),
  }, { merge: true });
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
  await setDoc(doc(db, COLLECTION, id), {
    stage,
    stageChangedAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function archivePlant(id: string): Promise<void> {
  await setDoc(doc(db, COLLECTION, id), {
    archived: true,
    archivedAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function unarchivePlant(id: string): Promise<void> {
  await setDoc(doc(db, COLLECTION, id), {
    archived: false,
    archivedAt: null,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getArchivedPlants(userId: string): Promise<Plant[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    where("archived", "==", true),
    orderBy("archivedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizePlant(d.id, d.data() as Record<string, unknown>));
}

export async function duplicatePlant(plant: Plant, userId: string): Promise<string> {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = plant;
  const baseName = plant.name.replace(/\s*\(cópia\s*\d*\)\s*$/, "").trim();
  const ref = await addDoc(collection(db, COLLECTION), {
    ...strip({ ...data, name: `${baseName} (cópia)` }),
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

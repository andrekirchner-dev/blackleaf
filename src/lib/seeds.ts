import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { GeneticType } from "./types";

export type StorageMethod = "envelope" | "fridge" | "freezer" | "airtight";

export interface SeedEntry {
  id: string;
  userId: string;
  strainName: string;
  bank: string;
  genetics: GeneticType | "";
  feminized: boolean;
  quantity: number;
  originalQuantity: number;
  germinated: number;
  storageMethod: StorageMethod;
  storageDate: Timestamp;
  notes?: string;
  createdAt: Timestamp;
}

export interface CreateSeedData {
  strainName: string;
  bank: string;
  genetics: GeneticType | "";
  feminized: boolean;
  quantity: number;
  storageMethod: StorageMethod;
  storageDate: Date;
  notes?: string;
}

const COLLECTION = "seeds";

export function subscribeSeeds(
  userId: string,
  callback: (seeds: SeedEntry[]) => void
): () => void {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SeedEntry)));
  });
}

function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function addSeed(
  userId: string,
  data: CreateSeedData
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    userId,
    ...strip(data),
    storageDate: Timestamp.fromDate(data.storageDate),
    originalQuantity: data.quantity,
    germinated: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function germinateSeed(id: string, currentGerminated: number, currentQty: number, count = 1): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    germinated: currentGerminated + count,
    quantity: Math.max(0, currentQty - count),
  });
}

export async function updateSeed(id: string, data: Partial<CreateSeedData>): Promise<void> {
  const update: Record<string, unknown> = { ...data };
  if (data.storageDate) {
    update.storageDate = Timestamp.fromDate(data.storageDate);
  }
  await updateDoc(doc(db, COLLECTION, id), update);
}

export async function deleteSeed(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export const STORAGE_METHODS: Record<StorageMethod, { label: string; emoji: string; maxYears: number; description: string }> = {
  envelope: { label: "Envelope", emoji: "✉️", maxYears: 2, description: "Temperatura ambiente, local seco e escuro" },
  airtight: { label: "Recipiente Hermético", emoji: "🫙", maxYears: 4, description: "Recipiente vedado com sachê dessecante" },
  fridge: { label: "Geladeira", emoji: "❄️", maxYears: 5, description: "4–8°C, recipiente hermético + dessecante" },
  freezer: { label: "Freezer", emoji: "🧊", maxYears: 15, description: "< 0°C, vedado com dessecante — longa duração" },
};

export const GENETICS_LABELS: Record<string, { label: string; emoji: string }> = {
  sativa: { label: "Sativa", emoji: "🌿" },
  indica: { label: "Indica", emoji: "🍃" },
  hibrida: { label: "Híbrida", emoji: "🌱" },
  autoflowering: { label: "Autoflower", emoji: "⚡" },
  "": { label: "Desconhecida", emoji: "❓" },
};

export function getStorageHealth(storageDate: Timestamp, method: StorageMethod): {
  months: number;
  years: number;
  status: "good" | "warning" | "danger";
  label: string;
} {
  const maxYears = STORAGE_METHODS[method].maxYears;
  const now = Date.now();
  const stored = storageDate.toMillis();
  const diffMs = now - stored;
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);

  const pct = years / maxYears;

  let status: "good" | "warning" | "danger";
  let label: string;

  if (pct < 0.6) {
    status = "good";
    label = months < 1 ? "< 1 mês" : months < 12 ? `${months} mês${months !== 1 ? "es" : ""}` : `${Math.floor(years)} ano${Math.floor(years) !== 1 ? "s" : ""}`;
  } else if (pct < 0.9) {
    status = "warning";
    label = `${Math.floor(years)} ano${Math.floor(years) !== 1 ? "s" : ""} — atenção`;
  } else {
    status = "danger";
    label = `${Math.floor(years)} ano${Math.floor(years) !== 1 ? "s" : ""} — próximo do limite`;
  }

  return { months, years, status, label };
}

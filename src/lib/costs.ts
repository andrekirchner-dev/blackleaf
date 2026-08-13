import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

export type CostCategory =
  | "energia"
  | "nutrientes"
  | "substrato"
  | "equipamento"
  | "sementes"
  | "outro";

export interface GrowCost {
  id: string;
  userId: string;
  category: CostCategory;
  description: string;
  amount: number;
  date: string;
  plantIds?: string[];
  notes?: string;
  createdAt: string;
}

export const COST_CATEGORY_EMOJI: Record<CostCategory, string> = {
  energia: "⚡",
  nutrientes: "🧪",
  substrato: "🌍",
  equipamento: "🔧",
  sementes: "🌱",
  outro: "📦",
};

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  energia: "Energia",
  nutrientes: "Nutrientes",
  substrato: "Substrato",
  equipamento: "Equipamento",
  sementes: "Sementes",
  outro: "Outro",
};

const COLLECTION = "grow_costs";

function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

function normalize(id: string, data: Record<string, unknown>): GrowCost {
  return { ...data, id } as GrowCost;
}

export async function createCost(
  userId: string,
  data: Omit<GrowCost, "id" | "userId" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), strip({
    ...data,
    userId,
    createdAt: new Date().toISOString(),
  }));
  return ref.id;
}

export async function getCosts(userId: string): Promise<GrowCost[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalize(d.id, d.data() as Record<string, unknown>));
}

export async function deleteCost(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

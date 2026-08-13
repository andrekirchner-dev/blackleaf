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
import type { GrowStyle, FeedingType } from "./types";

const COLLECTION = "grow_styles";

function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export const FEEDING_LABELS: Record<FeedingType, string> = {
  organico: "Orgânico",
  organomineral: "Organo-mineral",
  mineral: "Mineral",
  hidroponico: "Hidropônico",
};

export const FEEDING_TYPES: { value: FeedingType; label: string; emoji: string }[] = [
  { value: "organico",      label: "Orgânico",      emoji: "🌿" },
  { value: "organomineral", label: "Organo-mineral", emoji: "🔬" },
  { value: "mineral",       label: "Mineral",        emoji: "⚗️" },
  { value: "hidroponico",   label: "Hidropônico",    emoji: "💧" },
];

export const GROW_STYLE_PRESETS: GrowStyle[] = [
  {
    id: "preset-sog",
    userId: "__preset__",
    name: "SOG — Vega Curta",
    description: "Sea of Green com vega curta para ciclos rápidos. Muitas plantas pequenas maximizando o espaço.",
    feedingType: "mineral",
    vegWeeks: 3,
    isPreset: true,
    events: [
      { weekOffset: 0, label: "Germinação", emoji: "🌱", type: "milestone" },
      { weekOffset: 1, label: "Transplante para vaso final", emoji: "🪴", type: "action" },
      { weekOffset: 3, label: "Flip 12/12", emoji: "💡", type: "milestone" },
      { weekOffset: 5, label: "Início da floração real", emoji: "🌸", type: "milestone" },
    ],
    createdAt: "",
  },
  {
    id: "preset-lst-longa",
    userId: "__preset__",
    name: "LST — Vega Longa",
    description: "Treinamento LST com vega longa para plantas grandes e alto rendimento.",
    feedingType: "mineral",
    vegWeeks: 8,
    isPreset: true,
    events: [
      { weekOffset: 0, label: "Germinação", emoji: "🌱", type: "milestone" },
      { weekOffset: 2, label: "Início do LST", emoji: "📌", type: "action" },
      { weekOffset: 4, label: "Defolha parcial", emoji: "✂️", type: "action" },
      { weekOffset: 6, label: "Ajuste final do LST", emoji: "📌", type: "action" },
      { weekOffset: 8, label: "Flip 12/12", emoji: "💡", type: "milestone" },
      { weekOffset: 10, label: "Defolha pré-floração", emoji: "✂️", type: "action" },
    ],
    createdAt: "",
  },
  {
    id: "preset-organico",
    userId: "__preset__",
    name: "Orgânico",
    description: "Cultivo em solo vivo com insumos orgânicos. Foco em saúde da microbiota e sabor final.",
    feedingType: "organico",
    vegWeeks: 5,
    isPreset: true,
    events: [
      { weekOffset: 0, label: "Germinação", emoji: "🌱", type: "milestone" },
      { weekOffset: 1, label: "Inoculação de micorrizas", emoji: "🍄", type: "action" },
      { weekOffset: 2, label: "Primeiro top dress", emoji: "🌿", type: "action" },
      { weekOffset: 5, label: "Flip 12/12", emoji: "💡", type: "milestone" },
      { weekOffset: 7, label: "Top dress de floração", emoji: "🌿", type: "action" },
      { weekOffset: 13, label: "Flush final (água pura)", emoji: "💧", type: "action" },
    ],
    createdAt: "",
  },
  {
    id: "preset-organomineral",
    userId: "__preset__",
    name: "Organo-Mineral",
    description: "Combinação de insumos orgânicos com minerais solúveis para melhor controle de nutrientes.",
    feedingType: "organomineral",
    vegWeeks: 5,
    isPreset: true,
    events: [
      { weekOffset: 0, label: "Germinação", emoji: "🌱", type: "milestone" },
      { weekOffset: 1, label: "Micorrizas + base orgânica", emoji: "🍄", type: "action" },
      { weekOffset: 5, label: "Flip 12/12", emoji: "💡", type: "milestone" },
      { weekOffset: 6, label: "Boost mineral de floração", emoji: "⚗️", type: "action" },
      { weekOffset: 12, label: "Flush final", emoji: "💧", type: "action" },
    ],
    createdAt: "",
  },
  {
    id: "preset-hidro",
    userId: "__preset__",
    name: "Hidropônico",
    description: "Cultivo em solução nutritiva. Crescimento acelerado e alto controle de EC e pH.",
    feedingType: "hidroponico",
    vegWeeks: 3,
    isPreset: true,
    events: [
      { weekOffset: 0, label: "Germinação em lã de rocha", emoji: "🌱", type: "milestone" },
      { weekOffset: 1, label: "Transplante para sistema hidro", emoji: "💧", type: "action" },
      { weekOffset: 3, label: "Flip 12/12", emoji: "💡", type: "milestone" },
      { weekOffset: 4, label: "Trocar solução nutritiva", emoji: "🔄", type: "action" },
      { weekOffset: 10, label: "Flush final", emoji: "💧", type: "action" },
    ],
    createdAt: "",
  },
];

export async function createGrowStyle(
  userId: string,
  data: Omit<GrowStyle, "id" | "userId" | "createdAt">
) {
  const ref = await addDoc(collection(db, COLLECTION), strip({
    ...data,
    userId,
    createdAt: serverTimestamp(),
  }));
  return ref.id;
}

export async function updateGrowStyle(id: string, data: Partial<GrowStyle>) {
  await updateDoc(doc(db, COLLECTION, id), strip(data));
}

export async function deleteGrowStyle(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getUserGrowStyles(userId: string): Promise<GrowStyle[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GrowStyle));
}

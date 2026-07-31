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

export type ShoppingUrgency = "urgent" | "soon" | "ok";
export type ShoppingStatus = "pending" | "purchased";
export type ShoppingCategory =
  | "nutrientes"
  | "substrato"
  | "iluminação"
  | "equipamentos"
  | "sementes"
  | "controle"
  | "outros";

export interface ShoppingItem {
  id: string;
  userId: string;
  name: string;
  category: ShoppingCategory;
  urgency: ShoppingUrgency;
  estimatedPrice?: number;
  notes?: string;
  status: ShoppingStatus;
  createdAt: Timestamp;
  purchasedAt?: Timestamp;
}

export interface CreateShoppingItemData {
  name: string;
  category: ShoppingCategory;
  urgency: ShoppingUrgency;
  estimatedPrice?: number;
  notes?: string;
}

const COLLECTION = "shopping_items";

export function subscribeShoppingItems(
  userId: string,
  callback: (items: ShoppingItem[]) => void
): () => void {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShoppingItem))
    );
  });
}

export async function addShoppingItem(
  userId: string,
  data: CreateShoppingItemData
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    userId,
    ...data,
    status: "pending" as ShoppingStatus,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function toggleShoppingItem(
  id: string,
  currentStatus: ShoppingStatus
): Promise<void> {
  const newStatus: ShoppingStatus =
    currentStatus === "pending" ? "purchased" : "pending";
  await updateDoc(doc(db, COLLECTION, id), {
    status: newStatus,
    purchasedAt: newStatus === "purchased" ? serverTimestamp() : null,
  });
}

export async function updateShoppingItem(
  id: string,
  data: Partial<CreateShoppingItemData>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteShoppingItem(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export const SHOPPING_CATEGORIES: Record<
  ShoppingCategory,
  { label: string; emoji: string }
> = {
  nutrientes: { label: "Nutrientes", emoji: "🧪" },
  substrato: { label: "Substrato", emoji: "🪴" },
  iluminação: { label: "Iluminação", emoji: "💡" },
  equipamentos: { label: "Equipamentos", emoji: "🔧" },
  sementes: { label: "Sementes", emoji: "🌱" },
  controle: { label: "Controle de Pragas", emoji: "🛡️" },
  outros: { label: "Outros", emoji: "📦" },
};

export const URGENCY_CONFIG: Record<
  ShoppingUrgency,
  { label: string; color: string; bg: string }
> = {
  urgent: {
    label: "Urgente",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
  },
  soon: {
    label: "Em breve",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
  },
  ok: {
    label: "Sem pressa",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
};

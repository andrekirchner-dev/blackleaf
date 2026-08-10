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
import type { GrowStage, Medium } from "./types";

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
}

export interface NutritionRecipe {
  id: string;
  userId: string;
  name: string;
  description?: string;
  medium: Medium;
  stage: GrowStage;
  ph: { min: number; max: number };
  ec: { min: number; max: number };
  waterAmount?: number;
  ingredients: RecipeIngredient[];
  notes?: string;
  createdAt: string;
}

const COLLECTION = "nutrition_recipes";

function normalize(id: string, data: Record<string, unknown>): NutritionRecipe {
  return { ...data, id } as NutritionRecipe;
}

export async function createRecipe(
  userId: string,
  data: Omit<NutritionRecipe, "id" | "userId" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    userId,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getRecipes(userId: string): Promise<NutritionRecipe[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalize(d.id, d.data() as Record<string, unknown>));
}

export async function deleteRecipe(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

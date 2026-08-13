import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export type TaskType = "rega" | "nutrientes" | "poda" | "inspecao" | "outro";
export type TaskRecurrence = "none" | "daily" | "every2days" | "weekly" | "biweekly";

export interface GrowTask {
  id: string;
  userId: string;
  title: string;
  type: TaskType;
  plantIds?: string[];
  dueDate: string;
  recurrence: TaskRecurrence;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

const COLLECTION = "grow_tasks";

function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

const p = (n: number) => String(n).padStart(2, "0");
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

function nextDueDate(current: string, recurrence: TaskRecurrence): string {
  switch (recurrence) {
    case "daily":     return addDays(current, 1);
    case "every2days": return addDays(current, 2);
    case "weekly":    return addDays(current, 7);
    case "biweekly":  return addDays(current, 14);
    default:          return current;
  }
}

function normalize(id: string, data: Record<string, unknown>): GrowTask {
  return { ...data, id } as GrowTask;
}

export async function createTask(
  userId: string,
  data: Omit<GrowTask, "id" | "userId" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), strip({
    ...data,
    userId,
    createdAt: new Date().toISOString(),
  }));
  return ref.id;
}

export async function getTasks(userId: string): Promise<GrowTask[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("dueDate", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalize(d.id, d.data() as Record<string, unknown>));
}

export async function updateTask(
  id: string,
  data: Partial<Omit<GrowTask, "id" | "userId" | "createdAt">>
): Promise<void> {
  await setDoc(doc(db, COLLECTION, id), strip(data), { merge: true });
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function completeTask(task: GrowTask): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, task.id),
    strip({ completed: true, completedAt: new Date().toISOString() }),
    { merge: true }
  );

  if (task.recurrence !== "none") {
    const nextDate = nextDueDate(task.dueDate, task.recurrence);
    await addDoc(collection(db, COLLECTION), strip({
      userId: task.userId,
      title: task.title,
      type: task.type,
      plantIds: task.plantIds ?? [],
      dueDate: nextDate,
      recurrence: task.recurrence,
      completed: false,
      notes: task.notes ?? "",
      createdAt: new Date().toISOString(),
    }));
  }
}

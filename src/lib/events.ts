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
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { GrowEvent, GrowEventType } from "./types";

const COLLECTION = "grow_events";

function normalize(id: string, data: Record<string, unknown>): GrowEvent {
  return {
    ...data,
    id,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string) ?? new Date().toISOString(),
  } as GrowEvent;
}

function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function createGrowEvent(
  userId: string,
  data: Omit<GrowEvent, "id" | "userId" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...strip(data),
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateGrowEvent(
  id: string,
  data: Partial<Omit<GrowEvent, "id" | "userId" | "createdAt">>
): Promise<void> {
  await setDoc(doc(db, COLLECTION, id), strip(data), { merge: true });
}

export async function deleteGrowEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getUserEvents(userId: string): Promise<GrowEvent[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("date", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalize(d.id, d.data() as Record<string, unknown>));
}

// --- Google Calendar integration ---

export interface GoogleTokenData {
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
}

export async function pushToGoogleCalendar(
  token: GoogleTokenData,
  event: { title: string; date: string; time?: string; notes?: string }
): Promise<string | null> {
  try {
    const start = event.time
      ? { dateTime: `${event.date}T${event.time}:00`, timeZone: "America/Sao_Paulo" }
      : { date: event.date };
    const end = event.time
      ? { dateTime: `${event.date}T${event.time}:00`, timeZone: "America/Sao_Paulo" }
      : { date: event.date };

    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.notes ?? "",
          start,
          end,
        }),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.id ?? null;
  } catch {
    return null;
  }
}

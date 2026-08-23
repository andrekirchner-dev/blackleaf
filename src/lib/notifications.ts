import { db } from "@/lib/firebase";
import {
  collection, query, orderBy, limit, getDocs, updateDoc, doc,
  writeBatch, where
} from "firebase/firestore";
import type { AppNotification } from "@/lib/types";

export async function getNotifications(userId: string, onlyUnread = false): Promise<AppNotification[]> {
  const col = collection(db, "notifications", userId, "items");
  const q = onlyUnread
    ? query(col, where("read", "==", false), orderBy("createdAt", "desc"), limit(50))
    : query(col, orderBy("createdAt", "desc"), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const col = collection(db, "notifications", userId, "items");
  const q = query(col, where("read", "==", false), limit(99));
  const snap = await getDocs(q);
  return snap.size;
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  await updateDoc(doc(db, "notifications", userId, "items", notificationId), { read: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const col = collection(db, "notifications", userId, "items");
  const q = query(col, where("read", "==", false), limit(99));
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}

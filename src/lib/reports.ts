import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  where,
  updateDoc,
} from "firebase/firestore";
import type { PostReport } from "@/lib/types";

export async function reportPost(
  reporterId: string,
  reporterHandle: string,
  postId: string,
  postPhotoUrl: string,
  reason: string
): Promise<void> {
  await addDoc(collection(db, "reports"), {
    postId,
    postPhotoUrl,
    reporterId,
    reporterHandle,
    reason,
    resolved: false,
    createdAt: serverTimestamp(),
  });
}

export async function getReports(onlyPending = true): Promise<PostReport[]> {
  const q = onlyPending
    ? query(
        collection(db, "reports"),
        where("resolved", "==", false),
        orderBy("createdAt", "desc"),
        limit(50)
      )
    : query(
        collection(db, "reports"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PostReport));
}

export async function resolveReport(reportId: string): Promise<void> {
  await updateDoc(doc(db, "reports", reportId), { resolved: true });
}

export async function deleteReport(reportId: string): Promise<void> {
  await deleteDoc(doc(db, "reports", reportId));
}

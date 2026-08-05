import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { WidgetId } from "./dashboard-widgets";

interface UserPreferences {
  dashboardLayout?: WidgetId[];
}

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const ref = doc(db, "user_preferences", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return {};
  return snap.data() as UserPreferences;
}

export async function saveDashboardLayout(userId: string, layout: WidgetId[]): Promise<void> {
  const ref = doc(db, "user_preferences", userId);
  await setDoc(ref, { dashboardLayout: layout }, { merge: true });
}

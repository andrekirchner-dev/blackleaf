import { db } from "./firebase";
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from "firebase/firestore";

export interface AdminStats {
  totalUsers: number;
  totalPlants: number;
  totalSpaces: number;
  totalHarvests: number;
  totalEvents: number;
  totalTasks: number;
  totalCosts: number;
}

export interface AdminUser {
  userId: string;
  handle: string;
  plants: number;
  spaces: number;
  harvests: number;
  lastActive: string | null;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [plants, spaces, harvests, events, tasks, costs] = await Promise.all([
    getDocs(collection(db, "plants")),
    getDocs(collection(db, "spaces")),
    getDocs(collection(db, "harvest_logs")),
    getDocs(collection(db, "grow_events")),
    getDocs(collection(db, "grow_tasks")),
    getDocs(collection(db, "grow_costs")),
  ]);

  const userIds = new Set<string>([
    ...plants.docs.map((d) => d.data().userId as string),
    ...spaces.docs.map((d) => d.data().userId as string),
  ]);

  return {
    totalUsers: userIds.size,
    totalPlants: plants.size,
    totalSpaces: spaces.size,
    totalHarvests: harvests.size,
    totalEvents: events.size,
    totalTasks: tasks.size,
    totalCosts: costs.size,
  };
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const [plantsSnap, spacesSnap, harvestsSnap, eventsSnap] = await Promise.all([
    getDocs(query(collection(db, "plants"), orderBy("createdAt", "desc"), limit(500))),
    getDocs(collection(db, "spaces")),
    getDocs(collection(db, "harvest_logs")),
    getDocs(query(collection(db, "grow_events"), orderBy("createdAt", "desc"), limit(1000))),
  ]);

  const map = new Map<string, AdminUser>();

  const ensure = (uid: string) => {
    if (!map.has(uid)) {
      map.set(uid, {
        userId: uid,
        handle: `grower_${uid.slice(-4)}`,
        plants: 0,
        spaces: 0,
        harvests: 0,
        lastActive: null,
      });
    }
    return map.get(uid)!;
  };

  for (const d of plantsSnap.docs) {
    const uid = d.data().userId as string;
    const u = ensure(uid);
    u.plants++;
    const ca = d.data().createdAt as string | null;
    if (ca && (!u.lastActive || ca > u.lastActive)) u.lastActive = ca;
  }

  for (const d of spacesSnap.docs) {
    ensure(d.data().userId as string).spaces++;
  }

  for (const d of harvestsSnap.docs) {
    ensure(d.data().userId as string).harvests++;
  }

  for (const d of eventsSnap.docs) {
    const uid = d.data().userId as string;
    const u = ensure(uid);
    const ca = d.data().createdAt as string | null;
    if (ca && (!u.lastActive || ca > u.lastActive)) u.lastActive = ca;
  }

  return Array.from(map.values()).sort((a, b) => b.plants - a.plants);
}

export interface AdminPlant {
  id: string;
  userId: string;
  name: string;
  strain: string;
  stage: string;
  archived: boolean;
  createdAt: string;
}

export async function getAdminPlants(): Promise<AdminPlant[]> {
  const snap = await getDocs(query(collection(db, "plants"), orderBy("createdAt", "desc"), limit(500)));
  return snap.docs.map((d) => ({
    id: d.id,
    userId: d.data().userId as string,
    name: d.data().name as string,
    strain: d.data().strain as string,
    stage: d.data().stage as string,
    archived: !!(d.data().archived as boolean),
    createdAt: d.data().createdAt as string,
  }));
}

export async function adminDeletePlant(plantId: string) {
  await deleteDoc(doc(db, "plants", plantId));
}

export interface DiagnosticResult {
  orphanedPlants: AdminPlant[];
  spaceIds: Set<string>;
}

export async function getAdminDiagnostics(): Promise<DiagnosticResult> {
  const [plantsSnap, spacesSnap] = await Promise.all([
    getDocs(collection(db, "plants")),
    getDocs(collection(db, "spaces")),
  ]);

  const spaceIds = new Set(spacesSnap.docs.map((d) => d.id));

  const orphanedPlants: AdminPlant[] = plantsSnap.docs
    .filter((d) => {
      const sid = d.data().spaceId as string | undefined;
      return sid && !spaceIds.has(sid);
    })
    .map((d) => ({
      id: d.id,
      userId: d.data().userId as string,
      name: d.data().name as string,
      strain: d.data().strain as string,
      stage: d.data().stage as string,
      archived: !!(d.data().archived as boolean),
      createdAt: d.data().createdAt as string,
    }));

  return { orphanedPlants, spaceIds };
}

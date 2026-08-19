import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import type { GrowSpace, Plant, HarvestLog } from "./types";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface PublicSpace extends Pick<GrowSpace, "id" | "userId" | "name" | "type" | "widthCm" | "depthCm" | "heightCm" | "lightType" | "lightWatts" | "createdAt"> {}

export interface PublicPlant extends Pick<Plant, "id" | "userId" | "spaceId" | "name" | "strain" | "genetics" | "stage" | "environment" | "medium" | "germinationDate" | "stageChangedAt" | "photoUrl" | "createdAt"> {
  bank?: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  handle: string;
  photoUrl: string;
  caption: string;
  plantSnapshots: { id: string; name: string; strain: string; stage: string }[];
  medium?: string;
  lightType?: string;
  weekOfGrow?: number;
  createdAt: string;
}

export interface UserProfileData {
  userId: string;
  handle: string;
  bio?: string;
  avatarUrl?: string;
  updatedAt?: string;
}

export interface UserPublicProfile {
  userId: string;
  handle: string;
  bio?: string;
  avatarUrl?: string;
  activePlants: PublicPlant[];
  spaces: PublicSpace[];
  harvestCount: number;
  firstGrowDate: string | null;
  totalDryWeightG: number;
  recentPosts: CommunityPost[];
}

// Legacy type kept for any remaining imports
export interface CommunityUser {
  userId: string;
  handle: string;
  spaces: PublicSpace[];
  plants: PublicPlant[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripSensitive(doc: object, sensitiveKeys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = { ...doc };
  for (const k of sensitiveKeys) delete out[k];
  return out;
}

const PLANT_SENSITIVE = ["notes", "previousGrowNotes", "bankRecommendations", "effects", "terpenes"];
const SPACE_SENSITIVE = ["notes"];
const POSTS_COLLECTION = "communityPosts";

export function makeHandle(userId: string) {
  return `grower_${userId.slice(-4)}`;
}

// ─── User profile ─────────────────────────────────────────────────────────────

export async function getUserProfileData(userId: string): Promise<UserProfileData | null> {
  const snap = await getDoc(doc(db, "userProfiles", userId));
  if (!snap.exists()) return null;
  return { userId, ...snap.data() } as UserProfileData;
}

export async function upsertUserProfileData(
  userId: string,
  data: Partial<Omit<UserProfileData, "userId" | "updatedAt">>
): Promise<void> {
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  await setDoc(
    doc(db, "userProfiles", userId),
    { ...clean, userId, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function createCommunityPost(
  userId: string,
  data: Omit<CommunityPost, "id" | "userId" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, POSTS_COLLECTION), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getCommunityPosts(limitCount = 60): Promise<CommunityPost[]> {
  const q = query(
    collection(db, POSTS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityPost));
}

export async function getUserPosts(userId: string, limitCount = 12): Promise<CommunityPost[]> {
  const q = query(
    collection(db, POSTS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityPost));
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getUserPublicProfile(userId: string): Promise<UserPublicProfile | null> {
  const [spacesSnap, plantsSnap, harvestsSnap, postsSnap, profileSnap] = await Promise.all([
    getDocs(query(collection(db, "spaces"), where("userId", "==", userId))),
    getDocs(query(collection(db, "plants"), where("userId", "==", userId))),
    getDocs(query(collection(db, "harvest_logs"), where("userId", "==", userId))),
    getDocs(query(
      collection(db, POSTS_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(9)
    )),
    getDoc(doc(db, "userProfiles", userId)),
  ]);

  const profileData = profileSnap.exists() ? (profileSnap.data() as UserProfileData) : null;

  const spaces: PublicSpace[] = spacesSnap.docs.map((d) => {
    const raw = { id: d.id, ...d.data() } as GrowSpace;
    return stripSensitive(raw, SPACE_SENSITIVE) as unknown as PublicSpace;
  });

  const allPlants = plantsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Plant));
  const activePlants: PublicPlant[] = allPlants
    .filter((p) => !p.archived)
    .map((p) => stripSensitive(p, PLANT_SENSITIVE) as unknown as PublicPlant);

  const harvests = harvestsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as HarvestLog));
  const harvestCount = harvests.length;
  const totalDryWeightG = harvests.reduce((sum, h) => sum + (h.dryWeightG ?? 0), 0);

  // First grow date: earliest germination or creation date across all plants
  const allDates = allPlants
    .map((p) => p.germinationDate || p.createdAt)
    .filter(Boolean)
    .sort();
  const firstGrowDate = allDates[0] ?? null;

  const recentPosts: CommunityPost[] = postsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityPost));

  return {
    userId,
    handle: profileData?.handle ?? makeHandle(userId),
    bio: profileData?.bio,
    avatarUrl: profileData?.avatarUrl,
    activePlants,
    spaces,
    harvestCount,
    firstGrowDate,
    totalDryWeightG,
    recentPosts,
  };
}

// ─── Legacy feed (kept for reference) ────────────────────────────────────────

export async function getCommunityFeed(): Promise<CommunityUser[]> {
  const [spacesSnap, plantsSnap] = await Promise.all([
    getDocs(query(collection(db, "spaces"), orderBy("createdAt", "desc"), limit(200))),
    getDocs(query(collection(db, "plants"), orderBy("createdAt", "desc"), limit(500))),
  ]);

  const spaces: PublicSpace[] = spacesSnap.docs.map((d) => {
    const raw = { id: d.id, ...d.data() } as GrowSpace;
    return stripSensitive(raw, SPACE_SENSITIVE) as unknown as PublicSpace;
  });

  const plants: PublicPlant[] = plantsSnap.docs
    .filter((d) => !(d.data() as Plant).archived)
    .map((d) => {
      const raw = { id: d.id, ...d.data() } as Plant;
      return stripSensitive(raw, PLANT_SENSITIVE) as unknown as PublicPlant;
    });

  const userMap = new Map<string, CommunityUser>();

  for (const space of spaces) {
    if (!userMap.has(space.userId)) {
      userMap.set(space.userId, { userId: space.userId, handle: makeHandle(space.userId), spaces: [], plants: [] });
    }
    userMap.get(space.userId)!.spaces.push(space);
  }

  for (const plant of plants) {
    if (!userMap.has(plant.userId)) {
      userMap.set(plant.userId, { userId: plant.userId, handle: makeHandle(plant.userId), spaces: [], plants: [] });
    }
    userMap.get(plant.userId)!.plants.push(plant);
  }

  return Array.from(userMap.values());
}

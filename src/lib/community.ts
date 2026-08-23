import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
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
  avatarUrl?: string;
  photoUrl: string;
  caption: string;
  plantSnapshots: { id: string; name: string; strain: string; stage: string }[];
  medium?: string;
  lightType?: string;
  weekOfGrow?: number;
  likesCount: number;
  commentsCount: number;
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
  data: Omit<CommunityPost, "id" | "userId" | "createdAt" | "likesCount" | "commentsCount">
): Promise<string> {
  const ref = await addDoc(collection(db, POSTS_COLLECTION), {
    ...data,
    userId,
    likesCount: 0,
    commentsCount: 0,
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

export async function getTopCommunityPosts(limitN = 30): Promise<CommunityPost[]> {
  const q = query(
    collection(db, POSTS_COLLECTION),
    orderBy("likesCount", "desc"),
    limit(limitN)
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

export async function deleteCommunityPost(postId: string): Promise<void> {
  await deleteDoc(doc(db, POSTS_COLLECTION, postId));
}

// ─── Likes ────────────────────────────────────────────────────────────────────

export async function likePost(userId: string, postId: string): Promise<void> {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const likeRef = doc(db, POSTS_COLLECTION, postId, "likes", userId);
  await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef);
    if (likeSnap.exists()) return;
    const postSnap = await tx.get(postRef);
    const current = (postSnap.data()?.likesCount ?? 0) as number;
    tx.set(likeRef, { userId, createdAt: serverTimestamp() });
    tx.update(postRef, { likesCount: current + 1 });
  });
  const postSnap = await getDoc(postRef);
  const ownerId = postSnap.data()?.userId as string | undefined;
  if (ownerId && ownerId !== userId) {
    const profileSnap = await getDoc(doc(db, "userProfiles", userId));
    const fromHandle = (profileSnap.data()?.handle as string | undefined) ?? "grower";
    const fromAvatarUrl = (profileSnap.data()?.avatarUrl as string | undefined) ?? null;
    await addDoc(collection(db, "notifications", ownerId, "items"), {
      type: "like",
      fromUserId: userId,
      fromHandle,
      fromAvatarUrl,
      postId,
      postPhotoUrl: (postSnap.data()?.photoUrl as string | undefined) ?? null,
      read: false,
      createdAt: serverTimestamp(),
    });
  }
}

export async function unlikePost(userId: string, postId: string): Promise<void> {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const likeRef = doc(db, POSTS_COLLECTION, postId, "likes", userId);
  await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef);
    if (!likeSnap.exists()) return;
    const postSnap = await tx.get(postRef);
    const current = (postSnap.data()?.likesCount ?? 1) as number;
    tx.delete(likeRef);
    tx.update(postRef, { likesCount: Math.max(0, current - 1) });
  });
}

export async function isPostLiked(userId: string, postId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, POSTS_COLLECTION, postId, "likes", userId));
  return snap.exists();
}

export async function getPostsLikedByUser(userId: string, postIds: string[]): Promise<Set<string>> {
  const liked = new Set<string>();
  await Promise.all(
    postIds.map(async (postId) => {
      const snap = await getDoc(doc(db, POSTS_COLLECTION, postId, "likes", userId));
      if (snap.exists()) liked.add(postId);
    })
  );
  return liked;
}

// ─── Comments ─────────────────────────────────────────────────────────────────

import type { CommunityComment } from "@/lib/types";

export async function addComment(
  userId: string,
  postId: string,
  text: string,
  handle: string,
  avatarUrl?: string
): Promise<string> {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const commentRef = await addDoc(collection(db, POSTS_COLLECTION, postId, "comments"), {
    postId,
    userId,
    handle,
    avatarUrl: avatarUrl ?? null,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(postRef);
    const current = (snap.data()?.commentsCount ?? 0) as number;
    tx.update(postRef, { commentsCount: current + 1 });
  });
  const postSnap = await getDoc(postRef);
  const ownerId = postSnap.data()?.userId as string | undefined;
  if (ownerId && ownerId !== userId) {
    await addDoc(collection(db, "notifications", ownerId, "items"), {
      type: "comment",
      fromUserId: userId,
      fromHandle: handle,
      fromAvatarUrl: avatarUrl ?? null,
      postId,
      postPhotoUrl: (postSnap.data()?.photoUrl as string | undefined) ?? null,
      read: false,
      createdAt: serverTimestamp(),
    });
  }
  return commentRef.id;
}

export async function getComments(postId: string): Promise<CommunityComment[]> {
  const q = query(
    collection(db, POSTS_COLLECTION, postId, "comments"),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityComment));
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await deleteDoc(doc(db, POSTS_COLLECTION, postId, "comments", commentId));
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(postRef);
    const current = (snap.data()?.commentsCount ?? 1) as number;
    tx.update(postRef, { commentsCount: Math.max(0, current - 1) });
  });
}

// ─── Saved posts ──────────────────────────────────────────────────────────────

import type { SavedPost } from "@/lib/types";

export async function savePost(userId: string, postId: string, postPhotoUrl: string): Promise<void> {
  await setDoc(doc(db, "savedPosts", userId, "posts", postId), {
    userId,
    postId,
    postPhotoUrl,
    createdAt: serverTimestamp(),
  });
}

export async function unsavePost(userId: string, postId: string): Promise<void> {
  await deleteDoc(doc(db, "savedPosts", userId, "posts", postId));
}

export async function isPostSaved(userId: string, postId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "savedPosts", userId, "posts", postId));
  return snap.exists();
}

export async function getSavedPosts(userId: string): Promise<SavedPost[]> {
  const q = query(
    collection(db, "savedPosts", userId, "posts"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavedPost));
}

export async function getSavedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
  const saved = new Set<string>();
  await Promise.all(
    postIds.map(async (postId) => {
      const snap = await getDoc(doc(db, "savedPosts", userId, "posts", postId));
      if (snap.exists()) saved.add(postId);
    })
  );
  return saved;
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

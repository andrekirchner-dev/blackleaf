import { db } from "@/lib/firebase";
import {
  doc, setDoc, deleteDoc, getDoc, getDocs,
  collection, query, limit,
  runTransaction, serverTimestamp, addDoc
} from "firebase/firestore";
import type { CommunityFollow } from "@/lib/types";

// Re-export so callers can import the type from here if needed
export type { CommunityFollow };

export async function followUser(followerId: string, targetUserId: string): Promise<void> {
  if (followerId === targetUserId) return;

  // Write to both following and followers subcollections
  const followingRef = doc(db, "userFollows", followerId, "following", targetUserId);
  const followerRef  = doc(db, "userFollows", targetUserId, "followers", followerId);

  await Promise.all([
    setDoc(followingRef, { followerId, targetUserId, createdAt: serverTimestamp() }),
    setDoc(followerRef,  { followerId, targetUserId, createdAt: serverTimestamp() }),
  ]);

  // Increment counters on userProfiles
  const followerProfile = doc(db, "userProfiles", followerId);
  const targetProfile   = doc(db, "userProfiles", targetUserId);
  await runTransaction(db, async (tx) => {
    const fSnap = await tx.get(followerProfile);
    const tSnap = await tx.get(targetProfile);
    tx.update(followerProfile, { followingCount: (fSnap.data()?.followingCount ?? 0) + 1 });
    tx.update(targetProfile,   { followersCount: (tSnap.data()?.followersCount  ?? 0) + 1 });
  });

  // Send follow notification
  const fromProfileSnap = await getDoc(followerProfile);
  await addDoc(collection(db, "notifications", targetUserId, "items"), {
    type: "follow",
    fromUserId: followerId,
    fromHandle: fromProfileSnap.data()?.handle ?? "grower",
    fromAvatarUrl: fromProfileSnap.data()?.avatarUrl ?? null,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function unfollowUser(followerId: string, targetUserId: string): Promise<void> {
  const followingRef = doc(db, "userFollows", followerId, "following", targetUserId);
  const followerRef  = doc(db, "userFollows", targetUserId, "followers", followerId);

  await Promise.all([deleteDoc(followingRef), deleteDoc(followerRef)]);

  // Decrement counters
  const followerProfile = doc(db, "userProfiles", followerId);
  const targetProfile   = doc(db, "userProfiles", targetUserId);
  await runTransaction(db, async (tx) => {
    const fSnap = await tx.get(followerProfile);
    const tSnap = await tx.get(targetProfile);
    tx.update(followerProfile, { followingCount: Math.max(0, (fSnap.data()?.followingCount ?? 1) - 1) });
    tx.update(targetProfile,   { followersCount:  Math.max(0, (tSnap.data()?.followersCount  ?? 1) - 1) });
  });
}

export async function isFollowing(followerId: string, targetUserId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "userFollows", followerId, "following", targetUserId));
  return snap.exists();
}

export async function getFollowersCount(userId: string): Promise<number> {
  const snap = await getDoc(doc(db, "userProfiles", userId));
  return (snap.data()?.followersCount as number | undefined) ?? 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const snap = await getDoc(doc(db, "userProfiles", userId));
  return (snap.data()?.followingCount as number | undefined) ?? 0;
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const q = query(collection(db, "userFollows", userId, "following"), limit(500));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.id);
}

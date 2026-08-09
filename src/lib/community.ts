import { db } from "./firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import type { GrowSpace, Plant } from "./types";

export interface PublicSpace extends Pick<GrowSpace, "id" | "userId" | "name" | "type" | "widthCm" | "depthCm" | "heightCm" | "lightType" | "lightWatts" | "createdAt"> {}

export interface PublicPlant extends Pick<Plant, "id" | "userId" | "spaceId" | "name" | "strain" | "genetics" | "stage" | "environment" | "germinationDate" | "stageChangedAt" | "photoUrl" | "createdAt"> {
  bank?: string;
}

export interface CommunityUser {
  userId: string;
  handle: string;
  spaces: PublicSpace[];
  plants: PublicPlant[];
}

function stripSensitive(doc: object, sensitiveKeys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = { ...doc };
  for (const k of sensitiveKeys) delete out[k];
  return out;
}

const PLANT_SENSITIVE = ["notes", "previousGrowNotes", "bankRecommendations", "effects", "terpenes"];
const SPACE_SENSITIVE = ["notes"];

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
      userMap.set(space.userId, {
        userId: space.userId,
        handle: `grower_${space.userId.slice(-4)}`,
        spaces: [],
        plants: [],
      });
    }
    userMap.get(space.userId)!.spaces.push(space);
  }

  for (const plant of plants) {
    if (!userMap.has(plant.userId)) {
      userMap.set(plant.userId, {
        userId: plant.userId,
        handle: `grower_${plant.userId.slice(-4)}`,
        spaces: [],
        plants: [],
      });
    }
    userMap.get(plant.userId)!.plants.push(plant);
  }

  return Array.from(userMap.values());
}

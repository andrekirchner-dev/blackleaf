export type GrowStage = "semente" | "muda" | "vegetativo" | "floracao" | "colheita" | "secagem";
export type GrowEnv = "indoor" | "outdoor" | "greenhouse";
export type Medium = "terra" | "coco" | "hidro" | "aeroponia";

export interface Plant {
  id: string;
  userId: string;
  name: string;
  strain: string;
  stage: GrowStage;
  environment: GrowEnv;
  medium: Medium;
  germinationDate: string;
  stageChangedAt: string;
  potSize?: number;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiaryEntry {
  id: string;
  plantId: string;
  userId: string;
  date: string;
  type: "rega" | "nutrientes" | "poda" | "treinamento" | "observacao" | "foto";
  notes: string;
  ph?: number;
  ec?: number;
  waterAmount?: number;
  photoUrl?: string;
  createdAt: string;
}

export interface GrowEnvironment {
  id: string;
  userId: string;
  name: string;
  temperature?: number;
  humidity?: number;
  co2?: number;
  lightSchedule?: string;
  recordedAt: string;
}

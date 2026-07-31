export type GrowStage = "semente" | "muda" | "vegetativo" | "floracao" | "colheita" | "secagem";
export type GrowEnv = "indoor" | "outdoor" | "greenhouse";
export type Medium = "terra" | "coco" | "hidro" | "aeroponia";
export type SpaceType = "tenda" | "armario" | "quarto" | "estufa";
export type LightType = "led" | "hps" | "cmh" | "cfl" | "fluorescente" | "natural";
export type GeneticType = "sativa" | "indica" | "hibrida" | "autoflowering";

export interface GrowSpace {
  id: string;
  userId: string;
  name: string;
  type: SpaceType;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  lightType: LightType;
  lightWatts?: number;
  lightSchedule: string;
  ventInputs: number;
  ventOutputs: number;
  notes?: string;
  createdAt: string;
}

export interface Plant {
  id: string;
  userId: string;
  spaceId?: string;
  name: string;
  strain: string;
  bank?: string;
  genetics?: GeneticType;
  floweringWeeks?: number;
  thcEstimate?: string;
  cbdEstimate?: string;
  yieldIndoor?: string;
  yieldOutdoor?: string;
  bankRecommendations?: string;
  previousGrowNotes?: string;
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

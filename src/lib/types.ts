export type GrowStage = "semente" | "muda" | "vegetativo" | "floracao" | "colheita" | "secagem";
export type GrowEnv = "indoor" | "outdoor" | "greenhouse";
export type Medium = "terra" | "coco" | "hidro" | "aeroponia";
export type SpaceType = "tenda" | "armario" | "quarto" | "estufa";
export type LightType = "led" | "hps" | "cmh" | "cfl" | "fluorescente" | "natural";
export type GeneticType = "sativa" | "indica" | "hibrida" | "autoflowering";
export type VentRole = "entrada" | "saida" | "circulacao";
export type VentType = "inline" | "axial" | "clip" | "extrator" | "oscilante";
export type FeedingType = "organico" | "organomineral" | "mineral" | "hidroponico";

export interface VentilationUnit {
  id: string;
  role: VentRole;
  type: VentType;
  sizeMm?: number;
  label?: string;
}

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
  ventilations?: VentilationUnit[];
  notes?: string;
  createdAt: string;
}

export interface GrowStyleEvent {
  weekOffset: number;
  label: string;
  emoji: string;
  type: "milestone" | "action" | "warning";
}

export interface GrowStyle {
  id: string;
  userId: string;
  name: string;
  description?: string;
  feedingType: FeedingType;
  vegWeeks: number;
  isPreset?: boolean;
  events: GrowStyleEvent[];
  createdAt: string;
}

export interface Plant {
  id: string;
  userId: string;
  spaceId?: string;
  growStyleId?: string;
  name: string;
  strain: string;
  bank?: string;
  genetics?: GeneticType;
  geneticsCross?: string;
  floweringWeeks?: number;
  vegWeeks?: number;
  thcEstimate?: string;
  cbdEstimate?: string;
  effects?: string;
  terpenes?: string;
  yieldIndoor?: string;
  yieldOutdoor?: string;
  heightIndoor?: string;
  heightOutdoor?: string;
  harvestMonth?: string;
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
  phRunoff?: number;
  ec?: number;
  waterAmount?: number;
  photoUrl?: string;
  createdAt: string;
}

export interface GrowEnvironment {
  id: string;
  userId: string;
  spaceId?: string;
  temperature?: number;
  humidity?: number;
  co2?: number;
  recordedAt: string;
}

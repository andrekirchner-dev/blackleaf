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

export type GrowEventType =
  | "poda" | "treino" | "rega_fertilizante" | "rega"
  | "flush_pre_flip" | "flush_pre_colheita" | "escuridao"
  | "colheita" | "secagem" | "germinacao" | "transplante"
  | "top_dress" | "retirar_clones" | "cura" | "defoliacao"
  | "run_off";

export type WaterIrrigationType = "manual" | "gotejamento" | "aspersao" | "automatico";

export type PruningType =
  | "topping" | "fim" | "lollipopping" | "desbaste" | "mainlining" | "schwazzing";

export interface GrowEvent {
  id: string;
  userId: string;
  plantId?: string;
  plantIds?: string[];
  type: GrowEventType;
  pruningType?: PruningType;
  date: string;
  time?: string;
  notes?: string;
  googleEventId?: string;
  // Water fields (rega, rega_fertilizante, run_off)
  waterAmount?: number;
  irrigationType?: WaterIrrigationType;
  fertilizersUsed?: DiaryFertilizerUsage[];
  ph?: number;
  ppm?: number;
  phRunoff?: number;
  ppmRunoff?: number;
  createdAt: string;
}

export interface HarvestLog {
  id: string;
  userId: string;
  plantId?: string;
  plantName: string;
  strain: string;
  harvestDate: string; // YYYY-MM-DD
  wetWeightG?: number;
  dryWeightG?: number;
  curedWeightG?: number;
  floweringWeeks?: number;
  notes?: string;
  rating?: number; // 1-5
  trichomeStage?: "transparente" | "leitoso" | "ambar_50" | "ambar_100";
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
  sativaPercent?: number;
  indicaPercent?: number;
  ruderalisPercent?: number;
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
  // Per-phase planned durations (weeks). Used by calendar and phase tracker.
  germWeeks?: number;
  seedlingWeeks?: number;
  harvestWeeks?: number;
  dryingWeeks?: number;
  notes?: string;
  photoUrl?: string;
  photos?: string[];
  archived?: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type FertilizerType =
  | "organico"
  | "mineral"
  | "organomineral"
  | "knf"
  | "bioestimulante"
  | "pk_boost"
  | "cal_mag"
  | "radicular"
  | "foliar";

export interface FertilizerDoses {
  muda?: number;
  vegetativo?: number;
  floracao_inicio?: number;
  floracao_meio?: number;
  floracao_fim?: number;
}

export interface Fertilizer {
  id: string;
  userId: string;
  name: string;
  brand?: string;
  type: FertilizerType;
  npkN?: number;
  npkP?: number;
  npkK?: number;
  secondaryNutrients?: string;
  ecPerMl?: number;
  doses: FertilizerDoses;
  applicationFrequency?: string;
  notes?: string;
  createdAt: string;
}

export interface DiaryFertilizerUsage {
  fertilizerId: string;
  name: string;
  mlPerLiter: number;
}

export interface DiaryEntry {
  id: string;
  plantId: string;
  userId: string;
  date: string;
  type: GrowEventType | "nutrientes" | "observacao" | "treinamento" | "foto";
  pruningType?: PruningType;
  notes: string;
  ph?: number;
  ppm?: number;
  phRunoff?: number;
  ppmRunoff?: number;
  ec?: number;
  waterAmount?: number;
  irrigationType?: WaterIrrigationType;
  fertilizersUsed?: DiaryFertilizerUsage[];
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

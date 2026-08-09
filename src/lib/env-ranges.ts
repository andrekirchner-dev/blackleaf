import type { GrowStage } from "./types";

export interface EnvRange {
  min: number;
  max: number;
}

export interface StageEnvRanges {
  temperature: EnvRange;
  humidity: EnvRange;
  vpd: EnvRange;
  co2: EnvRange;
  ph: EnvRange;
}

export const STAGE_ENV_RANGES: Record<GrowStage, StageEnvRanges> = {
  semente: {
    temperature: { min: 22, max: 26 },
    humidity:    { min: 65, max: 80 },
    vpd:         { min: 0.4, max: 0.8 },
    co2:         { min: 400, max: 800 },
    ph:          { min: 6.0, max: 7.0 },
  },
  muda: {
    temperature: { min: 20, max: 25 },
    humidity:    { min: 60, max: 75 },
    vpd:         { min: 0.4, max: 0.8 },
    co2:         { min: 700, max: 1000 },
    ph:          { min: 5.8, max: 6.8 },
  },
  vegetativo: {
    temperature: { min: 22, max: 28 },
    humidity:    { min: 50, max: 70 },
    vpd:         { min: 0.8, max: 1.2 },
    co2:         { min: 1000, max: 1500 },
    ph:          { min: 5.8, max: 6.8 },
  },
  floracao: {
    temperature: { min: 20, max: 26 },
    humidity:    { min: 40, max: 55 },
    vpd:         { min: 1.0, max: 1.5 },
    co2:         { min: 1200, max: 1500 },
    ph:          { min: 5.8, max: 6.8 },
  },
  colheita: {
    temperature: { min: 18, max: 24 },
    humidity:    { min: 30, max: 45 },
    vpd:         { min: 1.2, max: 1.6 },
    co2:         { min: 400, max: 800 },
    ph:          { min: 5.8, max: 6.8 },
  },
  secagem: {
    temperature: { min: 18, max: 22 },
    humidity:    { min: 45, max: 55 },
    vpd:         { min: 0.8, max: 1.2 },
    co2:         { min: 400, max: 800 },
    ph:          { min: 5.8, max: 6.8 },
  },
};

export const STAGE_RANGE_LABELS: Record<GrowStage, string> = {
  semente:    "Semente",
  muda:       "Muda",
  vegetativo: "Vegetativo",
  floracao:   "Floração",
  colheita:   "Colheita",
  secagem:    "Secagem",
};

export const STAGE_RANGE_EMOJI: Record<GrowStage, string> = {
  semente:    "🌱",
  muda:       "🌿",
  vegetativo: "🍃",
  floracao:   "🌸",
  colheita:   "✂️",
  secagem:    "🍂",
};

import type { SpaceType, LightType } from "./types";

export const SPACE_TYPES: { value: SpaceType; label: string; emoji: string }[] = [
  { value: "tenda",   label: "Tenda",    emoji: "⛺" },
  { value: "armario", label: "Armário",  emoji: "🚪" },
  { value: "quarto",  label: "Quarto",   emoji: "🏠" },
  { value: "estufa",  label: "Estufa",   emoji: "🌿" },
];

export const LIGHT_TYPES: { value: LightType; label: string; color: string }[] = [
  { value: "led",          label: "LED",          color: "text-blue-400" },
  { value: "hps",          label: "HPS",          color: "text-yellow-400" },
  { value: "cmh",          label: "CMH / LEC",    color: "text-orange-400" },
  { value: "cfl",          label: "CFL",          color: "text-cyan-400" },
  { value: "fluorescente", label: "Fluorescente", color: "text-green-400" },
  { value: "natural",      label: "Luz Natural",  color: "text-accent" },
];

export const LIGHT_SCHEDULES = [
  { value: "20/4", label: "20/4 — Auto/Clone" },
  { value: "18/6", label: "18/6 — Vegetativo" },
  { value: "12/12", label: "12/12 — Floração" },
  { value: "natural", label: "Natural — Outdoor" },
];

export function getLightMeta(type: LightType) {
  return LIGHT_TYPES.find((l) => l.value === type) ?? LIGHT_TYPES[0];
}

export function getSpaceMeta(type: SpaceType) {
  return SPACE_TYPES.find((s) => s.value === type) ?? SPACE_TYPES[0];
}

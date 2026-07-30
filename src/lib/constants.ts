import type { GrowStage, GrowEnv, Medium } from "./types";

export const STAGE_LABELS: Record<GrowStage, string> = {
  semente: "Semente",
  muda: "Muda",
  vegetativo: "Vegetativo",
  floracao: "Floração",
  colheita: "Colheita",
  secagem: "Secagem",
};

export const STAGE_ORDER: GrowStage[] = [
  "semente",
  "muda",
  "vegetativo",
  "floracao",
  "colheita",
  "secagem",
];

export const STAGE_COLORS: Record<GrowStage, string> = {
  semente: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  muda: "bg-lime-500/10 text-lime-400 border-lime-500/30",
  vegetativo: "bg-green-500/10 text-green-400 border-green-500/30",
  floracao: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  colheita: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  secagem: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

export const STAGE_DOT: Record<GrowStage, string> = {
  semente: "bg-yellow-400",
  muda: "bg-lime-400",
  vegetativo: "bg-green-400",
  floracao: "bg-orange-400",
  colheita: "bg-amber-400",
  secagem: "bg-zinc-400",
};

export const ENV_LABELS: Record<GrowEnv, string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  greenhouse: "Greenhouse",
};

export const MEDIUM_LABELS: Record<Medium, string> = {
  terra: "Terra",
  coco: "Fibra de Coco",
  hidro: "Hidropônico",
  aeroponia: "Aeroponia",
};

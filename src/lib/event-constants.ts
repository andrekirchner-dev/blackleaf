import type { GrowEventType } from "./types";

export const GROW_EVENT_TYPES: {
  value: GrowEventType;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}[] = [
  { value: "germinacao",        label: "Germinação",           emoji: "🌱", color: "text-green-400",   bg: "bg-green-400/10 border-green-400/30" },
  { value: "transplante",       label: "Transplante",          emoji: "🪴", color: "text-lime-400",    bg: "bg-lime-400/10 border-lime-400/30" },
  { value: "poda",              label: "Poda",                 emoji: "✂️", color: "text-yellow-400",  bg: "bg-yellow-400/10 border-yellow-400/30" },
  { value: "defoliacao",        label: "Defoliação",           emoji: "🍃", color: "text-green-400",   bg: "bg-green-400/10 border-green-400/30" },
  { value: "treino",            label: "Treinamento",          emoji: "🪢", color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/30" },
  { value: "retirar_clones",    label: "Retirar Clones",       emoji: "🔬", color: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/30" },
  { value: "top_dress",         label: "Top Dress",            emoji: "🌿", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
  { value: "rega",              label: "Rega",                 emoji: "💧", color: "text-cyan-400",    bg: "bg-cyan-400/10 border-cyan-400/30" },
  { value: "rega_fertilizante", label: "Rega c/ Fertilizante", emoji: "🧪", color: "text-teal-400",   bg: "bg-teal-400/10 border-teal-400/30" },
  { value: "flush_pre_flip",    label: "Flush Pré-Flip",       emoji: "🚿", color: "text-sky-400",     bg: "bg-sky-400/10 border-sky-400/30" },
  { value: "flush_pre_colheita",label: "Flush Pré-Colheita",   emoji: "🚿", color: "text-indigo-400",  bg: "bg-indigo-400/10 border-indigo-400/30" },
  { value: "escuridao",         label: "Período de Escuridão", emoji: "🌑", color: "text-slate-400",   bg: "bg-slate-400/10 border-slate-400/30" },
  { value: "colheita",          label: "Colheita",             emoji: "🌾", color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/30" },
  { value: "secagem",           label: "Secagem",              emoji: "🍂", color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/30" },
  { value: "cura",              label: "Cura",                 emoji: "🫙", color: "text-rose-400",    bg: "bg-rose-400/10 border-rose-400/30" },
  { value: "run_off",           label: "Run Off",              emoji: "🔵", color: "text-blue-300",    bg: "bg-blue-300/10 border-blue-300/30" },
  { value: "flip",              label: "Flip (Veg → Floração)", emoji: "🔄", color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/30" },
  { value: "flip_verificacao",  label: "Flip de Verificação",  emoji: "🔍", color: "text-violet-400",  bg: "bg-violet-400/10 border-violet-400/30" },
];

export const EVENT_BY_TYPE = Object.fromEntries(
  GROW_EVENT_TYPES.map((e) => [e.value, e])
) as Record<GrowEventType, (typeof GROW_EVENT_TYPES)[number]>;

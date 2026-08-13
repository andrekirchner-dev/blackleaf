import type { PruningType } from "./types";

export const PRUNING_TYPES: { value: PruningType; label: string; desc: string }[] = [
  { value: "topping",      label: "Topping",      desc: "Corte do ápice principal" },
  { value: "fim",          label: "FIM",           desc: "Corte parcial do ápice" },
  { value: "lollipopping", label: "Lollipopping",  desc: "Remoção dos galhos baixeiros" },
  { value: "desbaste",     label: "Desbaste",      desc: "Limpeza de galhos fracos" },
  { value: "mainlining",   label: "Mainlining",    desc: "Divisão em manifold" },
  { value: "schwazzing",   label: "Schwazzing",    desc: "Defoliação agressiva" },
];

export const PRUNING_BY_TYPE = Object.fromEntries(
  PRUNING_TYPES.map((p) => [p.value, p])
) as Record<PruningType, (typeof PRUNING_TYPES)[number]>;

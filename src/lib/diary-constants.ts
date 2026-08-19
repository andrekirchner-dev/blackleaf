import { GROW_EVENT_TYPES } from "./event-constants";
import type { DiaryEntry } from "./types";

export type EntryType = DiaryEntry["type"];

// All diary entry types: event types + diary-only types
export const DIARY_ENTRY_TYPES: { value: EntryType; label: string; emoji: string; color: string; bg: string }[] = [
  ...GROW_EVENT_TYPES,
  { value: "nutrientes",  label: "Nutrientes",  emoji: "🧪", color: "text-purple-400",         bg: "bg-purple-400/10 border-purple-400/30" },
  { value: "observacao",  label: "Observação",  emoji: "📝", color: "text-muted-foreground",    bg: "bg-muted/30 border-border" },
  { value: "treinamento", label: "Treinamento", emoji: "🌀", color: "text-yellow-400",          bg: "bg-yellow-400/10 border-yellow-400/30" },
];

const BY_TYPE = Object.fromEntries(
  DIARY_ENTRY_TYPES.map((t) => [t.value, t])
) as Record<string, (typeof DIARY_ENTRY_TYPES)[number]>;

const FALLBACK = { value: "observacao", label: "Observação", emoji: "📝", color: "text-muted-foreground", bg: "bg-muted/30 border-border" } as const;

export function getEntryMeta(type: string) {
  return BY_TYPE[type] ?? FALLBACK;
}

// Legacy alias kept for any remaining imports
export const ENTRY_TYPES = DIARY_ENTRY_TYPES;

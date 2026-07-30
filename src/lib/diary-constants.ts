import type { DiaryEntry } from "./types";

export type EntryType = DiaryEntry["type"];

export const ENTRY_TYPES: { value: EntryType; label: string; emoji: string; color: string }[] = [
  { value: "rega",        label: "Rega",        emoji: "💧", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  { value: "nutrientes",  label: "Nutrientes",  emoji: "🧪", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  { value: "poda",        label: "Poda",        emoji: "✂️", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  { value: "treinamento", label: "Treinamento", emoji: "🌀", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  { value: "observacao",  label: "Observação",  emoji: "📝", color: "text-muted-foreground bg-muted/50 border-border" },
  { value: "foto",        label: "Foto",        emoji: "📷", color: "text-accent bg-accent/10 border-accent/20" },
];

export function getEntryMeta(type: EntryType) {
  return ENTRY_TYPES.find((t) => t.value === type) ?? ENTRY_TYPES[4];
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { GeneticType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrainResult } from "@/app/api/strains/route";

interface AutoFill {
  strain: string;
  bank: string;
  genetics: GeneticType | "";
  floweringWeeks: string;
  bankRecommendations: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onAutoFill: (data: AutoFill) => void;
  placeholder?: string;
  className?: string;
}

function mapGenetics(r: StrainResult): GeneticType | "" {
  if (r.flowering_behavior?.toLowerCase().includes("auto")) return "autoflowering";
  const sativa = r.sativa_percentage ?? 0;
  const indica = r.indica_percentage ?? 0;
  if (sativa === 0 && indica === 0) return "";
  if (sativa >= 65) return "sativa";
  if (indica >= 65) return "indica";
  return "hibrida";
}

function mapWeeks(r: StrainResult): string {
  const min = r.flowering_time_min;
  const max = r.flowering_time_max;
  if (min != null && max != null) {
    return String(Math.round(((min + max) / 2) / 7));
  }
  if (min != null) return String(Math.round(min / 7));
  if (max != null) return String(Math.round(max / 7));
  return "";
}

function getBank(r: StrainResult): string {
  return r.breeder_name ?? r.bank_name ?? r.seed_bank ?? "";
}

export function StrainAutocomplete({ value, onChange, onAutoFill, placeholder, className }: Props) {
  const [results, setResults] = useState<StrainResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [autofilled, setAutofilled] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/strains?q=${encodeURIComponent(q)}`);
      const data: StrainResult[] = await res.json();
      setResults(data);
      setOpen(data.length > 0);
      setHighlighted(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autofilled) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 320);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, search, autofilled]);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function selectResult(r: StrainResult) {
    const bank = getBank(r);
    const genetics = mapGenetics(r);
    const floweringWeeks = mapWeeks(r);
    const bankRecommendations = r.about_info ?? "";
    onChange(r.strain_name);
    onAutoFill({ strain: r.strain_name, bank, genetics, floweringWeeks, bankRecommendations });
    setOpen(false);
    setAutofilled(true);
    setTimeout(() => setAutofilled(false), 500);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      selectResult(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function clear() {
    onChange("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => { onChange(e.target.value); setAutofilled(false); }}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0 && value.length >= 2) setOpen(true); }}
          placeholder={placeholder ?? "Ex: OG Kush, Blue Dream, White Widow..."}
          className="pl-8 pr-16 bg-background border-border"
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 size={13} className="text-muted-foreground/60 animate-spin" />}
          {value && !loading && (
            <button type="button" onClick={clear} className="text-muted-foreground/50 hover:text-muted-foreground p-0.5">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1.5 bg-popover border border-border rounded-xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border bg-muted/20">
            <Sparkles size={11} className="text-primary" />
            <span className="text-[10px] text-muted-foreground font-medium">
              {results.length} strain{results.length !== 1 ? "s" : ""} encontradas
            </span>
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {results.map((r, i) => {
              const bank = getBank(r);
              const genetics = mapGenetics(r);
              const weeks = mapWeeks(r);
              const genEmoji = genetics === "autoflowering" ? "⚡" : genetics === "sativa" ? "🌿" : genetics === "indica" ? "🍃" : genetics === "hibrida" ? "🌱" : "";
              return (
                <li key={`${r.strain_name}-${i}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); selectResult(r); }}
                    onMouseEnter={() => setHighlighted(i)}
                    className={cn(
                      "w-full text-left flex items-start gap-3 px-3 py-2.5 transition-colors",
                      highlighted === i ? "bg-primary/10" : "hover:bg-muted/30"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{r.strain_name}</p>
                      {bank && (
                        <p className="text-[11px] text-muted-foreground truncate">{bank}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      {genEmoji && <span className="text-sm">{genEmoji}</span>}
                      {weeks && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                          {weeks}s
                        </span>
                      )}
                      {r.seed_gender === "Feminized" && (
                        <span className="text-[10px] text-pink-400/80">♀</span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

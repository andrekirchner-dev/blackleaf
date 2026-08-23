"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Loader2, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { compressImageToBase64, isImageFile } from "@/lib/image-utils";

interface VisualChecklist {
  burnedEdgesTips: "SIM" | "NÃO";
  purpleColoring: "SIM" | "NÃO";
  uniformYellowing: "SIM" | "NÃO";
  interveinalChlorosis: "SIM" | "NÃO";
  newLeavesAffected: "SIM" | "NÃO";
  newGrowthDeformed: "SIM" | "NÃO";
}

interface Diagnosis {
  identified: boolean;
  name: string;
  confidence: "alta" | "média" | "baixa";
  visualObservation?: string;
  visualChecklist?: VisualChecklist;
  description: string;
  urgency?: "alta" | "média" | "baixa";
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  additionalNotes?: string;
}

interface Props {
  category: "pests" | "diseases" | "nutrients";
  title: string;
  hint: string;
}

const CONFIDENCE_CONFIG = {
  alta:  { label: "Alta",  color: "text-primary",     bg: "bg-primary/10 border-primary/20" },
  média: { label: "Média", color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20" },
  baixa: { label: "Baixa", color: "text-muted-foreground", bg: "bg-muted/20 border-border" },
};

const URGENCY_CONFIG = {
  alta:  { label: "Urgente",  color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  média: { label: "Moderada", color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20" },
  baixa: { label: "Baixa",    color: "text-primary",     bg: "bg-primary/10 border-primary/20" },
};

function Section({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-background/60 border border-border/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/10 transition-colors"
      >
        <span className="shrink-0">{icon}</span>
        <span className="text-xs font-semibold text-foreground flex-1">{title}</span>
        {open ? <ChevronUp size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
      </button>
      {open && (
        <ul className="px-3 pb-3 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-1 w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PhotoDiagnose({ category, title, hint }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    if (!isImageFile(file)) {
      setError("Selecione uma imagem (JPEG, PNG, WEBP ou HEIC).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Imagem muito grande. Máximo 20MB.");
      return;
    }
    setError(null);
    setDiagnosis(null);
    try {
      const { base64, preview } = await compressImageToBase64(file, 1280, 0.85);
      setPreview(preview);
      setImageBase64(base64);
      setMimeType("image/jpeg");
    } catch {
      setError("Não foi possível processar a imagem. Tente outro formato.");
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clear() {
    setPreview(null);
    setImageBase64(null);
    setDiagnosis(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function analyse() {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);
    setDiagnosis(null);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao analisar");
      setDiagnosis(data.diagnosis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Camera size={15} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        </div>
      </div>

      {/* Drop zone / preview */}
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl h-36 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
            dragging
              ? "border-primary/60 bg-primary/5"
              : "border-border/50 hover:border-primary/30 hover:bg-muted/10"
          )}
        >
          <Upload size={22} className="text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">Tire uma foto ou selecione da galeria</p>
          <p className="text-[10px] text-muted-foreground/50">JPG, PNG, WEBP, HEIC</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl border border-border"
          />
          <button
            onClick={clear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Analyse button */}
      {preview && !diagnosis && (
        <Button
          onClick={analyse}
          disabled={loading}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Analisando com IA...
            </>
          ) : (
            <>
              <Camera size={14} />
              Analisar Foto
            </>
          )}
        </Button>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
          <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Result */}
      {diagnosis && (
        <div className="space-y-3">
          {/* Identity card */}
          <div className={cn(
            "rounded-xl border p-3 space-y-1",
            diagnosis.identified
              ? "bg-card border-border"
              : "bg-muted/10 border-border/50"
          )}>
            <div className="flex items-center gap-2 flex-wrap">
              {diagnosis.identified
                ? <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                : <CheckCircle2 size={15} className="text-primary shrink-0" />}
              <p className="text-sm font-semibold text-foreground">{diagnosis.name}</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{diagnosis.description}</p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", CONFIDENCE_CONFIG[diagnosis.confidence].bg, CONFIDENCE_CONFIG[diagnosis.confidence].color)}>
                Confiança {CONFIDENCE_CONFIG[diagnosis.confidence].label}
              </span>
              {diagnosis.urgency && (
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", URGENCY_CONFIG[diagnosis.urgency].bg, URGENCY_CONFIG[diagnosis.urgency].color)}>
                  Urgência {URGENCY_CONFIG[diagnosis.urgency].label}
                </span>
              )}
            </div>
          </div>

          {/* Visual observation — reasoning trace */}
          {diagnosis.visualObservation && (
            <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl px-3 py-2.5 flex items-start gap-2">
              <span className="text-xs shrink-0 mt-0.5">👁️</span>
              <div>
                <p className="text-[10px] font-semibold text-blue-400 mb-0.5 uppercase tracking-wide">O que a IA observou</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{diagnosis.visualObservation}</p>
              </div>
            </div>
          )}

          {/* Visual checklist — nutrients only */}
          {diagnosis.visualChecklist && (
            <div className="bg-muted/10 border border-border/50 rounded-xl px-3 py-2.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Checklist Visual</p>
              <div className="grid grid-cols-1 gap-1">
                {(
                  [
                    ["burnedEdgesTips",     "Bordas/pontas queimadas (marrons, crocantes)"],
                    ["purpleColoring",      "Coloração roxa/violeta nas folhas ou caule"],
                    ["uniformYellowing",    "Amarelamento uniforme da folha inteira"],
                    ["interveinalChlorosis","Nervuras verdes com miolo amarelo (clorose interveinal)"],
                    ["newLeavesAffected",   "Sintomas nas folhas novas (topo da planta)"],
                    ["newGrowthDeformed",   "Folhas novas deformadas, enroladas ou com pontas mortas"],
                  ] as [keyof VisualChecklist, string][]
                ).map(([key, label]) => {
                  const val = diagnosis.visualChecklist![key];
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-bold w-8 text-center rounded px-1 py-0.5",
                        val === "SIM"
                          ? "bg-amber-400/15 text-amber-400"
                          : "bg-muted/30 text-muted-foreground"
                      )}>
                        {val}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sections */}
          {diagnosis.identified && (
            <div className="space-y-2">
              {diagnosis.symptoms.length > 0 && (
                <Section title="Sintomas Identificados" items={diagnosis.symptoms} icon={<span className="text-xs">🔍</span>} />
              )}
              {diagnosis.treatment.length > 0 && (
                <Section title="Tratamento" items={diagnosis.treatment} icon={<span className="text-xs">💊</span>} />
              )}
              {diagnosis.prevention.length > 0 && (
                <Section title="Prevenção" items={diagnosis.prevention} icon={<span className="text-xs">🛡️</span>} />
              )}
              {diagnosis.additionalNotes && (
                <div className="bg-muted/20 border border-border/50 rounded-xl px-3 py-2.5">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{diagnosis.additionalNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* New analysis */}
          <button
            onClick={clear}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Analisar outra foto →
          </button>
        </div>
      )}
    </div>
  );
}

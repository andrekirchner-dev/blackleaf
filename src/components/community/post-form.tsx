"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { createCommunityPost, makeHandle } from "@/lib/community";
import { uploadCommunityPostPhoto } from "@/lib/storage";
import { STAGE_LABELS, MEDIUM_LABELS } from "@/lib/constants";
import type { Plant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { differenceInWeeks, parseISO } from "date-fns";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

interface PostFormProps {
  plants: Plant[];
  onSuccess: () => void;
  onCancel: () => void;
}

const LIGHT_LABELS: Record<string, string> = {
  led: "LED",
  hps: "HPS",
  cmh: "CMH",
  cfl: "CFL",
  fluorescente: "Fluorescente",
  natural: "Natural",
};

const MEDIUM_OPTIONS = Object.entries(MEDIUM_LABELS).map(([v, l]) => ({ value: v, label: l }));
const LIGHT_OPTIONS = Object.entries(LIGHT_LABELS).map(([v, l]) => ({ value: v, label: l }));

const RATE_LIMIT_MS = 60_000;

function validateImage(file: File): string | null {
  if (file.size > 8 * 1024 * 1024) return "Imagem muito grande. Máximo 8MB.";
  if (!["image/jpeg", "image/png", "image/webp", "image/heic"].includes(file.type)) {
    return "Formato não suportado. Use JPEG, PNG ou WebP.";
  }
  return null;
}

async function checkRateLimit(userId: string): Promise<boolean> {
  const q = query(
    collection(db, "communityPosts"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return true;
  const lastPost = snap.docs[0].data();
  const lastTime = lastPost.createdAt?.toDate?.()?.getTime() ?? 0;
  return Date.now() - lastTime >= RATE_LIMIT_MS;
}

export function PostForm({ plants, onSuccess, onCancel }: PostFormProps) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [medium, setMedium] = useState("");
  const [lightType, setLightType] = useState("");
  const [weekOfGrow, setWeekOfGrow] = useState<number | "">("");

  const selectedPlants = plants.filter((p) => selectedPlantIds.includes(p.id));

  function togglePlant(id: string) {
    setSelectedPlantIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      // Auto-fill medium/light from first selected plant
      if (!prev.includes(id)) {
        const plant = plants.find((p) => p.id === id);
        if (plant && !medium) setMedium(plant.medium ?? "");
        // Auto-calculate week
        if (plant?.germinationDate) {
          const w = differenceInWeeks(new Date(), parseISO(plant.germinationDate));
          setWeekOfGrow(Math.max(1, w));
        }
      }
      return next;
    });
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setError(null);
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  function removePhoto() {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setError("Sessão expirada."); return; }
    if (!photoFile) { setError("Adicione uma foto para o post."); return; }
    if (!caption.trim()) { setError("Escreva uma legenda."); return; }
    setLoading(true); setError(null);
    try {
      const allowed = await checkRateLimit(user.uid);
      if (!allowed) {
        setError("Aguarde 1 minuto entre posts.");
        setLoading(false);
        return;
      }
      const photoUrl = await uploadCommunityPostPhoto(user.uid, photoFile);
      const plantSnapshots = selectedPlants.map((p) => ({
        id: p.id,
        name: p.name,
        strain: p.strain,
        stage: p.stage,
      }));
      await createCommunityPost(user.uid, {
        handle: makeHandle(user.uid),
        photoUrl,
        caption: caption.trim(),
        plantSnapshots,
        medium: medium || undefined,
        lightType: lightType || undefined,
        weekOfGrow: weekOfGrow !== "" ? Number(weekOfGrow) : undefined,
      });
      onSuccess();
    } catch (err) {
      console.error("[PostForm]", err);
      setError("Erro ao publicar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Photo */}
      <div className="space-y-1.5">
        <Label>Foto</Label>
        {photoPreview ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 py-8 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            <ImagePlus size={24} />
            <span className="text-sm font-medium">Toque para adicionar foto</span>
            <span className="text-xs text-muted-foreground/60">JPG, PNG ou WEBP</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      </div>

      {/* Caption */}
      <div className="space-y-1.5">
        <Label htmlFor="caption">Legenda</Label>
        <Textarea
          id="caption"
          placeholder="O que está acontecendo no seu cultivo?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="bg-background border-border min-h-[90px] resize-none"
        />
      </div>

      {/* Plants */}
      {plants.length > 0 && (
        <div className="space-y-1.5">
          <Label>Plantas na foto <span className="text-muted-foreground/50 font-normal">(opcional)</span></Label>
          <div className="flex flex-wrap gap-2">
            {plants.map((p) => {
              const selected = selectedPlantIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlant(p.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                    selected
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    selected ? "bg-primary" : "bg-muted-foreground/30"
                  )} />
                  {p.name}
                  {selected && (
                    <span className="text-[10px] opacity-70">{STAGE_LABELS[p.stage]}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional characteristics */}
      <div className="space-y-3">
        <Label>Características <span className="text-muted-foreground/50 font-normal">(opcional)</span></Label>

        {/* Week */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-24 shrink-0">Semana do cultivo</span>
          <div className="flex items-center gap-2">
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,18,20].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeekOfGrow(weekOfGrow === w ? "" : w)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-medium border transition-all",
                  weekOfGrow === w
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Medium */}
        <div className="flex items-start gap-3">
          <span className="text-xs text-muted-foreground w-24 shrink-0 pt-2">Substrato</span>
          <div className="flex flex-wrap gap-2">
            {MEDIUM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMedium(medium === opt.value ? "" : opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                  medium === opt.value
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Light */}
        <div className="flex items-start gap-3">
          <span className="text-xs text-muted-foreground w-24 shrink-0 pt-2">Iluminação</span>
          <div className="flex flex-wrap gap-2">
            {LIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLightType(lightType === opt.value ? "" : opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                  lightType === opt.value
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="border-border">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || !photoFile || !caption.trim()}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {loading ? "Publicando..." : "Publicar"}
        </Button>
      </div>
    </form>
  );
}

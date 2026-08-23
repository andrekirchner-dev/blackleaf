"use client";

import { useRef, useState } from "react";
import { compressImageToFile } from "@/lib/image-utils";
import { Camera, Loader2, X } from "lucide-react";
import { upsertUserProfileData } from "@/lib/community";
import { uploadUserAvatar } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UserProfileData } from "@/lib/community";
import { cn } from "@/lib/utils";

interface ProfileEditFormProps {
  userId: string;
  current: Pick<UserProfileData, "handle" | "bio" | "avatarUrl">;
  onSuccess: (updated: Pick<UserProfileData, "handle" | "bio" | "avatarUrl">) => void;
  onCancel: () => void;
}

const HANDLE_RE = /^[a-zA-Z0-9_]{3,24}$/;

export function ProfileEditForm({ userId, current, onSuccess, onCancel }: ProfileEditFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [handle, setHandle] = useState(current.handle ?? "");
  const [bio, setBio] = useState(current.bio ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(current.avatarUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = !handle
    ? null
    : !HANDLE_RE.test(handle)
    ? "3–24 caracteres. Apenas letras, números e _"
    : null;

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageToFile(file, 512, 0.90);
      setAvatarFile(compressed);
      setAvatarPreview(URL.createObjectURL(compressed));
    } catch {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  function removeAvatar() {
    setAvatarFile(null);
    if (avatarPreview && avatarPreview !== current.avatarUrl) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (handleError) return;
    if (!handle.trim()) { setError("Escolha um nome de usuário."); return; }
    setLoading(true); setError(null);
    try {
      let avatarUrl = current.avatarUrl;
      if (avatarFile) {
        avatarUrl = await uploadUserAvatar(userId, avatarFile);
      } else if (!avatarPreview) {
        avatarUrl = undefined;
      }
      const updates = { handle: handle.trim(), bio: bio.trim() || undefined, avatarUrl };
      await upsertUserProfileData(userId, updates);
      onSuccess(updates);
    } catch (err) {
      console.error("[ProfileEditForm]", err);
      setError("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const initials = (handle || "??").slice(-2).toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {avatarPreview ? (
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{initials}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
          >
            <Camera size={14} />
          </button>

          {avatarPreview && (
            <button
              type="button"
              onClick={removeAvatar}
              className="absolute top-0 right-0 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
            >
              <X size={11} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-xs text-primary hover:underline"
        >
          {avatarPreview ? "Trocar foto" : "Adicionar foto"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onAvatarChange} />
      </div>

      {/* Handle */}
      <div className="space-y-1.5">
        <Label htmlFor="handle">Nome de usuário</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
          <Input
            id="handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value.replace(/\s/g, "_"))}
            className={cn(
              "bg-background border-border pl-7",
              handleError && "border-destructive focus-visible:ring-destructive"
            )}
            placeholder="seu_nome"
            maxLength={24}
          />
        </div>
        {handleError ? (
          <p className="text-[11px] text-destructive">{handleError}</p>
        ) : (
          <p className="text-[11px] text-muted-foreground/60">3–24 caracteres. Letras, números e _</p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio <span className="text-muted-foreground/50 font-normal">(opcional)</span></Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 160))}
          placeholder="Conta um pouco sobre o seu cultivo..."
          className="bg-background border-border min-h-[80px] resize-none"
        />
        <p className="text-[11px] text-muted-foreground/60 text-right">{bio.length}/160</p>
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="border-border">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || !!handleError || !handle.trim()}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[110px]"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Salvando..." : "Salvar Perfil"}
        </Button>
      </div>
    </form>
  );
}

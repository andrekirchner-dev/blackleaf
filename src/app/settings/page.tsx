"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useGrowStyles } from "@/hooks/use-grow-styles";
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";
import { createGrowStyle, deleteGrowStyle, FEEDING_TYPES } from "@/lib/grow-styles";
import { WIDGET_REGISTRY, type WidgetId } from "@/lib/dashboard-widgets";
import type { FeedingType, GrowStyleEvent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  LogOut, User, Shield, Leaf, Plus, Trash2, Loader2, ChevronDown,
  LayoutDashboard, GripVertical, Eye, EyeOff, ChevronUp, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";

function uid() {
  return Math.random().toString(36).slice(2);
}

interface WidgetItem {
  id: WidgetId;
  visible: boolean;
}

function DashboardLayoutEditor() {
  const { layout, saveLayout, loading } = useDashboardLayout();
  const [items, setItems] = useState<WidgetItem[]>([]);
  const [saved, setSaved] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (loading) return;
    // Build ordered list: enabled widgets first (in saved order), then disabled
    const enabledIds = layout;
    const allItems: WidgetItem[] = [
      ...enabledIds
        .filter((id) => WIDGET_REGISTRY.some((w) => w.id === id))
        .map((id) => ({ id, visible: true })),
      ...WIDGET_REGISTRY
        .filter((w) => !enabledIds.includes(w.id))
        .map((w) => ({ id: w.id, visible: false })),
    ];
    setItems(allItems);
  }, [layout, loading]);

  async function handleSave(newItems: WidgetItem[]) {
    const newLayout = newItems.filter((i) => i.visible).map((i) => i.id);
    await saveLayout(newLayout);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggle(index: number) {
    const next = items.map((item, i) =>
      i === index ? { ...item, visible: !item.visible } : item
    );
    // Move newly disabled items to the bottom of the list
    const enabled = next.filter((i) => i.visible);
    const disabled = next.filter((i) => !i.visible);
    const reordered = [...enabled, ...disabled];
    setItems(reordered);
    handleSave(reordered);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next);
    handleSave(next);
  }

  // Drag handlers
  function onDragStart(index: number) {
    dragIndex.current = index;
    setDragActive(true);
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    dragOverIndex.current = index;
  }

  function onDrop() {
    const from = dragIndex.current;
    const to = dragOverIndex.current;
    setDragActive(false);
    if (from === null || to === null || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    handleSave(next);
    dragIndex.current = null;
    dragOverIndex.current = null;
  }

  function onDragEnd() {
    setDragActive(false);
    dragIndex.current = null;
    dragOverIndex.current = null;
  }

  const enabledCount = items.filter((i) => i.visible).length;

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {enabledCount} de {items.length} widgets visíveis — arraste para reordenar
        </p>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-primary animate-in fade-in">
            <CheckCircle2 size={12} />
            Salvo
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {items.map((item, index) => {
          const meta = WIDGET_REGISTRY.find((w) => w.id === item.id)!;
          const isFirstDisabled = !item.visible && (index === 0 || items[index - 1].visible);

          return (
            <div key={item.id}>
              {isFirstDisabled && enabledCount > 0 && (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">
                    Ocultos
                  </span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
              )}
              <div
                draggable={item.visible}
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDrop={onDrop}
                onDragEnd={onDragEnd}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl border transition-all",
                  item.visible
                    ? "bg-card border-border"
                    : "bg-muted/10 border-border/40 opacity-50",
                  dragActive && dragIndex.current === index && "opacity-40 scale-95"
                )}
              >
                {/* Drag handle — only for visible items */}
                <div
                  className={cn(
                    "shrink-0 cursor-grab active:cursor-grabbing touch-none",
                    !item.visible && "cursor-default opacity-30"
                  )}
                >
                  <GripVertical size={15} className="text-muted-foreground/40" />
                </div>

                {/* Emoji */}
                <span className="text-lg leading-none shrink-0">{meta.emoji}</span>

                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={cn("text-sm font-medium", item.visible ? "text-foreground" : "text-muted-foreground")}>
                      {meta.label}
                    </p>
                    {meta.category !== "dashboard" && (
                      <span className={cn(
                        "text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full border",
                        meta.category === "ferramentas"
                          ? "text-primary/70 bg-primary/5 border-primary/20"
                          : "text-accent/70 bg-accent/5 border-accent/20"
                      )}>
                        {meta.category === "ferramentas" ? "Ferramenta" : "Diário"}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 leading-snug mt-0.5 truncate">
                    {meta.description}
                  </p>
                </div>

                {/* Move up button for mobile */}
                {item.visible && index > 0 && items[index - 1].visible && (
                  <button
                    onClick={() => moveUp(index)}
                    className="shrink-0 p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors md:hidden"
                    title="Mover para cima"
                  >
                    <ChevronUp size={14} />
                  </button>
                )}

                {/* Toggle visibility */}
                <button
                  onClick={() => toggle(index)}
                  className={cn(
                    "shrink-0 p-1.5 rounded-lg transition-colors",
                    item.visible
                      ? "text-primary hover:bg-primary/10"
                      : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/30"
                  )}
                  title={item.visible ? "Ocultar widget" : "Mostrar widget"}
                >
                  {item.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground/50 text-center pt-1">
        Alterações salvas automaticamente e sincronizadas em todos os dispositivos.
      </p>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { presets, custom, refresh } = useGrowStyles();

  const [showNewStyle, setShowNewStyle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);

  const [styleForm, setStyleForm] = useState({
    name: "",
    description: "",
    feedingType: "mineral" as FeedingType,
    vegWeeks: "5",
    events: [] as GrowStyleEvent[],
  });

  const [newEvent, setNewEvent] = useState({ weekOffset: "", label: "", emoji: "📌", type: "action" as GrowStyleEvent["type"] });
  const [addingEvent, setAddingEvent] = useState(false);

  function setStyleField<K extends keyof typeof styleForm>(k: K, v: (typeof styleForm)[K]) {
    setStyleForm((p) => ({ ...p, [k]: v }));
  }

  function addEvent() {
    if (!newEvent.label.trim() || !newEvent.weekOffset) return;
    setStyleField("events", [
      ...styleForm.events,
      { weekOffset: Number(newEvent.weekOffset), label: newEvent.label.trim(), emoji: newEvent.emoji, type: newEvent.type },
    ].sort((a, b) => a.weekOffset - b.weekOffset));
    setNewEvent({ weekOffset: "", label: "", emoji: "📌", type: "action" });
    setAddingEvent(false);
  }

  function removeEvent(idx: number) {
    setStyleField("events", styleForm.events.filter((_, i) => i !== idx));
  }

  async function handleSaveStyle(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !styleForm.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createGrowStyle(user.uid, {
        name: styleForm.name.trim(),
        description: styleForm.description.trim() || undefined,
        feedingType: styleForm.feedingType,
        vegWeeks: Number(styleForm.vegWeeks) || 5,
        events: styleForm.events,
      });
      setShowNewStyle(false);
      setStyleForm({ name: "", description: "", feedingType: "mineral", vegWeeks: "5", events: [] });
      refresh();
    } catch {
      setError("Erro ao salvar estilo. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStyle(id: string) {
    await deleteGrowStyle(id);
    refresh();
  }

  const EVENT_EMOJIS = ["📌", "💡", "✂️", "💧", "🌿", "🍄", "⚗️", "🔄", "⚠️", "🌸", "🌱", "🪴"];

  return (
    <MotionPage>
    <div className="space-y-6 max-w-2xl mx-auto">
      <MotionItem>
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie sua conta e preferências</p>
      </div>
      </MotionItem>

      {/* Profile */}
      <MotionItem>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User size={16} className="text-primary" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName ?? ""}
                className="w-14 h-14 rounded-full border-2 border-primary/30"
              />
            )}
            <div>
              <p className="font-semibold text-foreground">{user?.displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </MotionItem>

      {/* Dashboard Layout */}
      <MotionItem>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <LayoutDashboard size={16} className="text-primary" />
            Personalizar Dashboard
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Escolha quais widgets aparecem no seu painel e em qual ordem.
          </p>
        </CardHeader>
        <CardContent>
          <DashboardLayoutEditor />
        </CardContent>
      </Card>
      </MotionItem>

      {/* Grow Styles */}
      <MotionItem>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Leaf size={16} className="text-accent" />
              Estilos de Cultivo
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowNewStyle(true)}
              className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={12} />
              Novo
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Presets de cultivo com eventos no calendário. Use-os ao cadastrar plantas.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Presets */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Presets</p>
            <div className="space-y-2">
              {presets.map((s) => (
                <div key={s.id} className="border border-border rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedPreset(expandedPreset === s.id ? null : s.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{s.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                          {FEEDING_TYPES.find((f) => f.value === s.feedingType)?.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">Vega: {s.vegWeeks}s</span>
                      </div>
                      {s.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{s.description}</p>
                      )}
                    </div>
                    <ChevronDown
                      size={14}
                      className={cn("shrink-0 text-muted-foreground transition-transform ml-2", expandedPreset === s.id && "rotate-180")}
                    />
                  </button>
                  {expandedPreset === s.id && s.events.length > 0 && (
                    <div className="border-t border-border px-4 py-3 space-y-1.5 bg-background/30">
                      {s.events.map((ev, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="text-sm">{ev.emoji}</span>
                          <span className="text-primary/70 font-medium w-8">S{ev.weekOffset}</span>
                          <span>{ev.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom styles */}
          {custom.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Meus Estilos</p>
              <div className="space-y-2">
                {custom.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 border border-border rounded-xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{s.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
                          {FEEDING_TYPES.find((f) => f.value === s.feedingType)?.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Vega: {s.vegWeeks} sem. · {s.events.length} evento{s.events.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteStyle(s.id)}
                      className="text-muted-foreground/50 hover:text-destructive transition-colors p-1 shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {custom.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Você ainda não criou nenhum estilo personalizado.
            </p>
          )}
        </CardContent>
      </Card>
      </MotionItem>

      {/* Account */}
      <MotionItem>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield size={16} className="text-accent" />
            Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={logout} className="gap-2 w-full sm:w-auto">
            <LogOut size={15} />
            Sair da conta
          </Button>
        </CardContent>
      </Card>
      </MotionItem>

      {/* New grow style dialog */}
      <Dialog open={showNewStyle} onOpenChange={setShowNewStyle}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Estilo de Cultivo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveStyle} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="styleName">Nome *</Label>
              <Input
                id="styleName"
                placeholder="Ex: Meu SOG Pessoal"
                value={styleForm.name}
                onChange={(e) => setStyleField("name", e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="styleDesc">Descrição</Label>
              <Textarea
                id="styleDesc"
                placeholder="Descreva sua abordagem de cultivo..."
                value={styleForm.description}
                onChange={(e) => setStyleField("description", e.target.value)}
                className="bg-background border-border min-h-[60px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo de Nutrição</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {FEEDING_TYPES.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setStyleField("feedingType", f.value)}
                      className={cn(
                        "py-1.5 px-2 rounded-lg border text-xs font-medium transition-all text-left",
                        styleForm.feedingType === f.value
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f.emoji} {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vegWeeks">Semanas de Vega</Label>
                <Input
                  id="vegWeeks"
                  type="number"
                  min="1"
                  max="20"
                  value={styleForm.vegWeeks}
                  onChange={(e) => setStyleField("vegWeeks", e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            </div>

            {/* Events */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Eventos do Calendário</Label>
                <button
                  type="button"
                  onClick={() => setAddingEvent((v) => !v)}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                >
                  <Plus size={12} />
                  Adicionar
                </button>
              </div>

              {styleForm.events.map((ev, i) => (
                <div key={i} className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 text-xs">
                  <span>{ev.emoji}</span>
                  <span className="text-primary/70 font-medium w-8">S{ev.weekOffset}</span>
                  <span className="flex-1 text-foreground truncate">{ev.label}</span>
                  <button type="button" onClick={() => removeEvent(i)} className="text-muted-foreground/50 hover:text-destructive">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}

              {addingEvent && (
                <div className="bg-background border border-primary/20 rounded-xl p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground">Semana (S)</p>
                      <Input
                        type="number"
                        min="0"
                        max="30"
                        placeholder="Ex: 3"
                        value={newEvent.weekOffset}
                        onChange={(e) => setNewEvent((p) => ({ ...p, weekOffset: e.target.value }))}
                        className="bg-card border-border h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground">Emoji</p>
                      <div className="flex flex-wrap gap-1">
                        {EVENT_EMOJIS.map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => setNewEvent((p) => ({ ...p, emoji: em }))}
                            className={cn(
                              "w-6 h-6 rounded text-sm transition-all",
                              newEvent.emoji === em ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-muted"
                            )}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground">Descrição</p>
                    <Input
                      placeholder="Ex: Início do treinamento LST"
                      value={newEvent.label}
                      onChange={(e) => setNewEvent((p) => ({ ...p, label: e.target.value }))}
                      className="bg-card border-border h-8 text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={addEvent} className="h-7 text-xs bg-primary text-primary-foreground">
                      Adicionar
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setAddingEvent(false)} className="h-7 text-xs border-border">
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">{error}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowNewStyle(false)} className="border-border">
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Salvando..." : "Criar Estilo"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </MotionPage>
  );
}

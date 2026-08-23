"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTasks } from "@/hooks/use-tasks";
import { usePlants } from "@/hooks/use-plants";
import { createTask, deleteTask, completeTask } from "@/lib/grow-tasks";
import type { GrowTask, TaskType, TaskRecurrence } from "@/lib/grow-tasks";
import { parseISO, isToday, isThisWeek, format, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  RefreshCw,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_EMOJI: Record<TaskType, string> = {
  rega: "💧",
  nutrientes: "🧪",
  poda: "✂️",
  inspecao: "🔍",
  outro: "📋",
};

const TYPE_LABELS: Record<TaskType, string> = {
  rega: "Rega",
  nutrientes: "Nutrientes",
  poda: "Poda",
  inspecao: "Inspeção",
  outro: "Outro",
};

// Human-readable labels for each recurrence type
const RECURRENCE_LABELS: Record<TaskRecurrence, string> = {
  none: "Nenhuma",
  daily: "Diária",
  every2days: "A cada 2 dias",
  weekly: "Semanal",
  biweekly: "Quinzenal",
};

// How many days ahead the next occurrence will be created
const RECURRENCE_DAYS: Record<TaskRecurrence, number> = {
  none: 0,
  daily: 1,
  every2days: 2,
  weekly: 7,
  biweekly: 14,
};

const p = (n: number) => String(n).padStart(2, "0");
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

type FilterKey = "todas" | "hoje" | "semana" | "concluidas";

function groupLabel(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return "Hoje";
  if (isTomorrow(d)) return "Amanhã";
  return format(d, "EEEE, dd/MM", { locale: ptBR });
}

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, loading, refresh } = useTasks();
  const { plants } = usePlants();
  const [filter, setFilter] = useState<FilterKey>("todas");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    title: string;
    type: TaskType;
    dueDate: string;
    recurrence: TaskRecurrence;
    notes: string;
    plantIds: string[];
  }>({
    title: "",
    type: "rega",
    dueDate: todayStr(),
    recurrence: "none",
    notes: "",
    plantIds: [],
  });

  function resetForm() {
    setForm({ title: "", type: "rega", dueDate: todayStr(), recurrence: "none", notes: "", plantIds: [] });
  }

  const filtered = tasks.filter((t) => {
    if (filter === "concluidas") return t.completed;
    if (t.completed) return false;
    const d = parseISO(t.dueDate);
    if (filter === "hoje") return isToday(d) || d < new Date();
    if (filter === "semana") return isThisWeek(d, { weekStartsOn: 1 }) || d < new Date();
    return true;
  });

  const grouped = filtered.reduce<Record<string, GrowTask[]>>((acc, task) => {
    const label = groupLabel(task.dueDate);
    if (!acc[label]) acc[label] = [];
    acc[label].push(task);
    return acc;
  }, {});

  async function handleCreate() {
    if (!user || !form.title.trim()) return;
    setSaving(true);
    try {
      await createTask(user.uid, {
        title: form.title.trim(),
        type: form.type,
        dueDate: form.dueDate,
        recurrence: form.recurrence,
        completed: false,
        notes: form.notes,
        plantIds: form.plantIds,
      });
      resetForm();
      setSheetOpen(false);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete(task: GrowTask) {
    await completeTask(task);
    refresh();
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
    refresh();
  }

  const filters: { key: FilterKey; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "hoje", label: "Hoje" },
    { key: "semana", label: "Esta semana" },
    { key: "concluidas", label: "Concluídas" },
  ];

  return (
    <MotionPage>
      <div className="space-y-6 max-w-2xl mx-auto px-4 py-6">
        <MotionItem>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <CheckSquare size={22} className="text-primary" />
                Tarefas
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Agenda do seu cultivo</p>
            </div>
            <Button
              onClick={() => setSheetOpen(true)}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={16} />
              Nova Tarefa
            </Button>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  filter === f.key
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </MotionItem>

        <MotionItem>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-14 bg-muted/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle2 size={40} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm">Nenhuma tarefa nesta categoria</p>
              <button
                onClick={() => setSheetOpen(true)}
                className="text-xs text-primary mt-2 hover:underline"
              >
                Criar tarefa →
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([label, group]) => (
                <div key={label}>
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground/60 mb-2">
                    {label}
                  </p>
                  <div className="bg-card border border-border rounded-2xl divide-y divide-border/30">
                    {group.map((task) => {
                      const linkedPlants = plants.filter((pl) => task.plantIds?.includes(pl.id));
                      const isRecurring = task.recurrence !== "none";
                      const nextDays = RECURRENCE_DAYS[task.recurrence];
                      return (
                        <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                          <button
                            onClick={() => handleComplete(task)}
                            className="shrink-0"
                          >
                            {task.completed
                              ? <CheckCircle2 size={17} className="text-primary" />
                              : <Circle size={17} className="text-muted-foreground/40 hover:text-primary transition-colors" />
                            }
                          </button>
                          <span className="text-base shrink-0">{TYPE_EMOJI[task.type]}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className={cn(
                                "text-sm font-medium truncate",
                                task.completed ? "line-through text-muted-foreground" : "text-foreground"
                              )}>
                                {task.title}
                              </p>
                              {isRecurring && (
                                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-1.5 py-0.5 font-medium shrink-0">
                                  ♻️ {RECURRENCE_LABELS[task.recurrence]}
                                </span>
                              )}
                            </div>
                            {linkedPlants.length > 0 && (
                              <p className="text-[11px] text-muted-foreground truncate">
                                {linkedPlants.map((pl) => pl.name).join(", ")}
                              </p>
                            )}
                            {task.completed && isRecurring && nextDays > 0 && (
                              <p className="text-[11px] text-primary/70 mt-0.5">
                                🔁 Próxima em {nextDays} dia{nextDays !== 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                          {isRecurring && !task.completed && (
                            <RefreshCw size={11} className="shrink-0 text-muted-foreground/40" />
                          )}
                          <span className={cn(
                            "text-[10px] font-medium shrink-0 px-1.5 py-0.5 rounded-full",
                            isToday(parseISO(task.dueDate))
                              ? "bg-accent/10 text-accent"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {format(parseISO(task.dueDate), "dd/MM")}
                          </span>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </MotionItem>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Nova Tarefa</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pb-6">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Título</Label>
              <Input
                id="task-title"
                placeholder="Ex: Regar com nutrientes"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(TYPE_LABELS) as TaskType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      form.type === t
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {TYPE_EMOJI[t]} {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-due">Data de vencimento</Label>
              <Input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Recorrência</Label>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(RECURRENCE_LABELS) as TaskRecurrence[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setForm((f) => ({ ...f, recurrence: r }))}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      form.recurrence === r
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {r !== "none" && "♻️ "}{RECURRENCE_LABELS[r]}
                  </button>
                ))}
              </div>
              {form.recurrence !== "none" && (
                <p className="text-[11px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                  🔁 Próxima tarefa em{" "}
                  <span className="font-medium text-primary">
                    {RECURRENCE_DAYS[form.recurrence]} dia{RECURRENCE_DAYS[form.recurrence] !== 1 ? "s" : ""}
                  </span>{" "}
                  após a conclusão
                </p>
              )}
            </div>

            {plants.length > 0 && (
              <div className="space-y-1.5">
                <Label>Plantas (opcional)</Label>
                <div className="flex gap-2 flex-wrap">
                  {plants.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => setForm((f) => ({
                        ...f,
                        plantIds: f.plantIds.includes(pl.id)
                          ? f.plantIds.filter((id) => id !== pl.id)
                          : [...f.plantIds, pl.id],
                      }))}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        form.plantIds.includes(pl.id)
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-card border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {pl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="task-notes">Notas (opcional)</Label>
              <Textarea
                id="task-notes"
                placeholder="Observações..."
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <Button
              onClick={handleCreate}
              disabled={!form.title.trim() || saving}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? "Salvando..." : "Criar Tarefa"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </MotionPage>
  );
}

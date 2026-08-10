"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckSquare, Circle, CheckCircle2, RefreshCw } from "lucide-react";
import { parseISO, isToday, isTomorrow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { completeTask } from "@/lib/grow-tasks";
import type { GrowTask } from "@/lib/grow-tasks";
import { cn } from "@/lib/utils";

interface Props {
  tasks: GrowTask[];
}

const TYPE_EMOJI: Record<GrowTask["type"], string> = {
  rega: "💧",
  nutrientes: "🧪",
  poda: "✂️",
  inspecao: "🔍",
  outro: "📋",
};

function dueDateLabel(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return "Hoje";
  if (isTomorrow(d)) return "Amanhã";
  return format(d, "dd/MM", { locale: ptBR });
}

export function WidgetTasks({ tasks }: Props) {
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});

  const pending = tasks
    .filter((t) => !t.completed && !(optimistic[t.id]))
    .slice(0, 3);

  async function handleComplete(task: GrowTask) {
    setOptimistic((prev) => ({ ...prev, [task.id]: true }));
    try {
      await completeTask(task);
    } catch {
      setOptimistic((prev) => ({ ...prev, [task.id]: false }));
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <CheckSquare size={14} className="text-primary" />
          Tarefas do Cultivo
          {pending.length > 0 && (
            <span className="text-[10px] bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full font-medium">
              {pending.length}
            </span>
          )}
        </h3>
        <Link href="/tasks" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Ver todas →
        </Link>
      </div>

      {pending.length === 0 ? (
        <div className="px-4 py-5 text-center">
          <p className="text-xs text-muted-foreground">Nenhuma tarefa pendente ✓</p>
          <Link href="/tasks" className="text-xs text-primary mt-1 block hover:underline">
            Criar tarefa →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {pending.map((task) => (
            <button
              key={task.id}
              onClick={() => handleComplete(task)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/10 transition-colors text-left group"
            >
              <Circle size={15} className="shrink-0 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              <span className="text-base">{TYPE_EMOJI[task.type]}</span>
              <span className="flex-1 text-sm text-foreground truncate">{task.title}</span>
              {task.recurrence !== "none" && (
                <RefreshCw size={11} className="shrink-0 text-muted-foreground/40" />
              )}
              <span className={cn(
                "text-[10px] font-medium shrink-0 px-1.5 py-0.5 rounded-full",
                isToday(parseISO(task.dueDate))
                  ? "bg-accent/10 text-accent"
                  : "bg-muted text-muted-foreground"
              )}>
                {dueDateLabel(task.dueDate)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

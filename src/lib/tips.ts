import type { Plant, GrowSpace, DiaryEntry } from "./types";

export type TipSeverity = "info" | "warning" | "alert";

export interface Tip {
  id: string;
  severity: TipSeverity;
  emoji: string;
  title: string;
  body: string;
  href?: string;
}

export function generateTips(
  plants: Plant[],
  spaces: GrowSpace[],
  entries: DiaryEntry[]
): Tip[] {
  const tips: Tip[] = [];

  // Last diary entry per plant
  const lastEntry: Record<string, string> = {};
  for (const e of entries) {
    const cur = lastEntry[e.plantId];
    if (!cur || e.date > cur) lastEntry[e.plantId] = e.date;
  }

  // ── Sem dados ainda ───────────────────────────────────────────
  if (plants.length === 0) {
    tips.push({
      id: "no-plants",
      severity: "info",
      emoji: "🌱",
      title: "Nenhuma planta ainda",
      body: "Cadastre sua primeira planta para começar a monitorar seu cultivo.",
      href: "/plants/new",
    });
  }

  if (spaces.length === 0 && plants.length > 0) {
    tips.push({
      id: "no-spaces",
      severity: "info",
      emoji: "⛺",
      title: "Nenhum espaço cadastrado",
      body: "Crie um espaço de cultivo para organizar suas plantas.",
      href: "/spaces",
    });
  }

  // ── Por planta ────────────────────────────────────────────────
  for (const plant of plants) {
    const space = plant.spaceId ? spaces.find((s) => s.id === plant.spaceId) : null;

    // Sem espaço
    if (!plant.spaceId && spaces.length > 0) {
      tips.push({
        id: `no-space-${plant.id}`,
        severity: "info",
        emoji: "📍",
        title: `"${plant.name}" sem espaço`,
        body: "Aloque esta planta a um espaço para monitoramento completo.",
        href: `/plants/${plant.id}/edit`,
      });
    }

    // Schedule errado para floração
    if (plant.stage === "floracao" && space &&
        space.lightSchedule !== "12/12" && space.lightSchedule !== "natural") {
      tips.push({
        id: `wrong-schedule-${plant.id}`,
        severity: "warning",
        emoji: "💡",
        title: `Schedule incorreto — ${plant.name}`,
        body: `Em floração mas o espaço usa ${space.lightSchedule}. Mude para 12/12 para florir corretamente.`,
        href: `/spaces/${space.id}`,
      });
    }

    // Schedule de floração no vegetativo
    if ((plant.stage === "vegetativo" || plant.stage === "muda") &&
        space && space.lightSchedule === "12/12") {
      tips.push({
        id: `veg-12-12-${plant.id}`,
        severity: "warning",
        emoji: "⚠️",
        title: `12/12 no vegetativo — ${plant.name}`,
        body: "O espaço está em 12/12 mas a planta ainda está crescendo. Pode forçar floração prematura.",
        href: `/spaces/${space.id}`,
      });
    }

    // Próxima da colheita (estimativa por semanas de floração)
    if (plant.stage === "floracao" && plant.floweringWeeks && plant.stageChangedAt) {
      const stageStart = new Date(plant.stageChangedAt).getTime();
      const harvestEst = stageStart + plant.floweringWeeks * 7 * 86_400_000;
      const daysLeft = Math.ceil((harvestEst - Date.now()) / 86_400_000);
      if (daysLeft <= 14 && daysLeft > 0) {
        tips.push({
          id: `harvest-soon-${plant.id}`,
          severity: "alert",
          emoji: "✂️",
          title: `Colheita próxima — ${plant.name}`,
          body: `Estimativa: ${daysLeft} dia${daysLeft !== 1 ? "s" : ""} restantes de floração. Verifique os tricomos.`,
          href: `/plants/${plant.id}`,
        });
      }
      if (daysLeft <= 0) {
        tips.push({
          id: `harvest-overdue-${plant.id}`,
          severity: "alert",
          emoji: "🌾",
          title: `${plant.name} — janela de colheita`,
          body: "Já passou o tempo estimado de floração. Avalie os tricomos e planeje a colheita.",
          href: `/plants/${plant.id}`,
        });
      }
    }

    // Sem diário há 7+ dias (apenas estágios ativos)
    const activeStages = ["muda", "vegetativo", "floracao"];
    if (activeStages.includes(plant.stage)) {
      const last = lastEntry[plant.id];
      const daysSince = last
        ? Math.floor((Date.now() - new Date(last).getTime()) / 86_400_000)
        : 999;
      if (daysSince >= 7) {
        tips.push({
          id: `no-diary-${plant.id}`,
          severity: "info",
          emoji: "📓",
          title: `Registre "${plant.name}"`,
          body: daysSince >= 999
            ? "Nenhum registro no diário ainda. Documente seu cultivo!"
            : `Sem registros há ${daysSince} dias. Documente rega, nutrientes ou observações.`,
          href: "/diary",
        });
      }
    }

    // Secagem — lembrete de umidade
    if (plant.stage === "secagem") {
      tips.push({
        id: `drying-${plant.id}`,
        severity: "info",
        emoji: "🌡️",
        title: `Secagem — ${plant.name}`,
        body: "Mantenha 45–55% de umidade e 18–22°C. Boa secagem preserva terpenos e potência.",
        href: `/plants/${plant.id}`,
      });
    }
  }

  // ── Por espaço ────────────────────────────────────────────────
  for (const space of spaces) {
    const vents = space.ventilations ?? [];
    const hasOutput =
      vents.some((v) => v.role === "saida") ||
      (!vents.length && space.ventOutputs > 0);

    // Indoor sem saída de ar
    if (space.type !== "estufa" && !hasOutput) {
      tips.push({
        id: `no-vent-out-${space.id}`,
        severity: "warning",
        emoji: "💨",
        title: `${space.name} sem extração`,
        body: "Espaços fechados precisam de saída de ar para controlar temperatura e umidade.",
        href: `/spaces/${space.id}`,
      });
    }

    // Indoor sem circulação
    if (space.type !== "estufa" && !vents.some((v) => v.role === "circulacao") && plants.some((p) => p.spaceId === space.id)) {
      tips.push({
        id: `no-circ-${space.id}`,
        severity: "info",
        emoji: "🌀",
        title: `${space.name} sem circulação`,
        body: "Um ventilador de circulação fortalece os caules e distribui melhor o CO₂.",
        href: `/spaces/${space.id}`,
      });
    }
  }

  // Ordenar: alert → warning → info
  const order: Record<TipSeverity, number> = { alert: 0, warning: 1, info: 2 };
  return tips.sort((a, b) => order[a.severity] - order[b.severity]);
}

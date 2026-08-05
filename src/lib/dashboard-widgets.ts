export type WidgetId =
  | "quick_stats"
  | "grow_stats"
  | "week_calendar"
  | "harvest_countdown"
  | "spaces"
  | "grow_calendar"
  | "env_charts";

export interface WidgetMeta {
  id: WidgetId;
  label: string;
  description: string;
  emoji: string;
}

export const WIDGET_REGISTRY: WidgetMeta[] = [
  {
    id: "quick_stats",
    label: "Resumo Rápido",
    description: "Contagem de plantas, floração e vegetativo",
    emoji: "📊",
  },
  {
    id: "grow_stats",
    label: "Estatísticas do Cultivo",
    description: "Dias de cultivo, eventos da semana e próximo evento",
    emoji: "📈",
  },
  {
    id: "week_calendar",
    label: "Calendário Semanal",
    description: "Eventos da semana — pendentes e concluídos",
    emoji: "🗓️",
  },
  {
    id: "harvest_countdown",
    label: "Contagem para Colheita",
    description: "Progresso de floração e dias restantes por planta",
    emoji: "⏱️",
  },
  {
    id: "spaces",
    label: "Ambientes Ativos",
    description: "Cards dos seus espaços de cultivo e plantas alocadas",
    emoji: "🏕️",
  },
  {
    id: "grow_calendar",
    label: "Calendário de Cultivo",
    description: "Timeline visual das fases de cada planta",
    emoji: "🌱",
  },
  {
    id: "env_charts",
    label: "Gráficos de Ambiente",
    description: "Temperatura, umidade, VPD, CO₂ e pH",
    emoji: "🌡️",
  },
];

export const DEFAULT_LAYOUT: WidgetId[] = WIDGET_REGISTRY.map((w) => w.id);

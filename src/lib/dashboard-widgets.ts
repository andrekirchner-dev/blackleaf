export type WidgetId =
  | "quick_stats"
  | "grow_stats"
  | "week_calendar"
  | "harvest_countdown"
  | "spaces"
  | "grow_calendar"
  | "env_charts"
  | "widget_vpd"
  | "widget_dli"
  | "widget_flush"
  | "widget_diary"
  | "widget_shopping";

export interface WidgetMeta {
  id: WidgetId;
  label: string;
  description: string;
  emoji: string;
  category: "dashboard" | "ferramentas" | "diario";
}

export const WIDGET_REGISTRY: WidgetMeta[] = [
  // Dashboard
  {
    id: "quick_stats",
    label: "Resumo Rápido",
    description: "Contagem de plantas, floração e vegetativo",
    emoji: "📊",
    category: "dashboard",
  },
  {
    id: "grow_stats",
    label: "Estatísticas do Cultivo",
    description: "Dias de cultivo, eventos da semana e próximo evento",
    emoji: "📈",
    category: "dashboard",
  },
  {
    id: "week_calendar",
    label: "Calendário Semanal",
    description: "Eventos da semana — pendentes e concluídos",
    emoji: "🗓️",
    category: "dashboard",
  },
  {
    id: "harvest_countdown",
    label: "Contagem para Colheita",
    description: "Progresso de floração e dias restantes por planta",
    emoji: "⏱️",
    category: "dashboard",
  },
  {
    id: "spaces",
    label: "Ambientes Ativos",
    description: "Cards dos seus espaços de cultivo e plantas alocadas",
    emoji: "🏕️",
    category: "dashboard",
  },
  {
    id: "grow_calendar",
    label: "Calendário de Cultivo",
    description: "Timeline visual das fases de cada planta",
    emoji: "🌱",
    category: "dashboard",
  },
  {
    id: "env_charts",
    label: "Gráficos de Ambiente",
    description: "Temperatura, umidade, VPD, CO₂ e pH",
    emoji: "🌡️",
    category: "dashboard",
  },

  // Ferramentas
  {
    id: "widget_vpd",
    label: "Calculadora VPD",
    description: "Calcule o VPD ajustando temperatura e umidade com sliders",
    emoji: "💨",
    category: "ferramentas",
  },
  {
    id: "widget_dli",
    label: "Calculadora DLI",
    description: "Calcule o DLI a partir de PPFD e horas de luz",
    emoji: "☀️",
    category: "ferramentas",
  },
  {
    id: "widget_flush",
    label: "Flush & Colheita",
    description: "Datas de flush e colheita para plantas em floração",
    emoji: "💧",
    category: "ferramentas",
  },

  // Diário
  {
    id: "widget_diary",
    label: "Diário Recente",
    description: "Últimas 5 anotações do diário de cultivo",
    emoji: "📓",
    category: "diario",
  },
  {
    id: "widget_shopping",
    label: "Lista de Compras",
    description: "Itens pendentes com toggle rápido de comprado",
    emoji: "🛒",
    category: "diario",
  },
];

export const DEFAULT_LAYOUT: WidgetId[] = [
  "quick_stats",
  "grow_stats",
  "week_calendar",
  "harvest_countdown",
  "spaces",
  "grow_calendar",
  "env_charts",
];

"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { cn } from "@/lib/utils";

interface DataPoint {
  label: string;
  value: number | null;
}

interface Props {
  title: string;
  unit: string;
  data: DataPoint[];
  color?: string;
  refMin?: number;
  refMax?: number;
  decimals?: number;
  emptyMessage?: string;
  className?: string;
}

function CustomTooltip({ active, payload, label, unit }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs shadow-lg">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-bold text-foreground">{payload[0].value}{unit}</p>
    </div>
  );
}

export function EnvChart({
  title,
  unit,
  data,
  color = "#22c55e",
  refMin,
  refMax,
  decimals = 1,
  emptyMessage = "Sem dados registrados",
  className,
}: Props) {
  const hasData = data.some((d) => d.value !== null);
  const hasZone = refMin !== undefined && refMax !== undefined;

  // Expand Y domain to always include the ideal zone boundaries
  const yDomain = (() => {
    if (!hasData) return undefined;
    const values = data.filter((d) => d.value !== null).map((d) => d.value as number);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const lo = refMin !== undefined ? Math.min(dataMin, refMin) : dataMin;
    const hi = refMax !== undefined ? Math.max(dataMax, refMax) : dataMax;
    const pad = (hi - lo) * 0.12 || 0.5;
    return [lo - pad, hi + pad] as [number, number];
  })();

  return (
    <div className={cn("bg-card border border-border rounded-2xl p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        {hasZone && (
          <span className="text-[10px] text-muted-foreground bg-muted/40 rounded px-1.5 py-0.5">
            {refMin}–{refMax}{unit.trim()}
          </span>
        )}
      </div>
      {!hasData ? (
        <div className="h-[120px] flex items-center justify-center">
          <p className="text-xs text-muted-foreground/60">{emptyMessage}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.toFixed(decimals)}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />

            {/* Zona ideal — banda colorida */}
            {hasZone && (
              <ReferenceArea
                y1={refMin}
                y2={refMax}
                fill={color}
                fillOpacity={0.12}
                strokeOpacity={0}
                ifOverflow="visible"
              />
            )}

            {/* Linhas de limite */}
            {refMin !== undefined && (
              <ReferenceLine
                y={refMin}
                stroke={color}
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                strokeWidth={1}
                ifOverflow="visible"
              />
            )}
            {refMax !== undefined && (
              <ReferenceLine
                y={refMax}
                stroke={color}
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                strokeWidth={1}
                ifOverflow="visible"
              />
            )}

            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 2, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

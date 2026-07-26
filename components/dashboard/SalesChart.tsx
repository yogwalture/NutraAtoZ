"use client";

import * as React from "react";
import { formatINRCompact } from "@/lib/format";

interface SalesChartProps {
  data: { label: string; value: number }[];
}

/** Dependency-free SVG bar chart of the recent payout trend. */
export default function SalesChart({ data }: SalesChartProps) {
  const [hover, setHover] = React.useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => d.value));
  const width = 640;
  const height = 200;
  const padX = 8;
  const padBottom = 24;
  const barGap = 6;
  const n = data.length || 1;
  const barW = (width - padX * 2 - barGap * (n - 1)) / n;
  const chartH = height - padBottom;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-48 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Daily vendor payout trend over the last 14 days"
      >
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={padX}
            x2={width - padX}
            y1={chartH - chartH * g}
            y2={chartH - chartH * g}
            stroke="hsl(168 16% 86%)"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        ))}
        {data.map((d, i) => {
          const h = d.value > 0 ? Math.max(2, (d.value / max) * chartH) : 0;
          const x = padX + i * (barW + barGap);
          const y = chartH - h;
          const active = hover === i;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={3}
                fill={active ? "hsl(171 67% 18%)" : "hsl(171 50% 30%)"}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              <rect
                x={x}
                y={0}
                width={barW}
                height={chartH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              {i % 2 === 0 && (
                <text
                  x={x + barW / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fill="hsl(158 7% 44%)"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-1 h-5 text-center text-xs text-muted-foreground">
        {hover != null ? (
          <span>
            <span className="font-medium text-foreground">
              {formatINRCompact(data[hover].value)}
            </span>{" "}
            · {data[hover].label}
          </span>
        ) : (
          <span>Hover a bar to see the day&apos;s payout</span>
        )}
      </div>
    </div>
  );
}

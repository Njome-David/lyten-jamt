// TelemetrySparkline.tsx
// Component to render a multi‑line sparkline SVG for the four mission gauges.
// No external chart libraries – pure SVG for compliance with rule 4.

import React from "react";

// Types for a single gauge sample point
export interface GaugeSample {
  timestamp: number; // epoch ms or incremental step index
  power: number; // 0‑100
  air: number; // 0‑100
  food: number; // 0‑100
  health: number; // 0‑100
}

/**
 * Props for the sparkline component.
 * @param data Array of gauge samples ordered chronologically.
 * @param width Desired width of the SVG (default 200).
 * @param height Desired height of the SVG (default 80).
 */
export interface TelemetrySparklineProps {
  data: GaugeSample[];
  width?: number;
  height?: number;
}

/**
 * Utility: maps a value (0‑100) to a Y coordinate inside the SVG.
 * The SVG origin (0,0) is top‑left, so higher values should be nearer the top.
 */
const valueToY = (value: number, height: number): number => {
  const padding = 4; // small padding to keep lines inside viewbox
  const usableHeight = height - padding * 2;
  // invert because higher value => lower Y (closer to top)
  return padding + (usableHeight * (100 - value)) / 100;
};

/**
 * Renders a polyline for a specific gauge.
 */
const renderLine = (
  points: { x: number; y: number }[],
  color: string,
  key: string,
) => (
  <polyline
    key={key}
    fill="none"
    stroke={color}
    strokeWidth={2}
    points={points.map((p) => `${p.x},${p.y}`).join(" ")}
  />
);

/**
 * TelemetrySparkline – pure SVG line chart for power, air, food, health.
 * Includes a dashed horizontal line at the 25% safety threshold.
 */
export const TelemetrySparkline: React.FC<TelemetrySparklineProps> = ({
  data,
  width = 200,
  height = 80,
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Determine X spacing based on number of points.
  const stepX = width / (data.length - 1);

  const lines = {
    power: [] as { x: number; y: number }[],
    air: [] as { x: number; y: number }[],
    food: [] as { x: number; y: number }[],
    health: [] as { x: number; y: number }[],
  };

  data.forEach((sample, idx) => {
    const x = idx * stepX;
    lines.power.push({ x, y: valueToY(sample.power, height) });
    lines.air.push({ x, y: valueToY(sample.air, height) });
    lines.food.push({ x, y: valueToY(sample.food, height) });
    lines.health.push({ x, y: valueToY(sample.health, height) });
  });

  // Danger threshold at 25%
  const dangerY = valueToY(25, height);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Mission telemetry sparkline"
    >
      {/* Background grid – optional subtle lines */}
      <line
        x1={0}
        y1={dangerY}
        x2={width}
        y2={dangerY}
        stroke="#ff5555"
        strokeDasharray="4 2"
        strokeWidth={1}
      />
      {/* Gauge lines */}
      {renderLine(lines.power, "#ff8800", "power")}
      {renderLine(lines.air, "#00aaff", "air")}
      {renderLine(lines.food, "#88cc00", "food")}
      {renderLine(lines.health, "#ff00aa", "health")}
    </svg>
  );
};

export default TelemetrySparkline;

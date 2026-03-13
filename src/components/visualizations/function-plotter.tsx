"use client";

import { useState, useMemo } from "react";
import { computePoints, evalMathExpr } from "@/lib/visualizations/math-eval";

interface FunctionPlotterProps {
  expression?: string;
  xMin?: number;
  xMax?: number;
  expression2?: string;
  color?: string;
  color2?: string;
  title?: string;
}

const W = 560;
const H = 360;
const PAD = 48;

function toSvgX(x: number, xMin: number, xMax: number) {
  return PAD + ((x - xMin) / (xMax - xMin)) * (W - 2 * PAD);
}
function toSvgY(y: number, yMin: number, yMax: number) {
  return H - PAD - ((y - yMin) / (yMax - yMin)) * (H - 2 * PAD);
}

function buildPath(
  pts: { x: number; y: number }[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
): string {
  let d = "";
  let pen = false;
  for (const p of pts) {
    if (!isFinite(p.y) || p.y < yMin - (yMax - yMin) || p.y > yMax + (yMax - yMin)) {
      pen = false;
      continue;
    }
    const sx = toSvgX(p.x, xMin, xMax);
    const sy = toSvgY(p.y, yMin, yMax);
    if (!pen) {
      d += `M${sx.toFixed(2)},${sy.toFixed(2)} `;
      pen = true;
    } else {
      d += `L${sx.toFixed(2)},${sy.toFixed(2)} `;
    }
  }
  return d;
}

export function FunctionPlotter({
  expression: initExpr = "sin(x)",
  xMin: initXMin = -6.28,
  xMax: initXMax = 6.28,
  expression2,
  color = "#6366f1",
  color2 = "#22c55e",
  title,
}: FunctionPlotterProps) {
  const [expr, setExpr] = useState(initExpr);
  const [xMin, setXMin] = useState(initXMin);
  const [xMax, setXMax] = useState(initXMax);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const pts1 = useMemo(() => computePoints(expr, xMin, xMax), [expr, xMin, xMax]);
  const pts2 = useMemo(
    () => (expression2 ? computePoints(expression2, xMin, xMax) : []),
    [expression2, xMin, xMax]
  );

  const validY1 = pts1.map((p) => p.y).filter(isFinite);
  const validY2 = pts2.map((p) => p.y).filter(isFinite);
  const allY = [...validY1, ...validY2];
  const rawYMin = allY.length ? Math.min(...allY) : -1;
  const rawYMax = allY.length ? Math.max(...allY) : 1;
  const yRange = rawYMax - rawYMin || 2;
  const yMin = rawYMin - yRange * 0.1;
  const yMax = rawYMax + yRange * 0.1;

  const path1 = buildPath(pts1, xMin, xMax, yMin, yMax);
  const path2 = expression2 ? buildPath(pts2, xMin, xMax, yMin, yMax) : "";

  // Hover y value
  const hoverY =
    hoverX !== null ? evalMathExpr(expr, hoverX) : null;

  // Axis positions
  const axisX = toSvgX(0, xMin, xMax);
  const axisY = toSvgY(0, yMin, yMax);

  // Grid lines
  const xTicks = 6;
  const yTicks = 5;

  return (
    <div className="viz-card">
      {title && <div className="viz-title">{title}</div>}
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto" }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const svgX = ((e.clientX - rect.left) / rect.width) * W;
          const x = xMin + ((svgX - PAD) / (W - 2 * PAD)) * (xMax - xMin);
          if (x >= xMin && x <= xMax) setHoverX(x);
        }}
        onMouseLeave={() => setHoverX(null)}
      >
        {/* Background */}
        <rect x={PAD} y={PAD} width={W - 2 * PAD} height={H - 2 * PAD} fill="#111" rx="4" />

        {/* Grid */}
        {Array.from({ length: xTicks + 1 }, (_, i) => {
          const x = xMin + (i / xTicks) * (xMax - xMin);
          const sx = toSvgX(x, xMin, xMax);
          return (
            <g key={`xg${i}`}>
              <line x1={sx} y1={PAD} x2={sx} y2={H - PAD} stroke="#222" strokeWidth="1" />
              <text x={sx} y={H - PAD + 14} textAnchor="middle" fontSize="10" fill="#555">
                {x.toFixed(1)}
              </text>
            </g>
          );
        })}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const y = yMin + (i / yTicks) * (yMax - yMin);
          const sy = toSvgY(y, yMin, yMax);
          return (
            <g key={`yg${i}`}>
              <line x1={PAD} y1={sy} x2={W - PAD} y2={sy} stroke="#222" strokeWidth="1" />
              <text x={PAD - 6} y={sy + 4} textAnchor="end" fontSize="10" fill="#555">
                {y.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Axes */}
        {axisX >= PAD && axisX <= W - PAD && (
          <line x1={axisX} y1={PAD} x2={axisX} y2={H - PAD} stroke="#444" strokeWidth="1.5" />
        )}
        {axisY >= PAD && axisY <= H - PAD && (
          <line x1={PAD} y1={axisY} x2={W - PAD} y2={axisY} stroke="#444" strokeWidth="1.5" />
        )}

        {/* Curves */}
        {path1 && (
          <path d={path1} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {path2 && (
          <path d={path2} fill="none" stroke={color2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Hover */}
        {hoverX !== null && hoverY !== null && isFinite(hoverY) && (
          <>
            <line
              x1={toSvgX(hoverX, xMin, xMax)}
              y1={PAD}
              x2={toSvgX(hoverX, xMin, xMax)}
              y2={H - PAD}
              stroke="#ffffff33"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
            <circle
              cx={toSvgX(hoverX, xMin, xMax)}
              cy={toSvgY(hoverY, yMin, yMax)}
              r="4"
              fill={color}
            />
            <rect
              x={toSvgX(hoverX, xMin, xMax) + 8}
              y={toSvgY(hoverY, yMin, yMax) - 18}
              width={110}
              height={20}
              fill="#1a1a1a"
              rx="4"
            />
            <text
              x={toSvgX(hoverX, xMin, xMax) + 13}
              y={toSvgY(hoverY, yMin, yMax) - 4}
              fontSize="11"
              fill="#f5f5f5"
            >
              ({hoverX.toFixed(3)}, {hoverY.toFixed(3)})
            </text>
          </>
        )}
      </svg>

      {/* Controls */}
      <div className="viz-controls">
        <label className="viz-label">
          f(x) =&nbsp;
          <input
            className="viz-input"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            spellCheck={false}
            placeholder="e.g. sin(x)*x"
          />
        </label>
        <label className="viz-label">
          x: [{xMin.toFixed(1)},&nbsp;
          <input
            type="range"
            min="-20"
            max="0"
            step="0.5"
            value={xMin}
            onChange={(e) => setXMin(Number(e.target.value))}
            className="viz-slider"
          />
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={xMax}
            onChange={(e) => setXMax(Number(e.target.value))}
            className="viz-slider"
          />
          {xMax.toFixed(1)}]
        </label>
      </div>
      {expression2 && (
        <div className="viz-legend">
          <span style={{ color }}>━ f(x) = {expr}</span>
          <span style={{ color: color2 }}>━ g(x) = {expression2}</span>
        </div>
      )}
    </div>
  );
}

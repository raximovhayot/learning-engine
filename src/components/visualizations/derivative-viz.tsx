"use client";

import { useState, useMemo } from "react";
import { computePoints, evalMathExpr } from "@/lib/visualizations/math-eval";

interface DerivativeVizProps {
  expression?: string;
  point?: number;
  xMin?: number;
  xMax?: number;
  title?: string;
}

const W = 560;
const H = 360;
const PAD = 50;

function toSvgX(x: number, xMin: number, xMax: number) {
  return PAD + ((x - xMin) / (xMax - xMin)) * (W - 2 * PAD);
}
function toSvgY(y: number, yMin: number, yMax: number) {
  return H - PAD - ((y - yMin) / (yMax - yMin)) * (H - 2 * PAD);
}

export function DerivativeViz({
  expression: initExpr = "x*x",
  point: initPoint = 1,
  xMin: initXMin = -4,
  xMax: initXMax = 4,
  title,
}: DerivativeVizProps) {
  const [expr, setExpr] = useState(initExpr);
  const [point, setPoint] = useState(initPoint);
  const [xMin, xMax] = [initXMin, initXMax];

  const pts = useMemo(() => computePoints(expr, xMin, xMax), [expr, xMin, xMax]);

  const validY = pts.map((p) => p.y).filter(isFinite);
  const rawYMin = validY.length ? Math.min(...validY) : -4;
  const rawYMax = validY.length ? Math.max(...validY) : 4;
  const yRange = rawYMax - rawYMin || 2;
  const yMin = rawYMin - yRange * 0.15;
  const yMax = rawYMax + yRange * 0.15;

  // Numerical derivative
  const h = 0.0001;
  const f0 = evalMathExpr(expr, point);
  const f1 = evalMathExpr(expr, point + h);
  const slope = (f1 - f0) / h;

  // Tangent line: y - f(x0) = slope * (x - x0)
  const tangentY = (x: number) => f0 + slope * (x - point);
  const tangentPts = [
    { x: xMin, y: tangentY(xMin) },
    { x: xMax, y: tangentY(xMax) },
  ];

  // Build SVG path
  let curvePath = "";
  let pen = false;
  for (const p of pts) {
    if (!isFinite(p.y) || p.y < yMin - (yMax - yMin) || p.y > yMax + (yMax - yMin)) {
      pen = false;
      continue;
    }
    const sx = toSvgX(p.x, xMin, xMax);
    const sy = toSvgY(p.y, yMin, yMax);
    curvePath += `${pen ? "L" : "M"}${sx.toFixed(2)},${sy.toFixed(2)} `;
    pen = true;
  }

  const tangentPath = tangentPts
    .filter((p) => isFinite(p.y))
    .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p.x, xMin, xMax).toFixed(2)},${toSvgY(p.y, yMin, yMax).toFixed(2)}`)
    .join(" ");

  const px = toSvgX(point, xMin, xMax);
  const py = toSvgY(f0, yMin, yMax);

  const axisY = toSvgY(0, yMin, yMax);
  const axisX = toSvgX(0, xMin, xMax);

  return (
    <div className="viz-card">
      {title && <div className="viz-title">{title}</div>}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        <rect x={PAD} y={PAD} width={W - 2 * PAD} height={H - 2 * PAD} fill="#111" rx="4" />

        {/* Axes */}
        {axisY >= PAD && axisY <= H - PAD && (
          <line x1={PAD} y1={axisY} x2={W - PAD} y2={axisY} stroke="#333" strokeWidth="1.5" />
        )}
        {axisX >= PAD && axisX <= W - PAD && (
          <line x1={axisX} y1={PAD} x2={axisX} y2={H - PAD} stroke="#333" strokeWidth="1.5" />
        )}

        {/* Tick labels */}
        {[-3, -2, -1, 1, 2, 3].map((v) => {
          const sx = toSvgX(v, xMin, xMax);
          const sy = toSvgY(v, yMin, yMax);
          return (
            <g key={v}>
              {sx >= PAD && sx <= W - PAD && (
                <text x={sx} y={axisY + 14} textAnchor="middle" fontSize="10" fill="#444">{v}</text>
              )}
              {sy >= PAD && sy <= H - PAD && (
                <text x={axisX - 8} y={sy + 4} textAnchor="end" fontSize="10" fill="#444">{v}</text>
              )}
            </g>
          );
        })}

        {/* Tangent line */}
        {tangentPath && (
          <path d={tangentPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,4" />
        )}

        {/* Function curve */}
        {curvePath && (
          <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Point of tangency */}
        <circle cx={px} cy={py} r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
        <line x1={px} y1={axisY} x2={px} y2={py} stroke="#f59e0b55" strokeWidth="1" strokeDasharray="4,3" />

        {/* Derivative label */}
        <rect x={px + 10} y={py - 24} width={160} height={18} fill="#1a1a1a" rx="4" />
        <text x={px + 14} y={py - 10} fontSize="12" fill="#f59e0b">
          f ′({point.toFixed(2)}) = {slope.toFixed(4)}
        </text>
      </svg>

      {/* Controls */}
      <div className="viz-controls">
        <label className="viz-label">
          f(x) =&nbsp;
          <input className="viz-input" value={expr} onChange={(e) => setExpr(e.target.value)}
            spellCheck={false} placeholder="x*x" />
        </label>
        <label className="viz-label">
          Tangent at x = {point.toFixed(2)}&nbsp;
          <input type="range" min={xMin} max={xMax} step="0.05" value={point}
            onChange={(e) => setPoint(Number(e.target.value))}
            className="viz-slider" style={{ width: "160px" }} />
        </label>
      </div>

      <div className="viz-info-row">
        <span style={{ color: "#6366f1" }}>━ f(x) = {expr}</span>
        <span style={{ color: "#f59e0b" }}>- - tangent at x = {point.toFixed(2)}</span>
        <span style={{ color: "#a0a0a0" }}>slope = {slope.toFixed(4)}</span>
      </div>
    </div>
  );
}

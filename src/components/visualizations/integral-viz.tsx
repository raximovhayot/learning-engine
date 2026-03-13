"use client";

import { useState, useMemo } from "react";
import { computePoints, evalMathExpr } from "@/lib/visualizations/math-eval";

interface IntegralVizProps {
  expression?: string;
  xMin?: number;
  xMax?: number;
  integralMin?: number;
  integralMax?: number;
  subdivisions?: number;
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

export function IntegralViz({
  expression: initExpr = "sin(x)",
  xMin: initXMin = -1,
  xMax: initXMax = 7,
  integralMin: initA = 0,
  integralMax: initB = 3.14159,
  subdivisions: initN = 50,
  title,
}: IntegralVizProps) {
  const [expr, setExpr] = useState(initExpr);
  const [a, setA] = useState(initA);
  const [b, setB] = useState(initB);
  const [n, setN] = useState(initN);
  const [xMin] = useState(initXMin);
  const [xMax] = useState(initXMax);

  const pts = useMemo(() => computePoints(expr, xMin, xMax), [expr, xMin, xMax]);

  const validY = pts.map((p) => p.y).filter(isFinite);
  const rawYMin = validY.length ? Math.min(...validY, 0) : -2;
  const rawYMax = validY.length ? Math.max(...validY, 0) : 2;
  const yRange = rawYMax - rawYMin || 2;
  const yMin = rawYMin - yRange * 0.15;
  const yMax = rawYMax + yRange * 0.15;

  // Numerical integration (trapezoidal rule)
  const integral = useMemo(() => {
    const step = (b - a) / Math.max(n, 1);
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const x0 = a + i * step;
      const x1 = a + (i + 1) * step;
      sum += ((evalMathExpr(expr, x0) + evalMathExpr(expr, x1)) / 2) * step;
    }
    return sum;
  }, [expr, a, b, n]);

  // Build curve path
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

  // Build shaded area path
  const shadePts = computePoints(expr, a, b, 120);
  const axisY0 = toSvgY(0, yMin, yMax);
  const aX = toSvgX(a, xMin, xMax);
  const bX = toSvgX(b, xMin, xMax);

  let shadePath = `M${aX.toFixed(2)},${axisY0.toFixed(2)} `;
  for (const p of shadePts) {
    if (!isFinite(p.y)) continue;
    const sy = toSvgY(p.y, yMin, yMax);
    shadePath += `L${toSvgX(p.x, xMin, xMax).toFixed(2)},${sy.toFixed(2)} `;
  }
  shadePath += `L${bX.toFixed(2)},${axisY0.toFixed(2)} Z`;

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
        {[-2, -1, 1, 2, 3, 4, 5, 6].map((v) => {
          const sx = toSvgX(v, xMin, xMax);
          return sx >= PAD && sx <= W - PAD ? (
            <text key={v} x={sx} y={axisY + 14} textAnchor="middle" fontSize="10" fill="#444">{v}</text>
          ) : null;
        })}

        {/* Shaded area */}
        <path d={shadePath} fill="#6366f133" stroke="none" />

        {/* Bounds lines */}
        <line x1={aX} y1={PAD} x2={aX} y2={H - PAD} stroke="#22c55e66" strokeWidth="1.5" strokeDasharray="5,4" />
        <line x1={bX} y1={PAD} x2={bX} y2={H - PAD} stroke="#ef444466" strokeWidth="1.5" strokeDasharray="5,4" />
        <text x={aX} y={PAD - 4} textAnchor="middle" fontSize="11" fill="#22c55e">a={a.toFixed(2)}</text>
        <text x={bX} y={PAD - 4} textAnchor="middle" fontSize="11" fill="#ef4444">b={b.toFixed(2)}</text>

        {/* Curve */}
        {curvePath && (
          <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Integral label */}
        <rect x={W / 2 - 80} y={PAD + 8} width={160} height={22} fill="#1a1a1a99" rx="4" />
        <text x={W / 2} y={PAD + 24} textAnchor="middle" fontSize="13" fill="#f5f5f5" fontWeight="600">
          ∫ f(x)dx ≈ {integral.toFixed(5)}
        </text>
      </svg>

      <div className="viz-controls">
        <label className="viz-label">
          f(x) =&nbsp;
          <input className="viz-input" value={expr} onChange={(e) => setExpr(e.target.value)}
            spellCheck={false} placeholder="sin(x)" />
        </label>
        <label className="viz-label">
          a = {a.toFixed(2)}&nbsp;
          <input type="range" min={xMin} max={b - 0.1} step="0.05" value={a}
            onChange={(e) => setA(Number(e.target.value))} className="viz-slider" />
        </label>
        <label className="viz-label">
          b = {b.toFixed(2)}&nbsp;
          <input type="range" min={a + 0.1} max={xMax} step="0.05" value={b}
            onChange={(e) => setB(Number(e.target.value))} className="viz-slider" />
        </label>
        <label className="viz-label">
          n = {n}&nbsp;
          <input type="range" min="4" max="200" step="2" value={n}
            onChange={(e) => setN(Number(e.target.value))} className="viz-slider" />
        </label>
      </div>

      <div className="viz-info-row">
        <span style={{ color: "#6366f1" }}>━ f(x) = {expr}</span>
        <span style={{ color: "#a0a0a0" }}>∫<sub>{a.toFixed(2)}</sub><sup>{b.toFixed(2)}</sup> f(x)dx ≈ <strong style={{ color: "#f5f5f5" }}>{integral.toFixed(5)}</strong></span>
      </div>
    </div>
  );
}

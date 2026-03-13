"use client";

import { useState } from "react";

interface MatrixTransformProps {
  matrix?: number[][];
  title?: string;
}

const W = 400;
const H = 400;
const CX = W / 2;
const CY = H / 2;
const SCALE = 60;

const SHAPES = {
  square: [
    [0, 0], [1, 0], [1, 1], [0, 1],
  ] as [number, number][],
  triangle: [
    [0, 0], [1, 0], [0.5, 1],
  ] as [number, number][],
  letter_L: [
    [0, 0], [0.5, 0], [0.5, 0.3], [0.2, 0.3], [0.2, 1], [0, 1],
  ] as [number, number][],
};

type ShapeName = keyof typeof SHAPES;

function applyMatrix(pts: [number, number][], m: number[][]): [number, number][] {
  return pts.map(([x, y]) => [
    m[0][0] * x + m[0][1] * y,
    m[1][0] * x + m[1][1] * y,
  ]);
}

function toSvg(pts: [number, number][]): string {
  return pts.map(([x, y], i) =>
    `${i === 0 ? "M" : "L"}${(CX + x * SCALE).toFixed(1)},${(CY - y * SCALE).toFixed(1)}`
  ).join(" ") + " Z";
}

function gridLine(x1: number, y1: number, x2: number, y2: number, m: number[][]): string {
  const pts: [number, number][] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    const [tx, ty] = [m[0][0] * x + m[0][1] * y, m[1][0] * x + m[1][1] * y];
    pts.push([tx, ty]);
  }
  return pts.map(([x, y], i) =>
    `${i === 0 ? "M" : "L"}${(CX + x * SCALE).toFixed(1)},${(CY - y * SCALE).toFixed(1)}`
  ).join(" ");
}

export function MatrixTransform({
  matrix: initMatrix = [[1, 0], [0, 1]],
  title,
}: MatrixTransformProps) {
  const [a, setA] = useState(initMatrix[0][0]);
  const [b, setB] = useState(initMatrix[0][1]);
  const [c, setC] = useState(initMatrix[1][0]);
  const [d, setD] = useState(initMatrix[1][1]);
  const [shape, setShape] = useState<ShapeName>("square");
  const [showGrid, setShowGrid] = useState(true);
  const [showOriginal, setShowOriginal] = useState(true);

  const m = [[a, b], [c, d]];
  const det = a * d - b * c;

  const pts = SHAPES[shape];
  const originalPath = toSvg(pts);
  const transformedPts = applyMatrix(pts, m);
  const transformedPath = toSvg(transformedPts);

  // Basis vectors
  const e1T: [number, number] = [m[0][0], m[1][0]];
  const e2T: [number, number] = [m[0][1], m[1][1]];

  return (
    <div className="viz-card">
      {title && <div className="viz-title">{title}</div>}

      {/* Matrix display */}
      <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px",
          padding: "12px", background: "#1a1a1a", borderRadius: "8px",
          border: "1px solid #2a2a2a",
        }}>
          <div style={{ fontSize: "11px", color: "#666", gridColumn: "1/-1", textAlign: "center" }}>
            Matrix M
          </div>
          {[
            { val: a, set: setA, label: "a" },
            { val: b, set: setB, label: "b" },
            { val: c, set: setC, label: "c" },
            { val: d, set: setD, label: "d" },
          ].map(({ val, set, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#666" }}>{label}</div>
              <input
                type="number"
                value={val}
                step="0.1"
                onChange={(e) => set(Number(e.target.value))}
                style={{
                  width: "60px", padding: "4px", textAlign: "center",
                  background: "#111", border: "1px solid #333", borderRadius: "4px",
                  color: "#f5f5f5", fontSize: "14px",
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ fontSize: "13px", color: "#a0a0a0" }}>
          <div style={{ marginBottom: "6px" }}>
            det(M) = <span style={{ color: det >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
              {det.toFixed(3)}
            </span>
          </div>
          <div style={{ marginBottom: "6px", color: "#666", fontSize: "12px" }}>
            {det === 0 ? "⚠ singular (collapses)" : det < 0 ? "↩ reflection + scale" : "↻ rotation + scale"}
          </div>
          <div style={{ fontSize: "11px", color: "#6366f1" }}>
            e₁ → ({e1T[0].toFixed(2)}, {e1T[1].toFixed(2)})
          </div>
          <div style={{ fontSize: "11px", color: "#22c55e" }}>
            e₂ → ({e2T[0].toFixed(2)}, {e2T[1].toFixed(2)})
          </div>
        </div>
      </div>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto", marginTop: "12px" }}>
        <rect width={W} height={H} fill="#111" rx="8" />

        {/* Grid — original */}
        {showGrid && [-3, -2, -1, 0, 1, 2, 3].map((v) => (
          <g key={v}>
            <line
              x1={CX + v * SCALE} y1={0}
              x2={CX + v * SCALE} y2={H}
              stroke="#1e1e1e" strokeWidth="1"
            />
            <line
              x1={0} y1={CY - v * SCALE}
              x2={W} y2={CY - v * SCALE}
              stroke="#1e1e1e" strokeWidth="1"
            />
          </g>
        ))}

        {/* Transformed grid */}
        {showGrid && [-3, -2, -1, 0, 1, 2, 3].map((v) => (
          <g key={v}>
            <path d={gridLine(v, -4, v, 4, m)} fill="none" stroke="#6366f122" strokeWidth="1" />
            <path d={gridLine(-4, v, 4, v, m)} fill="none" stroke="#6366f122" strokeWidth="1" />
          </g>
        ))}

        {/* Axes */}
        <line x1={0} y1={CY} x2={W} y2={CY} stroke="#333" strokeWidth="1.5" />
        <line x1={CX} y1={0} x2={CX} y2={H} stroke="#333" strokeWidth="1.5" />

        {/* Transformed basis vectors */}
        <line x1={CX} y1={CY} x2={CX + e1T[0] * SCALE} y2={CY - e1T[1] * SCALE}
          stroke="#6366f1" strokeWidth="2.5" markerEnd="url(#arrowB)" />
        <line x1={CX} y1={CY} x2={CX + e2T[0] * SCALE} y2={CY - e2T[1] * SCALE}
          stroke="#22c55e" strokeWidth="2.5" markerEnd="url(#arrowG)" />

        <defs>
          <marker id="arrowB" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6 Z" fill="#6366f1" />
          </marker>
          <marker id="arrowG" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6 Z" fill="#22c55e" />
          </marker>
        </defs>

        {/* Original shape */}
        {showOriginal && (
          <path d={originalPath} fill="#6366f122" stroke="#6366f188" strokeWidth="1.5" strokeDasharray="5,3" />
        )}

        {/* Transformed shape */}
        <path d={transformedPath} fill="#f59e0b22" stroke="#f59e0b" strokeWidth="2" />
      </svg>

      <div className="viz-controls">
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <label className="viz-label">
            Shape:&nbsp;
            <select value={shape} onChange={(e) => setShape(e.target.value as ShapeName)} className="viz-select">
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
              <option value="letter_L">Letter L</option>
            </select>
          </label>
          <label className="viz-label">
            <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
            &nbsp;Transformed grid
          </label>
          <label className="viz-label">
            <input type="checkbox" checked={showOriginal} onChange={(e) => setShowOriginal(e.target.checked)} />
            &nbsp;Original shape
          </label>
        </div>

        {/* Preset transformations */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
          {[
            { label: "Identity", vals: [1,0,0,1] },
            { label: "Rotate 45°", vals: [Math.cos(Math.PI/4), -Math.sin(Math.PI/4), Math.sin(Math.PI/4), Math.cos(Math.PI/4)] },
            { label: "Scale 2x", vals: [2,0,0,2] },
            { label: "Shear x", vals: [1,1,0,1] },
            { label: "Reflect x", vals: [1,0,0,-1] },
            { label: "Project x", vals: [1,0,0,0] },
          ].map(({ label, vals }) => (
            <button
              key={label}
              className="viz-quick-btn"
              onClick={() => { setA(vals[0]); setB(vals[1]); setC(vals[2]); setD(vals[3]); }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

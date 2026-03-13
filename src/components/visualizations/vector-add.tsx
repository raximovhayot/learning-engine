"use client";

import { useState } from "react";

interface Vector {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

interface VectorAddProps {
  vectors?: Vector[];
  title?: string;
}

const W = 500;
const H = 380;
const PAD = 60;
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#a78bfa"];

function Arrow({
  x1, y1, x2, y2, color, label,
}: {
  x1: number; y1: number; x2: number; y2: number; color: string; label?: string;
}) {
  const id = `arrow-${color.replace("#", "")}`;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return null;
  return (
    <g>
      <defs>
        <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 Z" fill={color} />
        </marker>
      </defs>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth="2.5"
        markerEnd={`url(#${id})`}
      />
      {label && (
        <text
          x={(x1 + x2) / 2 + dy / len * 12}
          y={(y1 + y2) / 2 - dx / len * 12}
          fontSize="13"
          fill={color}
          fontWeight="600"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}

export function VectorAdd({ vectors: initVectors, title }: VectorAddProps) {
  const [vectors, setVectors] = useState<Vector[]>(
    initVectors || [
      { x: 3, y: 2, label: "a", color: "#6366f1" },
      { x: 1, y: -3, label: "b", color: "#22c55e" },
    ]
  );

  // Compute sum
  const sum = vectors.reduce((acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }), { x: 0, y: 0 });

  // Determine scale
  const allX = vectors.flatMap((v) => [0, v.x, sum.x]);
  const allY = vectors.flatMap((v) => [0, v.y, sum.y]);
  const maxAbs = Math.max(
    ...allX.map(Math.abs),
    ...allY.map(Math.abs),
    1
  );
  const scale = ((Math.min(W, H) - 2 * PAD) / 2) / (maxAbs * 1.2);

  const ox = W / 2;
  const oy = H / 2;

  function toSvgX(x: number) { return ox + x * scale; }
  function toSvgY(y: number) { return oy - y * scale; }

  // Compute tip-to-tail positions
  let cx = 0, cy = 0;
  const tipTail = vectors.map((v) => {
    const x1 = toSvgX(cx); const y1 = toSvgY(cy);
    cx += v.x; cy += v.y;
    return { x1, y1, x2: toSvgX(cx), y2: toSvgY(cy), v };
  });

  const updateVector = (i: number, field: "x" | "y", val: number) => {
    setVectors((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v));
  };

  return (
    <div className="viz-card">
      {title && <div className="viz-title">{title}</div>}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto" }}>
          <rect width={W} height={H} fill="#111" rx="8" />

          {/* Grid */}
          {Array.from({ length: 11 }, (_, i) => {
            const v = (i - 5) * Math.ceil(maxAbs / 5);
            const sx = toSvgX(v); const sy = toSvgY(v);
            return (
              <g key={i}>
                <line x1={sx} y1={PAD / 2} x2={sx} y2={H - PAD / 2} stroke="#1a1a1a" strokeWidth="1" />
                <line x1={PAD / 2} y1={sy} x2={W - PAD / 2} y2={sy} stroke="#1a1a1a" strokeWidth="1" />
              </g>
            );
          })}

          {/* Axes */}
          <line x1={PAD / 2} y1={oy} x2={W - PAD / 2} y2={oy} stroke="#333" strokeWidth="1.5" />
          <line x1={ox} y1={PAD / 2} x2={ox} y2={H - PAD / 2} stroke="#333" strokeWidth="1.5" />
          <text x={W - PAD / 2 + 4} y={oy + 4} fontSize="12" fill="#444">x</text>
          <text x={ox + 4} y={PAD / 2 - 4} fontSize="12" fill="#444">y</text>

          {/* Tip-to-tail vectors (dashed) */}
          {tipTail.map(({ x1, y1, x2, y2, v }, i) => (
            <Arrow key={`tt${i}`} x1={x1} y1={y1} x2={x2} y2={y2} color={v.color || COLORS[i % COLORS.length]} />
          ))}

          {/* Vectors from origin */}
          {vectors.map((v, i) => (
            <Arrow
              key={`vo${i}`}
              x1={ox} y1={oy}
              x2={toSvgX(v.x)} y2={toSvgY(v.y)}
              color={v.color || COLORS[i % COLORS.length]}
              label={v.label || `v${i + 1}`}
            />
          ))}

          {/* Sum vector */}
          {(sum.x !== 0 || sum.y !== 0) && (
            <Arrow
              x1={ox} y1={oy}
              x2={toSvgX(sum.x)} y2={toSvgY(sum.y)}
              color="#ef4444"
              label="R"
            />
          )}
        </svg>

        {/* Controls */}
        <div style={{ minWidth: 160 }}>
          {vectors.map((v, i) => (
            <div key={i} style={{ marginBottom: "12px", padding: "8px", background: "#1a1a1a", borderRadius: "8px", border: `1px solid ${v.color || COLORS[i % COLORS.length]}33` }}>
              <div style={{ color: v.color || COLORS[i % COLORS.length], fontWeight: 600, fontSize: "13px", marginBottom: "6px" }}>
                {v.label || `v${i + 1}`}
              </div>
              <label className="viz-label" style={{ fontSize: "12px" }}>
                x: {v.x.toFixed(1)}&nbsp;
                <input type="range" min="-8" max="8" step="0.5" value={v.x}
                  onChange={(e) => updateVector(i, "x", Number(e.target.value))}
                  className="viz-slider" style={{ width: "100px" }} />
              </label>
              <label className="viz-label" style={{ fontSize: "12px" }}>
                y: {v.y.toFixed(1)}&nbsp;
                <input type="range" min="-8" max="8" step="0.5" value={v.y}
                  onChange={(e) => updateVector(i, "y", Number(e.target.value))}
                  className="viz-slider" style={{ width: "100px" }} />
              </label>
            </div>
          ))}
          <div style={{ padding: "8px", background: "#1a1a1a", borderRadius: "8px", border: "1px solid #ef444433", fontSize: "12px" }}>
            <div style={{ color: "#ef4444", fontWeight: 600, marginBottom: "4px" }}>Resultant R</div>
            <div style={{ color: "#a0a0a0" }}>
              ({sum.x.toFixed(2)}, {sum.y.toFixed(2)})<br />
              |R| = {Math.sqrt(sum.x ** 2 + sum.y ** 2).toFixed(3)}<br />
              θ = {(Math.atan2(sum.y, sum.x) * 180 / Math.PI).toFixed(1)}°
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

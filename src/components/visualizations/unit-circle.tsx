"use client";

import { useState } from "react";

const W = 360;
const H = 360;
const CX = W / 2;
const CY = H / 2;
const R = 130;

interface UnitCircleProps {
  angle?: number;
  title?: string;
}

export function UnitCircle({ angle: initAngle = 45, title }: UnitCircleProps) {
  const [angleDeg, setAngleDeg] = useState(initAngle);

  const rad = (angleDeg * Math.PI) / 180;
  const px = CX + R * Math.cos(rad);
  const py = CY - R * Math.sin(rad);
  const cosVal = Math.cos(rad);
  const sinVal = Math.sin(rad);
  const tanVal = Math.tan(rad);

  // Arc path for angle indicator
  const arcR = 32;
  const arcX = CX + arcR * Math.cos(rad);
  const arcY = CY - arcR * Math.sin(rad);
  const largeArc = angleDeg > 180 ? 1 : 0;

  return (
    <div className="viz-card">
      {title && <div className="viz-title">{title}</div>}
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", maxWidth: W, height: "auto" }}
        >
          <rect width={W} height={H} fill="#111" rx="8" />

          {/* Grid lines */}
          <line x1={CX} y1={20} x2={CX} y2={H - 20} stroke="#2a2a2a" strokeWidth="1" />
          <line x1={20} y1={CY} x2={W - 20} y2={CY} stroke="#2a2a2a" strokeWidth="1" />

          {/* Tick marks */}
          {[-1, -0.5, 0.5, 1].map((v) => (
            <g key={v}>
              <line x1={CX + v * R - 3} y1={CY} x2={CX + v * R + 3} y2={CY} stroke="#444" strokeWidth="1.5" />
              <line x1={CX} y1={CY - v * R - 3} x2={CX} y2={CY - v * R + 3} stroke="#444" strokeWidth="1.5" />
              {v !== 0 && (
                <>
                  <text x={CX + v * R} y={CY + 16} textAnchor="middle" fontSize="10" fill="#555">{v}</text>
                  <text x={CX - 18} y={CY - v * R + 4} textAnchor="end" fontSize="10" fill="#555">{v}</text>
                </>
              )}
            </g>
          ))}

          {/* Unit circle */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#333" strokeWidth="1.5" />

          {/* Angle arc */}
          <path
            d={`M ${CX + arcR} ${CY} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcX.toFixed(2)} ${arcY.toFixed(2)}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <text
            x={CX + 46 * Math.cos(rad / 2)}
            y={CY - 46 * Math.sin(rad / 2) + 4}
            fontSize="11"
            fill="#f59e0b"
            textAnchor="middle"
          >
            θ
          </text>

          {/* cos line (horizontal) */}
          <line
            x1={CX}
            y1={py}
            x2={px}
            y2={py}
            stroke="#6366f1"
            strokeWidth="2"
            strokeDasharray="4,3"
          />
          {/* sin line (vertical) */}
          <line
            x1={px}
            y1={CY}
            x2={px}
            y2={py}
            stroke="#22c55e"
            strokeWidth="2"
            strokeDasharray="4,3"
          />

          {/* Radius */}
          <line x1={CX} y1={CY} x2={px} y2={py} stroke="#f5f5f5" strokeWidth="2" />

          {/* Point on circle */}
          <circle cx={px} cy={py} r="6" fill="#6366f1" stroke="#f5f5f5" strokeWidth="1.5" />

          {/* Labels */}
          <text
            x={CX + (cosVal / 2) * R}
            y={py - 6}
            textAnchor="middle"
            fontSize="12"
            fill="#6366f1"
            fontWeight="600"
          >
            cos θ = {cosVal.toFixed(3)}
          </text>
          <text
            x={px + (cosVal >= 0 ? 8 : -8)}
            y={CY - (sinVal / 2) * R}
            textAnchor={cosVal >= 0 ? "start" : "end"}
            fontSize="12"
            fill="#22c55e"
            fontWeight="600"
          >
            sin θ = {sinVal.toFixed(3)}
          </text>

          {/* Point label */}
          <text
            x={px + (cosVal >= 0 ? 10 : -10)}
            y={py + (sinVal >= 0 ? -10 : 18)}
            fontSize="11"
            fill="#f5f5f5"
            textAnchor={cosVal >= 0 ? "start" : "end"}
          >
            ({cosVal.toFixed(2)}, {sinVal.toFixed(2)})
          </text>
        </svg>

        {/* Values panel */}
        <div className="viz-values-panel">
          <div className="viz-value-row">
            <span className="viz-value-label">θ</span>
            <span className="viz-value">{angleDeg}°</span>
          </div>
          <div className="viz-value-row">
            <span className="viz-value-label">rad</span>
            <span className="viz-value">{rad.toFixed(4)}</span>
          </div>
          <div className="viz-value-row" style={{ color: "#6366f1" }}>
            <span className="viz-value-label">cos θ</span>
            <span className="viz-value">{cosVal.toFixed(4)}</span>
          </div>
          <div className="viz-value-row" style={{ color: "#22c55e" }}>
            <span className="viz-value-label">sin θ</span>
            <span className="viz-value">{sinVal.toFixed(4)}</span>
          </div>
          <div className="viz-value-row" style={{ color: "#f59e0b" }}>
            <span className="viz-value-label">tan θ</span>
            <span className="viz-value">{Math.abs(tanVal) > 999 ? "∞" : tanVal.toFixed(4)}</span>
          </div>

          {/* Special angles */}
          <div style={{ marginTop: "12px", fontSize: "11px", color: "#666" }}>
            Quick angles:
          </div>
          {[0, 30, 45, 60, 90, 120, 135, 150, 180, 270, 360].map((a) => (
            <button
              key={a}
              onClick={() => setAngleDeg(a)}
              className="viz-quick-btn"
              style={{ background: angleDeg === a ? "#6366f1" : "#1a1a1a" }}
            >
              {a}°
            </button>
          ))}
        </div>
      </div>

      {/* Slider */}
      <div className="viz-controls" style={{ marginTop: "8px" }}>
        <label className="viz-label">
          Angle: {angleDeg}°&nbsp;
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={angleDeg}
            onChange={(e) => setAngleDeg(Number(e.target.value))}
            className="viz-slider"
            style={{ width: "200px" }}
          />
        </label>
      </div>
    </div>
  );
}

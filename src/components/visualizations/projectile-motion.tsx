"use client";

import { useState, useEffect, useRef } from "react";

interface ProjectileMotionProps {
  initialSpeed?: number;
  launchAngle?: number;
  gravity?: number;
  title?: string;
}

const W = 560;
const H = 320;
const PAD_L = 50;
const PAD_B = 40;
const PAD_T = 20;
const PAD_R = 20;

export function ProjectileMotion({
  initialSpeed: initSpeed = 20,
  launchAngle: initAngle = 45,
  gravity: g = 9.81,
  title,
}: ProjectileMotionProps) {
  const [speed, setSpeed] = useState(initSpeed);
  const [angle, setAngle] = useState(initAngle);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const rad = (angle * Math.PI) / 180;
  const vx = speed * Math.cos(rad);
  const vy = speed * Math.sin(rad);
  const totalT = (2 * vy) / g;
  const maxX = vx * totalT;
  const maxH = (vy * vy) / (2 * g);

  // Generate trajectory path
  const steps = 100;
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const ti = (i / steps) * totalT;
    return { x: vx * ti, y: vy * ti - 0.5 * g * ti * ti };
  });

  const svgW = W - PAD_L - PAD_R;
  const svgH = H - PAD_B - PAD_T;

  function toSvgX(x: number) {
    return PAD_L + (x / maxX) * svgW;
  }
  function toSvgY(y: number) {
    return H - PAD_B - (y / (maxH * 1.2)) * svgH;
  }

  const pathD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p.x).toFixed(1)},${toSvgY(p.y).toFixed(1)}`)
    .join(" ");

  // Current position
  const tClamped = Math.min(t, totalT);
  const curX = vx * tClamped;
  const curY = vy * tClamped - 0.5 * g * tClamped * tClamped;

  useEffect(() => {
    if (!playing) return;
    startRef.current = null;

    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      setT(elapsed);
      if (elapsed < totalT) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setPlaying(false);
        setT(totalT);
      }
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, totalT]);

  const handlePlay = () => {
    setT(0);
    setPlaying(true);
  };

  const handleReset = () => {
    setPlaying(false);
    setT(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  return (
    <div className="viz-card">
      {title && <div className="viz-title">{title}</div>}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        <rect width={W} height={H} fill="#111" rx="8" />

        {/* Ground */}
        <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="#444" strokeWidth="2" />

        {/* Y-axis */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="#333" strokeWidth="1.5" />

        {/* Axis labels */}
        <text x={PAD_L + svgW / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#555">
          Range (m)
        </text>
        <text x={12} y={H / 2} textAnchor="middle" fontSize="11" fill="#555" transform={`rotate(-90, 12, ${H / 2})`}>
          Height (m)
        </text>

        {/* Grid */}
        {[0.25, 0.5, 0.75, 1].map((frac) => (
          <g key={frac}>
            <line
              x1={PAD_L + frac * svgW} y1={PAD_T}
              x2={PAD_L + frac * svgW} y2={H - PAD_B}
              stroke="#1d1d1d" strokeWidth="1"
            />
            <text x={PAD_L + frac * svgW} y={H - PAD_B + 14} textAnchor="middle" fontSize="10" fill="#444">
              {(frac * maxX).toFixed(0)}
            </text>
          </g>
        ))}
        {[0.25, 0.5, 0.75, 1].map((frac) => (
          <g key={frac}>
            <line
              x1={PAD_L} y1={toSvgY(frac * maxH * 1.2)}
              x2={W - PAD_R} y2={toSvgY(frac * maxH * 1.2)}
              stroke="#1d1d1d" strokeWidth="1"
            />
            <text x={PAD_L - 4} y={toSvgY(frac * maxH * 1.2) + 4} textAnchor="end" fontSize="10" fill="#444">
              {(frac * maxH * 1.2).toFixed(0)}
            </text>
          </g>
        ))}

        {/* Max height marker */}
        <line
          x1={PAD_L} y1={toSvgY(maxH)}
          x2={toSvgX(maxX / 2)} y2={toSvgY(maxH)}
          stroke="#f59e0b33" strokeWidth="1" strokeDasharray="4,4"
        />
        <text x={PAD_L + 4} y={toSvgY(maxH) - 4} fontSize="10" fill="#f59e0b">
          max h = {maxH.toFixed(1)} m
        </text>

        {/* Trajectory path */}
        <path d={pathD} fill="none" stroke="#6366f155" strokeWidth="2" strokeLinecap="round" />

        {/* Animated trail */}
        {t > 0 && (() => {
          const trailPts = pts.filter((p, i) => (i / steps) * totalT <= tClamped + 0.01);
          if (trailPts.length < 2) return null;
          const trailD = trailPts
            .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p.x).toFixed(1)},${toSvgY(p.y).toFixed(1)}`)
            .join(" ");
          return <path d={trailD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />;
        })()}

        {/* Projectile */}
        <circle
          cx={toSvgX(curX)}
          cy={toSvgY(Math.max(0, curY))}
          r="8"
          fill="#6366f1"
          stroke="#818cf8"
          strokeWidth="2"
        />

        {/* Launch angle indicator */}
        <line
          x1={PAD_L} y1={H - PAD_B}
          x2={PAD_L + 28 * Math.cos(rad)}
          y2={H - PAD_B - 28 * Math.sin(rad)}
          stroke="#f59e0b" strokeWidth="2"
        />
        <text x={PAD_L + 22} y={H - PAD_B - 8} fontSize="10" fill="#f59e0b">{angle}°</text>

        {/* Range label */}
        <text x={toSvgX(maxX)} y={H - PAD_B + 14} textAnchor="middle" fontSize="10" fill="#22c55e">
          R={maxX.toFixed(1)}m
        </text>
      </svg>

      {/* Stats */}
      <div className="viz-stats-row">
        <span className="viz-stat"><span className="viz-stat-label">Range</span>{maxX.toFixed(1)} m</span>
        <span className="viz-stat"><span className="viz-stat-label">Max height</span>{maxH.toFixed(1)} m</span>
        <span className="viz-stat"><span className="viz-stat-label">Time</span>{totalT.toFixed(2)} s</span>
        <span className="viz-stat"><span className="viz-stat-label">vₓ</span>{vx.toFixed(1)} m/s</span>
        <span className="viz-stat"><span className="viz-stat-label">v₀ᵧ</span>{vy.toFixed(1)} m/s</span>
      </div>

      {/* Controls */}
      <div className="viz-controls">
        <label className="viz-label">
          v₀: {speed} m/s&nbsp;
          <input type="range" min="5" max="50" step="1" value={speed}
            onChange={(e) => { setSpeed(Number(e.target.value)); handleReset(); }}
            className="viz-slider" />
        </label>
        <label className="viz-label">
          θ: {angle}°&nbsp;
          <input type="range" min="1" max="89" step="1" value={angle}
            onChange={(e) => { setAngle(Number(e.target.value)); handleReset(); }}
            className="viz-slider" />
        </label>
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <button onClick={handlePlay} disabled={playing} className="viz-btn">
            ▶ Launch
          </button>
          <button onClick={handleReset} className="viz-btn viz-btn-secondary">
            ↺ Reset
          </button>
        </div>
      </div>
    </div>
  );
}

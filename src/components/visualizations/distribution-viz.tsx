"use client";

import { useState, useMemo } from "react";

interface DistributionVizProps {
  mean?: number;
  stdDev?: number;
  highlightMin?: number;
  highlightMax?: number;
  title?: string;
}

const W = 560;
const H = 320;
const PAD_L = 60;
const PAD_R = 20;
const PAD_T = 30;
const PAD_B = 50;

function normalPDF(x: number, mu: number, sigma: number): number {
  return (
    (1 / (sigma * Math.sqrt(2 * Math.PI))) *
    Math.exp(-0.5 * ((x - mu) / sigma) ** 2)
  );
}

export function DistributionViz({
  mean: initMean = 0,
  stdDev: initStd = 1,
  highlightMin,
  highlightMax,
  title,
}: DistributionVizProps) {
  const [mean, setMean] = useState(initMean);
  const [std, setStd] = useState(initStd);
  const [hlMin, setHlMin] = useState(highlightMin ?? initMean - initStd);
  const [hlMax, setHlMax] = useState(highlightMax ?? initMean + initStd);
  const [showSigmas, setShowSigmas] = useState(true);

  const xLow = mean - 4 * std;
  const xHigh = mean + 4 * std;

  const STEPS = 300;
  const pts = useMemo(
    () =>
      Array.from({ length: STEPS + 1 }, (_, i) => {
        const x = xLow + (i / STEPS) * (xHigh - xLow);
        return { x, y: normalPDF(x, mean, std) };
      }),
    [mean, std, xLow, xHigh]
  );

  const maxY = normalPDF(mean, mean, std) * 1.15;

  const svgW = W - PAD_L - PAD_R;
  const svgH = H - PAD_T - PAD_B;

  function toSvgX(x: number) {
    return PAD_L + ((x - xLow) / (xHigh - xLow)) * svgW;
  }
  function toSvgY(y: number) {
    return H - PAD_B - (y / maxY) * svgH;
  }

  const curvePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p.x).toFixed(2)},${toSvgY(p.y).toFixed(2)}`)
    .join(" ");

  // Shaded area between hlMin and hlMax
  const shadePts = pts.filter((p) => p.x >= hlMin && p.x <= hlMax);
  const baseY = toSvgY(0);
  let shadePath = "";
  if (shadePts.length > 1) {
    shadePath = `M${toSvgX(shadePts[0].x).toFixed(2)},${baseY} `;
    for (const p of shadePts) {
      shadePath += `L${toSvgX(p.x).toFixed(2)},${toSvgY(p.y).toFixed(2)} `;
    }
    shadePath += `L${toSvgX(shadePts[shadePts.length - 1].x).toFixed(2)},${baseY} Z`;
  }

  // Probability in the highlighted range (numerical integration)
  const prob = useMemo(() => {
    let sum = 0;
    const step = (hlMax - hlMin) / 500;
    for (let x = hlMin; x <= hlMax; x += step) {
      sum += normalPDF(x, mean, std) * step;
    }
    return Math.min(1, Math.max(0, sum));
  }, [mean, std, hlMin, hlMax]);

  // X axis ticks
  const ticks = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((d) => mean + d * std);

  return (
    <div className="viz-card">
      {title && <div className="viz-title">{title}</div>}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        <rect x={PAD_L} y={PAD_T} width={svgW} height={svgH} fill="#111" rx="4" />

        {/* Y axis */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="#333" strokeWidth="1.5" />
        {/* X axis */}
        <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="#333" strokeWidth="1.5" />

        {/* Sigma lines */}
        {showSigmas &&
          [-3, -2, -1, 1, 2, 3].map((d) => {
            const sx = toSvgX(mean + d * std);
            return (
              <g key={d}>
                <line x1={sx} y1={PAD_T} x2={sx} y2={H - PAD_B} stroke="#2a2a2a" strokeWidth="1" strokeDasharray="4,3" />
                <text x={sx} y={H - PAD_B + 14} textAnchor="middle" fontSize="10" fill="#444">
                  {d > 0 ? `+${d}σ` : `${d}σ`}
                </text>
              </g>
            );
          })}

        {/* X ticks */}
        {ticks.map((x, i) => (
          <text key={i} x={toSvgX(x)} y={H - PAD_B + 26} textAnchor="middle" fontSize="9" fill="#555">
            {x.toFixed(1)}
          </text>
        ))}

        {/* Y axis labels */}
        {[0.25, 0.5, 0.75, 1].map((frac) => {
          const y = frac * maxY;
          const sy = toSvgY(y);
          return (
            <text key={frac} x={PAD_L - 6} y={sy + 4} textAnchor="end" fontSize="10" fill="#444">
              {y.toFixed(3)}
            </text>
          );
        })}

        {/* Shaded region */}
        {shadePath && <path d={shadePath} fill="#6366f144" stroke="none" />}

        {/* Curve */}
        <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />

        {/* Mean line */}
        <line
          x1={toSvgX(mean)} y1={PAD_T}
          x2={toSvgX(mean)} y2={H - PAD_B}
          stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3"
        />
        <text x={toSvgX(mean)} y={PAD_T - 4} textAnchor="middle" fontSize="11" fill="#f59e0b">
          μ = {mean.toFixed(2)}
        </text>

        {/* Probability label */}
        <rect x={W / 2 - 90} y={PAD_T + 6} width={180} height={20} fill="#1a1a1a99" rx="4" />
        <text x={W / 2} y={PAD_T + 21} textAnchor="middle" fontSize="12" fill="#f5f5f5" fontWeight="600">
          P({hlMin.toFixed(2)} ≤ X ≤ {hlMax.toFixed(2)}) = {(prob * 100).toFixed(2)}%
        </text>
      </svg>

      <div className="viz-controls">
        <label className="viz-label">
          μ (mean): {mean.toFixed(2)}&nbsp;
          <input type="range" min="-5" max="5" step="0.1" value={mean}
            onChange={(e) => {
              const newMean = Number(e.target.value);
              setMean(newMean);
              setHlMin(newMean - std);
              setHlMax(newMean + std);
            }}
            className="viz-slider" />
        </label>
        <label className="viz-label">
          σ (std dev): {std.toFixed(2)}&nbsp;
          <input type="range" min="0.2" max="3" step="0.1" value={std}
            onChange={(e) => {
              const newStd = Number(e.target.value);
              setStd(newStd);
              setHlMin(mean - newStd);
              setHlMax(mean + newStd);
            }}
            className="viz-slider" />
        </label>
        <label className="viz-label">
          highlight low: {hlMin.toFixed(2)}&nbsp;
          <input type="range" min={mean - 4 * std} max={hlMax} step="0.1" value={hlMin}
            onChange={(e) => setHlMin(Number(e.target.value))}
            className="viz-slider" />
        </label>
        <label className="viz-label">
          highlight high: {hlMax.toFixed(2)}&nbsp;
          <input type="range" min={hlMin} max={mean + 4 * std} step="0.1" value={hlMax}
            onChange={(e) => setHlMax(Number(e.target.value))}
            className="viz-slider" />
        </label>
        <label className="viz-label">
          <input type="checkbox" checked={showSigmas} onChange={(e) => setShowSigmas(e.target.checked)} />
          &nbsp;Show σ lines
        </label>
      </div>
    </div>
  );
}

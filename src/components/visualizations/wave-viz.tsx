"use client";

import { useState, useEffect, useRef } from "react";

interface WaveConfig {
  amplitude: number;
  frequency: number;
  phase?: number;
}

interface WaveVizProps {
  wave1?: WaveConfig;
  wave2?: WaveConfig;
  title?: string;
  showSuperposition?: boolean;
}

const W = 560;
const H = 300;
const PAD_L = 20;
const PAD_R = 20;
const PAD_V = 30;
const POINTS = 400;

export function WaveViz({
  wave1: w1Init = { amplitude: 1, frequency: 1, phase: 0 },
  wave2: w2Init,
  title,
  showSuperposition = true,
}: WaveVizProps) {
  const [wave1, setWave1] = useState<WaveConfig>(w1Init);
  const [wave2, setWave2] = useState<WaveConfig>(
    w2Init || { amplitude: 0.5, frequency: 2, phase: 0 }
  );
  const [hasWave2, setHasWave2] = useState(!!w2Init);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let prev: number | null = null;
    function tick(ts: number) {
      if (prev !== null) setTime((t) => t + (ts - prev!) * 0.001);
      prev = ts;
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing]);

  const superMaxA = wave1.amplitude + (hasWave2 ? wave2.amplitude : 0);

  function buildPath(fn: (x: number) => number, scaleY: number): string {
    let d = "";
    for (let i = 0; i <= POINTS; i++) {
      const x = (i / POINTS) * (W - PAD_L - PAD_R) + PAD_L;
      const xNorm = (i / POINTS) * 4 * Math.PI;
      const y = H / 2 - fn(xNorm) * scaleY;
      d += `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)} `;
    }
    return d;
  }

  const scaleY = ((H / 2 - PAD_V) / superMaxA) * 0.9;

  const path1 = buildPath(
    (x) => wave1.amplitude * Math.sin(wave1.frequency * x - time * wave1.frequency * 2 + (wave1.phase || 0)),
    scaleY
  );

  const path2 = hasWave2
    ? buildPath(
        (x) => wave2.amplitude * Math.sin(wave2.frequency * x - time * wave2.frequency * 2 + (wave2.phase || 0)),
        scaleY
      )
    : null;

  const pathSuper = (hasWave2 && showSuperposition)
    ? buildPath(
        (x) =>
          wave1.amplitude * Math.sin(wave1.frequency * x - time * wave1.frequency * 2 + (wave1.phase || 0)) +
          wave2.amplitude * Math.sin(wave2.frequency * x - time * wave2.frequency * 2 + (wave2.phase || 0)),
        scaleY
      )
    : null;

  const updateW = (
    setFn: (fn: (prev: WaveConfig) => WaveConfig) => void,
    field: keyof WaveConfig,
    val: number
  ) => {
    setFn((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="viz-card">
      {title && <div className="viz-title">{title}</div>}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        <rect width={W} height={H} fill="#111" rx="8" />
        {/* Center line */}
        <line x1={PAD_L} y1={H / 2} x2={W - PAD_R} y2={H / 2} stroke="#2a2a2a" strokeWidth="1" />

        {/* Wave 1 */}
        <path d={path1} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />

        {/* Wave 2 */}
        {path2 && <path d={path2} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />}

        {/* Superposition */}
        {pathSuper && <path d={pathSuper} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeDasharray="6,3" />}

        {/* Labels */}
        <text x={PAD_L + 4} y={24} fontSize="11" fill="#6366f1">
          Wave 1: A={wave1.amplitude} f={wave1.frequency}
        </text>
        {hasWave2 && (
          <text x={PAD_L + 4} y={40} fontSize="11" fill="#22c55e">
            Wave 2: A={wave2.amplitude} f={wave2.frequency}
          </text>
        )}
        {pathSuper && (
          <text x={PAD_L + 4} y={hasWave2 ? 56 : 40} fontSize="11" fill="#f59e0b">
            Superposition
          </text>
        )}
      </svg>

      <div className="viz-controls">
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <button onClick={() => setPlaying((p) => !p)} className="viz-btn">
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <button onClick={() => setHasWave2((v) => !v)} className="viz-btn viz-btn-secondary">
            {hasWave2 ? "Remove Wave 2" : "+ Add Wave 2"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: hasWave2 ? "1fr 1fr" : "1fr", gap: "8px" }}>
          <div style={{ padding: "8px", background: "#1a1a1a", borderRadius: "6px", border: "1px solid #6366f133" }}>
            <div style={{ color: "#6366f1", fontWeight: 600, fontSize: "12px", marginBottom: "6px" }}>Wave 1</div>
            <label className="viz-label" style={{ fontSize: "12px" }}>
              A: {wave1.amplitude}&nbsp;
              <input type="range" min="0.1" max="2" step="0.1" value={wave1.amplitude}
                onChange={(e) => updateW(setWave1, "amplitude", Number(e.target.value))}
                className="viz-slider" />
            </label>
            <label className="viz-label" style={{ fontSize: "12px" }}>
              f: {wave1.frequency}&nbsp;
              <input type="range" min="0.5" max="4" step="0.5" value={wave1.frequency}
                onChange={(e) => updateW(setWave1, "frequency", Number(e.target.value))}
                className="viz-slider" />
            </label>
            <label className="viz-label" style={{ fontSize: "12px" }}>
              φ: {(wave1.phase || 0).toFixed(1)}&nbsp;
              <input type="range" min="0" max={2 * Math.PI} step="0.1" value={wave1.phase || 0}
                onChange={(e) => updateW(setWave1, "phase", Number(e.target.value))}
                className="viz-slider" />
            </label>
          </div>

          {hasWave2 && (
            <div style={{ padding: "8px", background: "#1a1a1a", borderRadius: "6px", border: "1px solid #22c55e33" }}>
              <div style={{ color: "#22c55e", fontWeight: 600, fontSize: "12px", marginBottom: "6px" }}>Wave 2</div>
              <label className="viz-label" style={{ fontSize: "12px" }}>
                A: {wave2.amplitude}&nbsp;
                <input type="range" min="0.1" max="2" step="0.1" value={wave2.amplitude}
                  onChange={(e) => updateW(setWave2, "amplitude", Number(e.target.value))}
                  className="viz-slider" />
              </label>
              <label className="viz-label" style={{ fontSize: "12px" }}>
                f: {wave2.frequency}&nbsp;
                <input type="range" min="0.5" max="4" step="0.5" value={wave2.frequency}
                  onChange={(e) => updateW(setWave2, "frequency", Number(e.target.value))}
                  className="viz-slider" />
              </label>
              <label className="viz-label" style={{ fontSize: "12px" }}>
                φ: {(wave2.phase || 0).toFixed(1)}&nbsp;
                <input type="range" min="0" max={2 * Math.PI} step="0.1" value={wave2.phase || 0}
                  onChange={(e) => updateW(setWave2, "phase", Number(e.target.value))}
                  className="viz-slider" />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

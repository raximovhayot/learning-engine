"use client";

import { useState, useRef, useCallback } from "react";

type SortAlgorithm = "bubble" | "selection" | "insertion";

interface SortingVizProps {
  array?: number[];
  algorithm?: SortAlgorithm;
  title?: string;
}

const COLORS = {
  default: "#6366f1",
  comparing: "#f59e0b",
  sorted: "#22c55e",
  pivot: "#ef4444",
};

interface Bar {
  value: number;
  state: "default" | "comparing" | "sorted" | "pivot";
}

function generateArray(size = 20): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

// Generator-based sort algorithms that yield states
type SortStep = { bars: Bar[]; comparisons: number; swaps: number };

async function* bubbleSort(arr: number[]): AsyncGenerator<SortStep> {
  const bars: Bar[] = arr.map((v) => ({ value: v, state: "default" }));
  let comps = 0, swaps = 0;
  for (let i = 0; i < bars.length; i++) {
    for (let j = 0; j < bars.length - i - 1; j++) {
      bars[j].state = "comparing";
      bars[j + 1].state = "comparing";
      comps++;
      yield { bars: bars.map((b) => ({ ...b })), comparisons: comps, swaps };
      if (bars[j].value > bars[j + 1].value) {
        [bars[j], bars[j + 1]] = [bars[j + 1], bars[j]];
        swaps++;
        yield { bars: bars.map((b) => ({ ...b })), comparisons: comps, swaps };
      }
      bars[j].state = "default";
      bars[j + 1].state = "default";
    }
    bars[bars.length - i - 1].state = "sorted";
  }
  yield { bars: bars.map((b) => ({ ...b, state: "sorted" })), comparisons: comps, swaps };
}

async function* selectionSort(arr: number[]): AsyncGenerator<SortStep> {
  const bars: Bar[] = arr.map((v) => ({ value: v, state: "default" }));
  let comps = 0, swaps = 0;
  for (let i = 0; i < bars.length; i++) {
    let minIdx = i;
    bars[i].state = "pivot";
    for (let j = i + 1; j < bars.length; j++) {
      bars[j].state = "comparing";
      comps++;
      yield { bars: bars.map((b) => ({ ...b })), comparisons: comps, swaps };
      if (bars[j].value < bars[minIdx].value) {
        if (minIdx !== i) bars[minIdx].state = "default";
        minIdx = j;
        bars[j].state = "pivot";
      } else {
        bars[j].state = "default";
      }
    }
    if (minIdx !== i) {
      [bars[i], bars[minIdx]] = [bars[minIdx], bars[i]];
      swaps++;
    }
    bars[i].state = "sorted";
    yield { bars: bars.map((b) => ({ ...b })), comparisons: comps, swaps };
  }
}

async function* insertionSort(arr: number[]): AsyncGenerator<SortStep> {
  const bars: Bar[] = arr.map((v) => ({ value: v, state: "default" }));
  let comps = 0, swaps = 0;
  bars[0].state = "sorted";
  for (let i = 1; i < bars.length; i++) {
    const key = bars[i];
    bars[i].state = "comparing";
    let j = i - 1;
    yield { bars: bars.map((b) => ({ ...b })), comparisons: comps, swaps };
    while (j >= 0 && bars[j].value > key.value) {
      bars[j + 1] = { ...bars[j], state: "comparing" };
      bars[j].state = "comparing";
      comps++;
      swaps++;
      yield { bars: bars.map((b) => ({ ...b })), comparisons: comps, swaps };
      bars[j].state = "sorted";
      j--;
    }
    bars[j + 1] = { ...key, state: "sorted" };
    yield { bars: bars.map((b) => ({ ...b })), comparisons: comps, swaps };
  }
}

export function SortingViz({
  array: initArray,
  algorithm: initAlgorithm = "bubble",
  title,
}: SortingVizProps) {
  const [arr, setArr] = useState<number[]>(initArray || generateArray(20));
  const [algorithm, setAlgorithm] = useState<SortAlgorithm>(initAlgorithm);
  const [bars, setBars] = useState<Bar[]>(arr.map((v) => ({ value: v, state: "default" })));
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 });
  const [speed, setSpeed] = useState(60);
  const genRef = useRef<AsyncGenerator<SortStep> | null>(null);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback((newArr?: number[]) => {
    if (rafRef.current) clearTimeout(rafRef.current);
    genRef.current = null;
    setRunning(false);
    const a = newArr || arr;
    setArr(a);
    setBars(a.map((v) => ({ value: v, state: "default" })));
    setStats({ comparisons: 0, swaps: 0 });
  }, [arr]);

  const start = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setBars(arr.map((v) => ({ value: v, state: "default" })));
    setStats({ comparisons: 0, swaps: 0 });

    const gen =
      algorithm === "bubble" ? bubbleSort([...arr]) :
      algorithm === "selection" ? selectionSort([...arr]) :
      insertionSort([...arr]);

    genRef.current = gen;

    function step() {
      gen.next().then(({ value, done }) => {
        if (done || !genRef.current) {
          setRunning(false);
          return;
        }
        setBars(value.bars);
        setStats({ comparisons: value.comparisons, swaps: value.swaps });
        rafRef.current = setTimeout(step, Math.max(4, 120 - speed));
      });
    }
    step();
  }, [running, arr, algorithm, speed]);

  const maxVal = Math.max(...arr);
  const BAR_W = Math.max(2, Math.floor(500 / arr.length) - 2);

  return (
    <div className="viz-card">
      {title && <div className="viz-title">{title}</div>}

      {/* Bars */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          height: "200px",
          gap: "2px",
          padding: "8px",
          background: "#111",
          borderRadius: "8px",
          overflowX: "auto",
        }}
      >
        {bars.map((bar, i) => (
          <div
            key={i}
            style={{
              width: `${BAR_W}px`,
              minWidth: `${BAR_W}px`,
              height: `${(bar.value / maxVal) * 180}px`,
              background: COLORS[bar.state],
              borderRadius: "2px 2px 0 0",
              transition: "height 0.05s",
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="viz-stats-row" style={{ marginTop: "6px" }}>
        <span className="viz-stat"><span className="viz-stat-label">Comparisons</span>{stats.comparisons}</span>
        <span className="viz-stat"><span className="viz-stat-label">Swaps</span>{stats.swaps}</span>
        <span className="viz-stat" style={{ color: "#6366f1" }}>■ comparing</span>
        <span className="viz-stat" style={{ color: "#22c55e" }}>■ sorted</span>
        <span className="viz-stat" style={{ color: "#f59e0b" }}>■ active</span>
      </div>

      {/* Controls */}
      <div className="viz-controls">
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={algorithm}
            onChange={(e) => { setAlgorithm(e.target.value as SortAlgorithm); reset(); }}
            className="viz-select"
          >
            <option value="bubble">Bubble Sort</option>
            <option value="selection">Selection Sort</option>
            <option value="insertion">Insertion Sort</option>
          </select>
          <button onClick={start} disabled={running} className="viz-btn">
            ▶ Sort
          </button>
          <button onClick={() => reset()} disabled={running} className="viz-btn viz-btn-secondary">
            ↺ Reset
          </button>
          <button onClick={() => reset(generateArray(arr.length))} disabled={running} className="viz-btn viz-btn-secondary">
            🔀 Shuffle
          </button>
        </div>
        <label className="viz-label" style={{ marginTop: "6px" }}>
          Speed: {speed}&nbsp;
          <input type="range" min="10" max="110" step="5" value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="viz-slider" />
        </label>
        <label className="viz-label">
          Size: {arr.length}&nbsp;
          <input type="range" min="8" max="60" step="2" value={arr.length}
            onChange={(e) => reset(generateArray(Number(e.target.value)))}
            disabled={running}
            className="viz-slider" />
        </label>
      </div>
    </div>
  );
}

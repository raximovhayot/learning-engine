"use client";

import { FunctionPlotter } from "./function-plotter";
import { UnitCircle } from "./unit-circle";
import { VectorAdd } from "./vector-add";
import { ProjectileMotion } from "./projectile-motion";
import { DerivativeViz } from "./derivative-viz";
import { IntegralViz } from "./integral-viz";
import { WaveViz } from "./wave-viz";
import { SortingViz } from "./sorting-viz";
import { DistributionViz } from "./distribution-viz";
import { MatrixTransform } from "./matrix-transform";

export type VisualizationType =
  | "function-plotter"
  | "unit-circle"
  | "vector-add"
  | "projectile"
  | "derivative"
  | "integral"
  | "wave"
  | "sorting"
  | "distribution"
  | "matrix-transform";

// The params mirror the tool schema
export interface VisualizationParams {
  // function-plotter / derivative / integral
  expression?: string;
  expression2?: string;
  xMin?: number;
  xMax?: number;
  point?: number;
  integralMin?: number;
  integralMax?: number;
  subdivisions?: number;
  // unit-circle
  angle?: number;
  // vector-add
  vectors?: { x: number; y: number; label?: string; color?: string }[];
  // projectile
  initialSpeed?: number;
  launchAngle?: number;
  gravity?: number;
  // wave
  wave1?: { amplitude: number; frequency: number; phase?: number };
  wave2?: { amplitude: number; frequency: number; phase?: number };
  showSuperposition?: boolean;
  // sorting
  array?: number[];
  algorithm?: "bubble" | "selection" | "insertion";
  // distribution
  mean?: number;
  stdDev?: number;
  highlightMin?: number;
  highlightMax?: number;
  // matrix-transform
  matrix?: number[][];
  // shared
  title?: string;
  color?: string;
  color2?: string;
}

interface VisualizationRendererProps {
  type: VisualizationType;
  params: VisualizationParams;
}

export function VisualizationRenderer({ type, params }: VisualizationRendererProps) {
  switch (type) {
    case "function-plotter":
      return (
        <FunctionPlotter
          expression={params.expression}
          expression2={params.expression2}
          xMin={params.xMin}
          xMax={params.xMax}
          color={params.color}
          color2={params.color2}
          title={params.title}
        />
      );
    case "unit-circle":
      return <UnitCircle angle={params.angle} title={params.title} />;
    case "vector-add":
      return <VectorAdd vectors={params.vectors} title={params.title} />;
    case "projectile":
      return (
        <ProjectileMotion
          initialSpeed={params.initialSpeed}
          launchAngle={params.launchAngle}
          gravity={params.gravity}
          title={params.title}
        />
      );
    case "derivative":
      return (
        <DerivativeViz
          expression={params.expression}
          point={params.point}
          xMin={params.xMin}
          xMax={params.xMax}
          title={params.title}
        />
      );
    case "integral":
      return (
        <IntegralViz
          expression={params.expression}
          xMin={params.xMin}
          xMax={params.xMax}
          integralMin={params.integralMin}
          integralMax={params.integralMax}
          subdivisions={params.subdivisions}
          title={params.title}
        />
      );
    case "wave":
      return (
        <WaveViz
          wave1={params.wave1}
          wave2={params.wave2}
          showSuperposition={params.showSuperposition}
          title={params.title}
        />
      );
    case "sorting":
      return (
        <SortingViz
          array={params.array}
          algorithm={params.algorithm}
          title={params.title}
        />
      );
    case "distribution":
      return (
        <DistributionViz
          mean={params.mean}
          stdDev={params.stdDev}
          highlightMin={params.highlightMin}
          highlightMax={params.highlightMax}
          title={params.title}
        />
      );
    case "matrix-transform":
      return <MatrixTransform matrix={params.matrix} title={params.title} />;
    default:
      return (
        <div className="viz-error">
          Unknown visualization type: {type}
        </div>
      );
  }
}

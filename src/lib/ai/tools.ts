import { tool } from "ai";
import { z } from "zod";
import type { VisualizationType, VisualizationParams } from "@/components/visualizations";

const waveConfigSchema = z.object({
  amplitude: z.number().describe("Wave amplitude (height)"),
  frequency: z.number().describe("Wave frequency (cycles per unit)"),
  phase: z.number().optional().describe("Phase offset in radians"),
});

const inputSchema = z.object({
  type: z
    .enum([
      "function-plotter",
      "unit-circle",
      "vector-add",
      "projectile",
      "derivative",
      "integral",
      "wave",
      "sorting",
      "distribution",
      "matrix-transform",
    ])
    .describe("The type of visualization to create"),

  title: z.string().optional().describe("Optional title for the visualization"),

  expression: z
    .string()
    .optional()
    .describe(
      "Math expression in x. E.g. 'sin(x)', 'x*x', 'exp(-x*x)'"
    ),
  expression2: z
    .string()
    .optional()
    .describe("Second function for function-plotter"),
  xMin: z.number().optional().describe("X-axis minimum value"),
  xMax: z.number().optional().describe("X-axis maximum value"),

  point: z
    .number()
    .optional()
    .describe("x-value for tangent line in derivative visualization"),
  integralMin: z.number().optional().describe("Lower bound of integral"),
  integralMax: z.number().optional().describe("Upper bound of integral"),
  subdivisions: z.number().optional().describe("Trapezoids for numerical integration"),

  angle: z.number().optional().describe("Initial angle in degrees (0-360) for unit circle"),

  vectors: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
        label: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .optional()
    .describe("Array of 2D vectors for vector-add visualization"),

  initialSpeed: z.number().optional().describe("Initial speed in m/s"),
  launchAngle: z.number().optional().describe("Launch angle in degrees"),
  gravity: z.number().optional().describe("Gravitational acceleration m/s²"),

  wave1: waveConfigSchema.optional().describe("First wave configuration"),
  wave2: waveConfigSchema.optional().describe("Second wave for superposition"),
  showSuperposition: z.boolean().optional().describe("Show wave superposition"),

  array: z.array(z.number()).optional().describe("Numbers to sort"),
  algorithm: z
    .enum(["bubble", "selection", "insertion"])
    .optional()
    .describe("Sorting algorithm"),

  mean: z.number().optional().describe("Mean μ of distribution"),
  stdDev: z.number().optional().describe("Standard deviation σ"),
  highlightMin: z.number().optional().describe("Lower bound of highlighted region"),
  highlightMax: z.number().optional().describe("Upper bound of highlighted region"),

  matrix: z
    .array(z.array(z.number()))
    .optional()
    .describe("2x2 matrix [[a,b],[c,d]]"),

  color: z.string().optional().describe("Primary CSS color"),
  color2: z.string().optional().describe("Secondary CSS color"),
});

type VisualizeInput = z.infer<typeof inputSchema>;
type VisualizeOutput = { type: VisualizationType; params: VisualizationParams };

export const visualizeTool = tool<VisualizeInput, VisualizeOutput>({
  description: `Create an interactive STEM visualization inline in the chat.

Available visualization types and when to use them:
- **function-plotter**: Plot y=f(x). Use for algebra, calculus function graphs.
- **unit-circle**: Interactive unit circle showing sin/cos/tan. Use for trigonometry.
- **vector-add**: 2D vector addition. Use for linear algebra, physics force problems.
- **projectile**: Animated projectile motion. Use for kinematics problems.
- **derivative**: Function with tangent line at a point. Use when teaching derivatives.
- **integral**: Definite integral as shaded area with value. Use when teaching integration.
- **wave**: Animated waves with optional superposition. Use for wave physics.
- **sorting**: Animated sorting algorithm. Use when teaching sorting algorithms.
- **distribution**: Normal distribution with probability shading. Use for statistics.
- **matrix-transform**: 2x2 matrix transformation of shapes. Use for linear algebra.

Use this tool whenever a visual would significantly help explain a concept.`,

  inputSchema,

  execute: async (args): Promise<VisualizeOutput> => {
    const { type, ...params } = args;
    return {
      type: type as VisualizationType,
      params: params as VisualizationParams,
    };
  },
});

export const visualizationTools = {
  visualize: visualizeTool,
};

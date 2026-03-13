/**
 * Safe math expression evaluator.
 * Runs entirely client-side — the user can only harm themselves.
 * Blocks access to globals, built-ins, and prototype-chain tricks.
 */

const FORBIDDEN =
  /\b(window|document|global|globalThis|process|require|import|eval|Function|constructor|prototype|__proto__|this|self|fetch|XMLHttpRequest|alert|confirm|prompt)\b/;

export function evalMathExpr(expression: string, x: number): number {
  if (!expression) return NaN;
  // Block dangerous identifiers before compiling
  if (FORBIDDEN.test(expression)) return NaN;
  // Block bracket access that might reach prototype chain (e.g. obj["constructor"])
  if (/\[/.test(expression)) return NaN;

  // Replace common math notation
  const normalized = expression
    .replace(/\^/g, "**")
    .replace(/\bpi\b/gi, String(Math.PI))
    .replace(/\bPI\b/g, String(Math.PI))
    .replace(/\be\b(?![a-z])/g, String(Math.E));

  try {
    const fn = new Function(
      "x",
      `"use strict"; const {abs,sin,cos,tan,sqrt,log,log2,log10,exp,pow,ceil,floor,round,sign,min,max,PI,E,sinh,cosh,tanh,asin,acos,atan,atan2} = Math; return (${normalized});`
    );
    const result = fn(x);
    return typeof result === "number" ? result : NaN;
  } catch {
    return NaN;
  }
}

export function computePoints(
  expression: string,
  xMin: number,
  xMax: number,
  steps = 300
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const step = (xMax - xMin) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * step;
    const y = evalMathExpr(expression, x);
    pts.push({ x, y });
  }
  return pts;
}

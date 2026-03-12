import { NextResponse } from "next/server";
import type { Exercise } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      exerciseData: Exercise;
      hintIndex: number;
    };
    const { exerciseData, hintIndex } = body;

    if (!exerciseData || hintIndex === undefined) {
      return NextResponse.json(
        { error: "exerciseData and hintIndex are required" },
        { status: 400 }
      );
    }

    const hints = exerciseData.hints ?? [];
    const idx = Math.max(0, Math.min(hintIndex, hints.length - 1));
    const hint = hints[idx];

    if (!hint) {
      return NextResponse.json(
        { error: "No hint available at this index" },
        { status: 404 }
      );
    }

    return NextResponse.json({ hint, hintIndex: idx, totalHints: hints.length });
  } catch (error) {
    console.error("POST /api/exercises/hint error:", error);
    return NextResponse.json(
      { error: "Failed to get hint" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getLessonById, getLessonSteps } from "@/lib/db/learning";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lesson = await getLessonById(id);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const steps = await getLessonSteps(lesson.id);

    return NextResponse.json({ ...lesson, steps });
  } catch (error) {
    console.error("GET /api/lessons/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}

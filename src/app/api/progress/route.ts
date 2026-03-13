import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserProgress, upsertLessonProgress } from "@/lib/db/learning";
import type { NewLearningProgress } from "@/lib/db/schema";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const progress = await getUserProgress(user.id);
    return NextResponse.json(progress);
  } catch (error) {
    console.error("GET /api/progress error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as Omit<NewLearningProgress, "userId">;
    const progress = await upsertLessonProgress({ ...body, userId: user.id });
    return NextResponse.json(progress);
  } catch (error) {
    console.error("POST /api/progress error:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}

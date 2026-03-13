import { createClient } from "@/lib/supabase/server";
import { getUserMemories, deleteAllUserMemories } from "@/lib/memory/store";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const mems = await getUserMemories(user.id);
    return NextResponse.json(mems);
  } catch (error) {
    console.error("GET /api/memories error:", error);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await deleteAllUserMemories(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/memories error:", error);
    return NextResponse.json({ error: "Failed to delete memories" }, { status: 500 });
  }
}

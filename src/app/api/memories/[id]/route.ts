import { createClient } from "@/lib/supabase/server";
import { deleteMemory } from "@/lib/memory/store";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await deleteMemory(id, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/memories/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}

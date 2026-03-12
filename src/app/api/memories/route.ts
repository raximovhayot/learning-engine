import { createClient } from "@/lib/supabase/server";
import { getUserMemories, deleteAllUserMemories } from "@/lib/memory/store";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mems = await getUserMemories(user.id);
  return NextResponse.json(mems);
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteAllUserMemories(user.id);
  return NextResponse.json({ ok: true });
}

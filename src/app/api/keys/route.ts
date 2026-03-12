import { createClient } from "@/lib/supabase/server";
import { getUserApiKey, setUserApiKey, deleteUserApiKey } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = await getUserApiKey(user.id);
  return NextResponse.json({ hasKey: !!key });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key, provider } = await req.json();
  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  await setUserApiKey(user.id, key, provider || "google");
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteUserApiKey(user.id);
  return NextResponse.json({ ok: true });
}

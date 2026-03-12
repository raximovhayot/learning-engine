import { createClient } from "@/lib/supabase/server";
import {
  getUserConversations,
  createConversation,
} from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const convs = await getUserConversations(user.id);
  return NextResponse.json(convs);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const conv = await createConversation({
    userId: user.id,
    title: body.title || "New Chat",
  });
  return NextResponse.json(conv);
}

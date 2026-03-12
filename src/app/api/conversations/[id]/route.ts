import { createClient } from "@/lib/supabase/server";
import {
  getConversation,
  updateConversationTitle,
  deleteConversation,
} from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const conv = await getConversation(id);
  if (!conv || conv.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(conv);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const conv = await getConversation(id);
  if (!conv || conv.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { title } = await req.json();
  if (title) {
    await updateConversationTitle(id, title);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const conv = await getConversation(id);
  if (!conv || conv.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteConversation(id);
  return NextResponse.json({ ok: true });
}

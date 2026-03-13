import { createClient } from "@/lib/supabase/server";
import {
  getConversation,
  getConversationMessages,
  createMessage,
} from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const msgs = await getConversationMessages(id);
    return NextResponse.json(msgs);
  } catch (error) {
    console.error("GET /api/conversations/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const body = await req.json();
    const msg = await createMessage({
      conversationId: id,
      role: body.role,
      content: body.content,
      agentId: body.agentId,
      metadata: body.metadata,
    });
    return NextResponse.json(msg);
  } catch (error) {
    console.error("POST /api/conversations/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}

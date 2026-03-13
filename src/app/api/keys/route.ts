import { createClient } from "@/lib/supabase/server";
import { getUserApiKey, setUserApiKey, deleteUserApiKey } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const key = await getUserApiKey(user.id);
    return NextResponse.json({ hasKey: !!key });
  } catch (error) {
    console.error("GET /api/keys error:", error);
    return NextResponse.json({ error: "Failed to fetch API key status" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
  } catch (error) {
    console.error("POST /api/keys error:", error);
    return NextResponse.json({ error: "Failed to save API key" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await deleteUserApiKey(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/keys error:", error);
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 });
  }
}

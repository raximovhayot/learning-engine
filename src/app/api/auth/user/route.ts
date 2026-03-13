import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
      },
    });
  } catch (error) {
    console.error("GET /api/auth/user error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}

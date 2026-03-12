import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDueReviews, updateReviewItem } from "@/lib/db/learning";
import { calculateNextReview } from "@/lib/gamification/spaced-repetition";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reviews = await getDueReviews(user.id);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/review error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
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

    const body = await request.json() as { itemId: string; quality: number };
    const { itemId, quality } = body;

    if (!itemId || quality === undefined) {
      return NextResponse.json(
        { error: "itemId and quality are required" },
        { status: 400 }
      );
    }

    // We need the current item to get easeFactor, interval, repetitions
    const reviews = await getDueReviews(user.id, 100);
    const item = reviews.find((r) => r.id === itemId);

    if (!item) {
      return NextResponse.json(
        { error: "Review item not found" },
        { status: 404 }
      );
    }

    const result = calculateNextReview(
      quality,
      item.easeFactor,
      item.interval,
      item.repetitions
    );

    const updated = await updateReviewItem(itemId, {
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReviewAt: result.nextReviewAt,
      lastReviewedAt: new Date(),
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/review error:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

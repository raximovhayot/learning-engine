import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createProvider } from "@/lib/ai/provider";
import { exerciseSchema } from "@/lib/ai/schemas";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const google = createProvider();

    const { object: exercise } = await generateObject({
      model: google("gemini-3.1-flash-lite-preview"),
      schema: exerciseSchema,
      system: `You are a daily challenge generator for a learning platform. Today's date is ${today}. Generate a consistent, interesting challenge for this date. Vary the subject across days. Keep difficulty at beginner to intermediate.`,
      prompt: `Generate a daily challenge exercise for ${today}. Pick an interesting topic from math, science, or programming. Create an engaging MCQ or fill-in-the-blank question.`,
      temperature: 0.5,
      maxOutputTokens: 512,
    });

    return NextResponse.json({ exercise, date: today });
  } catch (error) {
    console.error("GET /api/daily-challenge error:", error);
    return NextResponse.json(
      { error: "Failed to generate daily challenge" },
      { status: 500 }
    );
  }
}

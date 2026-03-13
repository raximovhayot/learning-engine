import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createProvider } from "@/lib/ai/provider";
import { answerCheckSchema } from "@/lib/ai/schemas";
import type { Exercise } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      exerciseData: Exercise;
      userAnswer: string;
      hintsUsed?: number;
    };
    const { exerciseData, userAnswer, hintsUsed = 0 } = body;

    if (!exerciseData || userAnswer === undefined) {
      return NextResponse.json(
        { error: "exerciseData and userAnswer are required" },
        { status: 400 }
      );
    }

    // MCQ: direct string comparison
    if (exerciseData.type === "mcq") {
      const isCorrect =
        userAnswer.trim().toLowerCase() ===
        exerciseData.correctAnswer.trim().toLowerCase();
      return NextResponse.json({
        isCorrect,
        feedback: isCorrect
          ? `Correct! ${exerciseData.explanation}`
          : `Not quite. The correct answer is "${exerciseData.correctAnswer}". ${exerciseData.explanation}`,
        hintsUsed,
      });
    }

    // fill_blank: AI-assisted comparison
    if (exerciseData.type === "fill_blank") {
      const normalizedUser = userAnswer.trim().toLowerCase().replace(/\s+/g, " ");
      const normalizedCorrect = exerciseData.correctAnswer
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      if (normalizedUser === normalizedCorrect) {
        return NextResponse.json({
          isCorrect: true,
          feedback: `Correct! ${exerciseData.explanation}`,
          hintsUsed,
        });
      }

      // Use AI for partial-match checking
      const google = createProvider();
      const { object } = await generateObject({
        model: google("gemini-3.1-flash-lite-preview"),
        schema: answerCheckSchema,
        system:
          "You are a helpful tutor. Check if the student's answer is correct or equivalent to the expected answer. Be encouraging.",
        prompt: `Question: ${exerciseData.prompt}
Expected answer: ${exerciseData.correctAnswer}
Student's answer: ${userAnswer}
Is the student's answer correct or equivalent?`,
        temperature: 0.2,
        maxOutputTokens: 256,
      });

      return NextResponse.json({ ...object, hintsUsed });
    }

    // free_text: always use AI
    const google = createProvider();
    const { object } = await generateObject({
      model: google("gemini-3.1-flash-lite-preview"),
      schema: answerCheckSchema,
      system:
        "You are a helpful, encouraging tutor. Evaluate the student's answer thoughtfully. Award partial credit for partially correct answers.",
      prompt: `Question: ${exerciseData.prompt}
Expected answer/key points: ${exerciseData.correctAnswer}
Student's answer: ${userAnswer}
Evaluate the answer and provide detailed, encouraging feedback.`,
      temperature: 0.3,
      maxOutputTokens: 512,
    });

    return NextResponse.json({ ...object, hintsUsed });
  } catch (error) {
    console.error("POST /api/exercises/check error:", error);
    return NextResponse.json(
      { error: "Failed to check answer" },
      { status: 500 }
    );
  }
}

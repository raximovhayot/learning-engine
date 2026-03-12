import { NextResponse } from "next/server";
import { getAllCourses, createCourse, createUnit, createLesson } from "@/lib/db/learning";
import { generateObject } from "ai";
import { createProvider } from "@/lib/ai/provider";
import { courseSchema } from "@/lib/ai/schemas";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const courses = await getAllCourses();
    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { topic?: string; difficulty?: string };
    const { topic, difficulty = "beginner" } = body;

    if (!topic) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    const google = createProvider();
    const { object: courseStructure } = await generateObject({
      model: google("gemini-3.1-flash-lite-preview"),
      schema: courseSchema,
      system:
        "You are an expert curriculum designer. Create a structured, engaging course outline.",
      prompt: `Create a ${difficulty} level course about: ${topic}. Include 2-4 units with 1-3 lessons each.`,
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const slug = `${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}-${nanoid(6)}`;

    const course = await createCourse({
      title: courseStructure.title,
      slug,
      subject: courseStructure.subject,
      description: courseStructure.description,
      difficulty: courseStructure.difficulty,
      isAiGenerated: true,
      estimatedMinutes: courseStructure.estimatedMinutes,
      xpReward: Math.round(courseStructure.estimatedMinutes * 3),
    });

    for (let ui = 0; ui < courseStructure.units.length; ui++) {
      const unitData = courseStructure.units[ui];
      const unit = await createUnit({
        courseId: course.id,
        title: unitData.title,
        description: unitData.description,
        orderIndex: ui,
      });

      for (let li = 0; li < unitData.lessons.length; li++) {
        const lessonData = unitData.lessons[li];
        await createLesson({
          unitId: unit.id,
          title: lessonData.title,
          description: lessonData.description,
          orderIndex: li,
          estimatedMinutes: lessonData.estimatedMinutes,
          xpReward: 50,
        });
      }
    }

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses error:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}

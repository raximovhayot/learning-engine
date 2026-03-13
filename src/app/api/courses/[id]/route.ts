import { NextResponse } from "next/server";
import { getCourseById, getCourseBySlug, getUnitsByCourse, getLessonsByUnit } from "@/lib/db/learning";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let course = await getCourseById(id);
    if (!course) {
      course = await getCourseBySlug(id);
    }
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const units = await getUnitsByCourse(course.id);
    const unitsWithLessons = await Promise.all(
      units.map(async (unit) => {
        const lessons = await getLessonsByUnit(unit.id);
        return { ...unit, lessons };
      })
    );

    return NextResponse.json({ ...course, units: unitsWithLessons });
  } catch (error) {
    console.error("GET /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}

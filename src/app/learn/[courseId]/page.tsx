import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar/sidebar";
import { getCourseById, getCourseBySlug, getUnitsByCourse, getLessonsByUnit } from "@/lib/db/learning";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseOverviewPage({ params }: PageProps) {
  const { courseId } = await params;

  let course = null;
  let unitsWithLessons: Array<{
    id: string;
    title: string;
    description: string | null;
    orderIndex: number;
    lessons: Array<{ id: string; title: string; description: string | null; estimatedMinutes: number; xpReward: number }>;
  }> = [];

  try {
    course = await getCourseById(courseId);
    if (!course) course = await getCourseBySlug(courseId);
    if (course) {
      const units = await getUnitsByCourse(course.id);
      unitsWithLessons = await Promise.all(
        units.map(async (unit) => {
          const lessons = await getLessonsByUnit(unit.id);
          return { ...unit, lessons };
        })
      );
    }
  } catch {
    // DB unavailable
  }

  if (!course) return notFound();

  const SUBJECT_EMOJI: Record<string, string> = {
    math: "📐",
    programming: "💻",
    science: "🔬",
    general: "📚",
  };

  const DIFFICULTY_COLOR: Record<string, string> = {
    beginner: "var(--success)",
    intermediate: "var(--warning)",
    advanced: "var(--danger)",
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <Link
            href="/learn"
            className="text-sm"
            style={{ color: "var(--text-muted)", textDecoration: "none" }}
          >
            ← Back to Learning Dashboard
          </Link>

          <div
            className="rounded-xl p-6"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-start gap-4 mb-4">
              <span className="text-4xl">
                {SUBJECT_EMOJI[course.subject] ?? "📚"}
              </span>
              <div className="flex-1">
                <h1
                  className="text-xl font-bold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {course.title}
                </h1>
                {course.description && (
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {course.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background:
                    (DIFFICULTY_COLOR[course.difficulty] ?? "var(--text-muted)") + "22",
                  color: DIFFICULTY_COLOR[course.difficulty] ?? "var(--text-muted)",
                }}
              >
                {course.difficulty}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                ⏱ {course.estimatedMinutes}m estimated
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: "var(--accent)" }}
              >
                +{course.xpReward} XP
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {unitsWithLessons.map((unit, ui) => (
              <div
                key={unit.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="px-5 py-3 border-b"
                  style={{
                    background: "var(--bg-tertiary)",
                    borderColor: "var(--border)",
                  }}
                >
                  <h2
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Unit {ui + 1}: {unit.title}
                  </h2>
                  {unit.description && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {unit.description}
                    </p>
                  )}
                </div>
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {unit.lessons.map((lesson, li) => (
                    <Link
                      key={lesson.id}
                      href={`/learn/${course.id}/${lesson.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors"
                      style={{
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                        display: "flex",
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
                        (e.currentTarget.style.background = "var(--bg-hover)")
                      }
                      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span
                        className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium shrink-0"
                        style={{
                          background: "var(--bg-hover)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {li + 1}
                      </span>
                      <span className="flex-1 text-sm" style={{ color: "var(--text-primary)" }}>
                        {lesson.title}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {lesson.estimatedMinutes}m
                      </span>
                      <span className="text-xs" style={{ color: "var(--accent)" }}>
                        +{lesson.xpReward} XP
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>→</span>
                    </Link>
                  ))}
                  {unit.lessons.length === 0 && (
                    <p
                      className="px-5 py-3 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No lessons in this unit yet.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

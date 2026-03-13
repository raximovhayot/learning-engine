import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar/sidebar";
import { LessonPlayer } from "@/components/capabilities/learning/lesson-player";
import { getLessonById, getLessonSteps } from "@/lib/db/learning";
import type { LessonStep } from "@/lib/db/schema";

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params;

  let lesson = null;
  let steps: LessonStep[] = [];

  try {
    lesson = await getLessonById(lessonId);
    if (lesson) {
      steps = await getLessonSteps(lesson.id);
    }
  } catch {
    // DB unavailable
  }

  if (!lesson) return notFound();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <Link
            href={`/learn/${courseId}`}
            className="text-sm"
            style={{ color: "var(--text-muted)", textDecoration: "none" }}
          >
            ← Back to Course
          </Link>

          <div>
            <h1
              className="text-xl font-bold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {lesson.description}
              </p>
            )}
          </div>

          <LessonPlayer
            lessonId={lesson.id}
            courseId={courseId}
            lessonTitle={lesson.title}
            xpReward={lesson.xpReward}
            steps={steps}
          />
        </div>
      </main>
    </div>
  );
}

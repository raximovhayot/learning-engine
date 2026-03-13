import { Sidebar } from "@/components/sidebar/sidebar";
import { CourseCard } from "@/components/capabilities/learning/course-card";
import { DailyChallengeSection } from "./daily-challenge-section";
import { ReviewQueueSection } from "./review-queue-section";
import { getAllCourses } from "@/lib/db/learning";

export default async function LearnPage() {
  let courses: Awaited<ReturnType<typeof getAllCourses>> = [];
  try {
    courses = await getAllCourses();
  } catch {
    // DB may not be available in dev without migrations
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              📚 Learning Dashboard
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Explore courses, complete exercises, and track your progress.
            </p>
          </div>

          {/* Daily Challenge */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              🌟 Daily Challenge
            </h2>
            <DailyChallengeSection />
          </section>

          {/* Review Queue */}
          <ReviewQueueSection />

          {/* Courses */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Courses
            </h2>
            {courses.length === 0 ? (
              <div
                className="rounded-xl p-8 text-center"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                <p className="mb-2">No courses available yet.</p>
                <p className="text-xs">
                  Run the database migrations and seed script to populate courses.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

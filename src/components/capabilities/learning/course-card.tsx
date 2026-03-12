"use client";

import Link from "next/link";
import { ProgressRing } from "./progress-ring";
import type { Course } from "@/lib/db/schema";

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

interface CourseCardProps {
  course: Course;
  progress?: number;
}

export function CourseCard({ course, progress = 0 }: CourseCardProps) {
  const emoji = SUBJECT_EMOJI[course.subject] ?? "📚";
  const difficultyColor =
    DIFFICULTY_COLOR[course.difficulty] ?? "var(--text-muted)";

  return (
    <Link href={`/learn/${course.id}`} style={{ textDecoration: "none" }}>
      <div
        className="rounded-xl p-4 flex flex-col gap-3 transition-colors cursor-pointer h-full"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "var(--accent)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--border)")
        }
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-2xl">{emoji}</span>
          {progress > 0 && (
            <ProgressRing progress={progress} size={40} strokeWidth={3} />
          )}
        </div>

        <div className="flex-1">
          <h3
            className="font-semibold text-sm mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {course.title}
          </h3>
          {course.description && (
            <p
              className="text-xs leading-relaxed line-clamp-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {course.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: difficultyColor + "22",
              color: difficultyColor,
            }}
          >
            {course.difficulty}
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            ⏱ {course.estimatedMinutes}m
          </span>
          <span
            className="ml-auto text-xs font-medium"
            style={{ color: "var(--accent)" }}
          >
            +{course.xpReward} XP
          </span>
        </div>
      </div>
    </Link>
  );
}

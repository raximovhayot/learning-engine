"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExerciseWidget } from "./exercise-widget";
import type { LessonStep } from "@/lib/db/schema";
import type { Exercise } from "@/lib/ai/schemas";

interface ContentData {
  title: string;
  body: string;
}

interface LessonPlayerProps {
  lessonId: string;
  lessonTitle: string;
  xpReward: number;
  steps: LessonStep[];
}

export function LessonPlayer({
  lessonTitle,
  xpReward,
  steps,
}: LessonPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const progressPct =
    totalSteps > 0 ? (completedSteps.size / totalSteps) * 100 : 0;

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setFinished(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleExerciseComplete = (isCorrect: boolean) => {
    if (isCorrect) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
    }
  };

  if (finished) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-6 py-16 px-8 rounded-xl text-center"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
        }}
      >
        <span className="text-6xl">🎉</span>
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Lesson Complete!
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          You finished <strong>{lessonTitle}</strong>
        </p>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold"
          style={{ background: "var(--accent)", color: "white" }}
        >
          <span>⭐</span>
          <span>+{xpReward} XP Earned</span>
        </div>
      </div>
    );
  }

  if (!step) {
    return (
      <div style={{ color: "var(--text-muted)" }} className="text-center py-8">
        No steps available for this lesson.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Step {currentStep + 1} / {totalSteps}
        </span>
        <div
          className="flex-1 h-2 rounded-full overflow-hidden"
          style={{ background: "var(--bg-tertiary)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: "var(--accent)",
            }}
          />
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          +{xpReward} XP
        </span>
      </div>

      {/* Step content */}
      {step.type === "content" && !!step.contentData && (
        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            {(step.contentData as ContentData).title}
          </h2>
          <div
            className="prose prose-sm max-w-none"
            style={{ color: "var(--text-secondary)" }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {(step.contentData as ContentData).body}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {step.type === "exercise" && !!step.exerciseData && (
        <ExerciseWidget
          exercise={step.exerciseData as Exercise}
          onComplete={handleExerciseComplete}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 mt-2">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-4 py-2 rounded-lg text-sm transition-colors"
          style={{
            background: "var(--bg-tertiary)",
            color:
              currentStep === 0
                ? "var(--text-muted)"
                : "var(--text-secondary)",
            border: "1px solid var(--border)",
            cursor: currentStep === 0 ? "not-allowed" : "pointer",
            opacity: currentStep === 0 ? 0.5 : 1,
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: "var(--accent)",
            color: "white",
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--accent-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--accent)")
          }
        >
          {currentStep === totalSteps - 1 ? "Finish 🎉" : "Next →"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ExerciseWidget } from "@/components/capabilities/learning/exercise-widget";
import type { Exercise } from "@/lib/ai/schemas";

export function DailyChallengeSection() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/daily-challenge")
      .then((r) => r.json())
      .then((data: { exercise: Exercise }) => {
        setExercise(data.exercise);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        Generating today&apos;s challenge…
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div
        className="rounded-xl p-6 text-center text-sm"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        Daily challenge unavailable. Check your API key in Settings.
      </div>
    );
  }

  return <ExerciseWidget exercise={exercise} />;
}

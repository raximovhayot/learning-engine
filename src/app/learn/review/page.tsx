"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ExerciseWidget } from "@/components/capabilities/learning/exercise-widget";
import { useChatStore } from "@/lib/store/chat-store";
import type { Exercise } from "@/lib/ai/schemas";

interface ReviewItem {
  id: string;
  exerciseData: Exercise;
  subject: string;
  topic: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: string;
}

export default function ReviewPage() {
  const { user, hydrated } = useChatStore();
  const router = useRouter();

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [awaitingNext, setAwaitingNext] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    fetch("/api/review")
      .then((r) => r.json())
      .then((data: ReviewItem[]) => {
        setItems(data);
        setLoading(false);
        if (!data.length) setDone(true);
      })
      .catch(() => setLoading(false));
  }, [hydrated, user, router]);

  const handleComplete = async (isCorrect: boolean) => {
    const item = items[currentIndex];
    if (!item) return;

    setAwaitingNext(true);

    const quality = isCorrect ? 5 : 2;
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, quality }),
      });
    } catch {
      // Continue even if update fails
    }
  };

  const handleNext = () => {
    setAwaitingNext(false);
    if (currentIndex + 1 >= items.length) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (!hydrated || loading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "var(--bg-primary)", color: "var(--text-muted)" }}
      >
        Loading your review queue…
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <Link
            href="/learn"
            className="text-sm"
            style={{ color: "var(--text-muted)", textDecoration: "none" }}
          >
            ← Back to Learning Dashboard
          </Link>

          <div>
            <h1
              className="text-xl font-bold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              🔁 Spaced Repetition Review
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Reinforce what you&apos;ve learned by reviewing due exercises.
            </p>
          </div>

          {done ? (
            <div
              className="rounded-xl p-8 flex flex-col items-center gap-4 text-center"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="text-5xl">🎉</span>
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                All caught up!
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {items.length > 0
                  ? `You reviewed ${items.length} item${items.length !== 1 ? "s" : ""}. Great work!`
                  : "No items due for review right now. Check back later!"}
              </p>
              <Link
                href="/learn"
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: "var(--accent)",
                  color: "white",
                  textDecoration: "none",
                }}
              >
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {currentIndex + 1} / {items.length}
                </span>
                <div
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${((currentIndex) / items.length) * 100}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {currentItem?.subject} · {currentItem?.topic}
                </span>
              </div>

              {/* Exercise */}
              {currentItem && (
                <ExerciseWidget
                  key={currentItem.id}
                  exercise={currentItem.exerciseData}
                  onComplete={handleComplete}
                />
              )}

              {/* Next button after answer is submitted */}
              {awaitingNext && (
                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
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
                  {currentIndex + 1 >= items.length ? "Finish Review 🎉" : "Next →"}
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

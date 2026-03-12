"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/ai/schemas";

interface ExerciseWidgetProps {
  exercise: Exercise;
  onComplete?: (isCorrect: boolean) => void;
}

export function ExerciseWidget({ exercise, onComplete }: ExerciseWidgetProps) {
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const userAnswer =
    exercise.type === "mcq" ? (selectedOption ?? "") : answer;

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/exercises/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseData: exercise, userAnswer, hintsUsed }),
      });
      const data = await res.json() as { isCorrect: boolean; feedback: string; partialCredit?: number; hint?: string };
      setIsCorrect(data.isCorrect);
      setFeedback(data.feedback);
      setSubmitted(true);
      onComplete?.(data.isCorrect);
    } catch {
      setFeedback("Failed to check answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetHint = async () => {
    if (hintsUsed >= 3 || submitted) return;

    try {
      const res = await fetch("/api/exercises/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseData: exercise, hintIndex: hintsUsed }),
      });
      const data = await res.json() as { hint: string };
      setRevealedHints((prev) => [...prev, data.hint]);
      setHintsUsed((h) => h + 1);
    } catch {
      // silently fail
    }
  };

  const resultBg = isCorrect
    ? "var(--success)"
    : isCorrect === false
    ? "var(--danger)"
    : "transparent";

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-4"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-start gap-2">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-muted)",
          }}
        >
          {exercise.type === "mcq"
            ? "Multiple Choice"
            : exercise.type === "fill_blank"
            ? "Fill in the Blank"
            : "Free Response"}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full ml-auto"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-muted)",
          }}
        >
          {exercise.difficulty}
        </span>
      </div>

      <p
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: "var(--text-primary)" }}
      >
        {exercise.prompt}
      </p>

      {/* MCQ options */}
      {exercise.type === "mcq" && exercise.options && (
        <div className="flex flex-col gap-2">
          {exercise.options.map((option) => {
            const isSelected = selectedOption === option;
            let borderColor = "var(--border)";
            if (submitted && option === exercise.correctAnswer)
              borderColor = "var(--success)";
            else if (submitted && isSelected && !isCorrect)
              borderColor = "var(--danger)";
            else if (isSelected) borderColor = "var(--accent)";

            return (
              <button
                key={option}
                onClick={() => !submitted && setSelectedOption(option)}
                disabled={submitted}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  background: isSelected
                    ? "var(--bg-hover)"
                    : "var(--bg-tertiary)",
                  border: `1px solid ${borderColor}`,
                  color: "var(--text-primary)",
                  cursor: submitted ? "default" : "pointer",
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {/* Fill in blank */}
      {exercise.type === "fill_blank" && (
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !submitted && handleSubmit()}
          disabled={submitted}
          placeholder="Type your answer..."
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      )}

      {/* Free text */}
      {exercise.type === "free_text" && (
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted}
          placeholder="Write your answer..."
          rows={4}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
          style={{
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      )}

      {/* Hints */}
      {revealedHints.length > 0 && (
        <div className="flex flex-col gap-1">
          {revealedHints.map((hint, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs p-2 rounded-lg"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ color: "var(--warning)" }}>💡</span>
              <span>{hint}</span>
            </div>
          ))}
        </div>
      )}

      {/* Feedback */}
      {submitted && feedback && (
        <div
          className="text-sm p-3 rounded-lg"
          style={{
            background: resultBg + "22",
            border: `1px solid ${resultBg}`,
            color: "var(--text-primary)",
          }}
        >
          <span style={{ marginRight: 6 }}>{isCorrect ? "✅" : "❌"}</span>
          {feedback}
        </div>
      )}

      {/* Actions */}
      {!submitted && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading || !userAnswer.trim()}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: "var(--accent)",
              color: "white",
              opacity: loading || !userAnswer.trim() ? 0.6 : 1,
              cursor: loading || !userAnswer.trim() ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loading && userAnswer.trim())
                e.currentTarget.style.background = "var(--accent-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent)";
            }}
          >
            {loading ? "Checking…" : "Submit"}
          </button>
          {hintsUsed < 3 && (exercise.hints?.length ?? 0) > hintsUsed && (
            <button
              onClick={handleGetHint}
              className="py-2 px-3 rounded-lg text-sm transition-colors"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--warning)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--bg-tertiary)")
              }
            >
              💡 Hint ({hintsUsed}/{Math.min(3, exercise.hints?.length ?? 0)})
            </button>
          )}
        </div>
      )}
    </div>
  );
}

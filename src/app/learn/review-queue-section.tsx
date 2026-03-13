"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useChatStore } from "@/lib/store/chat-store";

export function ReviewQueueSection() {
  const { user } = useChatStore();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/review")
      .then((r) => r.json())
      .then((data: unknown[]) => {
        if (Array.isArray(data)) setCount(data.length);
      })
      .catch(() => null);
  }, [user]);

  if (!user || count === null) return null;

  return (
    <section>
      <h2
        className="text-base font-semibold mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        🔁 Review Queue
      </h2>
      <div
        className="rounded-xl p-4 flex items-center justify-between"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
        }}
      >
        {count === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            ✅ You&apos;re all caught up! No reviews due right now.
          </p>
        ) : (
          <>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              You have{" "}
              <strong style={{ color: "var(--warning)" }}>{count}</strong> item
              {count !== 1 ? "s" : ""} due for review.
            </p>
            <Link
              href="/learn/review"
              className="text-sm px-3 py-1.5 rounded-lg font-medium"
              style={{
                background: "var(--accent)",
                color: "white",
                textDecoration: "none",
              }}
            >
              Start Review
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

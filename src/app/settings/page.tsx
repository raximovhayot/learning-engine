"use client";

import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/sidebar";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="text-sm mb-6 cursor-pointer"
            style={{ color: "var(--text-muted)" }}
          >
            ← Back
          </button>

          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Settings
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            View and manage your learning experience.
          </p>

          <section
            className="p-6 rounded-2xl border"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Active Agents
            </h2>
            <div className="space-y-3">
              {[
                { avatar: "📐", name: "Euler", domain: "Mathematics", desc: "Algebra, calculus, statistics, geometry" },
                { avatar: "⚛️", name: "Newton", domain: "Physics", desc: "Mechanics, E&M, quantum, relativity" },
                { avatar: "💻", name: "Ada", domain: "Programming", desc: "Algorithms, web dev, data structures" },
                { avatar: "🌟", name: "Sage", domain: "General", desc: "History, writing, languages, life skills" },
              ].map((agent) => (
                <div
                  key={agent.name}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <span className="text-xl">{agent.avatar}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {agent.name}
                      <span className="text-xs font-normal ml-2" style={{ color: "var(--text-muted)" }}>
                        {agent.domain}
                      </span>
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {agent.desc}
                    </p>
                  </div>
                  <span className="text-xs" style={{ color: "var(--success)" }}>Active</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

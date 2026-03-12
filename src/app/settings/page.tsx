"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/lib/store/chat-store";
import { Sidebar } from "@/components/sidebar/sidebar";

export default function SettingsPage() {
  const router = useRouter();
  const { apiKey, setApiKey } = useChatStore();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSave = () => {
    setApiKey(keyInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    if (!keyInput) return;
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Say hi in one word." }],
          apiKey: keyInput,
          agentId: "general",
        }),
      });

      if (response.ok) {
        setTestResult({ success: true, message: "API key works! Connection to Gemini successful." });
      } else {
        const data = await response.json().catch(() => ({}));
        setTestResult({
          success: false,
          message: data.error || `Failed with status ${response.status}`,
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Connection error: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    } finally {
      setTesting(false);
    }
  };

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
            Configure your API keys and preferences.
          </p>

          <section
            className="p-6 rounded-2xl border mb-6"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <h2
              className="text-lg font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Google AI Studio API Key
            </h2>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Get your free key at{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}
              >
                aistudio.google.com/apikey
              </a>
            </p>

            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIza..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border mb-4"
              style={{
                background: "var(--bg-tertiary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                style={{ background: "var(--accent)", color: "white" }}
              >
                {saved ? "✓ Saved!" : "Save Key"}
              </button>
              <button
                onClick={handleTest}
                disabled={!keyInput || testing}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {testing ? "Testing..." : "Test Connection"}
              </button>
            </div>

            {testResult && (
              <div
                className="mt-4 p-3 rounded-lg text-sm"
                style={{
                  background: testResult.success
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(239,68,68,0.1)",
                  color: testResult.success ? "var(--success)" : "var(--danger)",
                }}
              >
                {testResult.success ? "✓" : "✕"} {testResult.message}
              </div>
            )}
          </section>

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

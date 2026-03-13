"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/lib/store/chat-store";
import { Sidebar } from "@/components/sidebar/sidebar";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useChatStore();
  const [keyInput, setKeyInput] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Load saved key status from server
  useEffect(() => {
    if (!user) return;
    fetch("/api/keys")
      .then((r) => r.json())
      .then((data) => setHasKey(!!data.hasKey))
      .catch(() => {});
  }, [user]);

  const handleSave = async () => {
    if (!keyInput.trim()) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyInput.trim(), provider: "google" }),
      });
      if (res.ok) {
        setHasKey(true);
        setKeyInput("");
        setSaveResult({ success: true, message: "API key saved securely." });
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveResult({
          success: false,
          message: data.error || `Failed to save (status ${res.status})`,
        });
      }
    } catch {
      setSaveResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  /** Like handleSave but returns true on success (used by handleTest). */
  const handleSaveAndReturn = async (): Promise<boolean> => {
    if (!keyInput.trim()) return false;
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyInput.trim(), provider: "google" }),
      });
      if (res.ok) {
        setHasKey(true);
        setKeyInput("");
        setSaveResult({ success: true, message: "API key saved securely." });
        return true;
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveResult({
          success: false,
          message: data.error || `Failed to save (status ${res.status})`,
        });
        return false;
      }
    } catch {
      setSaveResult({ success: false, message: "Network error. Please try again." });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setSaveResult(null);
    try {
      await fetch("/api/keys", { method: "DELETE" });
      setHasKey(false);
      setSaveResult({ success: true, message: "API key removed." });
    } catch {
      setSaveResult({ success: false, message: "Failed to remove key." });
    } finally {
      setDeleting(false);
    }
  };

  const handleTest = async () => {
    if (!keyInput.trim() && !hasKey) return;
    setTesting(true);
    setTestResult(null);

    // Save new key first if one was typed; abort test if save fails
    if (keyInput.trim()) {
      const saved = await handleSaveAndReturn();
      if (!saved) {
        setTesting(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              id: "test-msg",
              role: "user",
              parts: [{ type: "text", text: "Say hi in one word." }],
            },
          ],
          agentId: "general",
        }),
      });

      if (response.ok) {
        setTestResult({
          success: true,
          message: "API key works! Connection to Gemini successful.",
        });
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
            Configure your API key and preferences.
          </p>

          {/* API Key Section */}
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
              Your key is stored encrypted on the server and never exposed to the
              browser. Get yours at{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}
              >
                aistudio.google.com/apikey
              </a>
            </p>

            {!user ? (
              <div
                className="p-4 rounded-xl text-sm"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                }}
              >
                <span>
                  Please{" "}
                  <button
                    onClick={() => router.push("/login")}
                    className="underline cursor-pointer"
                    style={{ color: "var(--accent)" }}
                  >
                    sign in
                  </button>{" "}
                  to save your API key.
                </span>
              </div>
            ) : (
              <>
                {hasKey && (
                  <div
                    className="flex items-center gap-2 mb-4 p-3 rounded-xl text-sm"
                    style={{
                      background: "rgba(34,197,94,0.1)",
                      color: "var(--success)",
                    }}
                  >
                    <span>✓</span>
                    <span>API key saved. Enter a new key below to replace it.</span>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="ml-auto text-xs underline cursor-pointer disabled:opacity-40"
                      style={{ color: "var(--danger)" }}
                    >
                      {deleting ? "Removing…" : "Remove"}
                    </button>
                  </div>
                )}

                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder={hasKey ? "Enter new key to replace…" : "AIza…"}
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
                    disabled={saving || !keyInput.trim()}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "var(--accent)", color: "white" }}
                  >
                    {saving ? "Saving…" : "Save Key"}
                  </button>
                  <button
                    onClick={handleTest}
                    disabled={testing || (!keyInput.trim() && !hasKey)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {testing ? "Testing…" : "Test Connection"}
                  </button>
                </div>

                {saveResult && (
                  <div
                    className="mt-4 p-3 rounded-lg text-sm"
                    style={{
                      background: saveResult.success
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(239,68,68,0.1)",
                      color: saveResult.success
                        ? "var(--success)"
                        : "var(--danger)",
                    }}
                  >
                    {saveResult.success ? "✓" : "✕"} {saveResult.message}
                  </div>
                )}

                {testResult && (
                  <div
                    className="mt-3 p-3 rounded-lg text-sm"
                    style={{
                      background: testResult.success
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(239,68,68,0.1)",
                      color: testResult.success
                        ? "var(--success)"
                        : "var(--danger)",
                    }}
                  >
                    {testResult.success ? "✓" : "✕"} {testResult.message}
                  </div>
                )}
              </>
            )}
          </section>

          {/* Active Agents Section */}
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
                {
                  avatar: "📐",
                  name: "Euler",
                  domain: "Mathematics",
                  desc: "Algebra, calculus, statistics, geometry",
                },
                {
                  avatar: "⚛️",
                  name: "Newton",
                  domain: "Physics",
                  desc: "Mechanics, E&M, quantum, relativity",
                },
                {
                  avatar: "💻",
                  name: "Ada",
                  domain: "Programming",
                  desc: "Algorithms, web dev, data structures",
                },
                {
                  avatar: "🌟",
                  name: "Sage",
                  domain: "General",
                  desc: "History, writing, languages, life skills",
                },
              ].map((agent) => (
                <div
                  key={agent.name}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <span className="text-xl">{agent.avatar}</span>
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {agent.name}
                      <span
                        className="text-xs font-normal ml-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {agent.domain}
                      </span>
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {agent.desc}
                    </p>
                  </div>
                  <span className="text-xs" style={{ color: "var(--success)" }}>
                    Active
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

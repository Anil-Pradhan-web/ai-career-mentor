"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, MessageSquare } from "lucide-react";
import { optimizeLinkedin, getMarketConfig, getUserStats } from "@/services/api";
import LinkedInPanel from "@/components/LinkedInPanel";
import { LinkedInStrategy } from "@/types";
import { toast } from "react-hot-toast";

export default function LinkedInPage() {
  const [config, setConfig] = useState<any>(null);
  const [role, setRole] = useState("");
  const [resumeRole, setResumeRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<LinkedInStrategy | null>(null);

  useEffect(() => {
    getMarketConfig()
      .then((data) => {
        setConfig(data);
        if (data.roles?.length && !role) setRole(data.roles[0]);
      })
      .catch(console.error);

    getUserStats()
      .then((stats) => {
        if (stats?.lastResumeAnalysis?.target_role) {
          const target = stats.lastResumeAnalysis.target_role;
          setRole(target);
          setResumeRole(target);
        }
      })
      .catch(console.error);
  }, []);

  const handleOptimize = async () => {
    if (!role) return toast.error("Please select a target role");
    setLoading(true);
    setStrategy(null);
    try {
      const data = await optimizeLinkedin(role);
      setStrategy(data.strategy || data);
      toast.success("Strategy generated successfully!");
      if (typeof window !== "undefined") window.dispatchEvent(new Event("rateLimitUpdated"));
    } catch (err: any) {
      toast.error(err.message || "Optimization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10" style={{ maxWidth: "1000px" }}>
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={15} style={{ color: "#0a66c2" }} />
          <span className="text-label" style={{ color: "#0a66c2" }}>LinkedIn</span>
        </div>
        <h1 className="text-h1" style={{ color: "var(--fg-primary)" }}>LinkedIn Optimizer</h1>
        <p className="mt-2" style={{ color: "var(--fg-secondary)", fontSize: "0.9375rem" }}>
          Forge a recruiter-ready brand using AI agents.
        </p>
      </div>

      <div className="card mb-10 animate-fade-up-delay-1" style={{ padding: "28px" }}>
        {resumeRole && (
          <div
            className="mb-5 flex items-center justify-between p-3.5 rounded-xl text-xs flex-wrap gap-2"
            style={{
              background: "rgba(10, 102, 194, 0.08)",
              border: "1px solid rgba(10, 102, 194, 0.2)",
              color: "#0a66c2",
            }}
          >
            <span className="flex items-center gap-2 font-medium">
              <Sparkles size={14} /> Target role auto-filled from your latest Resume Analysis
            </span>
            <span className="text-xs opacity-75">
              Personalized with your strengths & gaps
            </span>
          </div>
        )}

        <div className="mb-5">
          <label className="text-label mb-2 block">Target Career Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
            {role && config?.roles && !config.roles.includes(role) && (
              <option value={role} style={{ background: "var(--bg-surface)" }}>
                {role} (From Resume)
              </option>
            )}
            {config?.roles?.map((r: string) => (
              <option key={r} value={r} style={{ background: "var(--bg-surface)" }}>{r}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleOptimize}
          disabled={loading}
          className="btn-glow"
          style={{ padding: "14px", width: "100%", fontSize: "0.9375rem", fontWeight: 600 }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? "Forging Your Brand..." : "Generate LinkedIn Strategy"}
        </button>
      </div>

      {loading && (
        <div className="text-center py-16">
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: "#0a66c2" }} />
          <h2 className="text-h2" style={{ color: "var(--fg-primary)" }}>Synthesizing Brand Strategy...</h2>
        </div>
      )}

      {strategy && (
        <div className="animate-fade-up">
          <LinkedInPanel strategy={strategy} />
        </div>
      )}
    </div>
  );
}

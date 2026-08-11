"use client";

import React, { useState, useEffect } from "react";
import { Activity, Loader2, MapPin, Sparkles, History, RotateCcw } from "lucide-react";
import {
  getMarketConfig,
  getMarketHistory,
  getMarketTrends,
  deleteMarketHistory,
} from "@/services/api";
import MarketAnalysisPanel from "@/components/full-analysis/MarketAnalysisPanel";
import MarketHistory from "@/components/full-analysis/MarketHistory";
import type { MarketHistoryItem, MarketTrends } from "@/types";

const safeLocalStorage = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

function normaliseTrends(raw: any, fallbackRole: string, fallbackLocation: string): MarketTrends {
  const rawSalary = raw.salary_range;
  const salary_range =
    rawSalary && typeof rawSalary === "object"
      ? rawSalary
      : { min: null, max: null, currency: null, formatted: typeof rawSalary === "string" && rawSalary ? rawSalary : "Live salary data unavailable" };

  const hiring_companies: any[] =
    Array.isArray(raw.hiring_companies) && raw.hiring_companies.length > 0
      ? raw.hiring_companies
      : Array.isArray(raw.company_hiring_stats)
      ? raw.company_hiring_stats
      : [];

  const top_skills_freq: any[] =
    Array.isArray(raw.top_skills_freq) && raw.top_skills_freq.length > 0
      ? raw.top_skills_freq
      : Array.isArray(raw.top_skills)
      ? raw.top_skills.map((s: any) => ({ skill: s.skill ?? s, frequency: typeof s.frequency === "number" ? s.frequency : undefined }))
      : [];

  return {
    role: raw.role || fallbackRole,
    location: raw.location || fallbackLocation,
    market_trend: raw.market_trend || "Stable Demand",
    salary_range,
    hiring_volume: raw.hiring_volume ?? null,
    summary: raw.summary ?? null,
    hiring_companies,
    historical_salary: raw.historical_salary || [],
    historical_hiring: raw.historical_hiring || [],
    company_hiring_stats: hiring_companies,
    top_skills_freq,
    sources: raw.sources || [],
    is_live: raw.is_live ?? false,
    data_source: raw.data_source ?? null,
    provider: raw.provider ?? null,
  };
}

export default function MarketExplorer() {
  const [role, setRole] = useState("Software Engineer");
  const [location, setLocation] = useState("Bangalore, INDIA");
  const [seniority, setSeniority] = useState("Mid");
  const [trends, setTrends] = useState<MarketTrends | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [config, setConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<MarketHistoryItem[]>([]);
  const [historyStatus, setHistoryStatus] = useState<"loading" | "ready" | "error">("loading");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    getMarketConfig().then((data) => {
      setConfig(data);
      if (data?.roles?.length) setRole(data.roles[0]);
      if (data?.locations?.length) setLocation(data.locations[0]);
    });
    refreshHistory();
  }, []);

  const refreshHistory = async () => {
    try {
      setHistoryStatus("loading");
      const data = await getMarketHistory(8);
      setHistory(data);
      setHistoryStatus("ready");
    } catch {
      setHistoryStatus("error");
    }
  };

  const handleSearch = async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await getMarketTrends(role, location, undefined, seniority);
      setTrends(normaliseTrends(data, role, location));
      setStatus("done");
      if (typeof window !== "undefined") window.dispatchEvent(new Event("rateLimitUpdated"));
      refreshHistory();
    } catch (err: any) {
      setError(err.message || "Failed to fetch market data");
      setStatus("error");
    }
  };

  const openHistoryItem = (item: MarketHistoryItem) => {
    setRole(item.target_role);
    setLocation(item.location);
    setTrends(normaliseTrends(item.analysis, item.target_role, item.location));
    setError(null);
    setStatus("done");
    setShowHistory(false);
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      await deleteMarketHistory(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete history item", err);
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10" style={{ maxWidth: "1200px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={15} style={{ color: "var(--accent-cyan)" }} />
            <span className="text-label" style={{ color: "var(--accent-cyan)" }}>Live Market Intelligence</span>
          </div>
          <h1 className="text-h1" style={{ color: "var(--fg-primary)" }}>
            Global Tech{" "}
            <span className="gradient-text-cyan">Trends</span>
          </h1>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="btn btn-secondary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <History size={15} /> History
        </button>
      </div>

      {/* Search Card */}
      <div className="card mb-10 animate-fade-up-delay-1" style={{ padding: "28px" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-label mb-2 block">Target Role</label>
            <select aria-label="Target Role" value={role} onChange={(e) => setRole(e.target.value)} className="input">
              {config?.roles?.map((r: string) => (
                <option key={r} value={r} style={{ background: "var(--bg-surface)" }}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-label mb-2 block">Location</label>
            <select aria-label="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="input">
              {config?.locations?.map((l: string) => (
                <option key={l} value={l} style={{ background: "var(--bg-surface)" }}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-label mb-2 block">Seniority</label>
            <select aria-label="Seniority" value={seniority} onChange={(e) => setSeniority(e.target.value)} className="input">
              {config?.seniorities?.map((s: string) => (
                <option key={s} value={s} style={{ background: "var(--bg-surface)" }}>{s}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            disabled={status === "loading"}
            className="btn btn-primary w-full"
            style={{ height: "44px", fontWeight: 600 }}
          >
            {status === "loading" ? (
              <><Loader2 size={16} className="animate-spin" /> Scanning...</>
            ) : (
              <><Sparkles size={16} /> Launch Analysis</>
            )}
          </button>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <MarketHistory
          history={history}
          onSelect={openHistoryItem}
          onDelete={deleteHistoryItem}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Loading */}
      {status === "loading" && (
        <div className="text-center py-16">
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: "var(--accent-cyan)" }} />
          <h3 className="text-h2" style={{ color: "var(--fg-primary)" }}>Aggregating Live Data...</h3>
          <p style={{ color: "var(--fg-muted)", marginTop: "8px", fontSize: "0.875rem" }}>
            Scanning job boards, salary sources & hiring signals
          </p>
        </div>
      )}

      {/* Results */}
      {status === "done" && trends && (
        <div className="animate-fade-up">
          <MarketAnalysisPanel data={trends} role={role} />
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div
          className="card text-center"
          style={{ padding: "40px", maxWidth: "500px", margin: "40px auto", borderColor: "rgba(239, 68, 68, 0.2)" }}
        >
          <p style={{ color: "var(--accent-rose)", fontSize: "0.9375rem", marginBottom: "20px" }}>{error}</p>
          <button onClick={handleSearch} className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}
    </div>
  );
}

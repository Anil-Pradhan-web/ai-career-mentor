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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** SSR-safe localStorage read — returns null during SSR */
const safeLocalStorage = (key: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
};

/**
 * Normalise backend market response → MarketTrends interface.
 *
 * Fixes:
 *  - salary_range: always return object shape, never raw string fallback
 *  - top_skills_freq: never inject fake frequency values
 *  - hiring_companies / company_hiring_stats: single source of truth
 */
function normaliseTrends(raw: any, fallbackRole: string, fallbackLocation: string): MarketTrends {
    // salary_range — backend returns {min, max, currency, formatted}
    // Keep as-is if it's an object; wrap string into object shape as last resort
    const rawSalary = raw.salary_range;
    const salary_range =
        rawSalary && typeof rawSalary === "object"
            ? rawSalary
            : {
                  min: null,
                  max: null,
                  currency: null,
                  formatted:
                      typeof rawSalary === "string" && rawSalary
                          ? rawSalary
                          : "Live salary data unavailable",
              };

    // hiring_companies — prefer dedicated field, fall back to company_hiring_stats
    const hiring_companies: any[] =
        Array.isArray(raw.hiring_companies) && raw.hiring_companies.length > 0
            ? raw.hiring_companies
            : Array.isArray(raw.company_hiring_stats)
            ? raw.company_hiring_stats
            : [];

    // top_skills_freq — NEVER inject fake frequency (old: hardcoded 85)
    // Backend now returns real occurrence-based frequencies
    const top_skills_freq: any[] =
        Array.isArray(raw.top_skills_freq) && raw.top_skills_freq.length > 0
            ? raw.top_skills_freq
            : Array.isArray(raw.top_skills)
            ? raw.top_skills.map((s: any) => ({
                  skill: s.skill ?? s,
                  // Use backend frequency if present, otherwise omit (undefined → UI handles gracefully)
                  frequency: typeof s.frequency === "number" ? s.frequency : undefined,
              }))
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
        // keep company_hiring_stats in sync so downstream components work
        company_hiring_stats: hiring_companies,
        top_skills_freq,
        sources: raw.sources || [],
        is_live: raw.is_live ?? false,
        data_source: raw.data_source ?? null,
        provider: raw.provider ?? null,
    };
}

function salaryLabel(value: MarketTrends["salary_range"]): string {
    if (!value) return "Salary unavailable";
    if (typeof value === "string") return value;
    return (value as any).formatted || "Salary unavailable";
}


// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

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

            // Dispatch event to refresh dashboard rate limits
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("rateLimitUpdated"));
            }

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
        <div style={{ minHeight: "100vh", padding: "80px 32px 48px 110px", color: "#f8fafc" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

                {/* Header */}
                <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            background: "rgba(6, 182, 212, 0.1)", padding: "6px 16px",
                            borderRadius: "100px", color: "#06b6d4", fontSize: "0.75rem",
                            fontWeight: 700, letterSpacing: "0.1em", marginBottom: "16px",
                            border: "1px solid rgba(6, 182, 212, 0.2)",
                        }}>
                            <Activity size={14} /> LIVE MARKET INTELLIGENCE
                        </div>
                        <h1 style={{ fontSize: "2.8rem", fontWeight: 800, color: "white", margin: "0 0 12px 0", letterSpacing: "-0.02em" }}>
                            Global Tech{" "}
                            <span style={{ background: "linear-gradient(to right, #06b6d4, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                Trends
                            </span>
                        </h1>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            onClick={() => setShowHistory(true)}
                            style={{
                                padding: "10px 16px", borderRadius: "100px",
                                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                            }}
                        >
                            <History size={18} /> History
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div style={{
                    background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px",
                    padding: "32px", marginBottom: "48px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", alignItems: "flex-end" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Target Role</span>
                            <select
                                aria-label="Target Role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={{ padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                            >
                                {config?.roles?.map((r: string) => (
                                    <option key={r} value={r} style={{ background: "#0f172a" }}>{r}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Location</span>
                            <select
                                aria-label="Location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                style={{ padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                            >
                                {config?.locations?.map((l: string) => (
                                    <option key={l} value={l} style={{ background: "#0f172a" }}>{l}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Seniority</span>
                            <select
                                aria-label="Seniority"
                                value={seniority}
                                onChange={(e) => setSeniority(e.target.value)}
                                style={{ padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                            >
                                {config?.seniorities?.map((s: string) => (
                                    <option key={s} value={s} style={{ background: "#0f172a" }}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={status === "loading"}
                            style={{
                                height: "52px", borderRadius: "14px", fontWeight: 700,
                                cursor: status === "loading" ? "not-allowed" : "pointer",
                                border: "none", opacity: status === "loading" ? 0.7 : 1,
                                background: "linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)", color: "white",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                boxShadow: "0 8px 20px rgba(6,182,212,0.3)", transition: "opacity 0.2s",
                            }}
                        >
                            {status === "loading"
                                ? <><Loader2 size={20} className="animate-spin" /> Scanning...</>
                                : <><Sparkles size={20} /> Launch Analysis</>
                            }
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
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <Loader2 size={48} className="animate-spin" color="#06b6d4" style={{ margin: "0 auto 24px" }} />
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>
                            Aggregating Live Data...
                        </h3>
                        <p style={{ color: "rgba(255,255,255,0.4)", marginTop: "8px", fontSize: "0.9rem" }}>
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
                    <div style={{
                        padding: "40px", textAlign: "center",
                        background: "rgba(239,68,68,0.05)", borderRadius: "24px",
                        border: "1px solid rgba(239,68,68,0.2)", maxWidth: "600px", margin: "40px auto",
                    }}>
                        <p style={{ color: "#fca5a5", fontSize: "1.1rem", marginBottom: "24px" }}>{error}</p>
                        <button
                            onClick={handleSearch}
                            style={{
                                padding: "10px 24px", borderRadius: "100px",
                                background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                                color: "#fca5a5", cursor: "pointer", display: "inline-flex",
                                alignItems: "center", gap: "8px", fontWeight: 600,
                            }}
                        >
                            <RotateCcw size={16} /> Retry
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
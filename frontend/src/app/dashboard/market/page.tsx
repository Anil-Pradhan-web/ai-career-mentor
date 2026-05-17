"use client";

import React, { useState, useEffect } from "react";
import { Activity, Zap, Loader2, Sparkles } from "lucide-react";
import { getMarketConfig, getMarketTrends } from "@/services/api";
import MarketAnalysisPanel from "@/components/full-analysis/MarketAnalysisPanel";
import ModelSelector from "@/components/ModelSelector";
import { MarketTrends } from "@/types";

export default function MarketExplorer() {
    const [role, setRole] = useState("Software Engineer");
    const [location, setLocation] = useState("Bangalore, INDIA");
    const [seniority, setSeniority] = useState("Mid");
    const [trends, setTrends] = useState<MarketTrends | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [config, setConfig] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMarketConfig().then(data => {
            setConfig(data);
            if (data?.roles?.length) setRole(data.roles[0]);
            if (data?.locations?.length) setLocation(data.locations[0]);
        });
    }, []);

    const handleSearch = async () => {
        setStatus("loading");
        setError(null);
        try {
            const provider = localStorage.getItem("preferred_provider") || "groq";
            const data = await getMarketTrends(role, location, provider, seniority);
            
            // Map to MarketTrends interface if keys differ
            const mappedData: MarketTrends = {
                role: data.role || role,
                location: data.location || location,
                market_trend: data.market_trend || "Stable Demand",
                salary_range: data.salary_range || "Live salary data unavailable",
                hiring_volume: data.hiring_volume,
                summary: data.summary,
                hiring_companies: data.hiring_companies || data.company_hiring_stats || [],
                historical_salary: data.historical_salary || [],
                historical_hiring: data.historical_hiring || [],
                company_hiring_stats: data.company_hiring_stats || [],
                top_skills_freq: data.top_skills_freq || data.top_skills?.map((s: any) => ({ skill: s.skill, frequency: 85 })) || [],
                sources: data.sources || [],
                is_live: data.is_live,
                data_source: data.data_source,
                provider: data.provider
            };

            setTrends(mappedData);
            setStatus("done");
        } catch (err: any) {
            setError(err.message || "Failed to fetch market data");
            setStatus("error");
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
                            border: "1px solid rgba(6, 182, 212, 0.2)"
                        }}>
                            <Activity size={14} /> LIVE MARKET INTELLIGENCE
                        </div>
                        <h1 style={{ fontSize: "2.8rem", fontWeight: 800, color: "white", margin: "0 0 12px 0", letterSpacing: "-0.02em" }}>
                            Global Tech <span style={{ background: "linear-gradient(to right, #06b6d4, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Trends</span>
                        </h1>
                    </div>
                    <ModelSelector />
                </div>

                {/* Search Bar */}
                <div style={{
                    background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px",
                    padding: "32px", marginBottom: "48px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
                }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", alignItems: "flex-end" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Target Role</span>
                            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}>
                                {config?.roles?.map((r: string) => <option key={r} value={r} style={{ background: "#0f172a" }}>{r}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Location</span>
                            <select value={location} onChange={(e) => setLocation(e.target.value)} style={{ padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}>
                                {config?.locations?.map((l: string) => <option key={l} value={l} style={{ background: "#0f172a" }}>{l}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Seniority</span>
                            <select value={seniority} onChange={(e) => setSeniority(e.target.value)} style={{ padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}>
                                {config?.seniorities?.map((s: string) => <option key={s} value={s} style={{ background: "#0f172a" }}>{s}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={status === "loading"}
                            style={{
                                height: "52px", borderRadius: "14px", fontWeight: 700, cursor: "pointer", border: "none",
                                background: "linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)", color: "white",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                boxShadow: "0 8px 20px rgba(6,182,212,0.3)"
                            }}
                        >
                            {status === "loading" ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                            {status === "loading" ? "Scanning..." : "Launch Analysis"}
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                {status === "loading" && (
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <Loader2 size={48} className="animate-spin" color="#06b6d4" style={{ margin: "0 auto 24px" }} />
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>Aggregating Global Data...</h3>
                    </div>
                )}

                {status === "done" && trends && (
                    <div className="animate-fade-up">
                        <MarketAnalysisPanel data={trends} role={role} />
                    </div>
                )}

                {status === "error" && (
                    <div style={{ padding: "40px", textAlign: "center", background: "rgba(239,68,68,0.05)", borderRadius: "24px", border: "1px solid rgba(239,68,68,0.2)", maxWidth: "600px", margin: "40px auto" }}>
                        <p style={{ color: "#fca5a5", fontSize: "1.1rem" }}>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
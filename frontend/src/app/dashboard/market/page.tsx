"use client";

import React, { useState, useEffect } from "react";
import {
    Activity,
    Briefcase,
    MapPin,
    Zap,
    FileSearch,
    Loader2,
    Sparkles,
    Users,
    CircleDollarSign,
    Trophy,
    Building2,
    Globe
} from "lucide-react";
import { getMarketConfig, getMarketTrends } from "@/services/api";

export default function MarketExplorer() {
    const [role, setRole] = useState("Software Engineer");
    const [location, setLocation] = useState("Bangalore, INDIA");
    const [seniority, setSeniority] = useState("Mid");
    const [provider, setProvider] = useState("gemini");
    const [trends, setTrends] = useState<any>(null);
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
            const data = await getMarketTrends(role, location, provider, seniority);
            setTrends(data);
            setStatus("done");
        } catch (err: any) {
            setError(err.message || "Failed to fetch market data");
            setStatus("error");
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#020617", padding: "80px 32px 48px 32px", color: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                
                {/* Header - Professional AI Branding */}
                <div style={{ marginBottom: "40px", textAlign: "center" }}>
                    <div style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "8px", 
                        background: "rgba(99, 102, 241, 0.1)", 
                        padding: "6px 16px", 
                        borderRadius: "100px", 
                        color: "#818cf8", 
                        fontSize: "0.7rem", 
                        fontWeight: 700, 
                        letterSpacing: "0.1em",
                        marginBottom: "16px",
                        border: "1px solid rgba(99, 102, 241, 0.2)"
                    }}>
                        <Globe size={14} /> LIVE MARKET ANALYTICS 2.0
                    </div>
                    <h1 style={{ fontSize: "2.8rem", fontWeight: 800, color: "white", margin: "0 0 12px 0", letterSpacing: "-0.02em" }}>
                        Market <span style={{ background: "linear-gradient(to right, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Intelligence</span>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto" }}>
                        Real-time salary benchmarks and hiring volume from Serper.dev & Tavily AI.
                    </p>
                </div>

                {/* Search Bar - Sleek Glassmorphism */}
                <div style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "24px",
                    padding: "24px",
                    marginBottom: "40px",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Zap size={14} className="text-indigo-400" /> AI ENGINE SELECTION
                        </span>
                        <div style={{ display: "flex", background: "#0f172a", borderRadius: "100px", padding: "4px", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <button 
                                onClick={() => setProvider("gemini")}
                                style={{
                                    padding: "6px 16px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", border: "none",
                                    background: provider === "gemini" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                                    color: provider === "gemini" ? "white" : "rgba(255,255,255,0.4)",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                GOOGLE GEMINI
                            </button>
                            <button 
                                onClick={() => setProvider("groq")}
                                style={{
                                    padding: "6px 16px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", border: "none",
                                    background: provider === "groq" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "transparent",
                                    color: provider === "groq" ? "white" : "rgba(255,255,255,0.4)",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                GROQ (LLAMA-3)
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", alignItems: "flex-end" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Role</span>
                            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: "12px", borderRadius: "12px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}>
                                {config?.roles?.map((r: string) => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Location</span>
                            <select value={location} onChange={(e) => setLocation(e.target.value)} style={{ padding: "12px", borderRadius: "12px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}>
                                {config?.locations?.map((l: string) => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Seniority</span>
                            <select value={seniority} onChange={(e) => setSeniority(e.target.value)} style={{ padding: "12px", borderRadius: "12px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}>
                                {config?.seniorities?.map((s: string) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={status === "loading"}
                            style={{
                                height: "48px",
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                border: "none",
                                color: "white",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                transition: "transform 0.2s"
                            }}
                        >
                            {status === "loading" ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            {status === "loading" ? "Analyzing..." : "Analyze Market"}
                        </button>
                    </div>
                </div>

                {/* Main Results Display */}
                {status === "loading" && (
                    <div style={{ textAlign: "center", padding: "100px 0" }}>
                        <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 24px" }}>
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "4px solid rgba(99, 102, 241, 0.1)", borderRadius: "50%" }}></div>
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "4px solid transparent", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                        </div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "white" }}>Scanning Market Data...</h3>
                        <p style={{ color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>Fetching live reports from Serper & Tavily</p>
                    </div>
                )}

                {status === "done" && trends && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.5s ease-out" }}>
                        
                        {/* Top Row: Salary & Hiring Volume */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            <div style={{ padding: "32px", borderRadius: "28px", background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
                                <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)", pointerEvents: "none" }}></div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#6366f1", marginBottom: "20px" }}>
                                    <CircleDollarSign size={20} />
                                    <span style={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Compensation Benchmark</span>
                                </div>
                                <h2 style={{ fontSize: "2.4rem", fontWeight: 800, color: "white", marginBottom: "8px" }}>{trends.salary_range?.formatted}</h2>
                                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}>Annual base salary for <span style={{ color: "#a855f7", fontWeight: 600 }}>{trends.seniority}</span> role in <span style={{ color: "white" }}>{trends.location}</span></p>
                            </div>

                            <div style={{ padding: "32px", borderRadius: "28px", background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
                                <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)", pointerEvents: "none" }}></div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#a855f7", marginBottom: "20px" }}>
                                    <Users size={20} />
                                    <span style={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Hiring Volume</span>
                                </div>
                                <h2 style={{ fontSize: "2.4rem", fontWeight: 800, color: "white", marginBottom: "8px" }}>{trends.hiring_volume}</h2>
                                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}>Current job openings and recruitment velocity</p>
                            </div>
                        </div>

                        {/* Bottom Row: Skills & Companies */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
                            
                            {/* Skills Grid */}
                            <div style={{ padding: "28px", borderRadius: "28px", background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#fbbf24", marginBottom: "20px" }}>
                                    <Trophy size={18} />
                                    <span style={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>Trending Skills</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    {trends.top_skills?.map((s: any, i: number) => (
                                        <div key={i} style={{ padding: "12px 16px", borderRadius: "16px", background: "rgba(251, 191, 36, 0.05)", border: "1px solid rgba(251, 191, 36, 0.1)", color: "#fbbf24", fontSize: "0.85rem", fontWeight: 600, textAlign: "center" }}>
                                            {s.skill}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Companies List */}
                            <div style={{ padding: "28px", borderRadius: "28px", background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#34d399", marginBottom: "20px" }}>
                                    <Building2 size={18} />
                                    <span style={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>Key Hiring Entities</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {trends.top_companies?.map((c: any, i: number) => (
                                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                            <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>{c.name}</span>
                                            <div style={{ fontSize: "0.7rem", padding: "4px 10px", borderRadius: "100px", background: "rgba(52, 211, 153, 0.1)", color: "#34d399", fontWeight: 700 }}>ACTIVE</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Summary Footer */}
                        <div style={{ padding: "24px 32px", borderRadius: "24px", background: "linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", lineHeight: 1.6, fontStyle: "italic", textAlign: "center" }}>
                                "{trends.summary}"
                            </p>
                        </div>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
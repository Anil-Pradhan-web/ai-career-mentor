"use client";

import { useState } from "react";
import { Upload, ChevronRight, Briefcase, Zap, Bot, BrainCircuit, Users, TrendingUp } from "lucide-react";
import { uploadResume, runFullAnalysis } from "@/services/api";
import ResumeAnalysisPanel from "@/components/ResumeAnalysisPanel";
import ModelSelector from "@/components/ModelSelector";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const TARGET_ROLES = [
    "Software Engineer", "Data Scientist", "Full Stack Developer", "Frontend Developer",
    "Backend Developer", "Product Manager", "Machine Learning Engineer", "DevOps Engineer",
    "Cloud Architect", "Site Reliability Engineer", "Cybersecurity Analyst", "UI/UX Designer"
];

const TARGET_LOCATIONS = [
    "Bangalore, India", "Hyderabad, India", "Pune, India", "Mumbai, India",
    "Delhi NCR, India", "San Francisco, United States", "Seattle, United States",
    "London, United Kingdom", "Remote"
];

export default function FullAnalysisPage() {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState("");

    const [role, setRole] = useState(TARGET_ROLES[0]);
    const [location, setLocation] = useState(TARGET_LOCATIONS[0]);

    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"resume" | "market" | "roadmap">("resume");

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            try {
                const data = await uploadResume(e.target.files[0]);
                setResumeText(data.full_text);
            } catch (err) {
                console.error("Failed to read resume text", err);
            }
        }
    };

    const runAgents = async () => {
        if (!resumeText) {
            setError("Please upload a readable resume first.");
            return;
        }
        setStatus("loading");
        setError(null);
        setStep(3);

        try {
            const activeProvider = localStorage.getItem("preferred_provider") || "groq";
            const data = await runFullAnalysis(resumeText, role, location, activeProvider);
            setResults(data);
            setStatus("done");
        } catch (err: any) {
            setStatus("error");
            setError(err.message || "Failed to run agent orchestrator.");
        }
    };

    return (
        <main style={{
            flex: 1, padding: "48px 60px",
            width: "100%", position: "relative", zIndex: 1,
        }}>
            <div style={{ paddingLeft: "50px" }}>

                {/* Header */}
                <div className="animate-fade-up" style={{ marginBottom: "48px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{
                            width: "56px", height: "56px", borderRadius: "16px",
                            background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))",
                            border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 8px 20px rgba(139,92,246,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <BrainCircuit size={28} color="#a855f7" />
                        </div>
                        <div>
                            <h1 style={{
                                fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem", fontWeight: 800,
                                color: "white", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "6px",
                            }}>
                                Full Career Analysis
                            </h1>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.05rem" }}>
                                    Multi-Agent Orchestration (Resume + Market + Coach)
                                </p>
                                {status !== "loading" && <ModelSelector />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wizard Flow (Steps 1 & 2) */}
                {step < 3 && (
                    <div className="animate-fade-up-delay-1" style={{
                        maxWidth: "800px", padding: "40px",
                        background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)",
                        border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px",
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
                    }}>

                        {/* Step Indicator */}
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "40px", padding: "0 20px" }}>
                            <div style={{
                                flex: 1, textAlign: "center", fontWeight: 700, fontSize: "0.95rem",
                                color: step === 1 ? "#a855f7" : "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em"
                            }}>1. Upload Resume</div>
                            <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
                            <div style={{
                                flex: 1, textAlign: "center", fontWeight: 700, fontSize: "0.95rem",
                                color: step === 2 ? "#06b6d4" : "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em"
                            }}>2. Set Goal</div>
                            <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
                            <div style={{
                                flex: 1, textAlign: "center", fontWeight: 700, fontSize: "0.95rem",
                                color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em"
                            }}>3. AI Magic</div>
                        </div>

                        {/* Step 1: Upload */}
                        {step === 1 && (
                            <div>
                                <label style={{
                                    display: "flex", flexDirection: "column", alignItems: "center",
                                    padding: "50px 24px", border: "2px dashed rgba(255,255,255,0.1)",
                                    borderRadius: "16px", cursor: "pointer", background: "rgba(255,255,255,0.02)",
                                    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)";
                                        e.currentTarget.style.background = "rgba(139,92,246,0.05)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                                    }}
                                >
                                    <Upload size={36} color="#a855f7" style={{ marginBottom: "16px" }} />
                                    <span style={{ color: "white", fontWeight: 600, fontSize: "1.05rem" }}>
                                        {file ? file.name : "Click to upload your Resume (PDF)"}
                                    </span>
                                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: "8px" }}>
                                        PDF only · Max 5MB
                                    </span>
                                    <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileUpload} />
                                </label>
                                <button
                                    className="btn-glow"
                                    disabled={!resumeText}
                                    onClick={() => setStep(2)}
                                    style={{
                                        marginTop: "24px", width: "100%", padding: "16px",
                                        borderRadius: "14px", fontWeight: 700, border: "none",
                                        fontSize: "1rem", color: "white",
                                        background: !resumeText ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)",
                                        opacity: !resumeText ? 0.5 : 1, cursor: !resumeText ? "not-allowed" : "pointer",
                                        boxShadow: resumeText ? "0 8px 20px rgba(139,92,246,0.4)" : "none",
                                        transition: "all 0.15s ease"
                                    }}
                                >
                                    Continue to Goals <ChevronRight size={18} style={{ verticalAlign: "middle", marginLeft: "4px" }}/>
                                </button>
                            </div>
                        )}

                        {/* Step 2: Goals */}
                        {step === 2 && (
                            <div className="animate-fade-up">
                                <div style={{ marginBottom: "24px" }}>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "10px" }}>
                                        Target Role
                                    </label>
                                    <select
                                        value={role} onChange={(e) => setRole(e.target.value)}
                                        style={{
                                            width: "100%", padding: "16px 20px", borderRadius: "14px",
                                            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                                            color: "white", fontSize: "1rem", outline: "none", cursor: "pointer",
                                            transition: "border-color 0.15s ease",
                                        }}
                                        onFocus={e => e.currentTarget.style.borderColor = "#06b6d4"}
                                        onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                                    >
                                        {TARGET_ROLES.map(r => <option key={r} value={r} style={{ background: "#0f172a" }}>{r}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: "40px" }}>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "10px" }}>
                                        Location
                                    </label>
                                    <select
                                        value={location} onChange={(e) => setLocation(e.target.value)}
                                        style={{
                                            width: "100%", padding: "16px 20px", borderRadius: "14px",
                                            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                                            color: "white", fontSize: "1rem", outline: "none", cursor: "pointer",
                                            transition: "border-color 0.15s ease",
                                        }}
                                        onFocus={e => e.currentTarget.style.borderColor = "#06b6d4"}
                                        onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                                    >
                                        {TARGET_LOCATIONS.map(l => <option key={l} value={l} style={{ background: "#0f172a" }}>{l}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: "flex", gap: "16px" }}>
                                    <button
                                        onClick={() => setStep(1)}
                                        style={{
                                            flex: 1, padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.05)",
                                            border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: "pointer", fontSize: "1rem",
                                            fontWeight: 600, transition: "all 0.2s",
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)" }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
                                    >Back</button>
                                    <button
                                        className="btn-glow"
                                        onClick={runAgents}
                                        style={{
                                            flex: 2, padding: "16px", borderRadius: "14px", fontWeight: 700, border: "none", cursor: "pointer",
                                            fontSize: "1rem", color: "white", background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)",
                                            boxShadow: "0 8px 25px rgba(139,92,246,0.4)",
                                        }}
                                    >
                                        Launch AI Agents ✨
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Loading / Results */}
                {step === 3 && (
                    <div className="animate-fade-up">
                        {status === "loading" && (
                            <div 
                                className="animate-pulse-glow"
                                style={{ 
                                    textAlign: "center", 
                                    padding: "80px 40px", 
                                    background: "rgba(15, 23, 42, 0.2)", 
                                    borderRadius: "24px",
                                    border: "1px dashed rgba(168, 85, 247, 0.2)",
                                    maxWidth: "700px",
                                    margin: "40px auto"
                                }}
                            >
                                <Loader2 size={48} className="animate-spin" style={{ marginBottom: "24px", color: "#a855f7" }} />
                                <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", marginBottom: "16px", fontFamily: "'Space Grotesk', sans-serif" }}>AI Agents are collaborating...</h3>
                                <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.6, fontSize: "1.05rem" }}>
                                    The Resume Analyst, Market Researcher, and Career Coach are securely reviewing your profile in a live GroupChat to build your comprehensive report.
                                </p>
                                <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center" }}>
                                    <div style={{ padding: "8px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "100px", fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                                        Estimated time: 30-45 seconds
                                    </div>
                                </div>
                            </div>
                        )}

                        {status === "error" && (
                            <div style={{
                                padding: "40px", textAlign: "center", borderRadius: "24px", maxWidth: "600px", margin: "40px auto 0",
                                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", backdropFilter: "blur(20px)"
                            }}>
                                <p style={{ color: "#fca5a5", fontSize: "1.05rem", fontWeight: 500, marginBottom: "24px" }}>{error}</p>
                                <button
                                    onClick={() => setStep(2)}
                                    style={{
                                        padding: "12px 24px", background: "rgba(239,68,68,0.2)", color: "#fca5a5",
                                        border: "1px solid rgba(239,68,68,0.4)", borderRadius: "12px", cursor: "pointer",
                                        fontSize: "1rem", fontWeight: 600, transition: "background 0.2s"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.3)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {status === "done" && results && (
                            <div className="animate-fade-up">
                                {/* Tabs */}
                                <div style={{
                                    display: "flex", gap: "16px", marginBottom: "40px",
                                    borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px",
                                }}>
                                    {([
                                        { key: "resume" as const, label: "Resume Analysis", icon: Briefcase, color: "#a855f7" },
                                        { key: "market" as const, label: "Market Trends", icon: TrendingUp, color: "#06b6d4" },
                                        { key: "roadmap" as const, label: "Learning Roadmap", icon: Zap, color: "#3b82f6" },
                                    ]).map(tab => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.key;
                                        return (
                                            <button
                                                key={tab.key}
                                                onClick={() => setActiveTab(tab.key)}
                                                style={{
                                                    background: isActive ? `${tab.color}15` : "transparent",
                                                    border: isActive ? `1px solid ${tab.color}40` : "1px solid transparent",
                                                    fontWeight: isActive ? 700 : 500,
                                                    fontSize: "1rem",
                                                    cursor: "pointer",
                                                    display: "flex", alignItems: "center", gap: "8px",
                                                    color: isActive ? tab.color : "rgba(255,255,255,0.5)",
                                                    padding: "10px 20px",
                                                    borderRadius: "12px",
                                                    transition: "all 0.2s",
                                                }}
                                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "white" }}
                                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.5)" }}
                                            >
                                                <Icon size={20} />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Resume Tab */}
                                {activeTab === "resume" && (
                                    <ResumeAnalysisPanel analysis={results.resume_analysis} filename={file?.name || "Uploaded File"} />
                                )}

                                {/* Market Tab */}
                                {activeTab === "market" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                        {/* Row 1: Summary Cards */}
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                                    <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Market Trend</p>
                                                    {results.market_trends.market_confidence && (
                                                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#818cf8", padding: "2px 8px", background: "rgba(99,102,241,0.1)", borderRadius: "100px", border: "1px solid rgba(99,102,241,0.2)" }}>
                                                            {Math.round(results.market_trends.market_confidence * 100)}% CONFIDENCE
                                                        </div>
                                                    )}
                                                </div>
                                                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem", fontWeight: 800, color: "#34d399", marginBottom: "12px" }}>{results.market_trends.market_trend}</h2>
                                                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                                                    {results.market_trends.market_summary || "Real-time hiring demand and sentiment analysis."}
                                                </p>
                                            </div>
                                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                                    <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Expected Salary Range</p>
                                                    {results.market_trends.is_remote && (
                                                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#10b981", padding: "2px 8px", background: "rgba(16,185,129,0.1)", borderRadius: "100px", border: "1px solid rgba(16,185,129,0.2)" }}>
                                                            REMOTE
                                                        </div>
                                                    )}
                                                </div>
                                                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem", fontWeight: 800, margin: "16px 0", color: "white" }}>{results.market_trends.salary_range}</h2>
                                                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Estimated annual benchmark for {role} roles.</p>
                                            </div>
                                        </div>

                                        {/* Row 2: Charts */}
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                                            {/* Historical Salary Growth */}
                                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                                <p style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px" }}>
                                                    <TrendingUp size={18} color="#10b981" /> 4-Year Salary Growth
                                                </p>
                                                <div style={{ height: "250px", width: "100%" }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={results.market_trends.historical_salary}>
                                                            <defs>
                                                                <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                                                            <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)'}} tickFormatter={(val) => val > 1000000 ? `${(val/100000).toFixed(0)}L` : `${(val/1000).toFixed(0)}k`} />
                                                            <Tooltip 
                                                                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                                                itemStyle={{ color: '#10b981' }}
                                                            />
                                                            <Area type="monotone" dataKey="salary" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSalary)" />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            {/* Historical Hiring Volume */}
                                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                                <p style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px" }}>
                                                    <Briefcase size={18} color="#3b82f6" /> 4-Year Hiring Volume
                                                </p>
                                                <div style={{ height: "250px", width: "100%" }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={results.market_trends.historical_hiring}>
                                                            <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                                                            <Tooltip 
                                                                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                                                itemStyle={{ color: '#3b82f6' }}
                                                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                                            />
                                                            <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 3: Skills and Companies */}
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                                            {/* Top Skills Frequency */}
                                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                                <p style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px" }}>
                                                    <Zap size={18} color="#f59e0b" /> Top In-Demand Skills (Frequency)
                                                </p>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                                    {results.market_trends.top_skills_freq?.map((item: any, i: number) => (
                                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "100px" }}>
                                                            <span style={{ color: "#fbbf24", fontSize: "0.95rem", fontWeight: 600 }}>
                                                                {i + 1}. {item.skill}
                                                            </span>
                                                            <span style={{ background: "rgba(245,158,11,0.2)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", color: "#fbbf24" }}>
                                                                {item.frequency}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Top Companies Hiring Stats */}
                                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                                <p style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px" }}>
                                                    <Briefcase size={18} color="#a78bfa" /> Top Hiring Companies (Volume)
                                                </p>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                    {results.market_trends.company_hiring_stats?.map((comp: any, i: number) => {
                                                        const maxVol = results.market_trends.company_hiring_stats[0].hiring_volume;
                                                        const pct = (comp.hiring_volume / maxVol) * 100;
                                                        return (
                                                            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "white" }}>
                                                                    <span>{comp.name}</span>
                                                                    <span style={{ color: "#a78bfa", fontWeight: 600 }}>{comp.hiring_volume} openings</span>
                                                                </div>
                                                                <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                                                    <div style={{ width: `${pct}%`, height: "100%", background: "#a78bfa", borderRadius: "3px" }} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Roadmap Tab */}
                                {activeTab === "roadmap" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                        {results.roadmap.weeks?.map((week: any, i: number) => (
                                            <div key={i} style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)" }}>
                                                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "white", fontSize: "1.3rem", fontWeight: 800, marginBottom: "12px" }}>
                                                    Week {week.week}: <span style={{ color: "#38bdf8" }}>{week.topic}</span>
                                                </h3>
                                                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", marginBottom: "16px", lineHeight: 1.6 }}>
                                                    {week.mini_project}
                                                </p>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                                    {week.youtube_resources?.slice(0, 1).map((url: string, j: number) => (
                                                        <a key={`yt-${j}`} href={url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#f87171", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem", padding: "8px 16px", background: "rgba(239,68,68,0.1)", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.2)" }}>
                                                            YouTube ↗
                                                        </a>
                                                    ))}
                                                    {week.article_resources?.slice(0, 1).map((url: string, j: number) => (
                                                        <a key={`art-${j}`} href={url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#60a5fa", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem", padding: "8px 16px", background: "rgba(59,130,246,0.1)", borderRadius: "10px", border: "1px solid rgba(59,130,246,0.2)" }}>
                                                            Article ↗
                                                        </a>
                                                    ))}
                                                    {week.official_docs?.slice(0, 1).map((url: string, j: number) => (
                                                        <a key={`doc-${j}`} href={url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#34d399", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem", padding: "8px 16px", background: "rgba(16,185,129,0.1)", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.2)" }}>
                                                            Docs ↗
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

"use client";

import { useState } from "react";
import { Upload, ChevronRight, Briefcase, MapPin, Zap, Bot, BrainCircuit, TrendingUp } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { uploadResume, runFullAnalysis } from "@/services/api";
import ResumeAnalysisPanel from "@/components/ResumeAnalysisPanel";

const TARGET_ROLES = [
    "Software Engineer",
    "Data Scientist",
    "Full Stack Developer",
    "Cloud Engineer",
    "DevOps Engineer",
    "Machine Learning Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Product Manager",
    "Cybersecurity Analyst",
];

const TARGET_LOCATIONS = [
    "United States",
    "India",
    "Remote",
    "United Kingdom",
    "Canada",
    "Australia",
    "Europe",
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
                // Just extract text for now
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
            const data = await runFullAnalysis(resumeText, role, location);
            setResults(data);
            setStatus("done");
        } catch (err: any) {
            setStatus("error");
            setError(err.message || "Failed to run agent orchestrator.");
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>
            <div className="animate-pulse-glow" style={{ position: "absolute", top: "-15%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)", zIndex: 0, pointerEvents: "none" }} />
            <div className="animate-pulse-glow" style={{ position: "absolute", bottom: "-20%", left: "-5%", width: "700px", height: "700px", background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)", zIndex: 0, pointerEvents: "none", animationDelay: "1.5s" }} />

            <Sidebar />

            <main style={{ marginLeft: "240px", flex: 1, padding: "48px", maxWidth: "calc(100vw - 240px)", position: "relative", zIndex: 1 }}>

                <div className="animate-fade-up" style={{ marginBottom: "40px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <BrainCircuit size={24} color="#a855f7" />
                        </div>
                        <div>
                            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem", fontWeight: 800, color: "#f8fafc", marginBottom: "4px" }}>
                                Full Career Analysis
                            </h1>
                            <p style={{ color: "#94a3b8", fontSize: "15px" }}>Multi-Agent Orchestration (Resume + Market + Coach)</p>
                        </div>
                    </div>
                </div>

                {/* Wizard Flow */}
                {step < 3 && (
                    <div className="glass animate-fade-up-delay-1" style={{ maxWidth: "700px", padding: "40px", borderRadius: "20px" }}>

                        {/* Step Indicator */}
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
                            <div style={{ flex: 1, textAlign: "center", color: step === 1 ? "#a855f7" : "#475569", fontWeight: 600 }}>1. Upload Resume</div>
                            <ChevronRight size={16} color="#475569" />
                            <div style={{ flex: 1, textAlign: "center", color: step === 2 ? "#a855f7" : "#475569", fontWeight: 600 }}>2. Set Goal</div>
                            <ChevronRight size={16} color="#475569" />
                            <div style={{ flex: 1, textAlign: "center", color: "#475569", fontWeight: 600 }}>3. AI Magic</div>
                        </div>

                        {/* Step 1: Upload */}
                        {step === 1 && (
                            <div>
                                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", border: "2px dashed rgba(139,92,246,0.3)", borderRadius: "16px", cursor: "pointer", background: "rgba(15,23,42,0.5)", transition: "all 0.3s ease" }}>
                                    <Upload size={32} color="#a855f7" style={{ marginBottom: "16px" }} />
                                    <span style={{ color: "#f1f5f9", fontWeight: 500 }}>{file ? file.name : "Click to upload your Resume (PDF)"}</span>
                                    <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileUpload} />
                                </label>
                                <button className="btn-glow" disabled={!resumeText} onClick={() => setStep(2)} style={{ marginTop: "24px", width: "100%", padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", color: "white", fontWeight: 600, border: "none", cursor: resumeText ? "pointer" : "not-allowed", opacity: resumeText ? 1 : 0.5 }}>
                                    Continue to Goals
                                </button>
                            </div>
                        )}

                        {/* Step 2: Goals */}
                        {step === 2 && (
                            <div>
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px" }}>Target Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(139,92,246,0.3)", color: "#f8fafc", outline: "none", appearance: "none", cursor: "pointer" }}
                                    >
                                        {TARGET_ROLES.map(r => <option key={r} value={r} style={{ background: "#0f172a" }}>{r}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: "32px" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px" }}>Location</label>
                                    <select
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(139,92,246,0.3)", color: "#f8fafc", outline: "none", appearance: "none", cursor: "pointer" }}
                                    >
                                        {TARGET_LOCATIONS.map(l => <option key={l} value={l} style={{ background: "#0f172a" }}>{l}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: "flex", gap: "16px" }}>
                                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: "14px", borderRadius: "12px", background: "transparent", border: "1px solid #475569", color: "#cbd5e1", cursor: "pointer" }}>Back</button>
                                    <button className="btn-glow" onClick={runAgents} style={{ flex: 2, padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, #a855f7, #ec4899)", color: "white", fontWeight: 600, border: "none", cursor: "pointer" }}>
                                        Launch AI Agents ✨
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Loading / Results */}
                {step === 3 && (
                    <div>
                        {status === "loading" && (
                            <div className="glass" style={{ padding: "60px", textAlign: "center", borderRadius: "20px", maxWidth: "600px", margin: "0 auto" }}>
                                <Bot size={64} color="#a855f7" className="animate-float" style={{ margin: "0 auto 24px" }} />
                                <h2 style={{ fontSize: "1.5rem", color: "#f8fafc", marginBottom: "16px", fontWeight: 700 }}>Agents are collaborating...</h2>
                                <p style={{ color: "#94a3b8", marginBottom: "32px" }}>The Resume Analyst, Market Researcher, and Career Coach are securely reviewing your profile in a live GroupChat. This takes ~30 seconds.</p>
                                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#3b82f6", animation: "pulse-glow 1s infinite" }} />
                                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#8b5cf6", animation: "pulse-glow 1s infinite", animationDelay: "0.2s" }} />
                                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#06b6d4", animation: "pulse-glow 1s infinite", animationDelay: "0.4s" }} />
                                </div>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="glass" style={{ padding: "40px", textAlign: "center", borderRadius: "20px", border: "1px solid rgba(239,68,68,0.3)" }}>
                                <p style={{ color: "#ef4444", fontSize: "16px", fontWeight: 500 }}>{error}</p>
                                <button onClick={() => setStep(2)} style={{ marginTop: "24px", padding: "10px 20px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", cursor: "pointer" }}>Try Again</button>
                            </div>
                        )}

                        {status === "done" && results && (
                            <div className="animate-fade-up">
                                {/* Tabs */}
                                <div style={{ display: "flex", gap: "16px", marginBottom: "32px", borderBottom: "1px solid rgba(148,163,184,0.1)", paddingBottom: "16px" }}>
                                    <button onClick={() => setActiveTab("resume")} style={{ background: "none", border: "none", color: activeTab === "resume" ? "#a855f7" : "#94a3b8", fontWeight: activeTab === "resume" ? 700 : 500, fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <Briefcase size={18} /> Resume Analysis
                                    </button>
                                    <button onClick={() => setActiveTab("market")} style={{ background: "none", border: "none", color: activeTab === "market" ? "#06b6d4" : "#94a3b8", fontWeight: activeTab === "market" ? 700 : 500, fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <TrendingUp size={18} /> Market Trends
                                    </button>
                                    <button onClick={() => setActiveTab("roadmap")} style={{ background: "none", border: "none", color: activeTab === "roadmap" ? "#3b82f6" : "#94a3b8", fontWeight: activeTab === "roadmap" ? 700 : 500, fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <Zap size={18} /> Learning Roadmap
                                    </button>
                                </div>

                                {/* Content */}
                                {activeTab === "resume" && (
                                    <ResumeAnalysisPanel analysis={results.resume_analysis} filename={file?.name || "Uploaded File"} />
                                )}

                                {activeTab === "market" && (
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                        <div className="glass feature-card" style={{ padding: "32px", borderRadius: "20px" }}>
                                            <p style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Trend</p>
                                            <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: "16px 0", color: "#34d399" }}>{results.market_trends.market_trend}</h2>
                                        </div>
                                        <div className="glass feature-card" style={{ padding: "32px", borderRadius: "20px" }}>
                                            <p style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Salary</p>
                                            <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: "16px 0", color: "#f8fafc" }}>{results.market_trends.salary_range}</h2>
                                        </div>
                                        {/* You can expand on top skills / companies here to match Market page later */}
                                    </div>
                                )}

                                {activeTab === "roadmap" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {results.roadmap.weeks?.map((week: any, i: number) => (
                                            <div key={i} className="glass" style={{ padding: "24px", borderRadius: "16px" }}>
                                                <h3 style={{ color: "#f8fafc", fontSize: "18px", marginBottom: "8px" }}>Week {week.week}: {week.topic}</h3>
                                                <p style={{ color: "#94a3b8", marginBottom: "12px" }}>{week.mini_project}</p>
                                                <a href={week.resource_url} target="_blank" rel="noreferrer" style={{ color: "#a855f7", textDecoration: "none", fontWeight: 600 }}>Study Resource ↗</a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

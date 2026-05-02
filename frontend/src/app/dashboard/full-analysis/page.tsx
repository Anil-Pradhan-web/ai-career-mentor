"use client";

import { useState } from "react";
import { Upload, ChevronRight, Briefcase, Zap, Bot, BrainCircuit, TrendingUp } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { uploadResume, runFullAnalysis } from "@/services/api";
import ResumeAnalysisPanel from "@/components/ResumeAnalysisPanel";
import ModelSelector from "@/components/ModelSelector";

const TARGET_ROLES = [
    "Software Engineer",
    "Software Developer",
    "Data Scientist",
    "Data Analyst",
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "Web Developer",
    "Mobile App Developer",
    "Android Developer",
    "iOS Developer",
    "Cloud Engineer",
    "Cloud Architect",
    "DevOps Engineer",
    "Site Reliability Engineer",
    "Machine Learning Engineer",
    "AI Engineer",
    "Deep Learning Engineer",
    "Generative AI Engineer",
    "Prompt Engineer",
    "MLOps Engineer",
    "Data Engineer",
    "Big Data Engineer",
    "Product Manager",
    "Technical Product Manager",
    "Project Manager",
    "Cybersecurity Analyst",
    "Security Engineer",
    "Penetration Tester",
    "Blockchain Developer",
    "Game Developer",
    "AR/VR Developer",
    "Embedded Systems Engineer",
    "IoT Engineer",
    "Robotics Engineer",
    "Automation Engineer",
    "QA Engineer",
    "Test Engineer",
    "UI/UX Designer",
    "Solutions Architect",
    "IT Support Engineer",
    "Systems Engineer",
    "Network Engineer",
    "Research Engineer",
    "Computer Vision Engineer",
    "NLP Engineer",
];

const TARGET_LOCATIONS = [
    // India Tech Cities
    "Bangalore, India",
    "Hyderabad, India",
    "Pune, India",
    "Mumbai, India",
    "Delhi NCR, India",
    "Chennai, India",
    "Remote, India",

    // USA Tech Cities
    "San Francisco, United States",
    "Seattle, United States",
    "New York, United States",
    "Austin, United States",

    // Canada
    "Toronto, Canada",
    "Vancouver, Canada",

    // Europe Tech
    "London, United Kingdom",
    "Berlin, Germany",
    "Amsterdam, Netherlands",
    "Dublin, Ireland",

    // Asia / Middle East Tech
    "Singapore, Singapore",
    "Dubai, UAE",

    // Global Remote
    "Remote",
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
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)", position: "relative", overflow: "hidden" }}>
            {/* Background glows */}
            <div className="animate-pulse-glow" style={{
                position: "absolute", top: "-15%", right: "-10%",
                width: "600px", height: "600px", pointerEvents: "none", zIndex: 0,
                background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)",
            }} />
            <div className="animate-pulse-glow" style={{
                position: "absolute", bottom: "-20%", left: "-5%",
                width: "700px", height: "700px", pointerEvents: "none", zIndex: 0,
                background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)",
            }} />

            <Sidebar />

            <main style={{
                marginLeft: "248px", flex: 1, padding: "36px 40px",
                maxWidth: "calc(100vw - 248px)", position: "relative", zIndex: 1,
            }}>

                {/* Header */}
                <div className="animate-fade-up" style={{ marginBottom: "40px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{
                            width: "48px", height: "48px", borderRadius: "14px",
                            background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))",
                            border: "1px solid rgba(139,92,246,0.3)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <BrainCircuit size={24} color="#a855f7" />
                        </div>
                        <div>
                            <h1 style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "2rem", fontWeight: 800,
                                color: "var(--text-primary)", lineHeight: 1.1,
                                letterSpacing: "-0.02em", marginBottom: "4px",
                            }}>
                                Full Career Analysis
                            </h1>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                Multi-Agent Orchestration (Resume + Market + Coach)
                            </p>
                            {status !== "loading" && <ModelSelector />}
                        </div>
                        </div>
                    </div>
                </div>

                {/* Wizard Flow (Steps 1 & 2) */}
                {step < 3 && (
                    <div className="glass animate-fade-up-delay-1" style={{ maxWidth: "700px", padding: "40px", borderRadius: "20px" }}>

                        {/* Step Indicator */}
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
                            <div style={{
                                flex: 1, textAlign: "center", fontWeight: 600, fontSize: "0.9rem",
                                color: step === 1 ? "#a855f7" : "var(--text-muted)",
                            }}>1. Upload Resume</div>
                            <ChevronRight size={16} color="var(--text-muted)" />
                            <div style={{
                                flex: 1, textAlign: "center", fontWeight: 600, fontSize: "0.9rem",
                                color: step === 2 ? "#a855f7" : "var(--text-muted)",
                            }}>2. Set Goal</div>
                            <ChevronRight size={16} color="var(--text-muted)" />
                            <div style={{
                                flex: 1, textAlign: "center", fontWeight: 600, fontSize: "0.9rem",
                                color: "var(--text-muted)",
                            }}>3. AI Magic</div>
                        </div>

                        {/* Step 1: Upload */}
                        {step === 1 && (
                            <div>
                                <label style={{
                                    display: "flex", flexDirection: "column", alignItems: "center",
                                    padding: "40px 24px",
                                    border: "2px dashed rgba(139,92,246,0.3)",
                                    borderRadius: "16px", cursor: "pointer",
                                    background: "rgba(15,23,42,0.5)",
                                    transition: "all 0.3s",
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = "rgba(139,92,246,0.6)";
                                        e.currentTarget.style.background = "rgba(139,92,246,0.05)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)";
                                        e.currentTarget.style.background = "rgba(15,23,42,0.5)";
                                    }}
                                >
                                    <Upload size={32} color="#a855f7" style={{ marginBottom: "16px" }} />
                                    <span style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: "0.95rem" }}>
                                        {file ? file.name : "Click to upload your Resume (PDF)"}
                                    </span>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "6px" }}>
                                        PDF only · Max 5MB
                                    </span>
                                    <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileUpload} />
                                </label>
                                <button
                                    className="btn-glow"
                                    disabled={!resumeText}
                                    onClick={() => setStep(2)}
                                    style={{
                                        marginTop: "20px", width: "100%", padding: "14px",
                                        borderRadius: "12px", fontWeight: 600, border: "none",
                                        fontSize: "0.95rem",
                                        opacity: !resumeText ? 0.5 : 1,
                                        cursor: !resumeText ? "not-allowed" : "pointer",
                                    }}
                                >
                                    Continue to Goals
                                </button>
                            </div>
                        )}

                        {/* Step 2: Goals */}
                        {step === 2 && (
                            <div>
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{
                                        display: "block", fontSize: "0.75rem", fontWeight: 600,
                                        color: "var(--text-secondary)", textTransform: "uppercase",
                                        letterSpacing: "0.06em", marginBottom: "8px",
                                    }}>Target Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        style={{
                                            width: "100%", padding: "12px 16px",
                                            borderRadius: "10px",
                                            background: "var(--bg-surface)",
                                            border: "1px solid var(--border-default)",
                                            color: "var(--text-primary)",
                                            fontSize: "0.95rem",
                                            outline: "none",
                                            cursor: "pointer",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        {TARGET_ROLES.map(r => <option key={r} value={r} style={{ background: "#0f172a" }}>{r}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: "32px" }}>
                                    <label style={{
                                        display: "block", fontSize: "0.75rem", fontWeight: 600,
                                        color: "var(--text-secondary)", textTransform: "uppercase",
                                        letterSpacing: "0.06em", marginBottom: "8px",
                                    }}>Location</label>
                                    <select
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        style={{
                                            width: "100%", padding: "12px 16px",
                                            borderRadius: "10px",
                                            background: "var(--bg-surface)",
                                            border: "1px solid var(--border-default)",
                                            color: "var(--text-primary)",
                                            fontSize: "0.95rem",
                                            outline: "none",
                                            cursor: "pointer",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        {TARGET_LOCATIONS.map(l => <option key={l} value={l} style={{ background: "#0f172a" }}>{l}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: "flex", gap: "14px" }}>
                                    <button
                                        onClick={() => setStep(1)}
                                        style={{
                                            flex: 1, padding: "14px",
                                            borderRadius: "12px", background: "transparent",
                                            border: "1px solid var(--border-strong)",
                                            color: "var(--text-secondary)",
                                            cursor: "pointer", fontSize: "0.95rem",
                                            fontFamily: "Inter, sans-serif",
                                            transition: "all 0.15s",
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = "var(--text-muted)";
                                            e.currentTarget.style.color = "var(--text-primary)";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = "var(--border-strong)";
                                            e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                    >Back</button>
                                    <button
                                        className="btn-glow"
                                        onClick={runAgents}
                                        style={{
                                            flex: 2, padding: "14px",
                                            borderRadius: "12px", fontWeight: 600,
                                            border: "none", cursor: "pointer",
                                            fontSize: "0.95rem",
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
                    <div>
                        {status === "loading" && (
                            <div className="glass" style={{
                                padding: "60px", textAlign: "center",
                                borderRadius: "20px", maxWidth: "600px", margin: "0 auto",
                            }}>
                                <Bot size={64} color="#a855f7" className="animate-float" style={{ margin: "0 auto 24px" }} />
                                <h2 style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: "1.5rem", color: "var(--text-primary)",
                                    marginBottom: "16px", fontWeight: 700,
                                }}>
                                    Agents are collaborating...
                                </h2>
                                <p style={{ color: "var(--text-muted)", marginBottom: "32px", lineHeight: 1.65 }}>
                                    The Resume Analyst, Market Researcher, and Career Coach are securely reviewing your profile in a live GroupChat. This takes ~30 seconds.
                                </p>
                                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                                    <div className="animate-pulse-glow" style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#3b82f6" }} />
                                    <div className="animate-pulse-glow" style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#8b5cf6", animationDelay: "0.2s" }} />
                                    <div className="animate-pulse-glow" style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#06b6d4", animationDelay: "0.4s" }} />
                                </div>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="glass" style={{
                                padding: "40px", textAlign: "center",
                                borderRadius: "20px",
                                border: "1px solid rgba(239,68,68,0.3)",
                            }}>
                                <p style={{ color: "#ef4444", fontSize: "1rem", fontWeight: 500, marginBottom: "16px" }}>{error}</p>
                                <button
                                    onClick={() => setStep(2)}
                                    style={{
                                        padding: "10px 20px",
                                        background: "rgba(239,68,68,0.1)",
                                        color: "#ef4444",
                                        border: "1px solid rgba(239,68,68,0.3)",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                        fontFamily: "Inter, sans-serif",
                                    }}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {status === "done" && results && (
                            <div className="animate-fade-up">
                                {/* Tabs */}
                                <div style={{
                                    display: "flex", gap: "16px", marginBottom: "32px",
                                    borderBottom: "1px solid var(--border-default)",
                                    paddingBottom: "16px",
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
                                                    background: "none", border: "none",
                                                    fontWeight: isActive ? 700 : 500,
                                                    fontSize: "0.95rem",
                                                    cursor: "pointer",
                                                    display: "flex", alignItems: "center", gap: "8px",
                                                    color: isActive ? tab.color : "var(--text-muted)",
                                                    fontFamily: "Inter, sans-serif",
                                                    padding: "8px 16px",
                                                    borderRadius: "8px",
                                                    transition: "all 0.15s",
                                                    ...(isActive ? { background: `${tab.color}12` } : {}),
                                                }}
                                            >
                                                <Icon size={18} />
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
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
                                        <div className="glass feature-card" style={{ padding: "28px", borderRadius: "20px" }}>
                                            <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Trend</p>
                                            <h2 style={{
                                                fontFamily: "'Space Grotesk', sans-serif",
                                                fontSize: "1.8rem", fontWeight: 800,
                                                margin: "16px 0", color: "#34d399",
                                            }}>{results.market_trends.market_trend}</h2>
                                        </div>
                                        <div className="glass feature-card" style={{ padding: "28px", borderRadius: "20px" }}>
                                            <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Salary</p>
                                            <h2 style={{
                                                fontFamily: "'Space Grotesk', sans-serif",
                                                fontSize: "1.8rem", fontWeight: 800,
                                                margin: "16px 0", color: "var(--text-primary)",
                                            }}>{results.market_trends.salary_range}</h2>
                                        </div>
                                        {/* Top Skills */}
                                        <div className="glass feature-card" style={{ padding: "28px", borderRadius: "20px" }}>
                                            <p style={{
                                                display: "flex", alignItems: "center", gap: "8px",
                                                fontSize: "0.72rem", fontWeight: 600,
                                                color: "var(--text-muted)", textTransform: "uppercase",
                                                letterSpacing: "0.08em", marginBottom: "20px",
                                            }}>
                                                <Zap size={14} color="#f59e0b" /> Top In-Demand Skills
                                            </p>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                                {results.market_trends.top_skills.map((skill: string, i: number) => (
                                                    <span key={i} style={{
                                                        padding: "8px 14px",
                                                        background: "rgba(245,158,11,0.1)",
                                                        border: "1px solid rgba(245,158,11,0.2)",
                                                        borderRadius: "100px",
                                                        color: "#fbbf24",
                                                        fontSize: "0.85rem",
                                                        fontWeight: 500,
                                                    }}>
                                                        {i + 1}. {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Top Companies */}
                                        <div className="glass feature-card" style={{ padding: "28px", borderRadius: "20px" }}>
                                            <p style={{
                                                display: "flex", alignItems: "center", gap: "8px",
                                                fontSize: "0.72rem", fontWeight: 600,
                                                color: "var(--text-muted)", textTransform: "uppercase",
                                                letterSpacing: "0.08em", marginBottom: "20px",
                                            }}>
                                                <Briefcase size={14} color="#a78bfa" /> Top Hiring Companies
                                            </p>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                {results.market_trends.top_companies.map((company: string, i: number) => (
                                                    <div key={i} style={{
                                                        display: "flex", alignItems: "center", gap: "12px",
                                                        padding: "12px 14px",
                                                        background: "rgba(15,23,42,0.5)",
                                                        border: "1px solid var(--border-default)",
                                                        borderRadius: "12px",
                                                    }}>
                                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a78bfa" }} />
                                                        <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#e2e8f0" }}>{company}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Roadmap Tab */}
                                {activeTab === "roadmap" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {results.roadmap.weeks?.map((week: any, i: number) => (
                                            <div key={i} className="glass" style={{ padding: "24px", borderRadius: "16px" }}>
                                                <h3 style={{
                                                    fontFamily: "'Space Grotesk', sans-serif",
                                                    color: "var(--text-primary)", fontSize: "1.1rem",
                                                    fontWeight: 700, marginBottom: "8px",
                                                }}>
                                                    Week {week.week}: {week.topic}
                                                </h3>
                                                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "12px", lineHeight: 1.6 }}>
                                                    {week.mini_project}
                                                </p>
                                                <a
                                                    href={week.resource_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ color: "#a855f7", textDecoration: "none", fontWeight: 600, fontSize: "0.88rem" }}
                                                >
                                                    Study Resource ↗
                                                </a>
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

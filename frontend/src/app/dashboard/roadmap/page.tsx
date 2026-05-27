"use client";

import { useEffect, useState } from "react";
import { Map, Loader2, Sparkles, History } from "lucide-react";
import { toast } from "react-hot-toast";
import ModelSelector from "@/components/ModelSelector";
import { generateRoadmap, getRoadmapHistory, deleteRoadmap, getMarketConfig } from "@/services/api";
import { RoadmapResponse } from "@/types";
import RoadmapPanel from "@/components/full-analysis/RoadmapPanel";
import RoadmapHistory from "@/components/full-analysis/RoadmapHistory";


export default function RoadmapPage() {
    const [config, setConfig] = useState<any>(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [customGaps, setCustomGaps] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
    const [historyList, setHistoryList] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [expLevel, setExpLevel] = useState<"beginner_to_intermediate" | "intermediate_to_advanced">("intermediate_to_advanced");

    useEffect(() => {
        getMarketConfig().then(data => {
            setConfig(data);
            if (data.roles?.length) setSelectedRole(data.roles[0]);
        }).catch(console.error);
    }, []);

    // Load history
    useEffect(() => {
        getRoadmapHistory().then((data) => {
            if (data.history?.length > 0) {
                setHistoryList(data.history);
                // Load latest by default
                const latest = data.history[0];
                setRoadmap({ id: latest.id, target_role: latest.target_role, weeks: latest.weeks });
                // Cache total weeks so ProgressTracker can calculate % without API
                const roleKey = latest.target_role.toLowerCase().replace(/\s+/g, "_");
                localStorage.setItem(`roadmap_total_${roleKey}`, String(latest.weeks?.length || 8));
                setStatus("done");
            }
        }).catch(console.error);
    }, []);

    const [progress, setProgress] = useState({ completed: 0, total: 8 });

    useEffect(() => {
        const updateProgress = () => {
            if (!roadmap) return;
            const roleKey = roadmap.target_role ? roadmap.target_role.toLowerCase().replace(/\s+/g, "_") : "default";
            const rawCompleted = localStorage.getItem(`roadmap_completed_${roleKey}`);
            const completedArr: number[] = rawCompleted ? JSON.parse(rawCompleted) : [];
            const total = roadmap.weeks?.length || 8;
            const completed = completedArr.filter(w => w >= 1 && w <= total).length;
            setProgress({ completed, total });
        };

        updateProgress();

        window.addEventListener("roadmapProgressUpdate", updateProgress);
        return () => {
            window.removeEventListener("roadmapProgressUpdate", updateProgress);
        };
    }, [roadmap]);

    const [primaryGoal, setPrimaryGoal] = useState<string | null>(null);

    useEffect(() => {
        setPrimaryGoal(localStorage.getItem("primary_goal_role"));
    }, [roadmap]);

    const handleSetPrimary = () => {
        if (!roadmap) return;
        const currentPrimary = localStorage.getItem("primary_goal_role");
        if (currentPrimary && currentPrimary !== roadmap.target_role) {
            alert(`You have already set a primary goal for another role ("${currentPrimary}"). Please remove it first before setting a new primary goal.`);
            return;
        }
        localStorage.setItem("primary_goal_role", roadmap.target_role);
        setPrimaryGoal(roadmap.target_role);
        toast.success(`${roadmap.target_role} set as Primary Goal!`);
    };

    const handleRemovePrimary = () => {
        localStorage.removeItem("primary_goal_role");
        setPrimaryGoal(null);
        toast.success("Primary Goal removed.");
    };

    // ...

    const handleGenerate = async () => {
        setStatus("loading");
        let gaps = customGaps.split(",").map(s => s.trim()).filter(Boolean);
        if (gaps.length === 0) {
            gaps = ["Comprehensive Beginner to Advanced Progression", "Core Foundations", "Real-world Practical Projects"];
        }
        try {
            const result = await generateRoadmap(selectedRole, gaps, undefined, expLevel);
            setRoadmap(result);
            // Cache total weeks for ProgressTracker
            const roleKey = result.target_role.toLowerCase().replace(/\s+/g, "_");
            localStorage.setItem(`roadmap_total_${roleKey}`, String(result.weeks?.length || 8));
            setStatus("done");
            // Refresh history
            getRoadmapHistory().then(data => setHistoryList(data.history || []));
        } catch (err: any) {
            setStatus("error");
            toast.error(err.message || "Failed to generate roadmap");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteRoadmap(id);
            setHistoryList(prev => prev.filter(h => h.id !== id));
            toast.success("Roadmap deleted");
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    return (
        <main style={{ flex: 1, padding: "80px 32px 48px 110px", color: "#f8fafc" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                
                {/* Header */}
                <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Map size={24} color="#a855f7" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>Learning Roadmaps</h1>
                            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginTop: "4px", display: "flex", gap: "12px", alignItems: "center" }}>
                                <span>🤖 Default: <strong>NVIDIA NIM</strong></span>
                                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                                <span>⚙️ Allowed: NVIDIA, Groq, Google</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button onClick={() => setShowHistory(true)} style={{ padding: "10px 16px", borderRadius: "100px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                            <History size={18} /> History
                        </button>
                        <ModelSelector allowedProviders={["nvidia", "groq", "google"]} />
                    </div>
                </div>

                {/* Generator */}
                <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "40px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                        <div>
                            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "8px" }}>Target Role</label>
                            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
                                {config?.roles?.map((r: string) => <option key={r} value={r} style={{ background: "#0f172a" }}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "8px" }}>Skill Gaps (Optional)</label>
                            <input value={customGaps} onChange={(e) => setCustomGaps(e.target.value)} placeholder="e.g. React, Docker, SQL" style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                        </div>
                    </div>
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "10px" }}>Roadmap Level</label>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button 
                                onClick={() => setExpLevel("beginner_to_intermediate")}
                                style={{ 
                                    flex: 1, padding: "12px", borderRadius: "12px", 
                                    border: expLevel === "beginner_to_intermediate" ? "2px solid #a855f7" : "1px solid rgba(255,255,255,0.1)",
                                    background: expLevel === "beginner_to_intermediate" ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.03)",
                                    color: expLevel === "beginner_to_intermediate" ? "#d8b4fe" : "rgba(255,255,255,0.6)",
                                    fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                                }}
                            >
                                🌱 Beginner to Intermediate
                            </button>
                            <button 
                                onClick={() => setExpLevel("intermediate_to_advanced")}
                                style={{ 
                                    flex: 1, padding: "12px", borderRadius: "12px", 
                                    border: expLevel === "intermediate_to_advanced" ? "2px solid #06b6d4" : "1px solid rgba(255,255,255,0.1)",
                                    background: expLevel === "intermediate_to_advanced" ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                                    color: expLevel === "intermediate_to_advanced" ? "#99f6e4" : "rgba(255,255,255,0.6)",
                                    fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                                }}
                            >
                                🚀 Intermediate to Advanced
                            </button>
                        </div>
                    </div>
                    <button 
                        onClick={handleGenerate}
                        disabled={status === "loading"}
                        style={{ width: "100%", padding: "16px", borderRadius: "14px", background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)", color: "white", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
                    >
                        {status === "loading" ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        {status === "loading" ? "Architecting Curriculum..." : "Generate Master Roadmap"}
                    </button>
                </div>

                {/* Display */}
                {status === "loading" && (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Loader2 size={48} className="animate-spin" color="#a855f7" style={{ margin: "0 auto 24px" }} />
                        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>Synthesizing Learning Path...</h2>
                    </div>
                )}

                {status === "done" && roadmap && (
                    <div className="animate-fade-up">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                            <div style={{ padding: "12px 24px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "100px", display: "inline-block", color: "#a855f7", fontWeight: 700, fontSize: "0.85rem" }}>
                                🎯 Focus: {roadmap.target_role}
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                                {primaryGoal === roadmap.target_role ? (
                                    <button onClick={handleRemovePrimary} style={{ padding: "10px 20px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", transition: "all 0.2s" }} className="hover:bg-red-500/20">
                                        ✖ Remove Primary Goal
                                    </button>
                                ) : (
                                    <button onClick={handleSetPrimary} style={{ padding: "10px 20px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", transition: "all 0.2s" }} className="hover:bg-emerald-500/20">
                                        ⭐ Set as Primary Goal
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar & Level Banner Card */}
                        {(() => {
                            const pct = Math.round((progress.completed / progress.total) * 100) || 0;
                            let lvlName = "Novice Developer 🌱";
                            let lvlColor = "#38bdf8";
                            let lvlBg = "rgba(56,189,248,0.1)";
                            let lvlBorder = "rgba(56,189,248,0.2)";

                            if (pct > 75) {
                                lvlName = "Production Ready 🏆";
                                lvlColor = "#10b981";
                                lvlBg = "rgba(16,185,129,0.1)";
                                lvlBorder = "rgba(16,185,129,0.2)";
                            } else if (pct > 25) {
                                lvlName = "SDE-1 Ready 🚀";
                                lvlColor = "#a855f7";
                                lvlBg = "rgba(168,85,247,0.1)";
                                lvlBorder = "rgba(168,85,247,0.2)";
                            }

                            return (
                                <div style={{
                                    padding: "24px 32px", borderRadius: "24px",
                                    background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.08)",
                                    marginBottom: "32px", display: "flex", flexDirection: "column", gap: "16px"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                                        <div>
                                            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Syllabus Coverage</div>
                                            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                                                <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "white" }}>{pct}%</span>
                                                <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>({progress.completed} / {progress.total} Weeks)</span>
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: "12px 20px", borderRadius: "16px",
                                            background: lvlBg, border: `1px solid ${lvlBorder}`,
                                            color: lvlColor, display: "flex", alignItems: "center", gap: "8px",
                                            fontWeight: 700, fontSize: "0.95rem"
                                        }}>
                                            <span>Level:</span>
                                            <span>{lvlName}</span>
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", overflow: "hidden" }}>
                                        <div style={{
                                            width: `${pct}%`, height: "100%",
                                            background: "linear-gradient(90deg, #a855f7 0%, #06b6d4 100%)",
                                            borderRadius: "100px", transition: "width 0.4s ease-out"
                                        }} />
                                    </div>
                                </div>
                            );
                        })()}

                        <RoadmapPanel roadmap={roadmap} />
                    </div>
                )}

                {showHistory && (
                    <RoadmapHistory 
                        history={historyList} 
                        onSelect={(r) => { setRoadmap(r); setShowHistory(false); setStatus("done"); }} 
                        onDelete={handleDelete} 
                        onClose={() => setShowHistory(false)} 
                    />
                )}
            </div>
        </main>
    );
}

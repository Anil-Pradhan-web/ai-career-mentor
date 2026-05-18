"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Trophy, BarChart, BookOpen, Clock } from "lucide-react";

export default function ProgressTracker() {
    const [roadmapProgress, setRoadmapProgress] = useState(0);
    const [completedWeeks, setCompletedWeeks] = useState(0);
    const [totalWeeks, setTotalWeeks] = useState(0);
    const [lastInterviewScore, setLastInterviewScore] = useState<number | null>(null);

    useEffect(() => {
        const loadProgress = () => {
            // Calculate roadmap progress from primary goal role
            try {
                // Get the user's primary goal role
                const primaryRole = localStorage.getItem("primary_goal_role");
                if (primaryRole) {
                    const roleKey = primaryRole.toLowerCase().replace(/\s+/g, "_");
                    const rawCompleted = localStorage.getItem(`roadmap_completed_${roleKey}`);
                    const completedArr: number[] = rawCompleted ? JSON.parse(rawCompleted) : [];

                    // Get total weeks from roadmap history stored in DB via getUserStats call
                    // We store it locally when getUserStats runs; fall back to 8 (default roadmap length)
                    const storedTotal = localStorage.getItem(`roadmap_total_${roleKey}`);
                    const total = storedTotal ? parseInt(storedTotal) : 8;

                    setTotalWeeks(total);
                    setCompletedWeeks(completedArr.length);
                    setRoadmapProgress(Math.round((completedArr.length / total) * 100));
                } else {
                    // No primary goal set
                    setTotalWeeks(0);
                    setCompletedWeeks(0);
                    setRoadmapProgress(0);
                }
            } catch (e) {
                console.error("Error reading roadmap progress:", e);
            }

            // Fetch Interview Score
            try {
                const rawScore = localStorage.getItem("lastInterviewScore");
                if (rawScore) {
                    setLastInterviewScore(parseInt(rawScore, 10));
                }
            } catch (e) {
                console.error("Error reading interview score:", e);
            }
        };

        loadProgress();

        window.addEventListener("roadmapProgressUpdate", loadProgress);
        window.addEventListener("storage", loadProgress);
        
        return () => {
            window.removeEventListener("roadmapProgressUpdate", loadProgress);
            window.removeEventListener("storage", loadProgress);
        };

    }, []);

    return (
        <div className="glass feature-card" style={{ padding: "32px", borderRadius: "24px", marginBottom: "48px", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <BarChart size={22} color="#10b981" />
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#f1f5f9" }}>
                    Your Career Progress
                </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
                {/* Roadmap Widget */}
                <div style={{ background: "rgba(15,23,42,0.4)", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <BookOpen size={18} color="#8b5cf6" />
                            <h4 style={{ fontWeight: 600, color: "#e2e8f0" }}>6-Week Roadmap</h4>
                        </div>
                        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, padding: "4px 10px", background: "rgba(139,92,246,0.15)", borderRadius: "100px" }}>
                            {roadmapProgress}% Completed
                        </span>
                    </div>

                    <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", overflow: "hidden", marginBottom: "12px" }}>
                        <div
                            style={{
                                height: "100%",
                                width: `${roadmapProgress}%`,
                                background: "linear-gradient(90deg, #8b5cf6, #3b82f6)",
                                borderRadius: "100px",
                                transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8" }}>
                        <span>{completedWeeks} / {totalWeeks || 6} Weeks</span>
                        {roadmapProgress === 100 ? (
                            <span style={{ color: "#34d399", display: "flex", alignItems: "center", gap: "4px" }}><CheckCircle size={14} /> Mastered</span>
                        ) : (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14} /> In Progress</span>
                        )}
                    </div>
                </div>

                {/* Interview Score Widget */}
                <div style={{ background: "rgba(15,23,42,0.4)", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Trophy size={18} color="#f59e0b" />
                            <h4 style={{ fontWeight: 600, color: "#e2e8f0" }}>Mock Interview</h4>
                        </div>
                        {lastInterviewScore && (
                            <span style={{ fontSize: "12px", color: lastInterviewScore >= 80 ? "#10b981" : lastInterviewScore >= 60 ? "#f59e0b" : "#ef4444", fontWeight: 600, padding: "4px 10px", background: "rgba(255,255,255,0.05)", borderRadius: "100px" }}>
                                Last Score
                            </span>
                        )}
                    </div>

                    {lastInterviewScore !== null ? (
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                            <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#f8fafc", fontFamily: "'Space Grotesk', sans-serif" }}>
                                {lastInterviewScore}
                            </span>
                            <span style={{ color: "#94a3b8", fontSize: "16px", fontWeight: 600 }}>/ 100</span>
                        </div>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", height: "50px" }}>
                            <span style={{ color: "#64748b", fontSize: "14px" }}>No mock interviews completed yet. Start one to see your score!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

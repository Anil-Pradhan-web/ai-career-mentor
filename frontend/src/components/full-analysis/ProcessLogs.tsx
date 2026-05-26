import React from "react";
import { CheckCircle2, Circle, Loader2, AlertCircle, Briefcase, TrendingUp, Activity, Zap } from "lucide-react";

interface Props {
    logs: string[];
    errors: string[];
    status: "idle" | "loading" | "done" | "error";
}

export default function ProcessLogs({ logs, errors, status }: Props) {
    // Determine which stages are complete based on log patterns
    const stages = [
        { id: "resume", label: "Resume Context Analysis", icon: Briefcase, pattern: "Resume Node Complete" },
        { id: "market", label: "Market Research & Trends", icon: TrendingUp, pattern: "Market Node Complete" },
        { id: "linkedin", label: "LinkedIn Strategy Forge", icon: Briefcase, pattern: "LinkedIn Node Complete" },
        { id: "roadmap", label: "Curriculum Synthesis", icon: Zap, pattern: "Analysis Complete" },
    ];

    const getStageStatus = (index: number) => {
        if (status === "done") return "done";
        
        const stage = stages[index];
        const isDone = logs.some(log => log.includes(stage.pattern));
        if (isDone) return "done";
        
        if (status === "loading") {
            if (index === 0 || index === 1) {
                // resume and market start immediately at the beginning
                return "running";
            }
            if (index === 2 || index === 3) {
                // linkedin and roadmap only run when both resume and market are done
                const resumeDone = logs.some(log => log.includes("Resume Node Complete"));
                const marketDone = logs.some(log => log.includes("Market Node Complete"));
                if (resumeDone && marketDone) {
                    return "running";
                }
            }
        }
        return "pending";
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }} className="animate-fade-up">
            {/* Visual Timeline */}
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(4, 1fr)", 
                gap: "12px", 
                marginBottom: "32px" 
            }}>
                {stages.map((stage, i) => {
                    const s = getStageStatus(i);
                    const Icon = stage.icon;
                    return (
                        <div key={stage.id} style={{
                            padding: "16px", borderRadius: "16px",
                            background: s === "done" ? "rgba(16,185,129,0.05)" : s === "running" ? "rgba(139,92,246,0.05)" : "rgba(255,255,255,0.02)",
                            border: `1px solid ${s === "done" ? "rgba(16,185,129,0.2)" : s === "running" ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.05)"}`,
                            textAlign: "center", position: "relative", transition: "all 0.3s ease"
                        }}>
                            <div style={{
                                width: "32px", height: "32px", borderRadius: "8px", margin: "0 auto 12px",
                                background: s === "done" ? "#10b981" : s === "running" ? "#a855f7" : "rgba(255,255,255,0.1)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: s === "running" ? "0 0 15px rgba(168,85,247,0.4)" : "none"
                            }}>
                                {s === "done" ? <CheckCircle2 size={18} color="white" /> : s === "running" ? <Loader2 size={18} color="white" className="animate-spin" /> : <Icon size={18} color="rgba(255,255,255,0.3)" />}
                            </div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: s === "pending" ? "rgba(255,255,255,0.3)" : "white", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                                {stage.label}
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

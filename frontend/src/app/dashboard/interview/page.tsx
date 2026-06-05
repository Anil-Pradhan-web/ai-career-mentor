"use client";

import React, { useState, useEffect } from "react";
import { History, Sparkles, Trophy, RotateCcw, FileText } from "lucide-react";
import { getInterviewHistory, deleteInterview, getInterviewDetails, getUserStats } from "@/services/api";
import InterviewWizard from "@/components/interview/InterviewWizard";
import InterviewInterface from "@/components/interview/InterviewInterface";
import InterviewHistory from "@/components/interview/InterviewHistory";
import { useRouter } from "next/navigation";

export default function InterviewPage() {
    const router = useRouter();
    const [view, setView] = useState<"wizard" | "active" | "result">("wizard");
    const [sessionData, setSessionData] = useState<{ role: string; company: any; type: string } | null>(null);
    const [finalScore, setFinalScore] = useState<number | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedSession, setSelectedSession] = useState<any | null>(null);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [checkingResume, setCheckingResume] = useState(false);

    useEffect(() => {
        getInterviewHistory().then(data => setHistory(data.history || [])).catch(console.error);
    }, []);

    const handleStart = async (role: string, company: any, type: string) => {
        if (type === "technical") {
            setCheckingResume(true);
            try {
                const stats = await getUserStats();
                if (!stats.lastResumeAnalysis) {
                    setShowResumeModal(true);
                    return;
                }
            } catch (err) {
                console.error("Failed to check resume status", err);
            } finally {
                setCheckingResume(false);
            }
        }
        setSessionData({ role, company, type });
        setView("active");
    };

    const handleEnd = (score: number) => {
        setFinalScore(score);
        setView("result");
        // Refresh history
        getInterviewHistory().then(data => setHistory(data.history || []));
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteInterview(id);
            setHistory(prev => prev.filter(h => h.id !== id));
        } catch (err) {
            console.error("Delete failed");
        }
    };

    const handleSelectHistory = async (session: any) => {
        try {
            const fullDetails = await getInterviewDetails(session.id);
            setSelectedSession(fullDetails);
            setShowHistory(false);
            setView("result");
            setFinalScore(fullDetails.score);
        } catch (err) {
            console.error("Failed to load details");
        }
    };

    return (
        <main style={{ flex: 1, padding: "80px 32px 48px 110px", color: "#f8fafc" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                {/* Global Header */}
                <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>
                            AI <span style={{ color: "#a855f7" }}>Interviewer</span>
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.5)" }}>Dynamic simulations for 500+ global companies.</p>
                    </div>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                        <button onClick={() => setShowHistory(true)} style={{ padding: "10px 16px", borderRadius: "100px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                            <History size={18} /> History
                        </button>
                    </div>
                </div>

                {/* View Switcher */}
                {view === "wizard" && <InterviewWizard onStart={handleStart} loading={false} />}

                {view === "active" && sessionData && (
                    <InterviewInterface
                        role={sessionData.role}
                        company={sessionData.company}
                        type={sessionData.type}
                        onEnd={handleEnd}
                    />
                )}

                {view === "result" && (
                    <div className="animate-fade-up space-y-8" style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", padding: "60px 40px", background: "rgba(15,23,42,0.4)", borderRadius: "32px", border: "1px solid rgba(168,85,247,0.3)" }}>
                            <Trophy size={60} color="#fbbf24" style={{ marginBottom: "20px", filter: "drop-shadow(0 0 20px rgba(251,191,36,0.3))" }} />
                            <h2 style={{ fontSize: "3rem", fontWeight: 800, color: "white", marginBottom: "8px" }}>{finalScore}%</h2>
                            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", marginBottom: "32px" }}>
                                {selectedSession ? `Reviewing: ${selectedSession.target_role}` : "Interview Simulation Complete"}
                            </p>

                            {/* Transcript Display */}
                            {selectedSession?.chat_history && (
                                <div data-lenis-prevent style={{ textAlign: "left", background: "rgba(0,0,0,0.2)", borderRadius: "20px", padding: "24px", maxHeight: "400px", overflowY: "auto", marginBottom: "32px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "20px", letterSpacing: "0.1em" }}>Interview Transcript</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                        {selectedSession.chat_history.filter((m: any) => m.role !== "system").map((msg: any, i: number) => (
                                            <div key={i} style={{ borderLeft: `3px solid ${msg.role === "interviewer" ? "#a855f7" : "#06b6d4"}`, paddingLeft: "16px" }}>
                                                <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: msg.role === "interviewer" ? "#a855f7" : "#06b6d4", marginBottom: "4px" }}>
                                                    {msg.role === "interviewer" ? "Interviewer" : "You"}
                                                </div>
                                                <div style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.8)", lineHeight: "1.6" }}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => { setView("wizard"); setSelectedSession(null); }}
                                style={{ padding: "16px 32px", borderRadius: "14px", background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)", color: "white", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", margin: "0 auto" }}
                            >
                                <RotateCcw size={20} /> Back to Dashboard
                            </button>
                        </div>
                    </div>
                )}

                {/* History Modal */}
                {showHistory && (
                    <InterviewHistory
                        history={history}
                        onSelect={handleSelectHistory}
                        onDelete={handleDelete}
                        onClose={() => setShowHistory(false)}
                    />
                )}

            </div>
        </main>
    );
}

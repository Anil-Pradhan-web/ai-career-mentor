import React, { useState, useEffect } from "react";
import { Roadmap } from "@/types";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, Circle } from "lucide-react";
import { toggleRoadmapWeek } from "@/services/api";
import { toast } from "react-hot-toast";
import QuizModal from "./QuizModal";

interface Props {
    roadmap: Roadmap;
}

/** Safely convert any LLM value to a displayable string */
const safeString = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val;
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (typeof val === "number") return String(val);
    if (Array.isArray(val)) return val.map(v => safeString(v)).join(". ");
    if (typeof val === "object") {
        return Object.entries(val as Record<string, unknown>)
            .map(([k, v]) => {
                const key = k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                return typeof v === "boolean" ? (v ? key : "") : `${key}: ${safeString(v)}`;
            })
            .filter(Boolean)
            .join(". ");
    }
    return String(val);
};

const getYoutubeVideoId = (url: string): string | null => {
    try {
        const parsed = new URL(url);
        if (parsed.hostname === "youtu.be") {
            return parsed.pathname.slice(1);
        }
        if (parsed.hostname.includes("youtube.com")) {
            if (parsed.pathname === "/watch") {
                return parsed.searchParams.get("v");
            }
            if (parsed.pathname.startsWith("/embed/")) {
                return parsed.pathname.split("/")[2];
            }
        }
    } catch (e) {
        // Fallback to regex
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const RoadmapPanel: React.FC<Props> = ({ roadmap }) => {
    const [completedWeeks, setCompletedWeeks] = useState<Record<number, boolean>>({});
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const [quizState, setQuizState] = useState<{ isOpen: boolean; weekNumber: number; topic: string }>({
        isOpen: false,
        weekNumber: 1,
        topic: ""
    });

    const handleYoutubeClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
        const videoId = getYoutubeVideoId(url);
        if (videoId) {
            e.preventDefault();
            setActiveVideoId(videoId);
        }
    };

    useEffect(() => {
        if (!roadmap || !roadmap.weeks) return;
        const initialStates: Record<number, boolean> = {};
        let hasDbState = false;
        const dbCompletedWeeks: number[] = [];
        
        roadmap.weeks.forEach(w => {
            if (w.completed !== undefined) {
                initialStates[w.week] = !!w.completed;
                if (w.completed) dbCompletedWeeks.push(w.week);
                hasDbState = true;
            }
        });
        
        const roleKey = roadmap.target_role ? roadmap.target_role.toLowerCase().replace(/\s+/g, "_") : "default";
        if (hasDbState) {
            localStorage.setItem(`roadmap_completed_${roleKey}`, JSON.stringify(dbCompletedWeeks));
            window.dispatchEvent(new Event("roadmapProgressUpdate"));
        } else {
            const rawCompleted = localStorage.getItem(`roadmap_completed_${roleKey}`);
            const completedArr: number[] = rawCompleted ? JSON.parse(rawCompleted) : [];
            completedArr.forEach(w => {
                initialStates[w] = true;
            });
        }
        
        setCompletedWeeks(initialStates);
    }, [roadmap]);

    const toggleComplete = async (weekNum: number, forceCompleted?: boolean) => {
        const isNowComplete = forceCompleted !== undefined ? forceCompleted : !completedWeeks[weekNum];
        setCompletedWeeks(prev => ({ ...prev, [weekNum]: isNowComplete }));
        
        const roleKey = roadmap.target_role ? roadmap.target_role.toLowerCase().replace(/\s+/g, "_") : "default";

        if (roadmap.id) {
            try {
                await toggleRoadmapWeek(roadmap.id, weekNum, isNowComplete);
            } catch (err) {
                console.error("Syncing progress to DB failed", err);
                toast.error("Failed to sync progress with database");
            }
        }
        
        const rawCompleted = localStorage.getItem(`roadmap_completed_${roleKey}`);
        let completedArr: number[] = rawCompleted ? JSON.parse(rawCompleted) : [];

        if (isNowComplete) {
            if (!completedArr.includes(weekNum)) completedArr.push(weekNum);
        } else {
            completedArr = completedArr.filter(w => w !== weekNum);
        }
        localStorage.setItem(`roadmap_completed_${roleKey}`, JSON.stringify(completedArr));
        
        window.dispatchEvent(new Event("roadmapProgressUpdate"));
    };

    const handleOpenQuiz = (weekNumber: number, topic: string) => {
        setQuizState({
            isOpen: true,
            weekNumber,
            topic
        });
    };

    const handleQuizPassed = () => {
        toggleComplete(quizState.weekNumber, true);
    };

    if (!roadmap || !roadmap.weeks) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }} className="animate-fade-up">
            {roadmap.weeks.map((week, i) => (
                <div key={i} style={{ 
                    padding: "32px", borderRadius: "24px", 
                    background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(40px)", 
                    border: "1px solid rgba(255,255,255,0.08)", 
                    boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                    position: "relative", overflow: "hidden"
                }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: "linear-gradient(to bottom, #a855f7, #06b6d4)" }} />
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                            <button 
                                onClick={() => toggleComplete(week.week)}
                                style={{
                                    background: "none", border: "none", cursor: "pointer", padding: 0,
                                    marginTop: "4px", color: completedWeeks[week.week] ? "#10b981" : "rgba(255,255,255,0.2)",
                                    transition: "all 0.2s"
                                }}
                                title={completedWeeks[week.week] ? "Mark as incomplete" : "Mark as complete"}
                            >
                                {completedWeeks[week.week] ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                            </button>
                            <div>
                                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "white", fontSize: "1.5rem", fontWeight: 800, margin: "0 0 8px 0", letterSpacing: "-0.02em", opacity: completedWeeks[week.week] ? 0.6 : 1, textDecoration: completedWeeks[week.week] ? "line-through" : "none" }}>
                                    Week {week.week}: <span style={{ color: "#38bdf8" }}>{week.topic}</span>
                                </h3>
                            {week.skill_gap_addressed && (
                                <div style={{ display: "inline-flex", padding: "4px 12px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "100px", color: "#d8b4fe", fontSize: "0.8rem", fontWeight: 700 }}>
                                    Targeting: {safeString(week.skill_gap_addressed)}
                                </div>
                            )}
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", color: "rgba(255,255,255,0.8)", fontWeight: 700, fontSize: "0.9rem" }}>
                            ⏱ {week.estimated_hours} Hours
                        </div>
                    </div>

                    {week.why_it_matters && (
                        <div style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 20px 44px", fontStyle: "italic", background: "rgba(255, 255, 255, 0.02)", padding: "12px 18px", borderRadius: "12px", borderLeft: "3px solid #38bdf8" }}>
                            💡 <strong>Why it matters:</strong> {safeString(week.why_it_matters)}
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
                        <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em" }}>Capstone Project</div>
                            <div className="markdown-content" style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                                <ReactMarkdown>{safeString(week.mini_project) || "No project specified."}</ReactMarkdown>
                            </div>
                        </div>

                        {week.success_criteria && (
                            <div style={{ padding: "20px", background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.01) 100%)", borderRadius: "16px", border: "1px solid rgba(16,185,129,0.15)" }}>
                                <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#10b981", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }}/> Success Criteria
                                </div>
                                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", lineHeight: 1.6, fontWeight: 500 }}>
                                    {safeString(week.success_criteria)}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                        {roadmap.id && (
                            <button 
                                onClick={() => handleOpenQuiz(week.week, week.topic)}
                                style={{ 
                                    display: "inline-flex", alignItems: "center", gap: "8px", 
                                    color: "#cbd5e1", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem", 
                                    padding: "10px 20px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", 
                                    border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                                    cursor: "pointer", transition: "all 0.2s"
                                }}
                                className="hover:-translate-y-1 hover:bg-white/10"
                            >
                                {completedWeeks[week.week] ? "✨ Retake Weekly Quiz" : "📝 Take Weekly Quiz"}
                            </button>
                        )}
                        {week.youtube_resources?.slice(0, 1).map((url, j) => (
                            <a key={`yt-${j}`} href={url} onClick={(e) => handleYoutubeClick(e, url)} target="_blank" rel="noreferrer" className="hover:-translate-y-1 transition-transform" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#f87171", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem", padding: "10px 20px", background: "rgba(239,68,68,0.1)", borderRadius: "100px", border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 5px 15px rgba(239,68,68,0.1)" }}>
                                ▶ YouTube Tutorial
                            </a>
                        ))}
                        {week.article_resources?.slice(0, 1).map((url, j) => (
                            <a key={`art-${j}`} href={url} target="_blank" rel="noreferrer" className="hover:-translate-y-1 transition-transform" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#60a5fa", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem", padding: "10px 20px", background: "rgba(59,130,246,0.1)", borderRadius: "100px", border: "1px solid rgba(59,130,246,0.2)", boxShadow: "0 5px 15px rgba(59,130,246,0.1)" }}>
                                📄 Technical Article
                            </a>
                        ))}
                        {week.official_docs?.slice(0, 1).map((url, j) => (
                            <a key={`doc-${j}`} href={url} target="_blank" rel="noreferrer" className="hover:-translate-y-1 transition-transform" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#34d399", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem", padding: "10px 20px", background: "rgba(16,185,129,0.1)", borderRadius: "100px", border: "1px solid rgba(16,185,129,0.2)", boxShadow: "0 5px 15px rgba(16,185,129,0.1)" }}>
                                📚 Official Docs
                            </a>
                        ))}
                        {week.github_resources?.slice(0, 1).map((url, j) => (
                            <a key={`gh-${j}`} href={url} target="_blank" rel="noreferrer" className="hover:-translate-y-1 transition-transform" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#cbd5e1", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem", padding: "10px 20px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}>
                                💻 GitHub Repo
                            </a>
                        ))}
                    </div>

                    {week.explore_more_questions && week.explore_more_questions.length > 0 && (
                        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                            <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
                                🔍 Private Search Assist — Explore More
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                                {week.explore_more_questions.map((question, qIdx) => (
                                    <a
                                        key={`q-${qIdx}`}
                                        href={`https://duckduckgo.com/?q=${encodeURIComponent(question)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            display: "block",
                                            padding: "12px 16px",
                                            background: "rgba(255,255,255,0.02)",
                                            border: "1px solid rgba(255,255,255,0.06)",
                                            borderRadius: "12px",
                                            color: "#e2e8f0",
                                            fontSize: "0.85rem",
                                            fontWeight: 500,
                                            textDecoration: "none",
                                            transition: "all 0.2s ease-in-out",
                                        }}
                                        className="hover:-translate-y-0.5 hover:bg-white/5 hover:border-sky-500/30 group"
                                    >
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                                            <span style={{ color: "#38bdf8", fontWeight: "bold" }}>?</span>
                                            <span>{question}</span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
            
            <QuizModal
                isOpen={quizState.isOpen}
                onClose={() => setQuizState(prev => ({ ...prev, isOpen: false }))}
                roadmapId={roadmap.id}
                weekNumber={quizState.weekNumber}
                topic={quizState.topic}
                onQuizPassed={handleQuizPassed}
            />

            {activeVideoId && (
                <div 
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.85)",
                        backdropFilter: "blur(12px)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        padding: "20px"
                    }}
                    onClick={() => setActiveVideoId(null)}
                >
                    <div 
                        style={{
                            position: "relative",
                            width: "90%",
                            maxWidth: "960px",
                            aspectRatio: "16/9",
                            background: "rgba(15, 23, 42, 0.95)",
                            borderRadius: "24px",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            padding: "16px 24px", 
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(30, 41, 59, 0.4)"
                        }}>
                            <span style={{ 
                                fontFamily: "'Space Grotesk', sans-serif", 
                                fontWeight: 700, 
                                color: "#f8fafc",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "1.1rem"
                            }}>
                                🔒 Private Video Player <span style={{ fontSize: "0.8rem", color: "#38bdf8", background: "rgba(56,189,248,0.1)", padding: "2px 8px", borderRadius: "100px", fontWeight: 600 }}>Tracker-Free</span>
                            </span>
                            <button 
                                onClick={() => setActiveVideoId(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "rgba(255,255,255,0.6)",
                                    fontSize: "1.5rem",
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                    lineHeight: 1,
                                    transition: "color 0.2s"
                                }}
                                className="hover:text-white"
                            >
                                &times;
                            </button>
                        </div>
                        <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                                title="YouTube Private Player"
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    border: "none"
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default RoadmapPanel;

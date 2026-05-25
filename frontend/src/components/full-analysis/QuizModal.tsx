import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Trophy, BookOpen, CheckCircle, AlertCircle, ArrowRight, RotateCcw } from "lucide-react";
import { getRoadmapQuiz } from "@/services/api";
import { toast } from "react-hot-toast";

interface Question {
    question: string;
    options: string[];
    answer: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    roadmapId?: string;
    weekNumber: number;
    topic: string;
    onQuizPassed: () => void;
}

export default function QuizModal({ isOpen, onClose, roadmapId, weekNumber, topic, onQuizPassed }: Props) {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchQuiz = async () => {
        if (!roadmapId) {
            setError("No active roadmap found to generate quiz.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        setCurrentIdx(0);
        setSelectedLetter(null);
        setIsSubmitted(false);
        setScore(0);
        setQuizFinished(false);

        try {
            const data = await getRoadmapQuiz(roadmapId, weekNumber);
            if (Array.isArray(data) && data.length === 5) {
                setQuestions(data);
            } else {
                throw new Error("Invalid quiz questions structure");
            }
        } catch (err: any) {
            console.error("Quiz load error", err);
            setError("Failed to fetch AI quiz. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchQuiz();
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen, roadmapId, weekNumber]);

    if (!isOpen || !mounted) return null;

    const handleOptionSelect = (option: string) => {
        if (isSubmitted) return;
        const letter = option.trim().charAt(0).toUpperCase();
        setSelectedLetter(letter);
    };

    const handleSubmitAnswer = () => {
        if (!selectedLetter || isSubmitted) return;

        const currentQuestion = questions[currentIdx];
        const correct = currentQuestion.answer.toUpperCase();
        
        if (selectedLetter === correct) {
            setScore(prev => prev + 1);
            toast.success("Correct answer!");
        } else {
            toast.error(`Incorrect! The correct answer is ${correct}.`);
        }
        setIsSubmitted(true);
    };

    const handleNext = () => {
        if (currentIdx < 4) {
            setCurrentIdx(prev => prev + 1);
            setSelectedLetter(null);
            setIsSubmitted(false);
        } else {
            setQuizFinished(true);
            const finalScore = score + (selectedLetter === questions[4].answer ? 1 : 0);
            if (finalScore >= 3) {
                onQuizPassed();
            }
        }
    };

    const currentQuestion = questions[currentIdx];
    const isPass = score >= 3;

    return createPortal(
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100vh",
            background: "rgba(2, 6, 23, 0.85)", backdropFilter: "blur(12px)",
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
            <div style={{
                width: "100%", maxWidth: "650px", 
                background: "rgba(15, 23, 42, 0.9)", 
                borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.1)", 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh",
                fontFamily: "'Space Grotesk', sans-serif"
            }} className="animate-fade-up">
                
                {/* Header */}
                <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(168,85,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(168,85,247,0.2)" }}>
                            <BookOpen size={18} color="#a855f7" />
                        </div>
                        <div>
                            <h2 style={{ color: "white", fontSize: "1.15rem", fontWeight: 700 }}>Week {weekNumber} Assessment</h2>
                            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>Topic: {topic.length > 50 ? topic.substring(0, 47) + "..." : topic}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }} className="hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    {loading && (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                            <Loader2 size={48} className="animate-spin" color="#a855f7" style={{ margin: "0 auto 20px" }} />
                            <h3 style={{ color: "white", fontSize: "1.2rem", fontWeight: 700 }}>Orchestrating AI Quiz...</h3>
                            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginTop: "8px" }}>Analyzing syllabus and synthesizing custom multiple-choice questions</p>
                        </div>
                    )}

                    {error && (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "1px solid rgba(239,68,68,0.2)" }}>
                                <AlertCircle size={24} color="#ef4444" />
                            </div>
                            <p style={{ color: "#fca5a5", fontSize: "1rem", marginBottom: "20px" }}>{error}</p>
                            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                                <button onClick={fetchQuiz} style={{ padding: "12px 24px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                                    <RotateCcw size={16} /> Retry Quiz
                                </button>
                                <button onClick={onClose} style={{ padding: "12px 24px", borderRadius: "12px", background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontWeight: 600 }}>
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && !quizFinished && currentQuestion && (
                        <div>
                            {/* Progress Indicator */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Question {currentIdx + 1} of 5</span>
                                <div style={{ display: "flex", gap: "6px" }}>
                                    {[0, 1, 2, 3, 4].map((idx) => (
                                        <div key={idx} style={{
                                            width: "24px", height: "4px", borderRadius: "2px",
                                            background: idx === currentIdx ? "#a855f7" : idx < currentIdx ? "#10b981" : "rgba(255,255,255,0.1)"
                                        }} />
                                    ))}
                                </div>
                            </div>

                            {/* Question Title */}
                            <h3 style={{ color: "white", fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.5, marginBottom: "28px" }}>
                                {currentQuestion.question}
                            </h3>

                            {/* Options */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                {currentQuestion.options.map((option, idx) => {
                                    const letter = option.trim().charAt(0).toUpperCase();
                                    const isSelected = selectedLetter === letter;
                                    const correctLetter = currentQuestion.answer.toUpperCase();
                                    const isCorrectOption = letter === correctLetter;

                                    let optionStyle: React.CSSProperties = {
                                        width: "100%", padding: "18px 24px", borderRadius: "16px",
                                        textAlign: "left", cursor: isSubmitted ? "default" : "pointer",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        background: "rgba(255,255,255,0.02)", color: "white",
                                        transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center",
                                        fontWeight: 500, fontSize: "0.95rem"
                                    };

                                    if (isSelected && !isSubmitted) {
                                        optionStyle.border = "1px solid #a855f7";
                                        optionStyle.background = "rgba(168,85,247,0.08)";
                                    }

                                    if (isSubmitted) {
                                        if (isCorrectOption) {
                                            optionStyle.border = "1px solid #10b981";
                                            optionStyle.background = "rgba(16,185,129,0.15)";
                                            optionStyle.color = "#34d399";
                                        } else if (isSelected) {
                                            optionStyle.border = "1px solid #ef4444";
                                            optionStyle.background = "rgba(239,68,68,0.15)";
                                            optionStyle.color = "#f87171";
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionSelect(option)}
                                            style={optionStyle}
                                            disabled={isSubmitted}
                                            className={!isSubmitted ? "hover:bg-white/5 hover:border-white/20 hover:-translate-y-[2px]" : ""}
                                        >
                                            <span>{option}</span>
                                            {isSubmitted && isCorrectOption && <CheckCircle size={18} color="#34d399" />}
                                            {isSubmitted && isSelected && !isCorrectOption && <X size={18} color="#f87171" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}>
                                {!isSubmitted ? (
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={!selectedLetter}
                                        style={{
                                            padding: "14px 28px", borderRadius: "12px",
                                            background: selectedLetter ? "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)" : "rgba(255,255,255,0.05)",
                                            color: selectedLetter ? "white" : "rgba(255,255,255,0.3)",
                                            fontWeight: 700, border: "none", cursor: selectedLetter ? "pointer" : "default"
                                        }}
                                    >
                                        Submit Answer
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        style={{
                                            padding: "14px 28px", borderRadius: "12px",
                                            background: "white", color: "#0f172a",
                                            fontWeight: 700, border: "none", cursor: "pointer",
                                            display: "flex", alignItems: "center", gap: "8px"
                                        }}
                                        className="hover:bg-slate-200 transition-colors"
                                    >
                                        {currentIdx < 4 ? "Next Question" : "See Results"}
                                        <ArrowRight size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {!loading && !error && quizFinished && (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            {isPass ? (
                                <div className="animate-bounce-glow" style={{ marginBottom: "24px" }}>
                                    <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid rgba(16,185,129,0.3)" }}>
                                        <Trophy size={36} color="#10b981" />
                                    </div>
                                    <h3 style={{ color: "white", fontSize: "1.6rem", fontWeight: 800 }}>Challenge Completed!</h3>
                                    <p style={{ color: "#34d399", fontSize: "1rem", fontWeight: 700, marginTop: "8px" }}>Score: {score} / 5 — PASSED 🚀</p>
                                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: "12px", maxWidth: "400px", margin: "12px auto 0" }}>
                                        Excellent job! You have demonstrated key knowledge for Week {weekNumber}. This week has been marked completed in your roadmap.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid rgba(239,68,68,0.3)" }}>
                                        <AlertCircle size={36} color="#ef4444" />
                                    </div>
                                    <h3 style={{ color: "white", fontSize: "1.6rem", fontWeight: 800 }}>Assessment Failed</h3>
                                    <p style={{ color: "#f87171", fontSize: "1rem", fontWeight: 700, marginTop: "8px" }}>Score: {score} / 5 — Try Again 📚</p>
                                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: "12px", maxWidth: "400px", margin: "12px auto 0" }}>
                                        You need to answer at least 3 out of 5 questions correctly to pass and verify this week's progress. Review the learning resources and try again!
                                    </p>
                                </div>
                            )}

                            <div style={{ marginTop: "40px", display: "flex", gap: "16px", justifyContent: "center" }}>
                                {!isPass ? (
                                    <>
                                        <button onClick={fetchQuiz} style={{ padding: "14px 28px", borderRadius: "12px", background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)", color: "white", border: "none", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                                            <RotateCcw size={18} /> Retry Quiz
                                        </button>
                                        <button onClick={onClose} style={{ padding: "14px 28px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: "pointer", fontWeight: 700 }}>
                                            Close
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={onClose} style={{ padding: "14px 28px", borderRadius: "12px", background: "white", color: "#0f172a", border: "none", cursor: "pointer", fontWeight: 700 }}>
                                        Done & Continue
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Play, Square, Code, Clock, Star, Target, MessageSquare, Loader2, Sparkles, Bot } from "lucide-react";
import dynamic from "next/dynamic";
import { ChatMessage } from "./ChatMessage";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Props {
    role: string;
    company: any;
    type: string;
    onEnd: (score: number) => void;
}

export default function InterviewInterface({ role, company, type, onEnd }: Props) {
    const [messages, setMessages] = useState<any[]>([]);
    const [streamingMessage, setStreamingMessage] = useState("");
    const [inputVal, setInputVal] = useState("");
    const [codingMode, setCodingMode] = useState(false);
    const [codeVal, setCodeVal] = useState("// Write your code here...\n");
    const [language, setLanguage] = useState("python");
    const [isThinking, setIsThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [status, setStatus] = useState("Initializing...");
    const [showEndModal, setShowEndModal] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const audioQueueRef = useRef<any[]>([]);
    const isPlayingRef = useRef(false);
    const isConnectingRef = useRef(false);
    const finalScoreRef = useRef<number | null>(null);
    const sessionIdRef = useRef<string | null>(null);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => setElapsedSeconds(p => p + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // WebSocket Initialization
    useEffect(() => {
        if (isConnectingRef.current) return;
        isConnectingRef.current = true;

        const token = localStorage.getItem("token");
        if (!sessionIdRef.current) {
            sessionIdRef.current = Date.now().toString();
        }
        const sessionId = sessionIdRef.current;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const wsUrl = apiUrl.replace("http", "ws") + `/interview/ws/${sessionId}?role=${encodeURIComponent(role)}&company=${encodeURIComponent(company.name)}&company_tier=${company.tier}&company_style=${encodeURIComponent(company.interviewStyle)}&type=${encodeURIComponent(type)}&token=${token}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setStatus("Active Session");
        };

        const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send("__ping__");
            }
        }, 25000);

        ws.onmessage = (event) => {
            if (event.data === "__pong__") return;
            
            let data;
            try {
                data = JSON.parse(event.data);
            } catch (e) {
                console.error("Failed to parse WS message:", event.data);
                return;
            }
            
            // Handle audio independently
            if (data.audio) {
                audioQueueRef.current.push(data.audio);
                processAudioQueue();
            }

            if (data.role === "interviewer_stream") {
                setStreamingMessage(prev => prev + data.content);
                setIsThinking(false);
            } else if (data.role === "interviewer") {
                if (data.type === "question") setQuestionCount(p => p + 1);
                if (data.type === "feedback") {
                    const scoreMatch = data.content.match(/OVERALL SCORE\s*:\s*(\d+)/i);
                    if (scoreMatch) finalScoreRef.current = parseInt(scoreMatch[1]);
                    setIsFinished(true);
                    setStatus("Completed");
                }
                if (data.content) {
                    setMessages(prev => [...prev, { role: "interviewer", content: data.content }]);
                    setStreamingMessage("");
                }
            } else if (data.role === "system" && data.content === "Interview Completed.") {
                setIsFinished(true);
                setStatus("Completed");
                if (data.score !== undefined) {
                    finalScoreRef.current = data.score;
                }
            }
        };

        return () => {
            clearInterval(pingInterval);
            ws.close();
            isConnectingRef.current = false;
        };
    }, [role, company, onEnd]);

    const processAudioQueue = useCallback(async () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
        isPlayingRef.current = true;
        setIsSpeaking(true);
        const audioBase64 = audioQueueRef.current.shift();
        const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
        currentAudioRef.current = audio;
        audio.onended = () => {
            isPlayingRef.current = false;
            setIsSpeaking(false);
            if (finalScoreRef.current !== null && audioQueueRef.current.length === 0) {
                console.log("Audio ended. User can click 'View Your Score'.");
            } else {
                processAudioQueue();
            }
        };
        try { 
            // Add a small delay to prevent browser audio context / hardware DAC wake-up from clipping the first word
            await new Promise(resolve => setTimeout(resolve, 250));
            await audio.play(); 
        } catch { 
            isPlayingRef.current = false; 
            setIsSpeaking(false); 
            if (finalScoreRef.current !== null && audioQueueRef.current.length === 0) {
                console.log("Audio ended with error. User can click 'View Your Score'.");
            } else {
                processAudioQueue(); 
            }
        }
    }, [onEnd]);

    const stopAudio = () => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
            currentAudioRef.current = null;
        }
        audioQueueRef.current = [];
        isPlayingRef.current = false;
        setIsSpeaking(false);
    };

    const handleSend = () => {
        if (!inputVal.trim() && !codingMode) return;
        
        stopAudio();

        const fullMsg = codingMode ? `${inputVal}\n\nCode Solution:\n\`\`\`${codeVal}\`\`\`` : inputVal;
        wsRef.current?.send(fullMsg);
        setMessages(prev => [...prev, { role: "candidate", content: fullMsg }]);
        setInputVal("");
        setIsThinking(true);
    };

    return (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", minHeight: "calc(100vh - 100px)", padding: "12px 24px", paddingBottom: "48px" }}>
            
            {/* Global Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(15,23,42,0.4)", padding: "20px 32px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px -4px rgba(99,102,241,0.3)" }}>
                        <Bot size={24} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", margin: 0, marginBottom: "4px" }}>AI Interviewer</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
                                <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 600 }}>{status}</span>
                            </div>
                            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>•</span>
                            <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>{role} @ {company?.name || "Company"}</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                    <button style={{ padding: "10px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                        <Clock size={16} /> History
                    </button>
                    <button 
                        onClick={() => setShowEndModal(true)}
                        style={{ padding: "10px 20px", borderRadius: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                    >
                        <Square size={16} fill="#ef4444" /> End Session
                    </button>
                </div>
            </div>

            {/* Split Content */}
            <div style={{ display: "grid", gridTemplateColumns: "6fr 4fr", gap: "24px", flex: 1, alignItems: "start" }}>
                
                {/* Left: Chat History */}
                <div style={{ background: "rgba(15,23,42,0.4)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", overflow: "hidden", position: "sticky", top: "24px", height: "calc(100vh - 140px)" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Clock size={18} color="#6366f1" />
                            <span style={{ fontWeight: 600, color: "#6366f1", fontSize: "0.95rem" }}>Interview Record</span>
                        </div>
                        <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{questionCount} Questions Logged</span>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px", display: "flex", flexDirection: "column", minHeight: 0 }}>
                        {messages.map((m, i) => <ChatMessage key={i} msg={m} codingMode={false} isSpeaking={isSpeaking && i === messages.length - 1} />)}
                        {streamingMessage && <ChatMessage msg={{ role: "interviewer_stream", content: streamingMessage }} codingMode={false} isSpeaking={true} />}
                        {isThinking && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", fontStyle: "italic", marginLeft: "52px" }}>Interviewer is thinking...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Right: Input Area */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", minHeight: 0 }}>
                    
                    {/* Status Bar */}
                    <div style={{ background: "rgba(15,23,42,0.4)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ display: "flex", gap: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "white", fontWeight: 600, fontSize: "0.9rem" }}>
                                <Clock size={16} color="rgba(255,255,255,0.5)" /> 
                                {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "white", fontWeight: 600, fontSize: "0.9rem" }}>
                                <Target size={16} color="rgba(255,255,255,0.5)" />
                                Question {questionCount}/7
                            </div>
                        </div>
                    </div>

                    {/* Main Input Box */}
                    <div style={{ flex: 1, background: "rgba(15,23,42,0.4)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: "250px" }}>
                        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                            <span style={{ fontWeight: 700, color: "white", fontSize: "1.05rem" }}>Your Response</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16,185,129,0.1)", padding: "6px 12px", borderRadius: "100px" }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                                    <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 700, letterSpacing: "0.5px" }}>LIVE</span>
                                </div>
                                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Press Enter to send</span>
                            </div>
                        </div>
                        
                        <textarea 
                            value={inputVal} 
                            onChange={(e) => setInputVal(e.target.value)}
                            disabled={isFinished}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={isFinished ? "Interview Simulation Completed! Read your feedback above." : codingMode ? "Add a comment with your code..." : "Type your detailed answer here..."}
                            style={{ 
                                flex: 1, padding: "0 24px 24px 24px", background: "transparent", border: "none", 
                                color: "white", resize: "vertical", outline: "none", minHeight: "150px",
                                fontFamily: "inherit", fontSize: "1rem", lineHeight: "1.6",
                                opacity: isFinished ? 0.5 : 1
                            }}
                        />
                    </div>

                    {/* Bottom Actions */}
                    <div style={{ display: "flex", gap: "16px", flexShrink: 0 }}>
                        {isFinished ? (
                            <button 
                                onClick={() => {
                                    stopAudio();
                                    onEnd(finalScoreRef.current || 90);
                                }} 
                                style={{ 
                                    flex: 1, padding: "18px", borderRadius: "16px", 
                                    background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)", 
                                    color: "white", border: "none", cursor: "pointer",
                                    fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                    boxShadow: "0 10px 30px -5px rgba(168, 85, 247, 0.5)",
                                    transition: "all 0.3s ease",
                                    animation: "pulse-button 2s infinite"
                                }}
                            >
                                <Star size={20} fill="white" /> View Your Score & Evaluation <Star size={20} fill="white" />
                            </button>
                        ) : (
                            <>
                                <button onClick={() => setCodingMode(!codingMode)} style={{ padding: "16px 20px", borderRadius: "16px", background: codingMode ? "rgba(168,85,247,0.2)" : "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", color: codingMode ? "#a855f7" : "rgba(255,255,255,0.6)", cursor: "pointer", transition: "all 0.2s" }}>
                                    <Code size={22} />
                                </button>
                                <button 
                                    onClick={handleSend} 
                                    style={{ 
                                        flex: 1, padding: "16px", borderRadius: "16px", 
                                        background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", 
                                        color: "white", border: "none", cursor: "pointer",
                                        fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                        boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)",
                                        transition: "transform 0.1s"
                                    }}
                                    onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
                                    onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                >
                                    Submit Answer <Send size={18} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Code Editor (Appears Below Submit Button when toggled) */}
                    {codingMode && (
                        <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", background: "rgba(15,23,42,0.4)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                            <div style={{ padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)" }}>
                                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", fontWeight: 600 }}>Code Editor</span>
                                <select 
                                    value={language} 
                                    onChange={e => setLanguage(e.target.value)} 
                                    style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: "8px", outline: "none", fontSize: "0.85rem", cursor: "pointer" }}
                                >
                                    <option value="python" style={{ background: "#0f172a" }}>Python</option>
                                    <option value="java" style={{ background: "#0f172a" }}>Java</option>
                                    <option value="cpp" style={{ background: "#0f172a" }}>C++</option>
                                </select>
                            </div>
                            <div style={{ height: "400px" }}>
                                <Editor 
                                    height="100%" 
                                    theme="vs-dark" 
                                    language={language} 
                                    value={codeVal} 
                                    onChange={(v) => setCodeVal(v || "")}
                                    options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 } }}
                                />
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Custom End Session Modal */}
            {showEndModal && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <div className="animate-scale-in" style={{ width: "100%", maxWidth: "400px", background: "#0f172a", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", padding: "32px", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
                        <div style={{ width: "64px", height: "64px", background: "rgba(239,68,68,0.1)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                            <Square size={28} color="#ef4444" fill="#ef4444" />
                        </div>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "12px" }}>End Interview?</h3>
                        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "32px", lineHeight: "1.5" }}>Are you sure you want to stop the simulation early? Your progress will be saved but results may be incomplete.</p>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => setShowEndModal(false)} style={{ flex: 1, padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "white", border: "none", fontWeight: 600, cursor: "pointer" }}>Resume</button>
                            <button 
                                onClick={() => {
                                    wsRef.current?.close();
                                    onEnd(0);
                                }} 
                                style={{ flex: 1, padding: "14px", borderRadius: "12px", background: "#ef4444", color: "white", border: "none", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 15px rgba(239,68,68,0.3)" }}
                            >
                                End Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

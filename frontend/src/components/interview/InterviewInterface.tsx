import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Play, Square, Code, Clock, Star, Target, MessageSquare, Loader2, Sparkles, Bot } from "lucide-react";
import dynamic from "next/dynamic";
import { ChatMessage } from "./ChatMessage";

const Editor = dynamic(
    () => import("@monaco-editor/react").catch((err) => {
        console.error("Failed to load Monaco Editor:", err);
        if (typeof window !== "undefined") {
            window.location.reload();
        }
        return { default: () => <div style={{ padding: "20px", color: "rgba(255,255,255,0.5)" }}>Reloading editor...</div> };
    }),
    { ssr: false }
);

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
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isInputBlocked, setIsInputBlocked] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const audioQueueRef = useRef<any[]>([]);
    const isPlayingRef = useRef(false);
    const isConnectingRef = useRef(false);
    const finalScoreRef = useRef<number | null>(null);
    const sessionIdRef = useRef<string | null>(null);

    // Scroll to bottom on message updates
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingMessage]);

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
        const activeProvider = localStorage.getItem("preferred_provider") || "nvidia";
        if (!sessionIdRef.current) {
            sessionIdRef.current = Date.now().toString();
        }
        const sessionId = sessionIdRef.current;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const wsUrl = apiUrl.replace("http", "ws") + `/interview/ws/${sessionId}?role=${encodeURIComponent(role)}&company=${encodeURIComponent(company.name)}&company_tier=${company.tier}&company_style=${encodeURIComponent(company.interviewStyle)}&type=${encodeURIComponent(type)}&token=${token}&provider=${activeProvider}`;

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
            } else if (data.role === "system") {
                if (data.content === "Interview Concluding...") {
                    setIsInputBlocked(true);
                } else if (data.content === "Interview Completed.") {
                    setIsFinished(true);
                    setIsInputBlocked(true);
                    setStatus("Completed");
                    if (data.score !== undefined) {
                        finalScoreRef.current = data.score;
                    }
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
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px", minHeight: "calc(100vh - 100px)", padding: "12px 0 48px 0", position: "relative", zIndex: 1 }}>
            
            {/* Embedded Custom CSS Keyframes for Advanced Visuals */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes bounce {
                    0%, 100% { transform: scaleY(0.3); }
                    50% { transform: scaleY(1.3); }
                }
                @keyframes pulse-button {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.6); }
                    50% { box-shadow: 0 0 20px 8px rgba(168, 85, 247, 0.3); }
                }
                @keyframes float-gentle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-4px); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 100px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(168, 85, 247, 0.35);
                }
            `}} />

            {/* Glowing Decorative Background Blobs */}
            <div style={{
                position: "absolute",
                top: "12%",
                left: "20%",
                width: "400px",
                height: "400px",
                background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
                filter: "blur(80px)",
                zIndex: -1,
                pointerEvents: "none"
            }} />
            <div style={{
                position: "absolute",
                bottom: "15%",
                right: "10%",
                width: "500px",
                height: "500px",
                background: "radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 75%)",
                filter: "blur(90px)",
                zIndex: -1,
                pointerEvents: "none"
            }} />

            {/* Global Header Card */}
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                background: "linear-gradient(135deg, rgba(30, 41, 59, 0.45) 0%, rgba(15, 23, 42, 0.55) 100%)", 
                backdropFilter: "blur(16px)",
                padding: "24px 36px", 
                borderRadius: "24px", 
                border: "1px solid rgba(255,255,255,0.06)", 
                flexShrink: 0,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div style={{ 
                        width: "56px", 
                        height: "56px", 
                        background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)", 
                        borderRadius: "16px", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        boxShadow: "0 8px 20px -4px rgba(168,85,247,0.4)" 
                    }}>
                        <Bot size={28} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "white", margin: 0, marginBottom: "4px", fontFamily: "'Space Grotesk', sans-serif" }}>AI Interviewer</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
                                <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 700, letterSpacing: "0.5px" }}>{status.toUpperCase()}</span>
                            </div>
                            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem" }}>•</span>
                            <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                                {role} <span style={{ color: "#a855f7" }}>@</span> {company?.name || "Company"}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    {/* Animated Sound Waveform Indicator */}
                    {isSpeaking && (
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "4px", 
                            padding: "8px 16px", 
                            borderRadius: "100px", 
                            background: "rgba(168, 85, 247, 0.12)", 
                            border: "1px solid rgba(168, 85, 247, 0.25)",
                            marginRight: "8px"
                        }}>
                            <Sparkles size={16} color="#a855f7" />
                            <span style={{ fontSize: "0.75rem", color: "#a855f7", fontWeight: 800, letterSpacing: "0.5px", marginRight: "4px" }}>SPEAKING</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "14px" }}>
                                <div className="wave-bar" style={{ width: "2.5px", height: "8px", background: "#a855f7", borderRadius: "2px", animation: "bounce 0.8s ease-in-out infinite" }}></div>
                                <div className="wave-bar" style={{ width: "2.5px", height: "14px", background: "#06b6d4", borderRadius: "2px", animation: "bounce 0.8s ease-in-out infinite 0.15s" }}></div>
                                <div className="wave-bar" style={{ width: "2.5px", height: "10px", background: "#a855f7", borderRadius: "2px", animation: "bounce 0.8s ease-in-out infinite 0.3s" }}></div>
                                <div className="wave-bar" style={{ width: "2.5px", height: "5px", background: "#06b6d4", borderRadius: "2px", animation: "bounce 0.8s ease-in-out infinite 0.45s" }}></div>
                            </div>
                        </div>
                    )}

                    <button 
                        style={{ 
                            padding: "10px 20px", 
                            borderRadius: "12px", 
                            background: "rgba(255,255,255,0.04)", 
                            border: "1px solid rgba(255,255,255,0.08)", 
                            color: "white", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            fontSize: "0.9rem", 
                            fontWeight: 600, 
                            cursor: "pointer", 
                            transition: "all 0.2s" 
                        }} 
                        onMouseEnter={e => {e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "translateY(-1px)";}} 
                        onMouseLeave={e => {e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "translateY(0)";}}
                    >
                        <Clock size={16} /> History
                    </button>
                    <button 
                        onClick={() => setShowEndModal(true)}
                        style={{ 
                            padding: "10px 20px", 
                            borderRadius: "12px", 
                            background: "rgba(239,68,68,0.08)", 
                            border: "1px solid rgba(239,68,68,0.15)", 
                            color: "#ef4444", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            fontSize: "0.9rem", 
                            fontWeight: 600, 
                            cursor: "pointer", 
                            transition: "all 0.2s" 
                        }}
                        onMouseEnter={e => {e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.transform = "translateY(-1px)";}} 
                        onMouseLeave={e => {e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.transform = "translateY(0)";}}
                    >
                        <Square size={16} fill="#ef4444" stroke="none" /> End Session
                    </button>
                </div>
            </div>

            {/* Split Content Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "28px", flex: 1, alignItems: "start" }}>
                
                {/* Left: Chat History Panel */}
                <div style={{ 
                    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.3) 0%, rgba(15, 23, 42, 0.45) 100%)", 
                    backdropFilter: "blur(16px)",
                    borderRadius: "24px", 
                    border: "1px solid rgba(255,255,255,0.06)", 
                    display: "flex", 
                    flexDirection: "column", 
                    overflow: "hidden", 
                    position: "sticky", 
                    top: "24px", 
                    height: "calc(100vh - 240px)", 
                    minWidth: 0,
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)"
                }}>
                    <div style={{ 
                        padding: "20px 28px", 
                        borderBottom: "1px solid rgba(255,255,255,0.05)", 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        flexShrink: 0 
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <MessageSquare size={18} color="#a855f7" />
                            <span style={{ fontWeight: 700, color: "white", fontSize: "1rem", fontFamily: "'Space Grotesk', sans-serif" }}>Interview Record</span>
                        </div>
                        <div style={{ background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.2)", padding: "4px 12px", borderRadius: "100px", fontSize: "0.75rem", color: "#c084fc", fontWeight: 700 }}>
                            {questionCount} Questions Logged
                        </div>
                    </div>
                    
                    {/* Message Bubble Feed */}
                    <div className="custom-scrollbar" style={{ 
                        flex: 1, 
                        overflowY: "auto", 
                        padding: "28px", 
                        display: "flex", 
                        flexDirection: "column", 
                        minHeight: 0 
                    }}>
                        {messages.length === 0 && !streamingMessage && (
                            <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", gap: "12px", padding: "40px" }}>
                                <Loader2 className="animate-spin" size={28} color="#a855f7" />
                                <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>Spawning Interview Agent...</span>
                            </div>
                        )}
                        
                        {messages.map((m, i) => (
                            <ChatMessage 
                                key={i} 
                                msg={m} 
                                codingMode={false} 
                                isSpeaking={isSpeaking && i === messages.length - 1} 
                            />
                        ))}
                        
                        {streamingMessage && (
                            <ChatMessage 
                                msg={{ role: "interviewer_stream", content: streamingMessage }} 
                                codingMode={false} 
                                isSpeaking={true} 
                            />
                        )}
                        
                        {isThinking && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a855f7", fontSize: "0.85rem", fontWeight: 600, fontStyle: "italic", marginLeft: "52px", marginTop: "4px" }}>
                                <Loader2 size={14} className="animate-spin" />
                                Agent is thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Right Panel: Metrics, Input & Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", minHeight: 0, minWidth: 0 }}>
                    
                    {/* Status Stats Panel */}
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "1fr 1fr", 
                        gap: "16px",
                        flexShrink: 0 
                    }}>
                        {/* Stat Timer Card */}
                        <div style={{
                            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.5) 100%)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            borderRadius: "20px",
                            padding: "16px 20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                        }}>
                            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "rgba(6, 182, 212, 0.12)", border: "1px solid rgba(6, 182, 212, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Clock size={18} color="#06b6d4" />
                            </div>
                            <div>
                                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Time Elapsed</div>
                                <div style={{ fontSize: "1.1rem", color: "white", fontWeight: 800 }}>
                                    {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
                                </div>
                            </div>
                        </div>

                        {/* Stat Progress Card */}
                        <div style={{
                            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.5) 100%)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            borderRadius: "20px",
                            padding: "16px 20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                        }}>
                            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Target size={18} color="#a855f7" />
                            </div>
                            <div>
                                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Progress</div>
                                <div style={{ fontSize: "1.1rem", color: "white", fontWeight: 800 }}>
                                    Question {questionCount}/7
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Input Box Card */}
                    <div style={{ 
                        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.5) 100%)", 
                        backdropFilter: "blur(16px)",
                        borderRadius: "24px", 
                        border: isInputFocused ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid rgba(255,255,255,0.06)", 
                        display: "flex", 
                        flexDirection: "column", 
                        overflow: "hidden", 
                        minHeight: "260px",
                        boxShadow: isInputFocused ? "0 12px 30px rgba(168, 85, 247, 0.15)" : "0 8px 25px rgba(0,0,0,0.15)",
                        transition: "all 0.3s ease"
                    }}>
                        <div style={{ padding: "20px 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                            <span style={{ fontWeight: 800, color: "white", fontSize: "1.05rem", fontFamily: "'Space Grotesk', sans-serif" }}>Your Response</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.15)", padding: "5px 12px", borderRadius: "100px" }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                                    <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 800, letterSpacing: "0.5px" }}>LIVE INPUT</span>
                                </div>
                                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Shift + Enter for new line</span>
                            </div>
                        </div>
                        
                        <textarea 
                            value={inputVal} 
                            onChange={(e) => setInputVal(e.target.value)}
                            disabled={isFinished || isInputBlocked}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && !(isThinking || isInputBlocked)) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={(isFinished || isInputBlocked) ? "Interview concluding! Evaluating your performance..." : codingMode ? "Explain your logic or add comments for your solution here..." : "Type your detailed answer here..."}
                            style={{ 
                                flex: 1, 
                                padding: "16px 24px 24px", 
                                background: "transparent", 
                                border: "none", 
                                color: "white", 
                                resize: "none", 
                                outline: "none", 
                                minHeight: "150px",
                                fontFamily: "inherit", 
                                fontSize: "0.975rem", 
                                lineHeight: "1.7",
                                opacity: (isFinished || isInputBlocked) ? 0.4 : 1,
                                caretColor: "#a855f7"
                            }}
                        />
                    </div>

                    {/* Bottom Action Triggers */}
                    <div style={{ display: "flex", gap: "16px", flexShrink: 0 }}>
                        {isFinished ? (
                            <button 
                                onClick={() => {
                                    stopAudio();
                                    onEnd(finalScoreRef.current || 90);
                                }} 
                                style={{ 
                                    flex: 1, 
                                    padding: "18px", 
                                    borderRadius: "16px", 
                                    background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)", 
                                    color: "white", 
                                    border: "none", 
                                    cursor: "pointer",
                                    fontSize: "1.1rem", 
                                    fontWeight: 800, 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    gap: "10px",
                                    boxShadow: "0 10px 30px -5px rgba(168, 85, 247, 0.5)",
                                    transition: "all 0.3s ease",
                                    animation: "pulse-button 2.5s infinite",
                                    fontFamily: "'Space Grotesk', sans-serif"
                                }}
                            >
                                <Star size={20} fill="white" /> View Your Score & Evaluation <Star size={20} fill="white" />
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={() => setCodingMode(!codingMode)} 
                                    disabled={isInputBlocked}
                                    title={codingMode ? "Hide Code Editor" : "Open Code Editor"}
                                    style={{ 
                                        padding: "16px 20px", 
                                        borderRadius: "16px", 
                                        background: codingMode ? "rgba(168,85,247,0.18)" : "rgba(30,41,59,0.5)", 
                                        border: `1px solid ${codingMode ? "#a855f7" : "rgba(255,255,255,0.06)"}`, 
                                        color: codingMode ? "#c084fc" : "rgba(255,255,255,0.6)", 
                                        cursor: isInputBlocked ? "not-allowed" : "pointer", 
                                        opacity: isInputBlocked ? 0.4 : 1,
                                        transition: "all 0.2s",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                    onMouseEnter={e => { if(!codingMode && !isInputBlocked) e.currentTarget.style.background = "rgba(30,41,59,0.8)"; }}
                                    onMouseLeave={e => { if(!codingMode && !isInputBlocked) e.currentTarget.style.background = "rgba(30,41,59,0.5)"; }}
                                >
                                    <Code size={22} />
                                </button>
                                <button 
                                    onClick={handleSend} 
                                    disabled={isThinking || isInputBlocked}
                                    style={{ 
                                        flex: 1, 
                                        padding: "16px", 
                                        borderRadius: "16px", 
                                        background: (isThinking || isInputBlocked)
                                            ? "rgba(255,255,255,0.05)"
                                            : "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)", 
                                        color: (isThinking || isInputBlocked) ? "rgba(255,255,255,0.25)" : "white", 
                                        border: (isThinking || isInputBlocked) ? "1px solid rgba(255,255,255,0.05)" : "none", 
                                        cursor: (isThinking || isInputBlocked) ? "not-allowed" : "pointer",
                                        fontSize: "1.05rem", 
                                        fontWeight: 800, 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        gap: "10px",
                                        boxShadow: (isThinking || isInputBlocked) ? "none" : "0 10px 25px -5px rgba(168, 85, 247, 0.35)",
                                        transition: "all 0.2s ease",
                                        fontFamily: "'Space Grotesk', sans-serif"
                                    }}
                                    onMouseEnter={e => { 
                                        if (!(isThinking || isInputBlocked)) {
                                            e.currentTarget.style.transform = "translateY(-1px)"; 
                                            e.currentTarget.style.boxShadow = "0 12px 28px -5px rgba(168, 85, 247, 0.5)"; 
                                        }
                                    }}
                                    onMouseLeave={e => { 
                                        if (!(isThinking || isInputBlocked)) {
                                            e.currentTarget.style.transform = "translateY(0)"; 
                                            e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(168, 85, 247, 0.35)"; 
                                        }
                                    }}
                                    onMouseDown={e => { if (!(isThinking || isInputBlocked)) e.currentTarget.style.transform = "scale(0.98)" }}
                                    onMouseUp={e => { if (!(isThinking || isInputBlocked)) e.currentTarget.style.transform = "scale(1)" }}
                                >
                                    {isThinking ? "Thinking..." : "Submit Answer"} <Send size={16} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Integrated Monaco Code Editor Dashboard */}
                    {codingMode && (
                        <div className="animate-fade-up" style={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            background: "rgba(15,23,42,0.4)", 
                            backdropFilter: "blur(12px)",
                            borderRadius: "24px", 
                            border: "1px solid rgba(255,255,255,0.06)", 
                            overflow: "hidden",
                            boxShadow: "0 15px 35px rgba(0,0,0,0.25)"
                        }}>
                            <div style={{ 
                                padding: "14px 24px", 
                                borderBottom: "1px solid rgba(255,255,255,0.05)", 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "center", 
                                background: "rgba(0,0,0,0.25)" 
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <Code size={16} color="#06b6d4" />
                                    <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", fontWeight: 700 }}>Code Workspace</span>
                                </div>
                                <select 
                                    value={language} 
                                    onChange={e => setLanguage(e.target.value)} 
                                    style={{ 
                                        background: "rgba(255,255,255,0.05)", 
                                        color: "white", 
                                        border: "1px solid rgba(255,255,255,0.1)", 
                                        padding: "6px 12px", 
                                        borderRadius: "8px", 
                                        outline: "none", 
                                        fontSize: "0.85rem", 
                                        cursor: "pointer",
                                        fontWeight: 600
                                    }}
                                >
                                    <option value="python" style={{ background: "#0f172a" }}>Python</option>
                                    <option value="java" style={{ background: "#0f172a" }}>Java</option>
                                    <option value="cpp" style={{ background: "#0f172a" }}>C++</option>
                                </select>
                            </div>
                            <div style={{ height: "380px" }}>
                                <Editor 
                                    height="100%" 
                                    theme="vs-dark" 
                                    language={language} 
                                    value={codeVal} 
                                    onChange={(v) => setCodeVal(v || "")}
                                    options={{ 
                                        fontSize: 14, 
                                        minimap: { enabled: false }, 
                                        padding: { top: 16 },
                                        scrollbar: {
                                            vertical: "visible",
                                            horizontal: "visible"
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Custom Glassmorphic End Session Confirmation Modal */}
            {showEndModal && (
                <div style={{ 
                    position: "fixed", 
                    top: 0, 
                    left: 0, 
                    width: "100%", 
                    height: "100%", 
                    background: "rgba(2, 6, 23, 0.75)", 
                    backdropFilter: "blur(12px)", 
                    zIndex: 1000, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    padding: "20px" 
                }}>
                    <div className="animate-scale-in" style={{ 
                        width: "100%", 
                        maxWidth: "420px", 
                        background: "rgba(15, 23, 42, 0.95)", 
                        borderRadius: "28px", 
                        border: "1px solid rgba(239, 68, 68, 0.35)", 
                        padding: "36px", 
                        textAlign: "center", 
                        boxShadow: "0 25px 50px -12px rgba(239,68,68,0.2)" 
                    }}>
                        <div style={{ 
                            width: "68px", 
                            height: "68px", 
                            background: "rgba(239,68,68,0.1)", 
                            borderRadius: "22px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            margin: "0 auto 24px",
                            border: "1px solid rgba(239, 68, 68, 0.2)"
                        }}>
                            <Square size={28} color="#ef4444" fill="#ef4444" stroke="none" />
                        </div>
                        <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: "white", marginBottom: "12px", fontFamily: "'Space Grotesk', sans-serif" }}>End Simulation?</h3>
                        <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: "32px", lineHeight: "1.6", fontSize: "0.95rem" }}>
                            Are you sure you want to stop the mock interview early? Your results will be saved up to this point but the evaluation will be incomplete.
                        </p>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button 
                                onClick={() => setShowEndModal(false)} 
                                style={{ 
                                    flex: 1, 
                                    padding: "14px", 
                                    borderRadius: "12px", 
                                    background: "rgba(255,255,255,0.05)", 
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    color: "white", 
                                    fontWeight: 700, 
                                    cursor: "pointer",
                                    transition: "background 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                            >
                                Resume
                            </button>
                            <button 
                                onClick={() => {
                                    wsRef.current?.close();
                                    onEnd(0);
                                }} 
                                style={{ 
                                    flex: 1, 
                                    padding: "14px", 
                                    borderRadius: "12px", 
                                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", 
                                    color: "white", 
                                    border: "none", 
                                    fontWeight: 800, 
                                    cursor: "pointer", 
                                    boxShadow: "0 6px 20px rgba(239,68,68,0.35)",
                                    transition: "opacity 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
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

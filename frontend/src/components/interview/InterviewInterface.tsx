"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Send, Square, Code2, Clock, Volume2, VolumeX,
    Loader2, Sparkles, Bot, User, CheckCircle2,
    ChevronRight, ArrowRight, CornerDownLeft, Play, X, Award, Layers, RotateCcw
} from "lucide-react";
import dynamic from "next/dynamic";
import { ChatMessage } from "./ChatMessage";
import { getWsBaseUrl } from "@/services/client";

const Editor = dynamic(
    () => import("@monaco-editor/react").catch((err) => {
        console.error("Failed to load Monaco Editor:", err);
        return { default: () => <div style={{ padding: "20px", color: "var(--fg-muted)" }}>Loading Code Editor...</div> };
    }),
    { ssr: false }
);

const LiveTimer = React.memo(() => {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setElapsed(p => p + 1), 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <span style={{ fontSize: "0.85rem", color: "var(--fg-primary)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}
        </span>
    );
});
LiveTimer.displayName = "LiveTimer";

interface Props {
    role: string;
    company: any;
    type: string;
    roleLevel?: string;
    mode?: string;
    topicFocus?: string;
    onEnd: (score: number, feedback: string, scorecard?: any) => void;
    onBack?: () => void;
}

export default function InterviewInterface({
    role,
    company,
    type,
    roleLevel = "fresher",
    mode = "full_mock",
    topicFocus = "",
    onEnd,
    onBack
}: Props) {
    const [messages, setMessages] = useState<any[]>([]);
    const [streamingMessage, setStreamingMessage] = useState("");
    const [inputVal, setInputVal] = useState("");
    const [codingMode, setCodingMode] = useState(false);
    const [codeVal, setCodeVal] = useState("# Write your solution code here\ndef solution():\n    pass\n");
    const [language, setLanguage] = useState("python");
    const [isThinking, setIsThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [questionCount, setQuestionCount] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(mode === "quick_drill" ? 4 : 6);
    const [currentPhase, setCurrentPhase] = useState<string>("");
    const [status, setStatus] = useState("Connecting to AI Interviewer...");
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [reconnectTrigger, setReconnectTrigger] = useState(0);
    const [isInputBlocked, setIsInputBlocked] = useState(false);
    const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
    const [feedbackData, setFeedbackData] = useState<{
        score: number;
        feedback: string;
        scorecard?: any;
    } | null>(null);
    const [isConcluding, setIsConcluding] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const messageFeedRef = useRef<HTMLDivElement>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const audioQueueRef = useRef<string[]>([]);
    const isPlayingRef = useRef(false);
    const isMutedRef = useRef(isMuted);

    useEffect(() => {
        isMutedRef.current = isMuted;
        if (isMuted && currentAudioRef.current) {
            currentAudioRef.current.pause();
            isPlayingRef.current = false;
            setIsSpeaking(false);
        }
    }, [isMuted]);

    // Textarea Auto-Expand & Maximize State
    const [isTextareaExpanded, setIsTextareaExpanded] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const adjustTextareaHeight = useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;
        if (isTextareaExpanded) {
            el.style.height = codingMode ? "220px" : "340px";
            return;
        }
        el.style.height = "auto";
        const minH = codingMode ? 56 : 76;
        const maxH = codingMode ? 180 : 260;
        const nextH = Math.min(Math.max(el.scrollHeight, minH), maxH);
        el.style.height = `${nextH}px`;
    }, [codingMode, isTextareaExpanded]);

    useEffect(() => {
        adjustTextareaHeight();
    }, [inputVal, codingMode, isTextareaExpanded, adjustTextareaHeight]);

    const isAtBottomRef = useRef(true);

    const handleFeedScroll = useCallback(() => {
        if (!messageFeedRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messageFeedRef.current;
        isAtBottomRef.current = scrollHeight - (scrollTop + clientHeight) < 120;
    }, []);

    // Auto-scroll chat
    const scrollToBottom = useCallback((force = false) => {
        if (messageFeedRef.current && (force || isAtBottomRef.current)) {
            messageFeedRef.current.scrollTo({
                top: messageFeedRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, []);

    useEffect(() => {
        scrollToBottom(false);
    }, [messages, streamingMessage, feedbackData, scrollToBottom]);

    // Audio Playback Pipeline
    const processAudioQueue = useCallback(() => {
        if (isMutedRef.current) {
            audioQueueRef.current = [];
            isPlayingRef.current = false;
            setIsSpeaking(false);
            return;
        }

        if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

        isPlayingRef.current = true;
        setIsSpeaking(true);

        const nextBase64 = audioQueueRef.current.shift();
        if (!nextBase64) {
            isPlayingRef.current = false;
            setIsSpeaking(false);
            return;
        }

        const audio = new Audio(`data:audio/mp3;base64,${nextBase64}`);
        currentAudioRef.current = audio;

        const onFinished = () => {
            isPlayingRef.current = false;
            setIsSpeaking(false);
            processAudioQueue();
        };

        audio.onended = onFinished;
        audio.onerror = onFinished;

        audio.play().catch(onFinished);
    }, []);

    const sessionIdRef = useRef<string>("");
    if (!sessionIdRef.current) {
        sessionIdRef.current = crypto.randomUUID();
    }

    const onEndRef = useRef(onEnd);
    useEffect(() => {
        onEndRef.current = onEnd;
    }, [onEnd]);

    const companyName = company?.name || "Tech Company";
    const companyStyle = company?.interviewStyle || "";
    const companyTier = company?.tier || "other";

    // WebSocket Initialization
    useEffect(() => {
        let isCancelled = false;
        setConnectionError(null);
        const token = localStorage.getItem("token") || "";
        const preferredProvider = localStorage.getItem("preferred_provider") || "groq";

        const wsBase = getWsBaseUrl();
        const wsUrl = `${wsBase}/interview/ws/${sessionIdRef.current}?` +
            `role=${encodeURIComponent(role)}&` +
            `company=${encodeURIComponent(companyName)}&` +
            `company_style=${encodeURIComponent(companyStyle)}&` +
            `company_tier=${encodeURIComponent(companyTier)}&` +
            `token=${encodeURIComponent(token)}&` +
            `type=${encodeURIComponent(type)}&` +
            `provider=${encodeURIComponent(preferredProvider)}&` +
            `role_level=${encodeURIComponent(roleLevel)}&` +
            `mode=${encodeURIComponent(mode)}&` +
            `topic_focus=${encodeURIComponent(topicFocus)}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            if (isCancelled) {
                try { ws.close(); } catch {}
                return;
            }
            setConnectionError(null);
            setStatus("Live Interview In Session");
        };

        ws.onmessage = (event) => {
            if (isCancelled) return;
            try {
                const data = JSON.parse(event.data);

                // Handle text streaming fragments
                if (data.role === "interviewer_stream") {
                    const chunk = data.content || data.fragment;
                    if (chunk) {
                        setIsThinking(false);
                        setStreamingMessage(prev => prev + chunk);
                    }
                    return;
                }

                // Handle audio voice fragments
                if (data.role === "interviewer" && data.audio) {
                    audioQueueRef.current.push(data.audio);
                    processAudioQueue();
                    return;
                }

                // Handle complete question or concluding turns
                if (data.role === "interviewer" && (data.type === "question" || data.type === "concluding")) {
                    setStreamingMessage("");
                    setIsThinking(false);
                    setMessages(prev => [...prev, data]);
                    if (data.question_number) setQuestionCount(data.question_number);
                    if (data.total_questions) setTotalQuestions(data.total_questions);
                    if (data.phase_title) setCurrentPhase(data.phase_title);
                    if (data.type === "concluding") {
                        setIsConcluding(true);
                        setIsInputBlocked(true);
                    } else {
                        setIsInputBlocked(false);
                    }
                    return;
                }

                // Handle final 360 feedback scorecard frame
                if (data.type === "feedback" || data.scorecard) {
                    setStreamingMessage("");
                    setIsThinking(false);
                    setIsInputBlocked(true);
                    setIsConcluding(true);
                    const finalScore = data.score !== undefined ? data.score : (data.scorecard?.overall_score ?? 75);
                    const feedbackContent = data.content || "";
                    setFeedbackData({
                        score: finalScore,
                        feedback: feedbackContent,
                        scorecard: data.scorecard,
                    });
                    return;
                }

                // System messages
                if (data.role === "system") {
                    if (data.type === "rate_limit") {
                        setRateLimitMessage(data.content);
                        setIsInputBlocked(true);
                    } else if (data.type === "error") {
                        setConnectionError(data.content);
                        setStatus(data.content);
                        setIsInputBlocked(true);
                    } else if (data.content.includes("concluding")) {
                        setIsInputBlocked(true);
                    }
                }
            } catch (err) {
                console.error("WS message parse error:", err);
            }
        };

        ws.onerror = (err) => {
            if (isCancelled) return;
            console.error("WS error:", err);
            setConnectionError("Unable to connect to the interview server. Please check your network or try reconnecting.");
            setStatus("Connection issue. Please retry.");
        };

        ws.onclose = () => {
            if (isCancelled) return;
            if (messages.length === 0 && !feedbackData) {
                setConnectionError("Connection closed before interview started.");
                setStatus("Connection closed.");
            } else if (!feedbackData) {
                setStatus("Interview connection closed.");
            } else {
                setStatus("Interview concluded.");
            }
        };

        return () => {
            isCancelled = true;
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current = null;
            }
            audioQueueRef.current = [];
            isPlayingRef.current = false;
            setIsSpeaking(false);
            ws.onopen = null;
            ws.onmessage = null;
            ws.onerror = null;
            ws.onclose = null;
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                try { ws.close(); } catch {}
            }
        };
    }, [role, companyName, companyStyle, companyTier, type, roleLevel, mode, topicFocus, reconnectTrigger]);

    // Send candidate answer
    const handleSend = () => {
        const text = inputVal.trim();
        if (!text || isInputBlocked || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        // Immediately pause any ongoing audio & clear queue
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
        audioQueueRef.current = [];
        isPlayingRef.current = false;
        setIsSpeaking(false);

        // Append to local message feed
        setMessages(prev => [...prev, { role: "candidate", content: text }]);
        setInputVal("");
        setIsTextareaExpanded(false);
        if (textareaRef.current) {
            textareaRef.current.style.height = codingMode ? "56px" : "76px";
        }
        setIsThinking(true);
        setIsInputBlocked(true);
        scrollToBottom(true);

        // Send over WebSocket
        wsRef.current.send(text);
    };

    // Submit Code & Explanation from Monaco Editor
    const handleSubmitCode = () => {
        if (!codeVal.trim() || isInputBlocked || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        // Immediately pause any ongoing audio & clear queue
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
        audioQueueRef.current = [];
        isPlayingRef.current = false;
        setIsSpeaking(false);

        const codeMarkdown = `\`\`\`${language}\n${codeVal}\n\`\`\``;
        const fullSubmission = inputVal.trim()
            ? `${inputVal.trim()}\n\n${codeMarkdown}`
            : codeMarkdown;

        setMessages(prev => [...prev, { role: "candidate", content: fullSubmission }]);
        setInputVal("");
        setIsTextareaExpanded(false);
        if (textareaRef.current) {
            textareaRef.current.style.height = codingMode ? "56px" : "76px";
        }
        setIsThinking(true);
        setIsInputBlocked(true);
        scrollToBottom(true);

        wsRef.current.send(fullSubmission);
    };

    // Conclude Interview and Transition to Scorecard when user clicks button
    const handleViewScorecard = () => {
        if (!feedbackData) return;

        // Gracefully stop audio
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
        audioQueueRef.current = [];
        isPlayingRef.current = false;
        setIsSpeaking(false);

        onEndRef.current(feedbackData.score, feedbackData.feedback, feedbackData.scorecard);
    };

    // Wrap Up Early
    const handleConcludeEarly = () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        // Immediately pause any ongoing audio & clear queue
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
        audioQueueRef.current = [];
        isPlayingRef.current = false;
        setIsSpeaking(false);

        setIsInputBlocked(true);
        setIsConcluding(true);
        wsRef.current.send(JSON.stringify({ action: "conclude_early" }));
    };

    const modeBadge = mode === "quick_drill"
        ? "⚡ Quick Drill"
        : mode === "topic_drill"
            ? `🧠 ${topicFocus ? topicFocus.toUpperCase() : "Topic Focus"}`
            : "🎯 Full Realistic Mock";

    return (
        <div style={{ height: "calc(100vh - 32px)", display: "flex", flexDirection: "column", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-default)" }}>
            {/* Top Controls & Status Bar */}
            <div
                style={{
                    padding: "14px 20px",
                    background: "var(--bg-card)",
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px"
                }}
            >
                {/* Left: Role, Company & Mode Badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        background: "var(--brand-glow)", display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--brand)"
                    }}>
                        <Bot size={18} />
                    </div>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--fg-primary)" }}>
                                {role} Interview
                            </span>
                            <span style={{
                                fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "100px",
                                background: "rgba(59, 130, 246, 0.1)", color: "var(--brand)", border: "1px solid rgba(59, 130, 246, 0.2)"
                            }}>
                                {modeBadge}
                            </span>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>
                            Targeting: <strong style={{ color: "var(--fg-secondary)" }}>{company?.name || "Company"}</strong> • {roleLevel.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Center: Live Audio Waveform & Timer */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {/* Live Speaking Indicator */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "16px" }}>
                            <span style={{
                                width: "3px", height: isSpeaking ? "16px" : "4px", borderRadius: "2px",
                                background: isSpeaking ? "var(--brand)" : "var(--fg-muted)",
                                transition: "all 0.2s ease"
                            }} />
                            <span style={{
                                width: "3px", height: isSpeaking ? "20px" : "6px", borderRadius: "2px",
                                background: isSpeaking ? "var(--brand)" : "var(--fg-muted)",
                                transition: "all 0.2s ease"
                            }} />
                            <span style={{
                                width: "3px", height: isSpeaking ? "12px" : "4px", borderRadius: "2px",
                                background: isSpeaking ? "var(--brand)" : "var(--fg-muted)",
                                transition: "all 0.2s ease"
                            }} />
                        </div>
                        <span style={{ fontSize: "0.75rem", color: isSpeaking ? "var(--brand)" : "var(--fg-muted)", fontWeight: 600 }}>
                            {isSpeaking ? "Interviewer Speaking..." : isThinking ? "Interviewer Thinking..." : "Listening"}
                        </span>
                    </div>

                    {/* Timer */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "var(--bg-elevated)", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                        <Clock size={13} style={{ color: "var(--fg-muted)" }} />
                        <LiveTimer />
                    </div>

                    {/* Question Count Meter & Current Phase */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--fg-secondary)" }}>
                            Question <span style={{ color: "var(--brand)" }}>{Math.min(questionCount, totalQuestions)}</span> of {totalQuestions}
                        </div>
                        {currentPhase && (
                            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold text-purple-300 bg-purple-950/70 border border-purple-800/60 shadow-sm">
                                <Layers size={11} className="text-purple-400" />
                                <span>{currentPhase}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Actions: Mute Audio, Toggle Code Editor, Wrap Up Early */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* Audio Mute Button */}
                    <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        className="btn btn-ghost btn-icon"
                        title={isMuted ? "Unmute Interviewer Audio" : "Mute Interviewer Audio"}
                        style={{ color: isMuted ? "var(--accent-rose)" : "var(--fg-secondary)" }}
                    >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>

                    {/* Toggle Code Editor */}
                    <button
                        type="button"
                        onClick={() => setCodingMode(!codingMode)}
                        className="btn"
                        style={{
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            border: `1px solid ${codingMode ? "var(--brand)" : "var(--border-subtle)"}`,
                            background: codingMode ? "rgba(59, 130, 246, 0.1)" : "var(--bg-surface)",
                            color: codingMode ? "var(--brand)" : "var(--fg-secondary)"
                        }}
                    >
                        <Code2 size={14} />
                        <span>{codingMode ? "Hide Editor" : "Code Editor"}</span>
                    </button>

                    {/* Wrap Up or View Scorecard Action */}
                    {feedbackData ? (
                        <button
                            type="button"
                            onClick={handleViewScorecard}
                            className="btn btn-primary"
                            style={{
                                padding: "6px 14px",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                boxShadow: "0 0 16px rgba(59, 130, 246, 0.4)",
                                border: "none"
                            }}
                            title="View your final performance scorecard and 360 feedback"
                        >
                            <Award size={14} />
                            <span>View Scorecard 🏆</span>
                        </button>
                    ) : isConcluding ? (
                        <button
                            type="button"
                            disabled
                            className="btn btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.78rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}
                        >
                            <Loader2 size={13} className="animate-spin" />
                            <span>Generating Scorecard...</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleConcludeEarly}
                            disabled={isInputBlocked || messages.length < 2}
                            className="btn btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.78rem", fontWeight: 600 }}
                            title="Conclude interview now and review complete scorecard"
                        >
                            Wrap Up & Review
                        </button>
                    )}
                </div>
            </div>

            {/* Rate Limit Warning if reached */}
            {rateLimitMessage && (
                <div style={{ padding: "10px 20px", background: "rgba(244, 63, 94, 0.15)", borderBottom: "1px solid var(--accent-rose)", color: "var(--accent-rose)", fontSize: "0.85rem", fontWeight: 600 }}>
                    {rateLimitMessage}
                </div>
            )}

            {/* Main Area: Adaptive Split-Screen Layout */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
                {/* Left Panel: Conversational Chat */}
                <div
                    style={{
                        flex: codingMode ? "0 0 50%" : "1 1 100%",
                        display: "flex",
                        flexDirection: "column",
                        background: "var(--bg-base)",
                        borderRight: codingMode ? "1px solid var(--border-default)" : "none",
                        transition: "flex 0.2s ease",
                        minHeight: 0,
                        overflow: "hidden"
                    }}
                >
                    {/* Message Feed */}
                    <div
                        ref={messageFeedRef}
                        data-lenis-prevent
                        onScroll={handleFeedScroll}
                        onWheel={(e) => e.stopPropagation()}
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            overscrollBehavior: "contain",
                            minHeight: 0,
                            padding: "24px 20px",
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >
                        <div style={{ maxWidth: codingMode ? "100%" : "820px", width: "100%", margin: "0 auto" }}>
                            {messages.length === 0 && connectionError && (
                                <div style={{
                                    margin: "40px auto",
                                    maxWidth: "460px",
                                    padding: "24px 20px",
                                    background: "rgba(239, 68, 68, 0.06)",
                                    border: "1px solid rgba(239, 68, 68, 0.2)",
                                    borderRadius: "var(--radius-xl)",
                                    textAlign: "center"
                                }}>
                                    <div style={{
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "50%",
                                        background: "rgba(239, 68, 68, 0.12)",
                                        color: "var(--accent-rose)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 12px"
                                    }}>
                                        <RotateCcw size={20} />
                                    </div>
                                    <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "6px" }}>
                                        Simulation Connection Failed
                                    </h4>
                                    <p style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginBottom: "16px", lineHeight: 1.5 }}>
                                        {connectionError}
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <button
                                            type="button"
                                            onClick={() => setReconnectTrigger(p => p + 1)}
                                            className="btn btn-primary btn-sm"
                                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                                        >
                                            <RotateCcw size={13} /> Retry Connection
                                        </button>
                                        {onBack && (
                                            <button
                                                type="button"
                                                onClick={onBack}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                Back to Setup
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {messages.map((m, idx) => (
                                <ChatMessage
                                    key={idx}
                                    msg={m}
                                    codingMode={codingMode}
                                    isSpeaking={isSpeaking && idx === messages.length - 1}
                                />
                            ))}

                            {/* Real-time Streaming message */}
                            {streamingMessage && (
                                <ChatMessage
                                    msg={{ role: "interviewer", content: streamingMessage }}
                                    codingMode={codingMode}
                                    isSpeaking={isSpeaking}
                                />
                            )}

                            {/* Thinking skeleton */}
                            {isThinking && (
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", color: "var(--fg-muted)", fontSize: "0.85rem" }}>
                                    <Loader2 size={16} className="animate-spin" style={{ color: "var(--brand)" }} />
                                    <span>Interviewer is evaluating your response...</span>
                                </div>
                            )}

                            {/* Concluding status while generating scorecard */}
                            {isConcluding && !feedbackData && (
                                <div
                                    style={{
                                        marginTop: "16px",
                                        padding: "16px 20px",
                                        background: "rgba(59, 130, 246, 0.05)",
                                        border: "1px dashed rgba(59, 130, 246, 0.3)",
                                        borderRadius: "var(--radius-lg)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        color: "var(--fg-secondary)",
                                        fontSize: "0.85rem"
                                    }}
                                >
                                    <Loader2 size={18} className="animate-spin" style={{ color: "var(--brand)" }} />
                                    <span>Synthesizing your interview responses & assembling your 360° scorecard...</span>
                                </div>
                            )}

                            {/* Completed Banner with Dedicated Action Button */}
                            {feedbackData && (
                                <div
                                    style={{
                                        marginTop: "20px",
                                        marginBottom: "16px",
                                        padding: "20px 24px",
                                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
                                        border: "1px solid rgba(59, 130, 246, 0.3)",
                                        borderRadius: "var(--radius-xl)",
                                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "14px"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div
                                            style={{
                                                width: "42px",
                                                height: "42px",
                                                borderRadius: "12px",
                                                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#fff",
                                                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.35)",
                                                flexShrink: 0
                                            }}
                                        >
                                            <Award size={22} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--fg-primary)" }}>
                                                Interview Complete! 🎉
                                            </h4>
                                            <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "var(--fg-secondary)" }}>
                                                Your 360° performance scorecard and hiring verdict are ready.
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", paddingTop: "8px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                                        <div style={{ fontSize: "0.8rem", color: "var(--fg-muted)" }}>
                                            {isSpeaking ? (
                                                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--brand)" }}>
                                                    <span className="animate-pulse">●</span> Interviewer is speaking closing remarks... Listen or view results anytime.
                                                </span>
                                            ) : (
                                                <span>Click below to review your detailed scores, strengths, and Staff-level model answers.</span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleViewScorecard}
                                            className="btn btn-primary"
                                            style={{
                                                padding: "10px 22px",
                                                fontSize: "0.92rem",
                                                fontWeight: 700,
                                                borderRadius: "var(--radius-lg)",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                                                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <span>View Full Scorecard & Feedback</span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Input Bar */}
                    <div
                        style={{
                            padding: "16px 20px",
                            background: "var(--bg-card)",
                            borderTop: "1px solid var(--border-subtle)"
                        }}
                    >
                        <div style={{ maxWidth: codingMode ? "100%" : "820px", width: "100%", margin: "0 auto" }}>
                            {feedbackData ? (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "12px 18px",
                                        background: "rgba(59, 130, 246, 0.08)",
                                        borderRadius: "var(--radius-lg)",
                                        border: "1px solid rgba(59, 130, 246, 0.25)",
                                        gap: "12px",
                                        flexWrap: "wrap"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{
                                            width: "28px", height: "28px", borderRadius: "50%",
                                            background: "rgba(16, 185, 129, 0.15)", color: "#10b981",
                                            display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--fg-primary)", display: "block" }}>
                                                Evaluation Complete • Scorecard Ready
                                            </span>
                                            <span style={{ fontSize: "0.78rem", color: "var(--fg-muted)" }}>
                                                {isSpeaking ? "Interviewer audio concluding in background..." : "Click to view your comprehensive assessment."}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleViewScorecard}
                                        className="btn btn-primary"
                                        style={{
                                            padding: "9px 20px",
                                            fontSize: "0.88rem",
                                            fontWeight: 700,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                                            boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <span>View 360° Scorecard & Results 🏆</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div style={{ position: "relative", display: "flex", gap: "10px", alignItems: "flex-end" }}>
                                        <div style={{ position: "relative", flex: 1, display: "flex" }}>
                                            <textarea
                                                ref={textareaRef}
                                                data-lenis-prevent
                                                onWheel={(e) => {
                                                    // Crucial: Stop event bubbling so Lenis/outer scroll doesn't hijack scroll inside the textarea
                                                    e.stopPropagation();
                                                }}
                                                value={inputVal}
                                                onChange={(e) => setInputVal(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSend();
                                                    }
                                                }}
                                                placeholder={
                                                    isInputBlocked
                                                        ? (isConcluding ? "Interview is wrapping up..." : "Waiting for interviewer...")
                                                        : codingMode
                                                            ? "Type your verbal explanation here, or submit code directly from editor..."
                                                            : "Type your answer here... (Press Enter to send, Shift+Enter for new line)"
                                                }
                                                disabled={isInputBlocked}
                                                className="input"
                                                style={{
                                                    width: "100%",
                                                    resize: "vertical",
                                                    minHeight: codingMode ? "56px" : (isTextareaExpanded ? "340px" : "80px"),
                                                    maxHeight: isTextareaExpanded ? "480px" : "280px",
                                                    overflowY: "auto",
                                                    overscrollBehavior: "contain",
                                                    padding: "12px 38px 12px 14px",
                                                    fontSize: "0.9rem",
                                                    lineHeight: 1.55,
                                                    borderRadius: "var(--radius-lg)",
                                                    scrollbarWidth: "thin",
                                                    scrollbarColor: "rgba(255, 255, 255, 0.25) transparent"
                                                }}
                                            />
                                            {/* Expand/Collapse Toggle Button */}
                                            <button
                                                type="button"
                                                onClick={() => setIsTextareaExpanded(prev => !prev)}
                                                className="btn btn-ghost btn-icon"
                                                title={isTextareaExpanded ? "Collapse Text Box" : "Expand Text Box for Long Answers"}
                                                style={{
                                                    position: "absolute",
                                                    top: "8px",
                                                    right: "8px",
                                                    width: "26px",
                                                    height: "26px",
                                                    padding: 0,
                                                    color: isTextareaExpanded ? "var(--brand)" : "var(--fg-muted)",
                                                    background: "rgba(0, 0, 0, 0.25)",
                                                    borderRadius: "6px"
                                                }}
                                            >
                                                {isTextareaExpanded ? (
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="4 14 10 14 10 20" />
                                                        <polyline points="20 10 14 10 14 4" />
                                                        <line x1="14" y1="10" x2="21" y2="3" />
                                                        <line x1="3" y1="21" x2="10" y2="14" />
                                                    </svg>
                                                ) : (
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="15 3 21 3 21 9" />
                                                        <polyline points="9 21 3 21 3 15" />
                                                        <line x1="21" y1="3" x2="14" y2="10" />
                                                        <line x1="3" y1="21" x2="10" y2="14" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleSend}
                                            disabled={!inputVal.trim() || isInputBlocked}
                                            className="btn btn-primary btn-icon"
                                            style={{
                                                width: "44px",
                                                height: "44px",
                                                borderRadius: "var(--radius-lg)",
                                                flexShrink: 0,
                                                marginBottom: "2px"
                                            }}
                                            title="Send Answer (Enter)"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>

                                    {/* Helper Bar */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px", fontSize: "0.72rem", color: "var(--fg-muted)" }}>
                                        <span>
                                            {inputVal.trim() ? (
                                                <span>
                                                    <strong style={{ color: "var(--fg-primary)" }}>{inputVal.trim().split(/\s+/).filter(Boolean).length}</strong> words • {inputVal.length} chars
                                                </span>
                                            ) : (
                                                <span>Tip: Structure answers using STAR (Situation, Task, Action, Result)</span>
                                            )}
                                        </span>
                                        <span className="hidden sm:inline" style={{ opacity: 0.85 }}>
                                            <kbd style={{ padding: "1px 5px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "4px", fontSize: "0.68rem" }}>Shift</kbd> + <kbd style={{ padding: "1px 5px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "4px", fontSize: "0.68rem" }}>Enter</kbd> for newline
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Adaptive Monaco Code Editor */}
                {codingMode && (
                    <div
                        data-lenis-prevent
                        onWheel={(e) => e.stopPropagation()}
                        style={{
                            flex: "0 0 50%",
                            display: "flex",
                            flexDirection: "column",
                            background: "#1e1e1e",
                            position: "relative",
                            minHeight: 0,
                            overflow: "hidden"
                        }}
                    >
                        {/* Editor Header Toolbar */}
                        <div
                            style={{
                                padding: "10px 16px",
                                background: "#252526",
                                borderBottom: "1px solid #333333",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Code2 size={16} color="var(--accent-cyan)" />
                                <span style={{ fontSize: "0.8rem", color: "#cccccc", fontWeight: 700 }}>
                                    Solution Editor
                                </span>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    style={{
                                        background: "#1e1e1e",
                                        color: "#cccccc",
                                        border: "1px solid #3c3c3c",
                                        borderRadius: "4px",
                                        padding: "4px 8px",
                                        fontSize: "0.75rem",
                                        cursor: "pointer"
                                    }}
                                >
                                    <option value="python">Python</option>
                                    <option value="javascript">JavaScript</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                    <option value="go">Go</option>
                                    <option value="sql">SQL</option>
                                </select>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <button
                                    type="button"
                                    onClick={() => setCodeVal("")}
                                    style={{
                                        background: "transparent",
                                        color: "#888888",
                                        border: "none",
                                        fontSize: "0.75rem",
                                        cursor: "pointer",
                                        padding: "4px 8px"
                                    }}
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitCode}
                                    disabled={!codeVal.trim() || isInputBlocked}
                                    className="btn btn-primary"
                                    style={{
                                        padding: "6px 14px",
                                        fontSize: "0.78rem",
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}
                                >
                                    <span>Submit Code & Explain</span>
                                    <CornerDownLeft size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Monaco Editor Instance */}
                        <div style={{ flex: 1, position: "relative" }}>
                            <Editor
                                height="100%"
                                language={language}
                                theme="vs-dark"
                                value={codeVal}
                                onChange={(val) => setCodeVal(val || "")}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    lineNumbers: "on",
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 4,
                                    wordWrap: "on"
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

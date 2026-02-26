"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { Send, Play, Square, Bot, User, CheckCircle, MessageSquare } from "lucide-react";

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

const TARGET_COMPANIES = [
    "TCS", "Infosys", "Wipro", "HCLTech", "Tech Mahindra", "LTIMindtree", "Mphasis", "Cognizant",
    "Google", "Microsoft", "Amazon", "Apple", "Adobe", "Oracle", "SAP", "Salesforce",
    "Zoho", "Freshworks", "Postman", "BrowserStack", "InMobi",
    "Paytm", "PhonePe", "Razorpay", "Zerodha", "CRED", "Pine Labs", "PolicyBazaar", "Groww",
    "Flipkart", "Meesho", "Swiggy", "Zomato", "Nykaa", "Ola",
    "Fractal Analytics", "Mu Sigma", "Tiger Analytics", "Ksolves", "Mad Street Den",
    "Atlassian", "ServiceNow", "VMware", "Snowflake", "HashiCorp",
    "Dream11", "Nazara Technologies", "Gameskraft", "JetSynthesys",
    "Quick Heal", "Seqrite", "Palo Alto Networks", "CrowdStrike",
    "Intel", "NVIDIA", "Qualcomm", "AMD", "Texas Instruments",
    "Cisco", "Ericsson", "Nokia", "Jio Platforms",
    "Byju's", "Unacademy", "Udaan",
    "Bosch", "Tata Elxsi", "KPIT", "Siemens", "ABB",
    "FIS", "Fiserv", "Oracle Financial Services", "SAP Labs India"
];

export default function InterviewPage() {
    const [sessionId, setSessionId] = useState("");
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [inputVal, setInputVal] = useState("");
    const [isStarted, setIsStarted] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [score, setScore] = useState<number | null>(null);

    // New State for Targeted Input
    const [targetRole, setTargetRole] = useState<string>(TARGET_ROLES[0]);
    const [targetCompany, setTargetCompany] = useState<string>(TARGET_COMPANIES[0]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const startInterview = () => {
        const id = Date.now().toString(); // simple session id
        setSessionId(id);
        setIsStarted(true);
        setIsEnded(false);
        setMessages([]);
        setScore(null);

        // Connect to WebSocket
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const wsUrl = apiUrl.replace("http://", "ws://").replace("https://", "wss://");
        const socket = new WebSocket(`${wsUrl}/interview/ws/${id}?role=${encodeURIComponent(targetRole)}&company=${encodeURIComponent(targetCompany)}`);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.role === "system" && data.content === "Interview Completed.") {
                if (data.score !== undefined) {
                    setScore(data.score);
                }
                setIsEnded(true);
                return;
            }
            setMessages((prev) => [...prev, data]);
        };

        socket.onclose = () => {
            setIsEnded(true);
        };

        setWs(socket);
    };

    const endInterview = () => {
        if (ws) {
            ws.close();
        }
        setIsEnded(true);
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputVal.trim() || !ws) return;

        ws.send(inputVal);
        setMessages((prev) => [...prev, { role: "candidate", content: inputVal }]);
        setInputVal("");
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>
            {/* Dynamic Background */}
            <div
                className="animate-pulse-glow"
                style={{
                    position: "absolute",
                    top: "-15%",
                    right: "-10%",
                    width: "600px",
                    height: "600px",
                    background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 60%)",
                    zIndex: 0,
                    pointerEvents: "none"
                }}
            />

            <Sidebar />

            <main
                style={{
                    marginLeft: "240px",
                    flex: 1,
                    padding: "48px",
                    maxWidth: "calc(100vw - 240px)",
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh"
                }}
            >
                <div
                    className="animate-fade-up"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "24px",
                        flexShrink: 0
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "14px",
                                background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(139,92,246,0.2))",
                                border: "1px solid rgba(16,185,129,0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <MessageSquare size={24} color="#34d399" />
                        </div>
                        <div>
                            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem", fontWeight: 800, color: "#f8fafc", marginBottom: "4px" }}>
                                Mock Interview
                            </h1>
                            <p style={{ color: "#94a3b8", fontSize: "15px" }}>Practice technical questions and get real-time feedback.</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                        {!isStarted ? (
                            <button id="start-interview-btn" onClick={startInterview} className="btn-glow" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}>
                                <Play size={18} /> Start Interview
                            </button>
                        ) : (
                            isEnded ? (
                                <button
                                    onClick={() => { setIsStarted(false); setIsEnded(false); setMessages([]); setScore(null); }}
                                    className="btn-glow"
                                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}
                                >
                                    <Play size={18} /> Start Again
                                </button>
                            ) : (
                                <button
                                    id="end-interview-btn"
                                    onClick={endInterview}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px",
                                        background: "rgba(239, 68, 68, 0.1)",
                                        color: "#ef4444",
                                        border: "1px solid rgba(239, 68, 68, 0.3)",
                                        borderRadius: "8px", cursor: "pointer",
                                    }}
                                >
                                    <Square size={18} /> End Interview
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="glass animate-fade-up-delay-1" style={{ flex: 1, display: "flex", flexDirection: "column", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", minHeight: "400px" }}>

                    {!isStarted ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", padding: "40px", textAlign: "center" }}>
                            <Bot size={48} style={{ marginBottom: "16px", opacity: 0.5, color: "#34d399" }} className="animate-float" />

                            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#f8fafc", marginBottom: "16px" }}>Configure Your Interview</h2>

                            <div style={{ display: "flex", gap: "16px", marginBottom: "24px", maxWidth: "400px", width: "100%", flexDirection: "column", textAlign: "left" }}>
                                <div>
                                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>What role are you applying for?</label>
                                    <select
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        style={{ width: "100%", background: "rgba(15, 23, 42, 0.4)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", color: "#fff", outline: "none", appearance: "none" }}
                                    >
                                        {TARGET_ROLES.map((r: string, i: number) => (
                                            <option key={i} value={r} style={{ background: "#0f172a", color: "#fff" }}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>Target Company</label>
                                    <select
                                        value={targetCompany}
                                        onChange={(e) => setTargetCompany(e.target.value)}
                                        style={{ width: "100%", background: "rgba(15, 23, 42, 0.4)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", color: "#fff", outline: "none", appearance: "none" }}
                                    >
                                        {TARGET_COMPANIES.map((c: string, i: number) => (
                                            <option key={i} value={c} style={{ background: "#0f172a", color: "#fff" }}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <p style={{ marginTop: "12px" }}>Click <strong style={{ color: "#34d399" }}>Start Interview</strong> in the top right to begin.</p>
                            <p style={{ fontSize: "0.85rem", marginTop: "8px", opacity: 0.7 }}>The AI Interviewer will automatically adjust the difficulty of the 5 questions.</p>
                        </div>
                    ) : (
                        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                            {messages.map((m, idx) => {
                                const isBot = m.role === "interviewer";
                                return (
                                    <div key={idx} style={{
                                        display: "flex",
                                        gap: "12px",
                                        alignSelf: isBot ? "flex-start" : "flex-end",
                                        maxWidth: "80%"
                                    }}>
                                        {isBot && (
                                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <Bot size={20} color="#10b981" />
                                            </div>
                                        )}

                                        <div style={{
                                            background: isBot ? "rgba(30, 41, 59, 0.7)" : "#10b981",
                                            color: isBot ? "#f1f5f9" : "#ffffff",
                                            border: isBot ? "1px solid rgba(148, 163, 184, 0.2)" : "1px solid #10b981",
                                            padding: "16px",
                                            borderRadius: "16px",
                                            borderTopLeftRadius: isBot ? "4px" : "16px",
                                            borderTopRightRadius: !isBot ? "4px" : "16px",
                                            lineHeight: 1.6,
                                            fontSize: "0.95rem",
                                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                        }}>
                                            <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br />') }} />
                                        </div>

                                        {!isBot && (
                                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(148, 163, 184, 0.2)", border: "1px solid rgba(148, 163, 184, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <User size={20} color="#cbd5e1" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />

                            {isEnded && (
                                <div className="animate-fade-up" style={{
                                    marginTop: "20px",
                                    padding: "24px",
                                    borderRadius: "16px",
                                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))",
                                    border: "1px solid rgba(16, 185, 129, 0.3)",
                                    textAlign: "center"
                                }}>
                                    <CheckCircle size={32} color="#10b981" style={{ margin: "0 auto 12px" }} />
                                    <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#10b981", marginBottom: "8px" }}>Interview Completed</h3>
                                    {score !== null ? (
                                        <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#f1f5f9", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "16px" }}>
                                            {score}/100
                                        </div>
                                    ) : (
                                        <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>Check the final summary above for your detailed feedback and score.</p>
                                    )}
                                    <button
                                        onClick={() => { setIsStarted(false); setIsEnded(false); setMessages([]); setScore(null); }}
                                        className="btn-glow"
                                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", marginTop: "8px" }}
                                    >
                                        <Play size={18} /> Start New Interview
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Input Area */}
                    <form
                        onSubmit={sendMessage}
                        style={{
                            padding: "16px",
                            borderTop: "1px solid var(--border)",
                            background: "rgba(15, 23, 42, 0.8)",
                            display: "flex",
                            gap: "12px",
                            opacity: (!isStarted || isEnded) ? 0.5 : 1,
                            pointerEvents: (!isStarted || isEnded) ? "none" : "auto"
                        }}
                    >
                        <input
                            type="text"
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            placeholder="Type your answer..."
                            style={{
                                flex: 1,
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid var(--border)",
                                borderRadius: "12px",
                                padding: "12px 16px",
                                color: "#fff",
                                outline: "none",
                                fontSize: "0.95rem"
                            }}
                            disabled={!isStarted || isEnded}
                        />
                        <button
                            id="send-answer-btn"
                            type="submit"
                            disabled={!inputVal.trim() || !isStarted || isEnded}
                            style={{
                                background: inputVal.trim() ? "#10b981" : "rgba(16, 185, 129, 0.5)",
                                border: "none",
                                borderRadius: "12px",
                                padding: "0 24px",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: inputVal.trim() ? "pointer" : "not-allowed",
                                fontWeight: 600,
                                transition: "all 0.2s"
                            }}
                        >
                            <Send size={18} /> Send Answer
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

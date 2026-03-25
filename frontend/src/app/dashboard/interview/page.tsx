"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { Send, Play, Square, Bot, User, CheckCircle, MessageSquare, Code, Trash2 } from "lucide-react";
import Editor from "@monaco-editor/react";

// ─── roles.ts ───────────────────────────────────────────────────────────────

const TARGET_ROLES = [
  // Software Engineering
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile App Developer (Android)",
  "Mobile App Developer (iOS)",

  // Data & AI
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "Deep Learning Engineer",
  "Generative AI / LLM Engineer",
  "Computer Vision Engineer",
  "NLP Engineer",
  "MLOps Engineer",
  "Data Engineer",

  // Infrastructure & Cloud
  "DevOps Engineer",
  "Site Reliability Engineer (SRE)",
  "Cloud Engineer",
  "Cloud Architect",

  // Security
  "Cybersecurity Analyst",
  "Security Engineer",
  "Penetration Tester",

  // Product & Design
  "Product Manager",
  "Technical Product Manager",
  "UI/UX Designer",

  // Specialized Engineering
  "Blockchain Developer",
  "Game Developer",
  "AR/VR Developer",
  "Embedded Systems / IoT Engineer",
  "Robotics & Automation Engineer",
  "QA / Test Engineer",
  "Solutions Architect",
  "Research Engineer",
] as const;

type TargetRole = (typeof TARGET_ROLES)[number];


// ─── companies.ts ────────────────────────────────────────────────────────────

type CompanyTier = "FAANG" | "top-indian-product" | "indian-service" | "fintech" | "mid-product" | "hardware" | "gaming" | "security" | "other";

interface CompanyProfile {
  name: string;
  tier: CompanyTier;
  interviewStyle: string;   // injected into agent system_message
  active: boolean;          // set false for bankrupt/layoff-heavy companies
}

const COMPANY_PROFILES: CompanyProfile[] = [
  // ── FAANG / Big Tech ──────────────────────────────────────────────────────
  { name: "Google",     tier: "FAANG", active: true,
    interviewStyle: "LC-hard DSA, system design at Google scale, Googleyness culture fit" },
  { name: "Microsoft",  tier: "FAANG", active: true,
    interviewStyle: "LC-medium/hard DSA, design interviews, growth mindset behavioral questions" },
  { name: "Amazon",     tier: "FAANG", active: true,
    interviewStyle: "Leadership Principles (STAR format), LC-medium DSA, bar raiser round" },
  { name: "Apple",      tier: "FAANG", active: true,
    interviewStyle: "Deep domain expertise, practical coding, attention to quality & craft" },
  { name: "Adobe",      tier: "FAANG", active: true,
    interviewStyle: "LC-medium DSA, system design, past project deep-dives" },
  { name: "Oracle",     tier: "FAANG", active: true,
    interviewStyle: "Strong CS fundamentals, database internals, LC-medium coding" },
  { name: "Salesforce", tier: "FAANG", active: true,
    interviewStyle: "SaaS product thinking, LC-medium DSA, Ohana culture values" },
  { name: "SAP",        tier: "FAANG", active: true,
    interviewStyle: "Enterprise software design, LC-easy/medium, solution architecture" },

  // ── Top Indian Product ────────────────────────────────────────────────────
  { name: "Zerodha",     tier: "top-indian-product", active: true,
    interviewStyle: "No-fluff practical coding, system reliability, fintech domain depth" },
  { name: "Razorpay",    tier: "top-indian-product", active: true,
    interviewStyle: "Payments infrastructure, LC-medium DSA, high ownership culture" },
  { name: "CRED",        tier: "top-indian-product", active: true,
    interviewStyle: "Product intuition + engineering depth, LC-medium, premium UX sensibility" },
  { name: "PhonePe",     tier: "top-indian-product", active: true,
    interviewStyle: "Distributed systems, UPI/payments domain, LC-medium DSA" },
  { name: "Groww",       tier: "top-indian-product", active: true,
    interviewStyle: "Fintech product depth, LC-medium, fast-paced startup ownership" },
  { name: "Postman",     tier: "top-indian-product", active: true,
    interviewStyle: "API-first thinking, developer tooling depth, LC-medium coding" },
  { name: "BrowserStack",tier: "top-indian-product", active: true,
    interviewStyle: "Testing infra, cloud architecture, LC-medium, cross-browser expertise" },
  { name: "Freshworks",  tier: "top-indian-product", active: true,
    interviewStyle: "SaaS product design, LC-medium DSA, customer-centric engineering" },
  { name: "Zoho",        tier: "top-indian-product", active: true,
    interviewStyle: "Strong CS fundamentals, practical coding, product breadth awareness" },

  // ── E-commerce & Consumer ─────────────────────────────────────────────────
  { name: "Flipkart",  tier: "mid-product", active: true,
    interviewStyle: "LC-medium/hard DSA, e-commerce scale system design, strong backend depth" },
  { name: "Swiggy",    tier: "mid-product", active: true,
    interviewStyle: "Real-time logistics systems, LC-medium DSA, high-growth ops thinking" },
  { name: "Zomato",    tier: "mid-product", active: true,
    interviewStyle: "Hyperlocal platform design, LC-medium, product + engineering hybrid" },
  { name: "Meesho",    tier: "mid-product", active: true,
    interviewStyle: "Social commerce, LC-medium, frugal engineering & scale" },
  { name: "Ola",       tier: "mid-product", active: true,
    interviewStyle: "Geo/maps systems, LC-medium DSA, mobility platform design" },
  { name: "Nykaa",     tier: "mid-product", active: true,
    interviewStyle: "E-commerce fundamentals, LC-easy/medium, D2C product thinking" },
  { name: "InMobi",    tier: "mid-product", active: true,
    interviewStyle: "Ad-tech systems, LC-medium, real-time bidding platform knowledge" },
  { name: "Paytm",     tier: "mid-product", active: true,
    interviewStyle: "Payments + super-app design, LC-medium, high-throughput systems" },
  { name: "Pine Labs",  tier: "fintech",    active: true,
    interviewStyle: "POS/payments infrastructure, LC-medium, embedded fintech knowledge" },
  { name: "PolicyBazaar", tier: "fintech",  active: true,
    interviewStyle: "Insurance-tech, LC-medium DSA, full-stack product engineering" },

  // ── IT Services ───────────────────────────────────────────────────────────
  { name: "TCS",          tier: "indian-service", active: true,
    interviewStyle: "Core CS fundamentals, easy/medium coding, communication skills" },
  { name: "Infosys",      tier: "indian-service", active: true,
    interviewStyle: "Aptitude + core CS, LC-easy coding, problem-solving articulation" },
  { name: "Wipro",        tier: "indian-service", active: true,
    interviewStyle: "Core CS + OOPS, LC-easy, project experience discussion" },
  { name: "HCLTech",      tier: "indian-service", active: true,
    interviewStyle: "Technical fundamentals, easy coding, domain-specific knowledge" },
  { name: "Tech Mahindra",tier: "indian-service", active: true,
    interviewStyle: "Core CS, easy DSA, networking/telecom domain awareness" },
  { name: "LTIMindtree",  tier: "indian-service", active: true,
    interviewStyle: "Full stack fundamentals, LC-easy/medium, delivery mindset" },
  { name: "Cognizant",    tier: "indian-service", active: true,
    interviewStyle: "Core CS, easy coding rounds, client-facing communication" },
  { name: "Mphasis",      tier: "indian-service", active: true,
    interviewStyle: "Fintech-adjacent CS basics, easy DSA, cloud fundamentals" },

  // ── Hardware / Semiconductor ──────────────────────────────────────────────
  { name: "NVIDIA",             tier: "hardware", active: true,
    interviewStyle: "GPU architecture, parallel computing, CUDA, LC-hard DSA" },
  { name: "Intel",              tier: "hardware", active: true,
    interviewStyle: "Computer architecture, low-level programming, LC-medium/hard" },
  { name: "Qualcomm",           tier: "hardware", active: true,
    interviewStyle: "Embedded systems, DSP/signal processing, LC-medium coding" },
  { name: "Texas Instruments",  tier: "hardware", active: true,
    interviewStyle: "Embedded C, real-time OS, circuit-level problem solving" },
  { name: "Tata Elxsi",         tier: "hardware", active: true,
    interviewStyle: "Embedded + automotive, AUTOSAR knowledge, LC-easy/medium" },
  { name: "KPIT",               tier: "hardware", active: true,
    interviewStyle: "Automotive software, MISRA C, CAN/LIN protocols, domain depth" },

  // ── Security ──────────────────────────────────────────────────────────────
  { name: "Palo Alto Networks", tier: "security", active: true,
    interviewStyle: "Network security, threat modeling, LC-medium, SIEM/SOAR knowledge" },
  { name: "CrowdStrike",        tier: "security", active: true,
    interviewStyle: "Endpoint detection, threat hunting, LC-medium, incident response" },
  { name: "Quick Heal / Seqrite", tier: "security", active: true,
    interviewStyle: "AV/EDR fundamentals, malware analysis basics, LC-easy/medium" },

  // ── Analytics / AI Services ───────────────────────────────────────────────
  { name: "Fractal Analytics", tier: "other", active: true,
    interviewStyle: "ML case studies, statistics depth, LC-medium, business problem framing" },
  { name: "Mu Sigma",          tier: "other", active: true,
    interviewStyle: "Analytics consulting, data storytelling, LC-easy, case interviews" },

  // ── Telecom / Infra ───────────────────────────────────────────────────────
  { name: "Jio Platforms", tier: "other", active: true,
    interviewStyle: "Telecom-scale systems, LC-medium, network + cloud convergence" },
  { name: "Cisco",         tier: "other", active: true,
    interviewStyle: "Networking protocols, LC-medium, distributed systems" },

  // ── Inactive (layoffs / shutdown — hidden from UI) ────────────────────────
  { name: "Byju's",     tier: "other", active: false, interviewStyle: "" },
  { name: "Unacademy",  tier: "other", active: false, interviewStyle: "" },
] as const;

// Only active companies shown in dropdown
const TARGET_COMPANIES = COMPANY_PROFILES
  .filter(c => c.active)
  .map(c => c.name);

// Helper for agent injection
function getCompanyInterviewStyle(companyName: string): string {
  const profile = COMPANY_PROFILES.find(c => c.name === companyName);
  return profile?.interviewStyle ?? "balanced mix of DSA, system design, and behavioral questions";
}

export default function InterviewPage() {
    const [sessionId, setSessionId] = useState("");
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [inputVal, setInputVal] = useState("");
    const [isStarted, setIsStarted] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [score, setScore] = useState<number | null>(null);

    // New State for Targeted Input
    const [targetRole, setTargetRole] = useState<TargetRole>(TARGET_ROLES[0]);
    const [targetCompany, setTargetCompany] = useState<string>(TARGET_COMPANIES[0]);
    
    // Live Coding State
    const [codingMode, setCodingMode] = useState<boolean>(false);
    const [codingLanguage, setCodingLanguage] = useState<string>("python");
    const [codeVal, setCodeVal] = useState<string | undefined>("// Write your code here...\n");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const stopCurrentAudio = () => {
        const activeAudio = currentAudioRef.current;
        if (!activeAudio) return;

        activeAudio.pause();
        activeAudio.currentTime = 0;
        activeAudio.src = "";
        currentAudioRef.current = null;
    };

    const playIncomingAudio = async (audioBase64: string) => {
        stopCurrentAudio();

        const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
        audio.onended = () => {
            if (currentAudioRef.current === audio) {
                currentAudioRef.current = null;
            }
        };
        currentAudioRef.current = audio;

        try {
            await audio.play();
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }
            console.error("Audio play failed:", error);
        }
    };

    useEffect(() => {
        return () => {
            stopCurrentAudio();
        };
    }, []);

    const canSendMessage = Boolean(
        inputVal.trim() || (codingMode && codeVal && codeVal.trim() !== "// Write your code here...\n" && codeVal.trim() !== "// Write your code here...")
    );

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
                stopCurrentAudio();
                setIsEnded(true);
                return;
            }
            if (data.audio) {
                void playIncomingAudio(data.audio);
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
        stopCurrentAudio();
        setIsEnded(true);
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Either sending text input OR appending code explicitly
        let contentToSend = inputVal.trim();
        
        if (!contentToSend && !ws) return;
        
        if (codingMode && codeVal && codeVal.trim() !== "// Write your code here...") {
            if (contentToSend) {
                contentToSend += "\n\n```" + codingLanguage + "\n" + codeVal + "\n```";
            } else {
                contentToSend = "```" + codingLanguage + "\n" + codeVal + "\n```";
            }
        }

        if (!contentToSend) return;

        ws!.send(contentToSend);
        setMessages((prev) => [...prev, { role: "candidate", content: contentToSend }]);
        setInputVal("");
    };

    return (
        <div className="dashboard-root" style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>
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
                    className="animate-fade-up interview-header"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "24px",
                        flexShrink: 0,
                        flexWrap: "wrap",
                        gap: "12px",
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
                            <button suppressHydrationWarning id="start-interview-btn" onClick={startInterview} className="btn-glow" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}>
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
                                        suppressHydrationWarning
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value as TargetRole)}
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
                                        suppressHydrationWarning
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
                            <p style={{ fontSize: "0.85rem", marginTop: "8px", opacity: 0.7 }}>The AI Interviewer will automatically adjust the difficulty across all 7 questions.</p>
                        </div>
                    ) : (
                        <div style={{ flex: 1, overflow: "hidden", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Inner flex layout for Coding View if enabled */}
                            <div style={{ display: "flex", flex: 1, gap: "20px", flexDirection: codingMode ? "row" : "column", minHeight: 0 }}>
                                
                                {/* Chat Section */}
                                <div className="chat-scrollbar" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", paddingRight: codingMode ? "10px" : "0" }}>
                                    {messages.map((m, idx) => {
                                        const isBot = m.role === "interviewer";
                                        return (
                                            <div key={idx} style={{
                                                display: "flex",
                                                gap: "12px",
                                                alignSelf: isBot ? "flex-start" : "flex-end",
                                                maxWidth: codingMode ? "100%" : "80%"
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
                                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                    overflow: "hidden"
                                                }}>
                                                    {/* simple regex replace or Markdown parser for code snippets would be ideal, but for now we render HTML safely or use simple pre tags */}
                                                    <div style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: m.content.replace(/```(?:python|java|cpp|c\+\+|javascript)\n([\s\S]*?)```/gi, '<br/><pre style="background:rgba(0,0,0,0.3);padding:10px;border-radius:6px;overflow-x:auto;"><code>$1</code></pre><br/>').replace(/\n/g, '<br />') }} />
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
                                </div>

                                {/* Coding Section */}
                                {codingMode && (
                                    <div className="animate-fade-up-delay-1" style={{ flex: 1, display: "flex", flexDirection: "column", borderLeft: "1px solid var(--border)", paddingLeft: "16px", overflow: "hidden" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#60a5fa" }}>
                                                <Code size={16} />
                                                <span style={{ fontSize: "14px", fontWeight: 600 }}>Code Editor</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <select
                                                    value={codingLanguage}
                                                    onChange={(e) => setCodingLanguage(e.target.value)}
                                                    style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid var(--border)", borderRadius: "6px", padding: "4px 8px", color: "#fff", outline: "none", fontSize: "12px", cursor: "pointer" }}
                                                >
                                                    <option value="python">Python</option>
                                                    <option value="java">Java</option>
                                                    <option value="cpp">C++</option>
                                                    <option value="javascript">JavaScript</option>
                                                </select>
                                                <button
                                                    onClick={() => setCodeVal("// Write your code here...\n")}
                                                    title="Clear Code"
                                                    style={{
                                                        background: "rgba(239, 68, 68, 0.1)",
                                                        border: "1px solid rgba(239, 68, 68, 0.3)",
                                                        borderRadius: "6px",
                                                        padding: "4px 8px",
                                                        color: "#ef4444",
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, minHeight: 0, borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(148,163,184,0.15)" }}>
                                            <Editor
                                                height="100%"
                                                language={codingLanguage}
                                                theme="vs-dark"
                                                value={codeVal}
                                                onChange={(val) => setCodeVal(val)}
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: 14,
                                                    scrollBeyondLastLine: false,
                                                    padding: { top: 16 }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

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
                        {isStarted && !isEnded && (
                            <button
                                type="button"
                                onClick={() => setCodingMode(!codingMode)}
                                title={codingMode ? "Close Code Editor" : "Open Code Editor"}
                                style={{
                                    background: codingMode ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.05)",
                                    border: codingMode ? "1px solid #3b82f6" : "1px solid var(--border)",
                                    borderRadius: "12px",
                                    padding: "0 16px",
                                    color: codingMode ? "#60a5fa" : "var(--text-muted)",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.3s"
                                }}
                            >
                                <Code size={20} />
                            </button>
                        )}
                        <input
                            suppressHydrationWarning
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
                            suppressHydrationWarning
                            id="send-answer-btn"
                            type="submit"
                            disabled={!canSendMessage || !isStarted || isEnded}
                            style={{
                                background: canSendMessage ? "#10b981" : "rgba(16, 185, 129, 0.5)",
                                border: "none",
                                borderRadius: "12px",
                                padding: "0 24px",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: canSendMessage ? "pointer" : "not-allowed",
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

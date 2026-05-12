"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { Send, Play, Square, Bot, User, CheckCircle, MessageSquare, Code, Trash2, Clock, Star, History, X } from "lucide-react";
import Editor from "@monaco-editor/react";
import { getInterviewHistory, deleteInterview } from "@/services/api";


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

type CompanyTier = "FAANG" | "top-indian-product" | "indian-service" | "fintech" | "mid-product" | "hardware" | "gaming" | "security" | "hft" | "other";

interface CompanyProfile {
    name: string;
    tier: CompanyTier;
    interviewStyle: string;   // injected into agent system_message
    active: boolean;          // set false for bankrupt/layoff-heavy companies
}

const COMPANY_PROFILES: CompanyProfile[] = [
    // ── FAANG / Big Tech ──────────────────────────────────────────────────────
    {
        name: "Google", tier: "FAANG", active: true,
        interviewStyle: "LC-hard DSA (graph/trie/dp optimizations), 4-system design rounds with Google-scale distributed systems, Googleyness + leadership, 'how would you design YouTube search?'"
    },
    {
        name: "Microsoft", tier: "FAANG", active: true,
        interviewStyle: "LC-medium/hard (tree/array manipulations), 2 design interviews (low-level + high-level), growth mindset: 'tell me about a time you failed and learned', possible 'how does Windows scheduler work?'"
    },
    {
        name: "Amazon", tier: "FAANG", active: true,
        interviewStyle: "5 Leadership Principles rounds (STAR grilled hard), LC-medium DSA but tricky edge cases, Bar Raiser will ask 'design Amazon's inventory system at 1M orders/sec'"
    },
    {
        name: "Apple", tier: "FAANG", active: true,
        interviewStyle: "Deep domain expertise (ARM/Metal/Swift depending on team), practical coding on Xcode, 'how would you improve iPhone battery life by 10%?', quality obsession"
    },
    {
        name: "Adobe", tier: "FAANG", active: true,
        interviewStyle: "LC-medium with creative twist (image processing algos), system design for creative cloud, deep-dive into past projects: 'how did you optimize that O(n²) solution?'"
    },
    {
        name: "Oracle", tier: "FAANG", active: true,
        interviewStyle: "Database internals deep-dive (B+ trees, MVCC, query optimization), LC-medium (SQL-heavy sometimes), 'design a distributed transaction coordinator'"
    },
    {
        name: "Salesforce", tier: "FAANG", active: true,
        interviewStyle: "LC-medium (multithreading often), multi-tenant SaaS design, Ohana values: 'how do you mentor juniors?', Apex/triggers knowledge plus"
    },
    {
        name: "SAP", tier: "FAANG", active: true,
        interviewStyle: "Enterprise integration puzzles, LC-easy/medium (ABAP or Java), solution architecture: 'design a supply chain demand forecasting module'"
    },
    {
        name: "Meta", tier: "FAANG", active: true,
        interviewStyle: "LC-hard (graph BFS/DFS with optimizations 45min), system design for social graph: 'design Facebook friend recommendation', behavioral: move fast culture"
    },
    {
        name: "Netflix", tier: "FAANG", active: true,
        interviewStyle: "Culture-fit heavy (freedom & responsibility), system design for chaos engineering, fault tolerance, LC-hard DP, 'how would you design Netflix's CDN?'"
    },
    {
        name: "Uber", tier: "FAANG", active: true,
        interviewStyle: "LC-hard (geospatial + priority queues), real-time dispatch: 'design Uber eats matching at 50k orders/min', strong distributed systems with circuit breakers"
    },
    {
        name: "Airbnb", tier: "FAANG", active: true,
        interviewStyle: "Front-end React/Backend distributed, LC-medium/hard with product sense: 'design a pricing recommendation engine', pixel-perfect expectation"
    },
    {
        name: "Atlassian", tier: "FAANG", active: true,
        interviewStyle: "Pair programming live (they code with you), LC-medium (Jira-like ticket system design), 'how would you add real-time collaboration to Confluence?'"
    },

    // ── Top Indian Product ────────────────────────────────────────────────────
    {
        name: "Zerodha", tier: "top-indian-product", active: true,
        interviewStyle: "No-fluff: live trading system design, idempotency of orders, fintech depth: 'how to prevent double debit?', LC-medium (but practical only)"
    },
    {
        name: "Razorpay", tier: "top-indian-product", active: true,
        interviewStyle: "Payments webhook reliability, idempotency keys, 'design a fraud detection rule engine', LC-medium with concurrency questions"
    },
    {
        name: "CRED", tier: "top-indian-product", active: true,
        interviewStyle: "Premium app design, 'reverse engineer our referral leaderboard', LC-medium, product intuition: 'why does CRED use gamification?'"
    },
    {
        name: "PhonePe", tier: "top-indian-product", active: true,
        interviewStyle: "UPI switch design, transaction reconciliation at scale, LC-medium DSA (sliding window problems), 'design a bill payment reminder system'"
    },
    {
        name: "Groww", tier: "top-indian-product", active: true,
        interviewStyle: "Mutual fund order routing, 'design a stock price ticker at 100ms latency', LC-medium, startup ownership: 'describe your fastest feature launch'"
    },
    {
        name: "Postman", tier: "top-indian-product", active: true,
        interviewStyle: "API lifecycle depth, 'design a request mock server with matching rules', LC-medium, developer tooling: 'how to improve API collection runner?'"
    },
    {
        name: "BrowserStack", tier: "top-indian-product", active: true,
        interviewStyle: "Browser VM orchestration, 'design a parallel test execution framework', LC-medium, cross-browser quirks knowledge expected"
    },
    {
        name: "Freshworks", tier: "top-indian-product", active: true,
        interviewStyle: "SaaS multi-tenant data isolation, LC-medium, 'design a ticket SLA escalation engine', customer-centric metrics"
    },
    {
        name: "Zoho", tier: "top-indian-product", active: true,
        interviewStyle: "Strong CS fundamentals (OS + DBMS grilled), practical low-level design, 'build a mini Excel formula parser', LC-easy but thorough"
    },
    {
        name: "Ola Electric", tier: "top-indian-product", active: true,
        interviewStyle: "IoT + EV telemetry processing, 'design a battery health prediction system', LC-medium, hardware-software integration"
    },
    {
        name: "Unacademy", tier: "top-indian-product", active: true,
        interviewStyle: "Ed-tech content delivery, 'design a live class recording system', LC-medium, CDN caching strategies"
    },
    {
        name: "ShareChat", tier: "top-indian-product", active: true,
        interviewStyle: "Social media at India-scale, 'design a viral feed for regional languages', LC-medium/hard with recommendation basics"
    },

    // ── E-commerce & Consumer ─────────────────────────────────────────────────
    {
        name: "Flipkart", tier: "mid-product", active: true,
        interviewStyle: "LC-medium/hard (graph + heap), e-commerce scale: 'design Flipkart's Big Billion Days inventory service', warehouse allocation puzzles"
    },
    {
        name: "Swiggy", tier: "mid-product", active: true,
        interviewStyle: "Real-time logistics matching, 'design a delivery agent assignment algorithm with surge', LC-medium DSA, SLA breach handling"
    },
    {
        name: "Zomato", tier: "mid-product", active: true,
        interviewStyle: "Restaurant search ranking, 'design a restaurant discovery with dynamic filters', LC-medium, hyperlocal caching strategies"
    },
    {
        name: "Meesho", tier: "mid-product", active: true,
        interviewStyle: "Social commerce graph, 'design a reseller commission tracking system', LC-medium, frugal engineering with WhatsApp API integration"
    },
    {
        name: "Ola", tier: "mid-product", active: true,
        interviewStyle: "MAPS API integration, 'design a real-time ETA prediction', LC-medium DSA (Dijkstra variations), mobility platform"
    },
    {
        name: "Nykaa", tier: "mid-product", active: true,
        interviewStyle: "Inventory management for beauty, 'design a flash sale checkout system', LC-easy/medium, D2C thinking"
    },
    {
        name: "InMobi", tier: "mid-product", active: true,
        interviewStyle: "Ad-tech real-time bidding (RTB), 'design an ad auction with 100ms SLA', LC-medium, DSP/SSP knowledge plus"
    },
    {
        name: "Paytm", tier: "mid-product", active: true,
        interviewStyle: "Super-app scale: 'design a QR code payment retry logic with idempotency', LC-medium, high-throughput system design"
    },
    {
        name: "Dream11", tier: "mid-product", active: true,
        interviewStyle: "Fantasy sports team validation, 'design a live score updater under 1 sec latency', LC-medium, concurrency + leaderboard"
    },
    {
        name: "Myntra", tier: "mid-product", active: true,
        interviewStyle: "Fashion recommendation engine, 'design a size recommendation system', LC-medium, returns logistics puzzles"
    },

    // ── Fintech ───────────────────────────────────────────────────────────────
    {
        name: "Pine Labs", tier: "fintech", active: true,
        interviewStyle: "POS terminal reconciliation, 'design an offline payment capture system', LC-medium, embedded fintech + EMI logic"
    },
    {
        name: "PolicyBazaar", tier: "fintech", active: true,
        interviewStyle: "Insurance comparison engine, 'design a premium calculation rule engine with 500+ rules', LC-medium, web scraper design"
    },
    {
        name: "JPMorgan", tier: "fintech", active: true,
        interviewStyle: "Object-oriented design for trading platform, LC-medium (core Java/C++), 'design a limit order book', financial derivatives basics"
    },
    {
        name: "Goldman Sachs", tier: "fintech", active: true,
        interviewStyle: "Quant-heavy: DP + math, LC-hard, 'design a risk calculation system for derivatives', low-latency C++ expectations"
    },
    {
        name: "Stripe", tier: "fintech", active: true,
        interviewStyle: "Bug squash round (live debugging), pair programming API design, 'design a webhook delivery system with exponential backoff', high bar"
    },
    {
        name: "PayPal", tier: "fintech", active: true,
        interviewStyle: "Distributed transaction monitoring, LC-medium, 'design a fraud detection rule engine', REST API security deep-dive"
    },
    {
        name: "Coinbase", tier: "fintech", active: true,
        interviewStyle: "Blockchain transaction handling, 'design a crypto wallet with double-spend prevention', LC-medium/hard, Web3 knowledge plus"
    },
    {
        name: "Niyo", tier: "fintech", active: true,
        interviewStyle: "Neobanking international travel card, 'design forex rate alert system', LC-medium, zero-balance account logic"
    },
    {
        name: "BharatPe", tier: "fintech", active: true,
        interviewStyle: "QR code lending, 'design a merchant cash advance repayment tracker', LC-medium, UPI switching insights"
    },

    // ── IT Services ───────────────────────────────────────────────────────────
    {
        name: "TCS", tier: "indian-service", active: true,
        interviewStyle: "NQT style: aptitude + coding, LC-easy (array rotation, string palindrome), 'identify output of this C pointer code', communication"
    },
    {
        name: "Infosys", tier: "indian-service", active: true,
        interviewStyle: "Specialist role: Java concurrency or Spring boot, LC-easy, 'design an employee leave management system', articulation matters"
    },
    {
        name: "Wipro", tier: "indian-service", active: true,
        interviewStyle: "Turbo coding: 2 LC-easy in 30 mins, OOPS concepts grilled, 'explain polymorphism with real example', project walkthrough"
    },
    {
        name: "HCLTech", tier: "indian-service", active: true,
        interviewStyle: "Domain-specific (networking/cloud), LC-easy, 'write SQL query for second highest salary', client handling scenarios"
    },
    {
        name: "Tech Mahindra", tier: "indian-service", active: true,
        interviewStyle: "5G knowledge plus, LC-easy (recursion basics), 'debug this Java code snippet', telecom domain"
    },
    {
        name: "LTIMindtree", tier: "indian-service", active: true,
        interviewStyle: "Full stack basics, LC-easy/medium (two-sum variation), 'design a mini shopping cart REST API', delivery mindset"
    },
    {
        name: "Cognizant", tier: "indian-service", active: true,
        interviewStyle: "Genc next: LC-easy (array + string), 'what happens when you type URL?', client communication simulation"
    },
    {
        name: "Mphasis", tier: "indian-service", active: true,
        interviewStyle: "Fintech adjacent: basic transaction processing, LC-easy, 'design a simple bank account class', cloud basics (AWS EC2)"
    },
    {
        name: "Accenture", tier: "indian-service", active: true,
        interviewStyle: "Agile + cloud basics, LC-easy/medium, 'describe a sprint where you delivered under pressure', consulting scenario"
    },
    {
        name: "IBM", tier: "indian-service", active: true,
        interviewStyle: "Enterprise integration puzzles, LC-easy/medium, 'design a message queue with pub-sub', legacy modernization"
    },
    {
        name: "Capgemini", tier: "indian-service", active: true,
        interviewStyle: "Basic OOPS + database normalization, LC-easy, 'explain 3NF with example', Excel for client communication"
    },
    {
        name: "Deloitte USI", tier: "indian-service", active: true,
        interviewStyle: "Consulting + tech: 'design an expense approval workflow', LC-easy, case interview with ROI calculation"
    },
    {
        name: "PwC India", tier: "indian-service", active: true,
        interviewStyle: "Tech consulting + SAP/oracle, 'how to migrate legacy ERP to cloud?', LC-easy, client pitch simulation"
    },

    // ── Hardware / Semiconductor ──────────────────────────────────────────────
    {
        name: "NVIDIA", tier: "hardware", active: true,
        interviewStyle: "CUDA kernel optimization, 'parallelize matrix multiplication on GPU', LC-hard DSA + memory bandwidth questions"
    },
    {
        name: "Intel", tier: "hardware", active: true,
        interviewStyle: "Cache coherency protocols, 'design a branch predictor', LC-medium/hard with x86 assembly sometimes"
    },
    {
        name: "Qualcomm", tier: "hardware", active: true,
        interviewStyle: "IoT power management, 'design an interrupt handler for sensor', LC-medium, DSP + signal processing"
    },
    {
        name: "Texas Instruments", tier: "hardware", active: true,
        interviewStyle: "Embedded C + RTOS task scheduling, 'design a watchdog timer', circuit-level debugging scenarios"
    },
    {
        name: "Tata Elxsi", tier: "hardware", active: true,
        interviewStyle: "AUTOSAR + CAN bus simulation, 'design a brake-by-wire message handler', LC-easy/medium, ISO 26262 awareness"
    },
    {
        name: "KPIT", tier: "hardware", active: true,
        interviewStyle: "MISRA C compliance, 'design a adaptive cruise control state machine', CAN/LIN protocol deep-dive"
    },
    {
        name: "ARM", tier: "hardware", active: true,
        interviewStyle: "Pipeline hazards and forwarding, 'design a simple 5-stage CPU', LC-hard (bit manipulation heavy)"
    },
    {
        name: "AMD", tier: "hardware", active: true,
        interviewStyle: "RDNA architecture, 'optimize a ray tracing shader', LC-hard + GPU compute model"
    },
    {
        name: "Micron", tier: "hardware", active: true,
        interviewStyle: "Memory controller design, 'solve DDR4 timing constraints', LC-medium, transistor-level basics"
    },

    // ── Security ──────────────────────────────────────────────────────────────
    {
        name: "Palo Alto Networks", tier: "security", active: true,
        interviewStyle: "Network threat modeling with STRIDE, 'design a next-gen firewall rule matcher', LC-medium, SIEM log correlation"
    },
    {
        name: "CrowdStrike", tier: "security", active: true,
        interviewStyle: "Endpoint detection: 'design a behavioral detection engine', EDR event deduplication, LC-medium, incident response playbook"
    },
    {
        name: "Quick Heal / Seqrite", tier: "security", active: true,
        interviewStyle: "Malware signature generation, 'design a heuristic virus detector', LC-easy/medium, PE file parsing"
    },
    {
        name: "Zscaler", tier: "security", active: true,
        interviewStyle: "Zero trust architecture, 'design a SSL inspection proxy', LC-medium, TLS handshake deep-dive"
    },
    {
        name: "Fortinet", tier: "security", active: true,
        interviewStyle: "IPS signature performance, 'design a fast pattern matcher (Aho-Corasick)', LC-hard, network protocols"
    },

    // ── Analytics / AI Services ───────────────────────────────────────────────
    {
        name: "Fractal Analytics", tier: "other", active: true,
        interviewStyle: "ML case study: 'predict customer churn with XGBoost', LC-medium, statistics quiz (p-value, bias-variance)"
    },
    {
        name: "Mu Sigma", tier: "other", active: true,
        interviewStyle: "Analytics consulting: 'solve this business case with data storytelling', LC-easy, guesstimates + logic puzzles"
    },
    {
        name: "Tiger Analytics", tier: "other", active: true,
        interviewStyle: "Python pandas deep-dive, 'optimize a slow data pipeline', LC-medium, A/B testing design"
    },
    {
        name: "LatentView", tier: "other", active: true,
        interviewStyle: "Data visualization insights, 'find anomalies in this sales data', LC-easy, stakeholder presentation mock"
    },

    // ── Telecom / Infra ───────────────────────────────────────────────────────
    {
        name: "Jio Platforms", tier: "other", active: true,
        interviewStyle: "5G core network slicing, 'design a subscriber location registrar', LC-medium, telecom signaling (Diameter/HTTP2)"
    },
    {
        name: "Cisco", tier: "other", active: true,
        interviewStyle: "Routing protocol simulation, 'design a BGP route reflector', LC-medium, TCP state machine questions"
    },
    {
        name: "Nokia", tier: "other", active: true,
        interviewStyle: "OSS/BSS integration, 'design a network alarm correlation engine', LC-medium, SNMP knowledge"
    },
    {
        name: "Ericsson", tier: "other", active: true,
        interviewStyle: "RAN optimization, 'design a handover decision algorithm at 500 km/h', LC-medium, 3GPP spec awareness"
    },
    {
        name: "Airtel", tier: "other", active: true,
        interviewStyle: "Digital transformation: 'design a prepaid recharge stack with 50M users', LC-medium, partner API integration"
    },

    // ── SaaS & Cloud ─────────────────────────────────────────────────────────
    {
        name: "CleverTap", tier: "other", active: true,
        interviewStyle: "User engagement: 'design a push notification throttler at 1M/sec', LC-medium, segmentation engine"
    },
    {
        name: "Chargebee", tier: "other", active: true,
        interviewStyle: "Subscription billing: 'design a proration calculation engine with 200+ plans', LC-medium, idempotent invoicing"
    },
    {
        name: "Wingify", tier: "other", active: true,
        interviewStyle: "A/B testing platform, 'design a feature flag service with 0.1% latency', LC-medium, statistical significance"
    },
    {
        name: "Whatfix", tier: "other", active: true,
        interviewStyle: "Digital adoption platform, 'design an in-app widget position resolver', LC-medium, DOM traversal puzzles"
    },

    // ── Automotive Tech ───────────────────────────────────────────────────────
    {
        name: "Bosch Global Software", tier: "hardware", active: true,
        interviewStyle: "ESP algorithm, 'design a brake pressure estimator', LC-medium, ISO 26262 functional safety"
    },
    {
        name: "Mercedes-Benz R&D India", tier: "hardware", active: true,
        interviewStyle: "MBUX infotainment, 'design a voice command parser with slot filling', LC-medium, HMI design"
    },

    // ── HealthTech ────────────────────────────────────────────────────────────
    {
        name: "Practo", tier: "other", active: true,
        interviewStyle: "Video consultation reliability, 'design a doctor slot booking race condition resolver', LC-medium, HIPAA basics"
    },
    {
        name: "PharmEasy", tier: "other", active: true,
        interviewStyle: "Medicine delivery SLA, 'design a prescription expiry checker', LC-medium, regulatory compliance"
    },

    // ── EdTech ────────────────────────────────────────────────────────────────
    {
        name: "upGrad", tier: "other", active: true,
        interviewStyle: "Assessment platform, 'design a proctoring event collector', LC-medium, anti-cheating heuristics"
    },
    {
        name: "Vedantu", tier: "other", active: true,
        interviewStyle: "Live class whiteboard sync (WebRTC), 'design a hand raise queue manager', LC-medium, realtime signaling"
    },

    // ── Gaming ────────────────────────────────────────────────────────────────
    {
        name: "MPL (Mobile Premier League)", tier: "gaming", active: true,
        interviewStyle: "Game server tick rate, 'design a matchmaking ELO balancer', LC-medium, websocket game sync"
    },
    {
        name: "Nazara Technologies", tier: "gaming", active: true,
        interviewStyle: "Esports tournament bracket generator, 'design a fairness verifier for random draws', LC-medium"
    },

    // ── Proptech ─────────────────────────────────────────────────────────────
    {
        name: "NoBroker", tier: "other", active: true,
        interviewStyle: "Rental property search with polygon filters, 'design a mutual match notification system', LC-medium, geo-spatial index"
    },
    {
        name: "Magicbricks", tier: "other", active: true,
        interviewStyle: "Property valuation model backend, 'design a search with price range slider at 100ms', LC-medium, faceted search"
    },

    // ── Blockchain ────────────────────────────────────────────────────────────
    {
        name: "Polygon", tier: "other", active: true,
        interviewStyle: "zk-rollup transaction batching, 'design a mempool with gas auction', LC-hard, EIP-1559 understanding"
    },
    {
        name: "CoinDCX", tier: "other", active: true,
        interviewStyle: "DEX aggregation, 'design an order book for crypto options', LC-medium/hard, WebSocket API design"
    },
];

// HFT / Trading Firms
COMPANY_PROFILES.push(
    { name: "Jane Street", tier: "hft", active: true, interviewStyle: "OCaml functional + low latency, LC-hard (probabilistic), 'design a betting exchange', market microstructure depth" },
    { name: "Tower Research", tier: "hft", active: true, interviewStyle: "C++ memory pool design, lock-free queues, LC-hard, 'optimize this market data parser for 10 microseconds'" },
    { name: "Quadeye", tier: "hft", active: true, interviewStyle: "Latency arbitrage, LC-hard, 'detect quote stuffing from tick data', C++ template metaprogramming" },
    { name: "Jump Trading", tier: "hft", active: true, interviewStyle: "Verilog + C++ hybrid, 'design a packet sniffer timestamping circuit', LC-hard" },
    { name: "AlphaGrep", tier: "hft", active: true, interviewStyle: "FPGA + software co-design, LC-hard (bit tricks), 'design a risk limiter at nanosecond precision'" }
);

// Only active companies shown in dropdown
const TARGET_COMPANIES = COMPANY_PROFILES
    .filter(c => c.active)
    .map(c => c.name);





function renderMessageContent(content: string): React.ReactNode {
    const codeBlockRegex = /```(?:([a-zA-Z0-9+#-]+)\n)?([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        const textBefore = content.slice(lastIndex, match.index);
        if (textBefore) {
            parts.push(
                <span key={`text-${lastIndex}`} style={{ whiteSpace: "pre-wrap" }}>
                    {textBefore}
                </span>
            );
        }

        parts.push(
            <pre
                key={`code-${match.index}`}
                style={{
                    background: "rgba(0,0,0,0.3)",
                    padding: "10px",
                    borderRadius: "6px",
                    overflowX: "auto",
                    margin: "8px 0",
                    whiteSpace: "pre",
                }}
            >
                <code>{match[2]}</code>
            </pre>
        );

        lastIndex = match.index + match[0].length;
    }

    const textAfter = content.slice(lastIndex);
    if (textAfter) {
        parts.push(
            <span key={`text-${lastIndex}`} style={{ whiteSpace: "pre-wrap" }}>
                {textAfter}
            </span>
        );
    }

    return <>{parts}</>;
}

export default function InterviewPage() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [inputVal, setInputVal] = useState("");
    const [isStarted, setIsStarted] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [score, setScore] = useState<number | null>(null);

    // New State for Targeted Input
    const [targetRole, setTargetRole] = useState<TargetRole>(TARGET_ROLES[0]);
    const [targetCompany, setTargetCompany] = useState<string>(TARGET_COMPANIES[0]);

    // History State
    const [history, setHistory] = useState<any[]>([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    useEffect(() => {
        getInterviewHistory().then(data => {
            if (data.history) {
                setHistory(data.history);
            }
        }).catch(console.error);
    }, []);

    const handleDeleteHistory = async (id: string) => {
        try {
            await deleteInterview(id);
            setHistory(prev => prev.filter(h => h.id !== id));
        } catch (err) {
            console.error("Failed to delete interview:", err);
        }
    };

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
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        const id = Date.now().toString(); // simple session id
        setIsStarted(true);
        setIsEnded(false);
        setMessages([]);
        setScore(null);

        // Connect to WebSocket
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const wsUrl = apiUrl.replace("http://", "ws://").replace("https://", "wss://");
        const companyProfile = COMPANY_PROFILES.find(c => c.name === targetCompany);
        const params = new URLSearchParams({
            role: targetRole,
            company: targetCompany,
            company_style: companyProfile ? companyProfile.interviewStyle : "",
            token,
        });
        const socket = new WebSocket(`${wsUrl}/interview/ws/${id}?${params.toString()}`);

        socket.onmessage = (event) => {
            if (event.data === "__pong__") return;

            try {
                const data = JSON.parse(event.data);
                if (data.role === "system" && data.content === "Interview Completed.") {
                    if (data.score !== undefined) {
                        setScore(data.score);
                    }
                    setIsEnded(true);
                    return;
                }
                // Skip system status messages like "Connected. Preparing..."
                if (data.role === "system") return;
                // Real-time streaming chunks — append to the last interviewer message
                if (data.role === "interviewer_stream") {
                    setMessages((prev) => {
                        const last = prev[prev.length - 1];
                        if (last && last.role === "interviewer_stream") {
                            return [...prev.slice(0, -1), { ...last, content: last.content + data.content }];
                        }
                        return [...prev, { role: "interviewer_stream", content: data.content }];
                    });
                    return;
                }
                if (data.audio) {
                    void playIncomingAudio(data.audio);
                }
                if (data.content && data.role === "interviewer") {
                    // Full message received — replace the streaming placeholder
                    setMessages((prev) => {
                        const filtered = prev.filter(m => m.role !== "interviewer_stream");
                        return [...filtered, data];
                    });
                }
            } catch (e) {
                console.error("Failed to parse message:", e);
            }
        };

        const pingInterval = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send("__ping__");
            }
        }, 20000);

        socket.onclose = () => {
            clearInterval(pingInterval);
            setIsEnded(true);
        };

        setWs(socket);
    };

    // Keep-alive ping mechanism
    useEffect(() => {
        if (!ws) return;

        const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send("__ping__");
            }
        }, 20000); // Send ping every 20 seconds

        return () => clearInterval(pingInterval);
    }, [ws]);

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

        if (!ws) return;

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
                    padding: "32px 48px",
                    maxWidth: "calc(100vw - 240px)",
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    overflow: "hidden"
                }}
            >
                <div
                    className="animate-fade-up interview-header"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "16px",
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
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <p style={{ color: "#94a3b8", fontSize: "15px" }}>Practice technical questions and get real-time feedback.</p>

                            </div>
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

                {/* Chat Area - Terminal Style */}
                <div
                    className="glass animate-fade-up-delay-1"
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "16px",
                        overflow: "hidden",
                        background: "rgba(7, 8, 13, 0.95)",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.05)",
                        position: "relative"
                    }}
                >
                    {/* Terminal Header */}
                    <div style={{
                        padding: "12px 16px",
                        background: "rgba(15, 23, 42, 0.8)",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f56" }}></div>
                            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffbd2e" }}></div>
                            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#27c93f" }}></div>
                        </div>
                        <div style={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: isStarted ? "#10b981" : "#94a3b8", boxShadow: isStarted ? "0 0 8px #10b981" : "none" }}></div>
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "monospace" }}>
                                {isStarted ? `Interview_Session_${targetRole.replace(/\s+/g, '_')}.exe` : 'Secure_Interview_Terminal.exe'}
                            </span>
                        </div>
                        <div style={{ width: "40px" }}></div>
                    </div>

                    {!isStarted ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", padding: "40px", textAlign: "center" }}>
                            <Bot size={48} style={{ marginBottom: "16px", opacity: 0.5, color: "#34d399" }} className="animate-float" />

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "16px" }}>
                                <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#f8fafc", margin: 0 }}>Configure Your Interview</h2>
                                {history.length > 0 && (
                                    <button
                                        onClick={() => setShowHistoryModal(true)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            padding: "8px 12px",
                                            background: "rgba(16, 185, 129, 0.1)",
                                            border: "1px solid rgba(16, 185, 129, 0.2)",
                                            borderRadius: "8px",
                                            color: "#10b981",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <History size={14} /> View Previous Interviews
                                    </button>
                                )}
                            </div>

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
                                        const isBot = m.role === "interviewer" || m.role === "interviewer_stream";
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
                                                    background: isBot ? "rgba(30, 41, 59, 0.4)" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                                    color: isBot ? "#f1f5f9" : "#ffffff",
                                                    border: isBot ? "1px solid rgba(16, 185, 129, 0.2)" : "none",
                                                    padding: "16px 20px",
                                                    borderRadius: "18px",
                                                    borderTopLeftRadius: isBot ? "4px" : "18px",
                                                    borderTopRightRadius: !isBot ? "4px" : "18px",
                                                    lineHeight: 1.6,
                                                    fontSize: "0.95rem",
                                                    boxShadow: isBot ? "none" : "0 8px 16px -4px rgba(16, 185, 129, 0.2)",
                                                    overflow: "hidden",
                                                    backdropFilter: isBot ? "blur(10px)" : "none",
                                                    position: "relative"
                                                }}>
                                                    {isBot && (
                                                        <div style={{
                                                            position: "absolute",
                                                            top: 0,
                                                            left: 0,
                                                            width: "2px",
                                                            height: "100%",
                                                            background: "#10b981",
                                                            opacity: 0.6
                                                        }} />
                                                    )}
                                                    <div style={{ whiteSpace: "pre-wrap" }}>
                                                        {renderMessageContent(m.content)}
                                                    </div>
                                                </div>

                                                {!isBot && (
                                                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(148, 163, 184, 0.2)", border: "1px solid rgba(148, 163, 184, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                        <User size={20} color="#cbd5e1" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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
                                                    {Math.round(score)}/100
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

                        </div>
                    )}

                    {/* Input Area */}
                    <form
                        onSubmit={sendMessage}
                        style={{
                            padding: "20px 24px",
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                            background: "rgba(15, 23, 42, 0.9)",
                            display: "flex",
                            gap: "12px",
                            opacity: (!isStarted || isEnded) ? 0.5 : 1,
                            pointerEvents: (!isStarted || isEnded) ? "none" : "auto",
                            backdropFilter: "blur(10px)"
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
                                background: "rgba(15, 23, 42, 0.6)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "12px",
                                padding: "12px 18px",
                                color: "#f8fafc",
                                outline: "none",
                                fontSize: "0.95rem",
                                transition: "all 0.2s",
                                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
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

                {/* History Modal */}
                {showHistoryModal && (
                    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "500px", maxHeight: "80vh", overflowY: "auto" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f1f5f9" }}>Previous Interviews</h2>
                                <button onClick={() => setShowHistoryModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {history.map((h, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            padding: "16px", background: "rgba(15, 23, 42, 0.6)",
                                            border: "1px solid rgba(148, 163, 184, 0.15)", borderRadius: "10px",
                                            textAlign: "left"
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontSize: "1rem", fontWeight: 600, color: "#f1f5f9" }}>{h.target_role}</p>
                                            <p style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                                                <Clock size={12} /> {new Date(h.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.1)", padding: "6px 12px", borderRadius: "100px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                                            <Star size={14} color="#10b981" />
                                            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#10b981" }}>{h.score ? Math.round(h.score) : 0}/100</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteHistory(h.id); }}
                                            style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#ef4444", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                            title="Delete Interview"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

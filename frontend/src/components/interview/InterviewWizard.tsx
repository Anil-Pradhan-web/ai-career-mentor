"use client";

import React, { useState, useEffect, useRef } from "react";
import { Target, Building2, Zap, Sparkles, Loader2, Play, Search, ChevronDown, ChevronUp, Layers, Code2, Cpu, Users, FileText, CheckCircle2 } from "lucide-react";
import { getMarketConfig } from "@/services/api";

interface Props {
    onStart: (role: string, company: any, type: string, roleLevel: string, mode: string, topicFocus: string) => void;
    loading: boolean;
}

const ROLE_LEVELS = [
    { id: "intern", label: "Intern", desc: "0 yrs — fundamentals & problem solving" },
    { id: "fresher", label: "Fresher", desc: "0–2 yrs — foundational CS & projects" },
    { id: "mid", label: "Mid-Level", desc: "3–6 yrs — system trade-offs & design" },
    { id: "senior", label: "Senior", desc: "7+ yrs — architecture, scale & leadership" },
] as const;

const MODES = [
    {
        id: "quick_drill",
        title: "Quick Drill",
        badge: "⚡ 10 mins",
        desc: "3–4 high-signal technical questions for rapid warmup and instant assessment.",
    },
    {
        id: "full_mock",
        title: "Full Realistic Mock",
        badge: "🎯 25 mins",
        desc: "6 authentic rounds tailored to your target company and resume background.",
    },
    {
        id: "topic_drill",
        title: "Topic Focus Drill",
        badge: "🧠 Deep Dive",
        desc: "Specialized practice on DSA, System Design, or Behavioral STAR frameworks.",
    },
] as const;

const TOPIC_OPTIONS = [
    { id: "dsa", label: "DSA & Coding", icon: Code2 },
    { id: "system_design", label: "System Design (HLD/LLD)", icon: Cpu },
    { id: "behavioral", label: "Behavioral & STAR", icon: Users },
    { id: "resume_deep_dive", label: "Resume Projects", icon: FileText },
] as const;

function getPhaseSteps(mode: string, topicFocus: string, type: string) {
    if (type === "behavioral") {
        return [
            { num: 1, title: "Background & Philosophy", desc: "Core values & career background" },
            { num: 2, title: "Ownership & Execution", desc: "High-impact project deep dive (STAR)" },
            { num: 3, title: "Conflict & Teamwork", desc: "Disagreements & stakeholder alignment" },
            { num: 4, title: "Navigating Ambiguity", desc: "Pivoting under incomplete requirements" },
            { num: 5, title: "Failure & Resilience", desc: "Outage/post-mortem accountability" },
            { num: 6, title: "Culture & Leadership", desc: "Mentorship & long-term vision" },
        ];
    }
    if (mode === "quick_drill") {
        return [
            { num: 1, title: "Background & Architecture", desc: "Past systems & core stack" },
            { num: 2, title: "Fundamentals & Trade-offs", desc: "Domain depth & algorithmic choices" },
            { num: 3, title: "High-Scale Bottlenecks", desc: "Real-world throughput & data scaling" },
            { num: 4, title: "Operational Resiliency", desc: "Fault tolerance & incident response" },
        ];
    }
    if (mode === "topic_drill") {
        if (topicFocus === "dsa") {
            return [
                { num: 1, title: "Complexity & Data Structures", desc: "Time/space guarantees & memory layout" },
                { num: 2, title: "Advanced Traversal & Logic", desc: "Trees, graphs, dynamic programming" },
                { num: 3, title: "Scale & Edge Cases", desc: "Extreme inputs, overflow, race conditions" },
                { num: 4, title: "Optimal Space/Time Refactor", desc: "Cache locality & micro-optimizations" },
            ];
        }
        if (topicFocus === "system_design") {
            return [
                { num: 1, title: "SLA & Latency Scoping", desc: "Functional requirements & back-of-envelope math" },
                { num: 2, title: "High-Level Architecture", desc: "API boundaries & data schema" },
                { num: 3, title: "Sharding & Caching", desc: "Partition keys, replication & consistency" },
                { num: 4, title: "Resiliency & Failover", desc: "Circuit breakers & disaster recovery" },
            ];
        }
        if (topicFocus === "behavioral") {
            return [
                { num: 1, title: "Ownership & Initiative", desc: "Driving critical milestones" },
                { num: 2, title: "Technical Disagreements", desc: "Resolution with data & empathy" },
                { num: 3, title: "Ambiguity & Tight Deadlines", desc: "Prioritizing under pressure" },
                { num: 4, title: "Post-Mortems & Learning", desc: "Turning mistakes into team wins" },
            ];
        }
        if (topicFocus === "resume_deep_dive") {
            return [
                { num: 1, title: "Key Project Architecture", desc: "Deconstructing listed achievements" },
                { num: 2, title: "Tech Trade-offs & Alternatives", desc: "Why this stack vs alternatives" },
                { num: 3, title: "Production Scaling Breakpoints", desc: "Where the architecture failed" },
                { num: 4, title: "Operational Maintenance", desc: "Long-term tech debt & refactoring" },
            ];
        }
    }
    // full_mock technical
    return [
        { num: 1, title: "Project & Resume Deep-Dive", desc: "Past systems & candidate ownership" },
        { num: 2, title: "CS & Domain Fundamentals", desc: "Language runtime, DBs, networking" },
        { num: 3, title: "Applied Coding Challenge", desc: "Algorithm design & clean execution" },
        { num: 4, title: "High-Scale System Design", desc: "Distributed architecture & data flow" },
        { num: 5, title: "Production Resiliency", desc: "Debugging failures & disaster recovery" },
        { num: 6, title: "Culture & Engineering Values", desc: "Collaboration & technical standards" },
    ];
}

export default function InterviewWizard({ onStart, loading }: Props) {
    const [config, setConfig] = useState<any>(null);
    const [role, setRole] = useState("");
    const [company, setCompany] = useState<any>(null);
    const [type, setType] = useState("technical");
    const [roleLevel, setRoleLevel] = useState<string>("fresher");
    const [mode, setMode] = useState<string>("full_mock");
    const [topicFocus, setTopicFocus] = useState<string>("dsa");
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getMarketConfig().then(data => {
            setConfig(data);
            if (data.roles?.length) setRole(data.roles[0]);
            if (data.companies?.length) setCompany(data.companies[0]);
        }).catch(console.error);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!config) {
        return (
            <div className="flex items-center justify-center" style={{ padding: "80px" }}>
                <Loader2 className="animate-spin" size={28} style={{ color: "var(--brand)" }} />
            </div>
        );
    }

    const filteredCompanies = searchQuery.trim() === ""
        ? config.companies
        : config.companies.filter((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const groupedFilteredCompanies = filteredCompanies.reduce((acc: any, c: any) => {
        const tier = c.tier || "other";
        if (!acc[tier]) acc[tier] = [];
        acc[tier].push(c);
        return acc;
    }, {});

    const getTierLabel = (tier: string) => {
        const labels: Record<string, string> = {
            "FAANG": "FAANG & Big Tech",
            "ai": "AI & Frontier Tech",
            "analytics-data": "Data & Analytics Platforms",
            "fintech": "Fintech & Banking",
            "hft": "Quantitative & HFT",
            "top-indian-product": "Indian Product Unicorns",
            "saas-cloud": "Cloud, DevOps & SaaS",
            "mid-product": "High-Growth Products",
            "security": "Cybersecurity & Infra",
            "gaming": "Gaming & Metaverses",
            "hardware": "Hardware & Systems",
            "indian-service": "IT Consulting & Services",
            "other": "Specialized & Tech",
        };
        return labels[tier] || tier.toUpperCase();
    };

    return (
        <div className="animate-fade-up" style={{ maxWidth: "640px", margin: "0 auto" }}>
            <div className="card" style={{ padding: "36px 32px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)" }}>
                {/* Header */}
                <div className="text-center" style={{ marginBottom: "30px" }}>
                    <div className="flex items-center justify-center gap-2" style={{ marginBottom: "10px" }}>
                        <div style={{
                            width: "38px", height: "38px", borderRadius: "12px",
                            background: "var(--brand-glow)", display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <Sparkles size={20} style={{ color: "var(--brand)" }} />
                        </div>
                    </div>
                    <h2 className="font-display" style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--fg-primary)", marginBottom: "6px", letterSpacing: "-0.02em" }}>
                        Launch AI Mock Interview
                    </h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>
                        Realistic conversational simulation with real-time speech audio & 360° scorecard
                    </p>
                </div>

                <div className="flex flex-col" style={{ gap: "22px" }}>
                    {/* Mode Selector Cards */}
                    <div>
                        <label className="text-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                            <Layers size={13} style={{ color: "var(--brand)" }} /> Practice Mode
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                            {MODES.map((m) => {
                                const selected = mode === m.id;
                                return (
                                    <div
                                        key={m.id}
                                        onClick={() => setMode(m.id)}
                                        style={{
                                            padding: "14px 12px",
                                            borderRadius: "var(--radius-md)",
                                            border: `1.5px solid ${selected ? "var(--brand)" : "var(--border-subtle)"}`,
                                            background: selected ? "rgba(59, 130, 246, 0.08)" : "var(--bg-surface)",
                                            cursor: "pointer",
                                            transition: "all 0.15s ease",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between"
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                                                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: selected ? "var(--brand)" : "var(--fg-primary)" }}>
                                                    {m.title}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: "0.72rem", color: "var(--fg-muted)", lineHeight: 1.35 }}>
                                                {m.desc}
                                            </p>
                                        </div>
                                        <div style={{ marginTop: "10px" }}>
                                            <span style={{
                                                fontSize: "0.68rem", fontWeight: 700, padding: "2px 6px",
                                                borderRadius: "4px", background: selected ? "var(--brand)" : "var(--bg-elevated)",
                                                color: selected ? "#fff" : "var(--fg-secondary)"
                                            }}>
                                                {m.badge}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Topic Selector if topic_drill */}
                    {mode === "topic_drill" && (
                        <div className="animate-fade-in" style={{ padding: "14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                            <label className="text-label" style={{ display: "block", marginBottom: "8px" }}>
                                Select Focus Domain
                            </label>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                                {TOPIC_OPTIONS.map((t) => {
                                    const active = topicFocus === t.id;
                                    const Icon = t.icon;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setTopicFocus(t.id)}
                                            style={{
                                                padding: "10px 12px",
                                                borderRadius: "8px",
                                                border: `1px solid ${active ? "var(--brand)" : "var(--border-subtle)"}`,
                                                background: active ? "var(--brand-glow)" : "var(--bg-surface)",
                                                color: active ? "var(--brand)" : "var(--fg-secondary)",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                fontSize: "0.8rem",
                                                fontWeight: active ? 700 : 500,
                                                cursor: "pointer",
                                                textAlign: "left"
                                            }}
                                        >
                                            <Icon size={14} />
                                            <span>{t.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Role */}
                    <div>
                        <label className="text-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                            <Target size={13} style={{ color: "var(--brand)" }} /> Target Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="input"
                            style={{ padding: "11px 14px", fontSize: "0.875rem", cursor: "pointer" }}
                        >
                            {config.roles.map((r: string) => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    {/* Company Dropdown */}
                    <div style={{ position: "relative" }} ref={dropdownRef}>
                        <label className="text-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                            <Building2 size={13} style={{ color: "var(--accent-cyan)" }} /> Target Company
                        </label>
                        <div
                            onClick={() => setIsOpen(!isOpen)}
                            className="input"
                            style={{
                                padding: "11px 14px", cursor: "pointer", display: "flex",
                                justifyContent: "space-between", alignItems: "center"
                            }}
                        >
                            <span style={{ fontSize: "0.875rem", color: company ? "var(--fg-primary)" : "var(--fg-muted)", fontWeight: 600 }}>
                                {company ? company.name : "Select Company"}
                            </span>
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>

                        {isOpen && (
                            <div
                                data-lenis-prevent
                                onWheel={(e) => e.stopPropagation()}
                                style={{
                                    position: "absolute", top: "100%", left: 0, right: 0, marginTop: "6px",
                                    background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                                    borderRadius: "var(--radius-lg)", boxShadow: "0 16px 36px rgba(0,0,0,0.5)",
                                    maxHeight: "300px", overflowY: "auto", overscrollBehavior: "contain",
                                    zIndex: 50, padding: "8px"
                                }}
                            >
                                <div style={{ position: "sticky", top: 0, background: "var(--bg-elevated)", paddingBottom: "8px", zIndex: 10 }}>
                                    <div style={{ position: "relative" }}>
                                        <Search size={14} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--fg-muted)" }} />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search companies..."
                                            className="input"
                                            style={{ paddingLeft: "30px", fontSize: "0.8rem", height: "34px" }}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                {Object.keys(groupedFilteredCompanies).length === 0 ? (
                                    <div style={{ padding: "16px", textAlign: "center", color: "var(--fg-muted)", fontSize: "0.8rem" }}>No companies found</div>
                                ) : (
                                    Object.entries(groupedFilteredCompanies).map(([tier, comps]: [string, any]) => (
                                        <div key={tier} style={{ marginBottom: "8px" }}>
                                            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--fg-muted)", padding: "4px 8px", textTransform: "uppercase" }}>
                                                {getTierLabel(tier)}
                                            </div>
                                            {comps.map((c: any) => (
                                                <div
                                                    key={c.name}
                                                    onClick={() => {
                                                        setCompany(c);
                                                        setIsOpen(false);
                                                        setSearchQuery("");
                                                    }}
                                                    style={{
                                                        padding: "8px 12px", borderRadius: "6px", cursor: "pointer",
                                                        fontSize: "0.85rem", color: company?.name === c.name ? "var(--brand)" : "var(--fg-primary)",
                                                        background: company?.name === c.name ? "var(--brand-glow)" : "transparent",
                                                        fontWeight: company?.name === c.name ? 700 : 500
                                                    }}
                                                    className="hover:bg-slate-800"
                                                >
                                                    {c.name}
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Role Seniority Level */}
                    <div>
                        <label className="text-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                            <Zap size={13} style={{ color: "var(--accent-amber)" }} /> Seniority Level
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                            {ROLE_LEVELS.map((lvl) => {
                                const active = roleLevel === lvl.id;
                                return (
                                    <button
                                        key={lvl.id}
                                        type="button"
                                        onClick={() => setRoleLevel(lvl.id)}
                                        style={{
                                            padding: "9px 6px",
                                            borderRadius: "8px",
                                            border: `1px solid ${active ? "var(--accent-amber)" : "var(--border-subtle)"}`,
                                            background: active ? "rgba(245, 158, 11, 0.1)" : "var(--bg-surface)",
                                            color: active ? "var(--accent-amber)" : "var(--fg-secondary)",
                                            fontSize: "0.8rem",
                                            fontWeight: active ? 700 : 500,
                                            cursor: "pointer"
                                        }}
                                    >
                                        {lvl.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Interview Type */}
                    <div>
                        <label className="text-label" style={{ display: "block", marginBottom: "8px" }}>Interview Focus</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <button
                                type="button"
                                onClick={() => setType("technical")}
                                className="btn"
                                style={{
                                    border: `1.5px solid ${type === "technical" ? "var(--brand)" : "var(--border-subtle)"}`,
                                    background: type === "technical" ? "var(--brand-glow)" : "var(--bg-surface)",
                                    color: type === "technical" ? "var(--brand)" : "var(--fg-secondary)",
                                    fontWeight: type === "technical" ? 700 : 500
                                }}
                            >
                                Technical & Coding
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("behavioral")}
                                className="btn"
                                style={{
                                    border: `1.5px solid ${type === "behavioral" ? "var(--brand)" : "var(--border-subtle)"}`,
                                    background: type === "behavioral" ? "var(--brand-glow)" : "var(--bg-surface)",
                                    color: type === "behavioral" ? "var(--brand)" : "var(--fg-secondary)",
                                    fontWeight: type === "behavioral" ? 700 : 500
                                }}
                            >
                                Behavioral & Culture
                            </button>
                        </div>
                    </div>

                    {/* Structured Interview Roadmap Preview */}
                    {(() => {
                        const phaseSteps = getPhaseSteps(mode, topicFocus, type);
                        return (
                            <div style={{
                                padding: "16px",
                                background: "var(--bg-elevated)",
                                borderRadius: "var(--radius-lg)",
                                border: "1px solid var(--border-subtle)"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Layers size={14} style={{ color: "var(--brand)" }} />
                                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--fg-primary)" }}>
                                            Structured Flow ({phaseSteps.length} Guided Phases)
                                        </span>
                                    </div>
                                    <span style={{ fontSize: "0.72rem", color: "var(--brand)", fontWeight: 600 }}>
                                        {company ? `${company.name} Calibrated` : "Domain Calibrated"}
                                    </span>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                                    {phaseSteps.map((s) => (
                                        <div
                                            key={s.num}
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: "8px",
                                                padding: "8px 10px",
                                                background: "var(--bg-surface)",
                                                borderRadius: "6px",
                                                border: "1px solid var(--border-subtle)"
                                            }}
                                        >
                                            <span style={{
                                                fontSize: "0.7rem",
                                                fontWeight: 800,
                                                width: "18px",
                                                height: "18px",
                                                borderRadius: "50%",
                                                background: "var(--brand-glow)",
                                                color: "var(--brand)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                                marginTop: "1px"
                                            }}>
                                                {s.num}
                                            </span>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--fg-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {s.title}
                                                </div>
                                                <div style={{ fontSize: "0.68rem", color: "var(--fg-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {s.desc}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: "10px", fontSize: "0.72rem", color: "var(--fg-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                                    <span>
                                        Questions dynamically test <strong className="text-blue-400">{company ? company.name : "target company"}</strong>&apos;s real-world engineering stack and principles.
                                    </span>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Start Action Button */}
                    <button
                        type="button"
                        onClick={() => onStart(role, company, type, roleLevel, mode, topicFocus)}
                        disabled={loading || !role || !company}
                        className="btn btn-primary"
                        style={{
                            width: "100%", padding: "14px", marginTop: "12px",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            fontSize: "0.95rem", fontWeight: 700
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
                        <span>Start Interview Simulation</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

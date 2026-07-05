import React, { useState, useEffect, useRef } from "react";
import { Target, Building2, Zap, Sparkles, Loader2, Play, Search, ChevronDown, ChevronUp, X } from "lucide-react";
import { getMarketConfig } from "@/services/api";

interface Props {
    onStart: (role: string, company: any, type: string) => void;
    loading: boolean;
}

export default function InterviewWizard({ onStart, loading }: Props) {
    const [config, setConfig] = useState<any>(null);
    const [role, setRole] = useState("");
    const [company, setCompany] = useState<any>(null);
    const [type, setType] = useState("technical");
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getMarketConfig().then(data => {
            setConfig(data);
            if (data.roles?.length) setRole(data.roles[0]);
            if (data.companies?.length) setCompany(data.companies[0]);
        });
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

    if (!config) return <div style={{ textAlign: "center", padding: "40px" }}><Loader2 className="animate-spin" /></div>;

    const getTierLabel = (tier: string) => {
        const labels: Record<string, string> = {
            "FAANG": "FAANG & Global Big Tech",
            "top-indian-product": "Indian Product Leaders",
            "indian-service": "Indian Service Sector",
            "fintech": "Fintech & Banking",
            "mid-product": "Growth Stage Products",
            "hardware": "Hardware & Semiconductors",
            "gaming": "Gaming & Metaverses",
            "security": "Cybersecurity & Infra",
            "hft": "High Frequency Trading (HFT)",
            "other": "Specialized & Others"
        };
        return labels[tier] || tier.toUpperCase();
    };

    // Filter companies
    const filteredCompanies = searchQuery.trim() === ""
        ? config.companies
        : config.companies.filter((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Group filtered companies by tier
    const groupedFilteredCompanies = filteredCompanies.reduce((acc: any, c: any) => {
        if (!acc[c.tier]) acc[c.tier] = [];
        acc[c.tier].push(c);
        return acc;
    }, {});

    return (
        <div className="animate-fade-up" style={{ 
            maxWidth: "600px", margin: "0 auto", padding: "40px", 
            background: "rgba(15, 23, 42, 0.4)", borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
        }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", marginBottom: "32px", textAlign: "center" }}>
                Launch <span style={{ color: "#a855f7" }}>Mock Simulation</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Role */}
                <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "12px" }}>
                        <Target size={14} color="#a855f7" /> Target Role
                    </label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}>
                        {config.roles.map((r: string) => <option key={r} value={r} style={{ background: "#0f172a" }}>{r}</option>)}
                    </select>
                </div>

                {/* Company */}
                <div style={{ position: "relative" }} ref={dropdownRef}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "12px" }}>
                        <Building2 size={14} color="#06b6d4" /> Target Company
                    </label>
                    <div 
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ 
                            width: "100%", padding: "14px", borderRadius: "14px", 
                            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
                            color: "white", outline: "none", cursor: "pointer",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            userSelect: "none"
                        }}
                    >
                        <span>{company ? company.name : "Select a company..."}</span>
                        {isOpen ? <ChevronUp size={16} color="rgba(255,255,255,0.6)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.6)" />}
                    </div>

                    {isOpen && (
                        <div 
                            data-lenis-prevent
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                            style={{
                                position: "absolute", top: "105%", left: 0, width: "100%",
                                background: "#0f172a", border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "14px", zIndex: 100, maxHeight: "300px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column",
                                overflow: "hidden"
                            }}
                        >
                            {/* Search Box */}
                            <div style={{ 
                                padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)", 
                                background: "#0f172a", flexShrink: 0
                            }}>
                                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                    <Search size={14} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: "12px" }} />
                                    <input 
                                        type="text" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search company..."
                                        style={{ 
                                            width: "100%", padding: "10px 10px 10px 36px", borderRadius: "10px",
                                            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                            color: "white", fontSize: "0.85rem", outline: "none"
                                        }}
                                        autoFocus
                                    />
                                    {searchQuery && (
                                        <button 
                                            onClick={() => setSearchQuery("")}
                                            style={{
                                                position: "absolute", right: "12px", background: "none", border: "none",
                                                color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center"
                                            }}
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Dropdown Options */}
                            <div style={{ padding: "8px 0", overflowY: "auto", flex: 1 }}>
                                {filteredCompanies.length === 0 ? (
                                    <div style={{ padding: "20px 16px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
                                        Company not found
                                    </div>
                                ) : (
                                    Object.keys(groupedFilteredCompanies).map(tier => (
                                        <div key={tier}>
                                            <div style={{ 
                                                padding: "6px 16px", fontSize: "0.7rem", fontWeight: 800, 
                                                color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.05em",
                                                background: "rgba(168,85,247,0.03)", marginTop: "4px"
                                            }}>
                                                {getTierLabel(tier)}
                                            </div>
                                            {groupedFilteredCompanies[tier].map((c: any) => (
                                                <div 
                                                    key={c.name}
                                                    onClick={() => {
                                                        setCompany(c);
                                                        setIsOpen(false);
                                                        setSearchQuery("");
                                                    }}
                                                    style={{ 
                                                        padding: "10px 20px", color: "white", fontSize: "0.9rem", cursor: "pointer",
                                                        background: company?.name === c.name ? "rgba(168,85,247,0.15)" : "transparent",
                                                        transition: "background 0.2s"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (company?.name !== c.name) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (company?.name !== c.name) e.currentTarget.style.background = "transparent";
                                                    }}
                                                >
                                                    {c.name}
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Type */}
                <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "12px" }}>
                        <Zap size={14} /> Interview Focus
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        {["technical", "behavioral"].map(t => (
                            <button key={t} onClick={() => setType(t)} style={{ padding: "12px", borderRadius: "10px", background: type === t ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${type === t ? "#a855f7" : "rgba(255,255,255,0.1)"}`, color: type === t ? "white" : "rgba(255,255,255,0.6)", cursor: "pointer", textTransform: "capitalize", fontWeight: 600 }}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => onStart(role, company, type)}
                    disabled={loading}
                    style={{ 
                        marginTop: "16px", padding: "18px", borderRadius: "14px", 
                        background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)", 
                        color: "white", fontWeight: 700, border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
                        boxShadow: "0 8px 25px rgba(168,85,247,0.3)"
                    }}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Play size={20} />}
                    {loading ? "Initializing Agent..." : "Launch Simulation"}
                </button>
            </div>
        </div>
    );
}

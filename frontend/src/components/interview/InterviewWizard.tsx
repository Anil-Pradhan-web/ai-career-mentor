import React, { useState, useEffect } from "react";
import { Target, Building2, Zap, Sparkles, Loader2, Play } from "lucide-react";
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

    useEffect(() => {
        getMarketConfig().then(data => {
            setConfig(data);
            if (data.roles?.length) setRole(data.roles[0]);
            if (data.companies?.length) setCompany(data.companies[0]);
        });
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

    // Group companies by tier
    const groupedCompanies = config.companies.reduce((acc: any, c: any) => {
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
                <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "12px" }}>
                        <Building2 size={14} color="#06b6d4" /> Target Company
                    </label>
                    <select 
                        value={company?.name} 
                        onChange={(e) => setCompany(config.companies.find((c: any) => c.name === e.target.value))} 
                        style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                    >
                        {Object.keys(groupedCompanies).map(tier => (
                            <optgroup key={tier} label={getTierLabel(tier)} style={{ background: "#0f172a", color: "#a855f7", fontStyle: "normal" }}>
                                {groupedCompanies[tier].map((c: any) => (
                                    <option key={c.name} value={c.name} style={{ color: "white" }}>{c.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
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

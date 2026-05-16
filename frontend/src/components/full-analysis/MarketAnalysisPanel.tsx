import React from "react";
import { TrendingUp, DollarSign, Building2, Target, Activity, FileText } from "lucide-react";
import { MarketTrends } from "@/types";

interface Props {
    data: MarketTrends;
    role: string;
}

export default function MarketAnalysisPanel({ data, role }: Props) {
    if (!data) return null;

    // Data fallbacks to ensure UI never looks broken
    const skillsList = (data.top_skills_freq?.length ? data.top_skills_freq : data.top_skills) || [];
    const companiesList = (data.hiring_companies?.length ? data.hiring_companies : data.company_hiring_stats) || [];
    const hiringVol = data.hiring_volume || "Actively Hiring";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }} className="animate-fade-up">
            {/* Main Hero Header */}
            <div style={{
                position: "relative", overflow: "hidden",
                padding: "40px", borderRadius: "32px",
                background: "linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.6) 100%)",
                backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 30px 60px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)"
            }}>
                {/* Decorative glow */}
                <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "-50%", left: "-10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px", position: "relative", zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <div style={{ 
                            width: "56px", height: "56px", borderRadius: "18px", 
                            background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2))", 
                            border: "1px solid rgba(6,182,212,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 0 20px rgba(6,182,212,0.3)"
                        }}>
                            <Activity size={28} color="#06b6d4" />
                        </div>
                        <div>
                            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.8rem", fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>
                                <span style={{ color: "white" }}>Live Market </span>
                                <span style={{ background: "linear-gradient(to right, #06b6d4, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Intelligence</span>
                            </h3>
                            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", marginTop: "4px", fontWeight: 500 }}>Real-time data stream for {data.location}</p>
                        </div>
                    </div>
                    <div style={{ padding: "8px 24px", borderRadius: "100px", background: "linear-gradient(90deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", boxShadow: "0 0 15px rgba(16,185,129,0.2)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
                            Live Verified
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", position: "relative", zIndex: 10 }}>
                    <div className="hover:scale-105 transition-transform duration-300" style={{ padding: "28px", borderRadius: "24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", cursor: "default" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(16,185,129,0.1)" }}><DollarSign size={18} color="#10b981" /></div>
                            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Average Salary</span>
                        </div>
                        <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>
                            {typeof data.salary_range === 'string' ? data.salary_range : (data.salary_range as any)?.formatted || "N/A"}
                        </div>
                    </div>

                    <div className="hover:scale-105 transition-transform duration-300" style={{ padding: "28px", borderRadius: "24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", cursor: "default" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(6,182,212,0.1)" }}><TrendingUp size={18} color="#06b6d4" /></div>
                            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Demand Trend</span>
                        </div>
                        <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>{data.market_trend || "Stable Demand"}</div>
                    </div>

                    <div className="hover:scale-105 transition-transform duration-300" style={{ padding: "28px", borderRadius: "24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", cursor: "default" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(244,63,94,0.1)" }}><Building2 size={18} color="#f43f5e" /></div>
                            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Live Openings</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                            <span style={{ fontSize: "1.6rem", fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>
                                {hiringVol.replace(/active roles|roles|openings/i, '').trim()}
                            </span>
                            {/\d/.test(hiringVol) && (
                                <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase" }}>Roles</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Summary Context */}
            {data.summary && (
                <div style={{ 
                    padding: "28px", borderRadius: "24px", 
                    background: "linear-gradient(90deg, rgba(168,85,247,0.08) 0%, rgba(6,182,212,0.03) 100%)", 
                    border: "1px solid rgba(168,85,247,0.2)", borderLeft: "4px solid #a855f7"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                        <FileText size={20} color="#a855f7" />
                        <h4 style={{ color: "white", fontSize: "1.1rem", fontWeight: 800 }}>Executive Market Summary</h4>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1rem", lineHeight: "1.7", margin: 0 }}>
                        {data.summary}
                    </p>
                </div>
            )}

            {/* Deep Dive Section */}
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "32px" }}>
                
                {/* Skill Demand Matrix */}
                <div style={{ padding: "32px", borderRadius: "32px", background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
                        <div style={{ padding: "10px", borderRadius: "12px", background: "rgba(251,191,36,0.1)" }}><Target size={22} color="#fbbf24" /></div>
                        <h4 style={{ color: "white", fontSize: "1.2rem", fontWeight: 800 }}>Core Skill Matrix</h4>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                        {skillsList.map((item: any, i: number) => {
                            const freq = item.frequency || 50;
                            const isHigh = freq > 75;
                            return (
                                <div key={i} className="hover:-translate-y-1 transition-transform duration-300" style={{ 
                                    padding: "14px 24px", borderRadius: "100px", 
                                    background: isHigh ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.03)", 
                                    border: `1px solid ${isHigh ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.1)"}`,
                                    display: "flex", alignItems: "center", gap: "12px",
                                    boxShadow: isHigh ? "0 0 20px rgba(251,191,36,0.1)" : "none", cursor: "default"
                                }}>
                                    <span style={{ color: isHigh ? "#fcd34d" : "white", fontWeight: 700, fontSize: "1rem" }}>{item.skill}</span>
                                    {freq && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: isHigh ? "#fbbf24" : "rgba(255,255,255,0.3)" }} />
                                            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", fontWeight: 800 }}>{freq}%</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Employers */}
                <div style={{ padding: "32px", borderRadius: "32px", background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
                        <div style={{ padding: "10px", borderRadius: "12px", background: "rgba(244,63,94,0.1)" }}><Building2 size={22} color="#f43f5e" /></div>
                        <h4 style={{ color: "white", fontSize: "1.2rem", fontWeight: 800 }}>Top Hiring Entities</h4>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {companiesList.map((company: any, i: number) => (
                            <div key={i} className="hover:scale-105 transition-transform duration-300" style={{ 
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "20px 24px", borderRadius: "20px", 
                                background: "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                                border: "1px solid rgba(255,255,255,0.08)", cursor: "default",
                                boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f43f5e", boxShadow: "0 0 10px #f43f5e" }} />
                                    <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 800, fontSize: "1.05rem", letterSpacing: "0.02em" }}>{company.name}</span>
                                </div>
                                {company.hiring_volume && (
                                    <span style={{ padding: "6px 14px", borderRadius: "100px", background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.3)", color: "#fb7185", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        {company.hiring_volume}
                                    </span>
                                )}
                            </div>
                        ))}
                        {companiesList.length === 0 && (
                            <div style={{ padding: "20px", textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "20px", color: "rgba(255,255,255,0.4)" }}>
                                <span style={{ fontStyle: "italic", fontSize: "0.95rem" }}>No distinct entities captured in live feed.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { optimizeLinkedin, getMarketConfig } from "@/services/api";
import LinkedInPanel from "@/components/full-analysis/LinkedInPanel";
import { LinkedInStrategy } from "@/types";
import { toast } from "react-hot-toast";

export default function LinkedInPage() {
    const [config, setConfig] = useState<any>(null);
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [strategy, setStrategy] = useState<LinkedInStrategy | null>(null);

    useEffect(() => {
        getMarketConfig().then(data => {
            setConfig(data);
            if (data.roles?.length) setRole(data.roles[0]);
        }).catch(console.error);
    }, []);

    const handleOptimize = async () => {
        if (!role) return toast.error("Please select a target role");
        setLoading(true);
        setStrategy(null);
        try {
            const data = await optimizeLinkedin(role);
            setStrategy(data.strategy || data);
            toast.success("Strategy generated successfully!");

            // Dispatch event to refresh dashboard rate limits
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("rateLimitUpdated"));
            }
        } catch (err: any) {
            toast.error(err.message || "Optimization failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ flex: 1, padding: "80px 32px 48px 110px", color: "#f8fafc" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                
                {/* Header */}
                <div style={{ marginBottom: "48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ 
                            width: "56px", height: "56px", borderRadius: "16px",
                            background: "rgba(10, 102, 194, 0.1)", border: "1px solid rgba(10, 102, 194, 0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <Sparkles size={28} color="#0a66c2" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>LinkedIn Optimizer</h1>
                            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.05rem" }}>Forge a recruiter-ready brand using AI agents.</p>
                        </div>
                    </div>
                </div>

                {/* Input Card */}
                <div style={{ 
                    padding: "40px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", 
                    border: "1px solid rgba(255,255,255,0.08)", marginBottom: "48px"
                }}>
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "12px" }}>Target Career Role</label>
                        <select 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)} 
                            style={{ 
                                width: "100%", padding: "16px", borderRadius: "14px", 
                                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
                                color: "white", fontSize: "1.1rem" 
                            }} 
                        >
                            {config?.roles?.map((r: string) => <option key={r} value={r} style={{ background: "#0f172a" }}>{r}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={handleOptimize}
                        disabled={loading}
                        style={{ 
                            width: "100%", padding: "18px", borderRadius: "14px", 
                            background: "linear-gradient(135deg, #0a66c2 0%, #06b6d4 100%)", 
                            color: "white", fontWeight: 700, border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                            boxShadow: "0 8px 25px rgba(10, 102, 194, 0.3)"
                        }}
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                        {loading ? "Forging Your Brand..." : "Generate LinkedIn Strategy"}
                    </button>
                </div>

                {/* Results */}
                {loading && (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Loader2 size={48} className="animate-spin" color="#0a66c2" style={{ margin: "0 auto 24px" }} />
                        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>Synthesizing Brand Strategy...</h2>
                    </div>
                )}

                {strategy && (
                    <div className="animate-fade-up">
                        <LinkedInPanel strategy={strategy} />
                    </div>
                )}
            </div>
        </main>
    );
}

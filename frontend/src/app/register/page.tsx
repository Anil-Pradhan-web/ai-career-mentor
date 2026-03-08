"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Sparkles, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { registerUser } from "@/services/api";
import toast from "react-hot-toast";

const PERKS = [
    "Free forever — no credit card needed",
    "Multi-agent AI analysis in under 60s",
    "Real salary data, not guesses",
    "Interview coach that actually listens",
];

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
    const strengthLabel = ["", "Weak", "Fair", "Strong"][pwStrength];
    const strengthColor = ["", "#ef4444", "#f59e0b", "#10b981"][pwStrength];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) { setError("Please fill in all fields."); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
        setLoading(true); setError("");
        try {
            await registerUser(name, email, password);
            localStorage.setItem("userName", name);
            toast.success("Account created! Welcome 🎉");
            router.replace("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || "Registration failed. Please try again.");
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-base)" }}>
            {/* ── Left: Form ── */}
            <div className="auth-right-panel" style={{
                width: "480px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "60px 48px",
                borderRight: "1px solid var(--border-default)",
                position: "relative",
            }}>
                {/* Mobile logo */}
                <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "28px" }}
                    className="show-mobile">
                    <div style={{ width: "28px", height: "28px", background: "var(--brand-gradient)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Sparkles size={13} color="white" />
                    </div>
                    <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>CareerMentor.ai</span>
                </Link>

                <div style={{ marginBottom: "32px" }}>
                    <h1 style={{
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontSize: "1.7rem", fontWeight: 800,
                        color: "var(--text-primary)",
                        marginBottom: "6px", letterSpacing: "-0.02em",
                    }}>Create your account</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        Already have one?{" "}
                        <Link href="/login" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "12px 14px",
                        background: "rgba(244,63,94,0.08)",
                        border: "1px solid rgba(244,63,94,0.2)",
                        borderRadius: "var(--radius-md)", marginBottom: "20px",
                    }}>
                        <AlertCircle size={15} color="#f43f5e" strokeWidth={2.5} />
                        <span style={{ fontSize: "0.86rem", color: "#f43f5e" }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Name */}
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px" }}>Full name</label>
                        <div style={{ position: "relative" }}>
                            <User size={15} color="var(--text-muted)" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                placeholder="Anil Pradhan" autoComplete="name" className="input"
                                style={{ padding: "11px 14px 11px 38px" }} />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px" }}>Email address</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={15} color="var(--text-muted)" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com" autoComplete="email" className="input"
                                style={{ padding: "11px 14px 11px 38px" }} />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px" }}>Password</label>
                        <div style={{ position: "relative" }}>
                            <Lock size={15} color="var(--text-muted)" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                            <input type={showPw ? "text" : "password"} value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Min. 6 characters" autoComplete="new-password" className="input"
                                style={{ padding: "11px 40px 11px 38px" }} />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{
                                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                                background: "none", border: "none", cursor: "pointer",
                                color: "var(--text-muted)", padding: "2px", display: "flex", alignItems: "center",
                            }}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Password strength bar */}
                        {password.length > 0 && (
                            <div style={{ marginTop: "8px" }}>
                                <div style={{ display: "flex", gap: "4px" }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{
                                            flex: 1, height: "3px", borderRadius: "99px",
                                            background: i <= pwStrength ? strengthColor : "var(--border-default)",
                                            transition: "background 0.2s",
                                        }} />
                                    ))}
                                </div>
                                <span style={{ fontSize: "0.72rem", color: strengthColor, marginTop: "4px", display: "block" }}>
                                    {strengthLabel}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading} style={{
                        width: "100%", padding: "12px",
                        background: loading ? "rgba(91,110,248,0.5)" : "var(--brand-gradient)",
                        border: "none", borderRadius: "var(--radius-md)",
                        color: "white", fontFamily: "Inter,sans-serif",
                        fontWeight: 600, fontSize: "0.95rem",
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        transition: "box-shadow 0.15s, transform 0.15s", marginTop: "4px",
                    }}
                        onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-brand)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; } }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
                    >
                        {loading ? (
                            <>
                                <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                Creating account…
                            </>
                        ) : (
                            <>Create free account <ArrowRight size={16} /></>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-disabled)", marginTop: "24px" }}>
                    By signing up you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>

            {/* ── Right: Branding ── */}
            <div className="auth-left-panel" style={{
                flex: 1, flexDirection: "column", justifyContent: "center",
                padding: "60px 64px", position: "relative", overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute", top: "15%", right: "5%",
                    width: "500px", height: "500px", pointerEvents: "none",
                    background: "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)",
                }} />
                <div style={{ position: "relative", zIndex: 1, maxWidth: "460px" }}>
                    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "9px", textDecoration: "none", marginBottom: "52px" }}>
                        <div style={{ width: "32px", height: "32px", background: "var(--brand-gradient)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Sparkles size={16} color="white" />
                        </div>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                            CareerMentor<span style={{ color: "var(--brand-primary)" }}>.</span>ai
                        </span>
                    </Link>

                    <h2 style={{
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
                        fontWeight: 800, color: "var(--text-primary)",
                        lineHeight: 1.12, letterSpacing: "-0.025em", marginBottom: "16px",
                    }}>
                        Start free.<br />
                        <span className="gradient-text">Grow fast.</span>
                    </h2>
                    <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "40px" }}>
                        Most developers spend months figuring out what to learn next. Our AI tells you in 60 seconds, then stays with you every step of the way.
                    </p>

                    {PERKS.map((perk, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                            <CheckCircle2 size={17} color="#10b981" strokeWidth={2.5} />
                            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{perk}</span>
                        </div>
                    ))}

                    {/* Social proof */}
                    <div style={{
                        marginTop: "44px", padding: "20px 22px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius-lg)",
                    }}>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.7, marginBottom: "14px" }}>
                            &ldquo;I landed a senior engineer role 3 months after starting with CareerMentor. The roadmap was spot on.&rdquo;
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(91,110,248,0.15)", border: "1px solid rgba(91,110,248,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#818cf8" }}>
                                SK
                            </div>
                            <div>
                                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>Suresh Kumar</div>
                                <div style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>Senior Engineer @ Amazon</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

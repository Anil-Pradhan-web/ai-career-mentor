"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Sparkles, Mail, Lock, AlertCircle } from "lucide-react";
import { loginUser } from "@/services/api";
import toast from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { setError("Please fill in all fields."); return; }
        setLoading(true); setError("");
        try {
            const data = await loginUser(email, password);
            localStorage.setItem("token", data.access_token);
            if (data.name) localStorage.setItem("userName", data.name);
            toast.success("Welcome back!");
            router.replace("/dashboard");
        } catch (err: any) {
            setError(err.message || "Invalid email or password.");
        } finally { setLoading(false); }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            background: "var(--bg-base)",
        }}>
            {/* ── Left: Branding ── */}
            <div className="auth-left-panel" style={{
                flex: 1,
                flexDirection: "column",
                justifyContent: "center",
                padding: "60px 64px",
                background: "var(--bg-surface)",
                borderRight: "1px solid var(--border-default)",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Background glow */}
                <div style={{
                    position: "absolute", top: "20%", right: "-10%",
                    width: "420px", height: "420px", pointerEvents: "none",
                    background: "radial-gradient(ellipse, rgba(91,110,248,0.1) 0%, transparent 70%)",
                }} />
                <div style={{
                    position: "absolute", bottom: "10%", left: "-5%",
                    width: "300px", height: "300px", pointerEvents: "none",
                    background: "radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)",
                }} />

                <div style={{ position: "relative", zIndex: 1, maxWidth: "420px" }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "9px", textDecoration: "none", marginBottom: "56px" }}>
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
                        fontWeight: 800,
                        color: "var(--text-primary)",
                        lineHeight: 1.12,
                        letterSpacing: "-0.025em",
                        marginBottom: "16px",
                    }}>
                        Your career,<br />on autopilot.
                    </h2>
                    <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "40px" }}>
                        Resume analysis, learning roadmaps, market insights, and AI interview coaching — all in one smart platform.
                    </p>

                    {/* Feature list */}
                    {[
                        "AI resume scoring & gap analysis",
                        "Personalised week-by-week roadmaps",
                        "Real-time salary & market intelligence",
                        "Mock interview coach with live feedback",
                    ].map((f, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                            <div style={{
                                width: "20px", height: "20px",
                                background: "rgba(91,110,248,0.12)",
                                border: "1px solid rgba(91,110,248,0.2)",
                                borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                            }}>
                                <div style={{ width: "6px", height: "6px", background: "#818cf8", borderRadius: "50%" }} />
                            </div>
                            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{f}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right: Form ── */}
            <div className="auth-right-panel" style={{
                width: "460px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "60px 48px",
                position: "relative",
            }}>
                <div style={{ marginBottom: "36px" }}>
                    {/* Mobile logo */}
                    <div style={{ display: "none" }} className="show-mobile">
                        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "28px" }}>
                            <div style={{ width: "28px", height: "28px", background: "var(--brand-gradient)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Sparkles size={13} color="white" />
                            </div>
                            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>CareerMentor.ai</span>
                        </Link>
                    </div>

                    <h1 style={{
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontSize: "1.7rem",
                        fontWeight: 800,
                        color: "var(--text-primary)",
                        marginBottom: "6px",
                        letterSpacing: "-0.02em",
                    }}>
                        Welcome back
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        Don&apos;t have an account?{" "}
                        <Link href="/register" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 500 }}>
                            Sign up free
                        </Link>
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "12px 14px",
                        background: "rgba(244,63,94,0.08)",
                        border: "1px solid rgba(244,63,94,0.2)",
                        borderRadius: "var(--radius-md)",
                        marginBottom: "20px",
                    }}>
                        <AlertCircle size={15} color="#f43f5e" strokeWidth={2.5} />
                        <span style={{ fontSize: "0.86rem", color: "#f43f5e" }}>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Email */}
                    <div>
                        <label style={{
                            display: "block", fontSize: "0.8rem",
                            fontWeight: 600, color: "var(--text-secondary)",
                            marginBottom: "7px",
                        }}>Email address</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={15} color="var(--text-muted)" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                className="input"
                                style={{ padding: "11px 14px 11px 38px" }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label style={{
                            display: "block", fontSize: "0.8rem",
                            fontWeight: 600, color: "var(--text-secondary)",
                            marginBottom: "7px",
                        }}>Password</label>
                        <div style={{ position: "relative" }}>
                            <Lock size={15} color="var(--text-muted)" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                            <input
                                type={showPw ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="input"
                                style={{ padding: "11px 40px 11px 38px" }}
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{
                                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                                background: "none", border: "none", cursor: "pointer",
                                color: "var(--text-muted)", padding: "2px",
                                display: "flex", alignItems: "center",
                                transition: "color 0.15s",
                            }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
                            >
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading} style={{
                        width: "100%",
                        padding: "12px",
                        background: loading ? "rgba(91,110,248,0.5)" : "var(--brand-gradient)",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        color: "white",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        transition: "box-shadow 0.15s, transform 0.15s",
                        marginTop: "4px",
                    }}
                        onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-brand)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; } }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
                    >
                        {loading ? (
                            <>
                                <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                Signing in…
                            </>
                        ) : (
                            <>Sign in <ArrowRight size={16} /></>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-disabled)", marginTop: "28px" }}>
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}

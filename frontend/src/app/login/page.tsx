"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Sparkles, Mail, Lock, AlertCircle, ShieldCheck } from "lucide-react";
import { loginUser } from "@/services/api";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/services/api";

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
            if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);
            if (data.name) localStorage.setItem("userName", data.name);
            toast.success("Welcome back!");
            router.replace("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || "Invalid email or password.");
        } finally { setLoading(false); }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        if (!credentialResponse.credential) return;
        setLoading(true); setError("");
        try {
            const data = await googleLogin(credentialResponse.credential);
            localStorage.setItem("token", data.access_token);
            if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);
            if (data.name) localStorage.setItem("userName", data.name);
            toast.success("Welcome back with Google!");
            router.replace("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Google Login failed.");
        } finally { setLoading(false); }
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--bg-base)", position: "relative", overflow: "hidden", padding: "20px"
        }}>
            {/* Animated Glow Orbs */}
            <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(91,110,248,0.15) 0%, transparent 60%)", filter: "blur(80px)", transform: "translateZ(0)", willChange: "transform, filter" }} />
            <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 60%)", filter: "blur(80px)", transform: "translateZ(0)", willChange: "transform, filter" }} />

            {/* Main Glass Card */}
            <div className="animate-fade-up" style={{
                display: "flex", width: "100%", maxWidth: "1000px", minHeight: "600px",
                background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                overflow: "hidden", zIndex: 1
            }}>
                {/* Left: Showcase */}
                <div className="hide-mobile" style={{
                    flex: 1, padding: "48px", display: "flex", flexDirection: "column",
                    justifyContent: "space-between", background: "linear-gradient(135deg, rgba(91,110,248,0.1) 0%, rgba(0,0,0,0) 100%)",
                    borderRight: "1px solid rgba(255,255,255,0.05)", position: "relative"
                }}>
                    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <img src="/logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "white", letterSpacing: "-0.02em" }}>
                            CareerMentor<span style={{ color: "#818cf8" }}>.ai</span>
                        </span>
                    </Link>

                    <div>
                        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "2.8rem", fontWeight: 800, color: "white", lineHeight: 1.1, marginBottom: "20px", letterSpacing: "-0.02em" }}>
                            Welcome back to your <span style={{ background: "var(--brand-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Command Center</span>.
                        </h2>
                        <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "40px" }}>
                            Pick up right where you left off. Review your latest mock interview, update your roadmap, and track your placements.
                        </p>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ShieldCheck size={20} color="#34d399" />
                            </div>
                            <div>
                                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "white" }}>Secure Login</div>
                                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>Your data is encrypted and safe</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div style={{ flex: 1, padding: "48px", display: "flex", flexDirection: "column", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ maxWidth: "380px", margin: "0 auto", width: "100%" }}>
                        <div style={{ marginBottom: "40px", textAlign: "center" }}>
                            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "2rem", fontWeight: 800, color: "white", marginBottom: "8px" }}>Sign In</h1>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                                Don&apos;t have an account? <Link href="/register" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 600, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#a5b4fc"} onMouseLeave={e => e.currentTarget.style.color = "#818cf8"}>Create one</Link>
                            </p>
                        </div>

                        {error && (
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "12px", marginBottom: "24px" }}>
                                <AlertCircle size={16} color="#f43f5e" strokeWidth={2.5} />
                                <span style={{ fontSize: "0.85rem", color: "#f43f5e", fontWeight: 500 }}>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>Email Address</label>
                                <div style={{ position: "relative" }}>
                                    <Mail size={16} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
                                        style={{ width: "100%", padding: "14px 16px 14px 44px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "0.95rem", outline: "none", transition: "all 0.1s ease" }}
                                        onFocus={e => { e.currentTarget.style.borderColor = "#818cf8"; e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
                                        onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
                                    Password
                                    <Link href="#" style={{ color: "var(--text-muted)", textDecoration: "none", fontWeight: 400 }}>Forgot?</Link>
                                </label>
                                <div style={{ position: "relative" }}>
                                    <Lock size={16} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                    <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                                        style={{ width: "100%", padding: "14px 44px 14px 44px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "0.95rem", outline: "none", transition: "all 0.1s ease" }}
                                        onFocus={e => { e.currentTarget.style.borderColor = "#818cf8"; e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
                                        onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center" }}>
                                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} style={{
                                width: "100%", padding: "14px", marginTop: "10px", background: loading ? "rgba(91,110,248,0.5)" : "var(--brand-gradient)",
                                border: "none", borderRadius: "12px", color: "white", fontWeight: 700, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.1s ease",
                                boxShadow: "0 8px 25px rgba(91,110,248,0.4)"
                            }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-2px)" }}
                                onMouseLeave={e => { if (!loading) e.currentTarget.style.transform = "none" }}
                            >
                                {loading ? <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : <>Sign In <ArrowRight size={18} /></>}
                            </button>
                        </form>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "32px 0" }}>
                            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.1em" }}>OR CONTINUE WITH</span>
                            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
                        </div>

                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google login failed.")} theme="outline" shape="rectangular" size="large" text="signin_with" width="380" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

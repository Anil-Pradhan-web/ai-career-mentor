"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Sparkles, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { registerUser } from "@/services/api";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/services/api";

const PERKS = [
    "AI-powered career intelligence",
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
            const data = await registerUser(name, email, password);
            localStorage.setItem("token", data.access_token);
            if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);
            if (data.name) localStorage.setItem("userName", data.name);
            toast.success("Account created! Welcome 🎉");
            router.replace("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || "Registration failed. Please try again.");
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
            toast.success("Welcome aboard! 🎉");
            router.replace("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Google Registration failed.");
        } finally { setLoading(false); }
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--bg-base)", position: "relative", overflow: "hidden", padding: "20px"
        }}>
            {/* Animated Glow Orbs */}
            <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 60%)", filter: "blur(80px)", transform: "translateZ(0)", willChange: "transform, filter" }} />
            <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(91,110,248,0.1) 0%, transparent 60%)", filter: "blur(80px)", transform: "translateZ(0)", willChange: "transform, filter" }} />

            {/* Main Glass Card */}
            <div className="animate-fade-up" style={{
                display: "flex", width: "100%", maxWidth: "1000px", minHeight: "650px",
                background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                overflow: "hidden", zIndex: 1
            }}>
                {/* Left: Form */}
                <div style={{ flex: 1, padding: "48px", display: "flex", flexDirection: "column", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ maxWidth: "380px", margin: "0 auto", width: "100%" }}>
                        <div style={{ marginBottom: "32px", textAlign: "center" }}>
                            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "2rem", fontWeight: 800, color: "white", marginBottom: "8px" }}>Create Account</h1>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                                Already have one? <Link href="/login" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 600, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#a5b4fc"} onMouseLeave={e => e.currentTarget.style.color = "#818cf8"}>Sign In</Link>
                            </p>
                        </div>

                        {error && (
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "12px", marginBottom: "20px" }}>
                                <AlertCircle size={16} color="#f43f5e" strokeWidth={2.5} />
                                <span style={{ fontSize: "0.85rem", color: "#f43f5e", fontWeight: 500 }}>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>Full Name</label>
                                <div style={{ position: "relative" }}>
                                    <User size={16} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" autoComplete="name"
                                        style={{ width: "100%", padding: "14px 16px 14px 44px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "0.95rem", outline: "none", transition: "all 0.1s ease" }}
                                        onFocus={e => { e.currentTarget.style.borderColor = "#818cf8"; e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
                                        onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
                                    />
                                </div>
                            </div>

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
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>Password</label>
                                <div style={{ position: "relative" }}>
                                    <Lock size={16} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                    <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password"
                                        style={{ width: "100%", padding: "14px 44px 14px 44px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "0.95rem", outline: "none", transition: "all 0.1s ease" }}
                                        onFocus={e => { e.currentTarget.style.borderColor = "#818cf8"; e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
                                        onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center" }}>
                                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {password.length > 0 && (
                                    <div style={{ marginTop: "8px" }}>
                                        <div style={{ display: "flex", gap: "4px" }}>
                                            {[1, 2, 3].map(i => (
                                                <div key={i} style={{ flex: 1, height: "4px", borderRadius: "99px", background: i <= pwStrength ? strengthColor : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                                {loading ? <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : <>Get Started <ArrowRight size={18} /></>}
                            </button>
                        </form>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "24px 0" }}>
                            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.1em" }}>OR CONTINUE WITH</span>
                            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
                        </div>

                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google login failed.")} theme="outline" shape="rectangular" size="large" text="signup_with" width="380" />
                        </div>
                    </div>
                </div>

                {/* Right: Showcase */}
                <div className="hide-mobile" style={{
                    flex: 1, padding: "48px", display: "flex", flexDirection: "column",
                    justifyContent: "space-between", background: "linear-gradient(225deg, rgba(124,58,237,0.1) 0%, rgba(0,0,0,0) 100%)",
                    borderLeft: "1px solid rgba(255,255,255,0.05)", position: "relative"
                }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", alignSelf: "flex-end" }}>
                        <div style={{ width: "36px", height: "36px", background: "var(--brand-gradient)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(91,110,248,0.4)" }}>
                            <Sparkles size={18} color="white" />
                        </div>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "white" }}>
                            CareerMentor<span style={{ color: "var(--brand-primary)" }}>.ai</span>
                        </span>
                    </Link>

                    <div>
                        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "2.8rem", fontWeight: 800, color: "white", lineHeight: 1.1, marginBottom: "20px", letterSpacing: "-0.02em" }}>
                            Start Free.<br />
                            <span style={{ background: "linear-gradient(to right, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Grow Fast.</span>
                        </h2>
                        <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "40px" }}>
                            Most developers spend months figuring out what to learn next. Our AI tells you in 60 seconds, then stays with you every step of the way.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {PERKS.map((perk, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <CheckCircle2 size={18} color="#a855f7" />
                                    <span style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.85)" }}>{perk}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

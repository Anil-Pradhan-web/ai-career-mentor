"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Mail, Lock, AlertCircle, Shield } from "lucide-react";
import { loginUser, googleLogin } from "@/services/api";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import { formatDisplayName } from "@/utils/formatName";

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill in all fields.");
    setLoading(true);
    setError("");
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.access_token);
      if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);
      const loginName = data.name && data.name !== "Administrator"
        ? data.name
        : formatDisplayName(email.split("@")[0]);
      localStorage.setItem("userName", loginName);
      localStorage.setItem("userEmail", data.email || email);
      toast.success("Welcome back!");
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Invalid credentials.");
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (tokenResponse: any) => {
    if (!tokenResponse.access_token) return;
    setLoading(true);
    setError("");
    try {
      const data = await googleLogin(tokenResponse.access_token);
      localStorage.setItem("token", data.access_token);
      if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);
      localStorage.setItem("userName", data.name && data.name !== "Administrator" ? data.name : formatDisplayName(data.email?.split("@")[0] || "User"));
      localStorage.setItem("userEmail", data.email || "");
      toast.success("Welcome back!");
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Google Login failed.");
    } finally { setLoading(false); }
  };

  const login = useGoogleLogin({ onSuccess: handleGoogleSuccess, onError: () => setError("Google login failed.") });

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6" style={{ background: "var(--bg-base)" }}>
      {/* Subtle background glow */}
      <div className="absolute pointer-events-none" style={{ top: "-30%", left: "-10%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(59, 130, 246, 0.04) 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: "-30%", right: "-10%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, transparent 70%)", filter: "blur(80px)" }} />

      <div className="flex w-full max-w-4xl overflow-hidden z-10 animate-fade-up" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-2xl)", boxShadow: "0 24px 48px rgba(0, 0, 0, 0.5)" }}>
        {/* Left Panel */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-8" style={{ background: "linear-gradient(180deg, rgba(59, 130, 246, 0.03) 0%, transparent 100%)", borderRight: "1px solid var(--border-subtle)" }}>
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <img src="/icon.svg" alt="CareerMentor.ai" className="w-8 h-8 object-contain shrink-0" />
            <span className="font-display font-semibold" style={{ fontSize: "0.875rem", color: "var(--fg-primary)" }}>CareerMentor<span style={{ color: "var(--brand)" }}>.ai</span></span>
          </Link>

          <div className="mt-auto">
            <h2 className="font-display font-bold leading-tight mb-3" style={{ fontSize: "1.5rem", color: "var(--fg-primary)", letterSpacing: "-0.03em" }}>
              Welcome back to your <span className="gradient-text">Command Center</span>.
            </h2>
            <p style={{ color: "var(--fg-secondary)", fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: "32px" }}>
              Pick up right where you left off. Review your latest mock interview, update your roadmap, and track your placements.
            </p>
            <div className="flex items-center gap-3" style={{ padding: "12px 14px", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)" }}>
              <div className="flex items-center justify-center shrink-0" style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)", color: "var(--accent-emerald)" }}>
                <Shield size={16} />
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--fg-primary)" }}>Secure Environment</div>
                <div style={{ fontSize: "0.625rem", color: "var(--fg-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Multi-Agent Protocol V4.2</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="flex-1 flex flex-col justify-center auth-right-panel" style={{ padding: "36px" }}>
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-7">
              <h1 className="font-display font-bold mb-1" style={{ fontSize: "1.5rem", color: "var(--fg-primary)", letterSpacing: "-0.03em" }}>Sign In</h1>
              <p style={{ color: "var(--fg-secondary)", fontSize: "0.8125rem" }}>
                New here? <Link href="/register" style={{ color: "#a78bfa", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px" }}>Create account</Link>
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 mb-5 animate-scale-in" style={{ padding: "10px 12px", background: "rgba(244, 63, 94, 0.06)", border: "1px solid rgba(244, 63, 94, 0.15)", borderRadius: "var(--radius-md)" }}>
                <AlertCircle size={14} style={{ color: "var(--accent-rose)", flexShrink: 0 }} />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent-rose)" }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <AuthInput label="Email Address" icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <div className="relative">
                <AuthInput label="Password" icon={Lock} type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-[34px]" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-muted)", padding: "4px" }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="mt-5">
                <AuthButton loading={loading}>Sign In <ArrowRight size={15} /></AuthButton>
              </div>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: "var(--border-default)" }} />
              <span style={{ fontSize: "0.5625rem", fontWeight: 600, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "var(--border-default)" }} />
            </div>

            <button type="button" onClick={() => login()} className="btn w-full" style={{ padding: "12px", background: "var(--bg-surface)", color: "var(--fg-primary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", fontWeight: 500, fontSize: "0.8125rem" }}>
              <GoogleIcon /> Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

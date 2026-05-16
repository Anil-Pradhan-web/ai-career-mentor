"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Mail, Lock, AlertCircle, Shield } from "lucide-react";
import { loginUser, googleLogin } from "@/services/api";
import toast from "react-hot-toast";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
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
        setLoading(true); setError("");
        try {
            const data = await loginUser(email, password);
            localStorage.setItem("token", data.access_token);
            if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);
            if (data.name) localStorage.setItem("userName", data.name);
            toast.success("Welcome back!");
            router.replace("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || "Invalid credentials.");
        } finally { setLoading(false); }
    };

    const handleGoogleSuccess = async (tokenResponse: any) => {
        if (!tokenResponse.access_token) return;
        setLoading(true); setError("");
        try {
            const data = await googleLogin(tokenResponse.access_token);
            localStorage.setItem("token", data.access_token);
            if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);
            if (data.name) localStorage.setItem("userName", data.name);
            toast.success("Welcome back with Google!");
            router.replace("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Google Login failed.");
        } finally { setLoading(false); }
    };

    const login = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setError("Google login failed."),
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6 font-sans">
            {/* Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-radial-gradient-primary blur-[100px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-radial-gradient-secondary blur-[100px] opacity-10 pointer-events-none" />

            <div className="flex w-full max-w-5xl bg-surface/40 backdrop-blur-3xl border border-border rounded-[2rem] overflow-hidden z-10 shadow-2xl animate-fade-up">
                
                {/* Left Panel: Brand Showcase */}
                <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-primary/10 to-transparent border-r border-border/50 relative">
                    <Link href="/" className="flex items-center gap-4 no-underline group">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/20 shadow-xl transition-transform group-hover:scale-105">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover scale-110" />
                        </div>
                        <span className="font-display font-extrabold text-2xl text-white tracking-tight">
                            CareerMentor<span className="text-primary">.ai</span>
                        </span>
                    </Link>

                    <div>
                        <h2 className="font-display text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
                            Welcome back to your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Command Center</span>.
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
                            Pick up right where you left off. Review your latest mock interview, update your roadmap, and track your placements.
                        </p>
                        
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Shield className="text-emerald-400" size={24} />
                            </div>
                            <div>
                                <div className="text-white font-bold text-sm">Secure Environment</div>
                                <div className="text-slate-500 text-xs tracking-wide uppercase">Multi-Agent Protocol V4.2</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Auth Form */}
                <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center bg-black/20">
                    <div className="max-w-sm mx-auto w-full">
                        <div className="mb-10 text-center lg:text-left">
                            <h1 className="font-display text-4xl font-extrabold text-white mb-3">Sign In</h1>
                            <p className="text-slate-400 font-medium">
                                New here? <Link href="/register" className="text-primary hover:text-secondary transition-colors font-bold underline decoration-primary/30 underline-offset-4">Create account</Link>
                            </p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl mb-6 animate-shake">
                                <AlertCircle className="text-rose-500" size={18} />
                                <span className="text-sm font-semibold text-rose-500">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AuthInput 
                                label="Email Address"
                                icon={Mail}
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />

                            <div className="relative">
                                <AuthInput 
                                    label="Password"
                                    icon={Lock}
                                    type={showPw ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPw(!showPw)} 
                                    className="absolute right-4 bottom-4 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <AuthButton loading={loading}>
                                Sign In <ArrowRight size={20} />
                            </AuthButton>
                        </form>

                        <div className="flex items-center gap-4 my-10">
                            <div className="flex-1 h-[1px] bg-white/10" />
                            <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Security Gateway</span>
                            <div className="flex-1 h-[1px] bg-white/10" />
                        </div>

                        <button 
                            type="button"
                            onClick={() => login()}
                            className="w-full py-4 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-2xl border border-white shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <GoogleIcon />
                            Continue with Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    User, Lock, Shield, Save, MessageSquare as Bell, TrendingUp as CreditCard, 
    LayoutDashboard as Monitor, Map as Smartphone, Sparkles as Moon, Zap as Sun, Zap, Trash2, Key, 
    CheckCircle, Settings, Briefcase, Mail
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const router = useRouter();
    const [name, setName] = useState("User");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    // Preferences State
    const [theme, setTheme] = useState("dark");
    const [provider, setProvider] = useState("groq");
    
    // Notifications State
    const [notifMarket, setNotifMarket] = useState(true);
    const [notifInterview, setNotifInterview] = useState(true);
    const [notifProduct, setNotifProduct] = useState(false);

    useEffect(() => {
        const savedName = localStorage.getItem("userName");
        if (savedName) setName(savedName);
        const savedProvider = localStorage.getItem("preferred_provider");
        if (savedProvider) setProvider(savedProvider);
    }, []);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem("userName", name);
            localStorage.setItem("preferred_provider", provider);
            toast.success("Settings saved successfully!");
            setLoading(false);
            window.dispatchEvent(new Event("storage")); // Trigger sidebar update
        }, 600);
    };

    const TABS = [
        { id: "profile", label: "My Profile", icon: User, color: "#6366f1" },
        { id: "preferences", label: "Preferences", icon: Settings, color: "#8b5cf6" },
        { id: "notifications", label: "Notifications", icon: Bell, color: "#6366f1" },
        { id: "billing", label: "Billing & Plan", icon: CreditCard, color: "#8b5cf6" },
        { id: "security", label: "Security", icon: Shield, color: "#ef4444" },
    ];

    // Reusable Toggle Switch Component
    const ToggleSwitch = ({ checked, onChange, label, description }: any) => (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", marginBottom: "12px" }}>
            <div>
                <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "white" }}>{label}</p>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>{description}</p>
            </div>
            <div 
                onClick={() => onChange(!checked)}
                style={{
                    width: "44px", height: "24px", borderRadius: "100px",
                    background: checked ? "#6366f1" : "rgba(255,255,255,0.1)",
                    position: "relative", cursor: "pointer", transition: "background 0.2s"
                }}
            >
                <div style={{
                    width: "20px", height: "20px", borderRadius: "50%", background: "white",
                    position: "absolute", top: "2px", left: checked ? "22px" : "2px",
                    transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }} />
            </div>
        </div>
    );

    return (
        <main style={{
            flex: 1, padding: "48px 60px",
            width: "100%", position: "relative", zIndex: 1,
        }}>
            <div style={{ paddingLeft: "50px" }}>
                
                {/* Header */}
                <div className="animate-fade-up" style={{ marginBottom: "40px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))", border: "1px solid rgba(99, 102, 241, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Settings size={28} color="#818cf8" />
                        </div>
                        <div>
                            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem", fontWeight: 800, color: "white", marginBottom: "4px" }}>
                                Settings & Preferences
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.05rem" }}>
                                Manage your account, AI configurations, and billing.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="animate-fade-up-delay-1" style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
                    
                    {/* Sidebar Tabs */}
                    <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "12px", width: "100%",
                                        padding: "16px 20px", borderRadius: "16px",
                                        background: isActive ? `${tab.color}15` : "transparent",
                                        color: isActive ? "white" : "rgba(255,255,255,0.6)",
                                        fontSize: "1rem", fontWeight: isActive ? 700 : 500,
                                        cursor: "pointer", transition: "all 0.15s ease",
                                        textAlign: "left", position: "relative",
                                        border: isActive ? `1px solid ${tab.color}30` : "1px solid transparent",
                                    }}
                                    onMouseEnter={e => { if(!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "white"; } }}
                                    onMouseLeave={e => { if(!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; } }}
                                >
                                    <Icon size={20} color={isActive ? tab.color : "rgba(255,255,255,0.5)"} />
                                    {tab.label}
                                    {isActive && (
                                        <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "4px", height: "20px", background: tab.color, borderRadius: "0 4px 4px 0" }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Content Area */}
                    <div style={{
                        flex: 1, maxWidth: "800px", padding: "40px",
                        background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)",
                        border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px",
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
                    }}>

                        {/* 1. PROFILE TAB */}
                        {activeTab === "profile" && (
                            <div className="animate-fade-up">
                                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "white", marginBottom: "24px" }}>My Profile</h2>
                                
                                <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
                                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 700, color: "white", boxShadow: "0 10px 25px rgba(59,130,246,0.3)" }}>
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <button style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease", fontSize: "0.9rem" }}>Upload Avatar</button>
                                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: "8px" }}>JPG or PNG. Max size 2MB.</p>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Display Name</label>
                                        <div style={{ position: "relative" }}>
                                            <User size={18} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                                style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "1rem", outline: "none", transition: "border 0.15s ease" }}
                                                onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</label>
                                        <div style={{ position: "relative" }}>
                                            <Mail size={18} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                                            <input type="email" value="user@example.com" disabled
                                                style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: "12px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", fontSize: "1rem", outline: "none", cursor: "not-allowed" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: "32px" }}>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Professional Headline</label>
                                    <div style={{ position: "relative" }}>
                                        <Briefcase size={18} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: "16px", top: "20px" }} />
                                        <textarea placeholder="e.g. Senior Software Engineer at Tech Corp" rows={3}
                                            style={{ width: "100%", padding: "16px 16px 16px 44px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "1rem", outline: "none", transition: "border 0.15s ease", resize: "none", fontFamily: "inherit" }}
                                            onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <button onClick={handleSave} disabled={loading} style={{ padding: "14px 28px", background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: "12px", color: "white", fontWeight: 700, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.15s ease", boxShadow: "0 8px 25px rgba(99,102,241,0.3)" }}>
                                        <Save size={18} /> {loading ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 2. PREFERENCES TAB */}
                        {activeTab === "preferences" && (
                            <div className="animate-fade-up">
                                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "white", marginBottom: "32px" }}>Preferences</h2>
                                
                                <div style={{ marginBottom: "32px" }}>
                                    <h3 style={{ fontSize: "1rem", color: "white", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Zap size={18} color="#a855f7" /> AI Configuration</h3>
                                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px" }}>
                                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Default AI Provider</label>
                                        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "16px" }}>Select the underlying intelligence engine for your interviews and analysis.</p>
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            {[
                                                { id: "nvidia", label: "DeepSeek V4 Pro 🧠" },
                                                { id: "groq", label: "Llama 3.3 70B ⚡" },
                                            ].map(p => (
                                                <button key={p.id} onClick={() => setProvider(p.id)} style={{ flex: 1, padding: "16px", borderRadius: "12px", border: provider === p.id ? "2px solid #8b5cf6" : "1px solid rgba(255,255,255,0.1)", background: provider === p.id ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.03)", color: "white", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.15s ease", textTransform: "capitalize" }}>
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: "32px" }}>
                                    <h3 style={{ fontSize: "1rem", color: "white", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Monitor size={18} color="#06b6d4" /> Interface Theme</h3>
                                    <div style={{ display: "flex", gap: "16px" }}>
                                        {[
                                            { id: "light", icon: Sun, label: "Light" },
                                            { id: "dark", icon: Moon, label: "Dark" },
                                            { id: "system", icon: Monitor, label: "System" }
                                        ].map(t => (
                                            <button key={t.id} onClick={() => setTheme(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px", borderRadius: "16px", border: theme === t.id ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.1)", background: theme === t.id ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)", color: "white", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease", width: "120px" }}>
                                                <t.icon size={24} color={theme === t.id ? "#6366f1" : "rgba(255,255,255,0.5)"} />
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <button onClick={handleSave} disabled={loading} style={{ padding: "14px 28px", background: loading ? "rgba(139,92,246,0.5)" : "linear-gradient(135deg, #8b5cf6, #6366f1)", border: "none", borderRadius: "12px", color: "white", fontWeight: 700, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.15s ease", boxShadow: "0 8px 25px rgba(139,92,246,0.3)" }}>
                                        <Save size={18} /> Save Preferences
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 3. NOTIFICATIONS TAB */}
                        {activeTab === "notifications" && (
                            <div className="animate-fade-up">
                                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "white", marginBottom: "24px" }}>Notifications</h2>
                                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", marginBottom: "32px" }}>Choose how and when you want to be contacted by our AI agents.</p>
                                
                                <ToggleSwitch checked={notifMarket} onChange={setNotifMarket} label="Market Trend Alerts" description="Get notified weekly about salary and hiring trends in your target role." />
                                <ToggleSwitch checked={notifInterview} onChange={setNotifInterview} label="Interview Reminders" description="Reminders to practice mock interviews based on your roadmap." />
                                <ToggleSwitch checked={notifProduct} onChange={setNotifProduct} label="Product Updates" description="Be the first to know about new features and AI capabilities." />
                            </div>
                        )}

                        {/* 4. BILLING TAB */}
                        {activeTab === "billing" && (
                            <div className="animate-fade-up">
                                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "white", marginBottom: "24px" }}>Billing & Plan</h2>
                                
                                <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "20px", padding: "32px", marginBottom: "32px", position: "relative", overflow: "hidden" }}>
                                    <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)", filter: "blur(20px)" }} />
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
                                        <div>
                                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(99,102,241,0.2)", color: "#818cf8", padding: "6px 12px", borderRadius: "100px", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px" }}>
                                                <CheckCircle size={14} /> Current Plan
                                            </div>
                                            <h3 style={{ fontSize: "2rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: "white", marginBottom: "8px" }}>AI-Powered Career Intelligence</h3>
                                            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem" }}>You are currently on the Free Tier.</p>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <p style={{ fontSize: "2.5rem", fontWeight: 800, color: "white", lineHeight: 1 }}>$0<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>/mo</span></p>
                                        </div>
                                    </div>
                                </div>

                                <button style={{ width: "100%", padding: "18px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: "16px", color: "white", fontWeight: 700, fontSize: "1.05rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.15s ease", boxShadow: "0 8px 30px rgba(99,102,241,0.3)" }}>
                                    <Zap size={20} /> Upgrade to Pro
                                </button>
                            </div>
                        )}

                        {/* 5. SECURITY TAB */}
                        {activeTab === "security" && (
                            <div className="animate-fade-up">
                                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "white", marginBottom: "24px" }}>Security</h2>
                                
                                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
                                    <h3 style={{ fontSize: "1rem", color: "white", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Key size={18} color="#ef4444" /> Password & Authentication</h3>
                                    <button onClick={() => toast("Password reset link sent to your email.", { icon: "🔒" })} style={{ padding: "12px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px" }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                                        <Lock size={16} /> Change Password
                                    </button>
                                </div>

                                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
                                    <h3 style={{ fontSize: "1rem", color: "white", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Monitor size={18} color="#ef4444" /> Active Sessions</h3>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "12px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <Monitor size={20} color="rgba(255,255,255,0.5)" />
                                            <div>
                                                <p style={{ color: "white", fontWeight: 600, fontSize: "0.95rem" }}>Windows PC - Chrome</p>
                                                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Active Now · India</p>
                                            </div>
                                        </div>
                                        <span style={{ color: "#10b981", fontSize: "0.8rem", fontWeight: 700, padding: "4px 10px", background: "rgba(16,185,129,0.1)", borderRadius: "100px" }}>Current</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <Smartphone size={20} color="rgba(255,255,255,0.5)" />
                                            <div>
                                                <p style={{ color: "white", fontWeight: 600, fontSize: "0.95rem" }}>iPhone 15 - Safari</p>
                                                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Yesterday · India</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => {
                                        localStorage.removeItem("token");
                                        localStorage.removeItem("refreshToken");
                                        localStorage.removeItem("userName");
                                        toast.success("Successfully logged out everywhere.");
                                        router.replace("/login");
                                    }} style={{ padding: "12px 20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#fca5a5", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "8px" }} onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.2)"} onMouseLeave={e => e.currentTarget.style.background="rgba(239,68,68,0.1)"}>
                                        Log Out All Devices
                                    </button>
                                </div>

                                <div style={{ padding: "24px", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "16px", background: "rgba(239,68,68,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div>
                                        <h3 style={{ fontSize: "1rem", color: "#fca5a5", fontWeight: 600, marginBottom: "4px" }}>Delete Account</h3>
                                        <p style={{ color: "rgba(239,68,68,0.6)", fontSize: "0.85rem" }}>Permanently delete your account and all data.</p>
                                    </div>
                                    <button onClick={() => toast.error("Account deletion requested.")} style={{ padding: "10px 20px", background: "#ef4444", border: "none", borderRadius: "8px", color: "white", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(239,68,68,0.4)" }} onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </main>
    );
}

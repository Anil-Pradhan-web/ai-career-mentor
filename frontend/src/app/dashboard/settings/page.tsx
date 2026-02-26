"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Bell, Lock, CreditCard, Shield, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const router = useRouter();
    const [name, setName] = useState("User");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedName = localStorage.getItem("userName");
        if (savedName) setName(savedName);
    }, []);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem("userName", name);
            toast.success("Settings saved successfully!");
            setLoading(false);
            window.dispatchEvent(new Event("storage")); // Trigger sidebar update
        }, 800);
    };

    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", animation: "fadeUp 0.5s ease" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#f8fafc", marginBottom: "32px", fontFamily: "'Space Grotesk', sans-serif" }}>
                Settings
            </h1>

            {/* Profile Section */}
            <div style={{
                background: "rgba(15,23,42,0.6)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px",
                padding: "32px",
                marginBottom: "24px",
                backdropFilter: "blur(12px)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={20} color="#3b82f6" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#f8fafc" }}>Profile Details</h2>
                        <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Update your personal information.</p>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                width: "100%", maxWidth: "400px", padding: "12px 16px", borderRadius: "10px",
                                background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255,255,255,0.08)",
                                color: "#f8fafc", fontSize: "0.95rem", outline: "none", transition: "border 0.2s"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "rgba(16,185,129,0.5)"}
                            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</label>
                        <input
                            type="email"
                            defaultValue="your@email.com"
                            disabled
                            style={{
                                width: "100%", maxWidth: "400px", padding: "12px 16px", borderRadius: "10px",
                                background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.04)",
                                color: "#64748b", fontSize: "0.95rem", outline: "none", cursor: "not-allowed"
                            }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                        marginTop: "24px", padding: "12px 24px",
                        background: loading ? "rgba(16,185,129,0.4)" : "linear-gradient(135deg, #10b981, #3b82f6)",
                        border: "none", borderRadius: "10px", color: "white", fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px",
                        transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => (!loading && (e.currentTarget.style.transform = "translateY(-2px)"))}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                    <Save size={16} />
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Security Section */}
            <div style={{
                background: "rgba(15,23,42,0.6)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px",
                padding: "32px",
                backdropFilter: "blur(12px)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Shield size={20} color="#8b5cf6" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#f8fafc" }}>Security & Privacy</h2>
                        <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Manage your account security.</p>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button
                        onClick={() => toast("Password reset link sent to your email.", { icon: "🔒" })}
                        style={{
                            alignSelf: "flex-start", padding: "10px 20px", background: "transparent",
                            border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0",
                            fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
                        }}>
                        <Lock size={16} /> Change Password
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("userName");
                            toast.success("Successfully logged out everywhere.");
                            router.replace("/login");
                        }}
                        style={{
                            alignSelf: "flex-start", padding: "10px 20px", background: "rgba(220, 38, 38, 0.1)",
                            border: "1px solid rgba(220, 38, 38, 0.3)", borderRadius: "8px", color: "#ef4444",
                            fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
                        }}>
                        Log Out Everywhere
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

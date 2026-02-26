"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Brain,
    FileText,
    Map,
    TrendingUp,
    MessageSquare,
    Home,
    Settings,
    LogOut,
    User,
    BrainCircuit,
} from "lucide-react";

const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: BrainCircuit, label: "Full Analysis", href: "/dashboard/full-analysis" },
    { icon: FileText, label: "Resume", href: "/dashboard/resume" },
    { icon: Map, label: "Roadmap", href: "/dashboard/roadmap" },
    { icon: TrendingUp, label: "Market", href: "/dashboard/market" },
    { icon: MessageSquare, label: "Interview", href: "/dashboard/interview" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState("User");

    useEffect(() => {
        const updateAuthAndName = () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.replace("/login");
            } else {
                setIsAuthenticated(true);
                const savedName = localStorage.getItem("userName");
                if (savedName) setUserName(savedName);
            }
        };

        // Initial check
        updateAuthAndName();

        // Listen for updates from Settings or other tabs
        window.addEventListener("storage", updateAuthAndName);
        return () => {
            window.removeEventListener("storage", updateAuthAndName);
        };
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        router.replace("/login");
    };

    if (!isAuthenticated) return null; // Prevent flicker before redirect

    return (
        <aside
            style={{
                width: "240px",
                minHeight: "100vh",
                background: "rgba(15, 23, 42, 0.95)",
                borderRight: "1px solid rgba(148,163,184,0.08)",
                display: "flex",
                flexDirection: "column",
                padding: "24px 16px",
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 40,
            }}
        >
            {/* Logo */}
            <Link
                href="/"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    textDecoration: "none",
                    marginBottom: "40px",
                    padding: "0 8px",
                }}
            >
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <Brain size={18} color="white" />
                </div>
                <span
                    style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: "15px",
                        color: "#f1f5f9",
                        lineHeight: 1.2,
                    }}
                >
                    AI Career<br />
                    <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "12px" }}>
                        Mentor
                    </span>
                </span>
            </Link>

            {/* Nav Items */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                <p
                    style={{
                        fontSize: "11px",
                        color: "#475569",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "0 12px",
                        marginBottom: "8px",
                    }}
                >
                    Main Menu
                </p>

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            id={`sidebar-nav-${item.label.toLowerCase()}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px 12px",
                                borderRadius: "10px",
                                textDecoration: "none",
                                background: isActive
                                    ? "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))"
                                    : "transparent",
                                border: isActive
                                    ? "1px solid rgba(139,92,246,0.25)"
                                    : "1px solid transparent",
                                color: isActive ? "#f1f5f9" : "#94a3b8",
                                fontSize: "14px",
                                fontWeight: isActive ? 600 : 400,
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = "rgba(148,163,184,0.05)";
                                    e.currentTarget.style.color = "#f1f5f9";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "#94a3b8";
                                }
                            }}
                        >
                            <item.icon
                                size={18}
                                color={isActive ? "#818cf8" : "currentColor"}
                            />
                            {item.label}
                            {isActive && (
                                <span
                                    style={{
                                        marginLeft: "auto",
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        background: "#818cf8",
                                    }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Settings and User Profile */}
            <div style={{ borderTop: "1px solid rgba(148,163,184,0.08)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <Link
                    href="/dashboard/settings"
                    id="sidebar-nav-settings"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        textDecoration: "none",
                        color: "#94a3b8",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#f1f5f9";
                        e.currentTarget.style.background = "rgba(148,163,184,0.05)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#94a3b8";
                        e.currentTarget.style.background = "transparent";
                    }}
                >
                    <Settings size={18} />
                    Settings
                </Link>

                <div style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(148,163,184,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <User size={16} color="white" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "#f8fafc", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</span>
                            <span style={{ fontSize: "10px", color: "#94a3b8" }}>Pro Plan</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", color: "#ef4444", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                        title="Logout"
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

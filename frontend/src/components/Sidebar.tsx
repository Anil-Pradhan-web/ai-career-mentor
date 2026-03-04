"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, FileText, Map, TrendingUp,
    MessageSquare, BrainCircuit, Settings, LogOut,
    Sparkles, ChevronRight,
} from "lucide-react";

const NAV = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/full-analysis", icon: BrainCircuit, label: "Full Analysis" },
    { href: "/dashboard/resume", icon: FileText, label: "Resume" },
    { href: "/dashboard/roadmap", icon: Map, label: "Roadmap" },
    { href: "/dashboard/market", icon: TrendingUp, label: "Market" },
    { href: "/dashboard/interview", icon: MessageSquare, label: "Interview" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [userName, setUserName] = useState("User");
    const [initials, setInitials] = useState("U");

    useEffect(() => {
        const load = () => {
            const n = localStorage.getItem("userName") || "User";
            setUserName(n);
            setInitials(n.slice(0, 2).toUpperCase());
        };
        load();
        window.addEventListener("storage", load);
        return () => window.removeEventListener("storage", load);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        router.replace("/login");
    };

    return (
        <aside style={{
            position: "fixed",
            top: 0, left: 0, bottom: 0,
            width: "248px",
            background: "var(--bg-surface)",
            borderRight: "1px solid var(--border-default)",
            display: "flex",
            flexDirection: "column",
            zIndex: 40,
            overflowY: "auto",
            overflowX: "hidden",
        }}>
            {/* Logo */}
            <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
                <Link href="/" style={{
                    display: "flex", alignItems: "center", gap: "9px",
                    textDecoration: "none",
                    padding: "6px 8px",
                    borderRadius: "var(--radius-md)",
                    transition: "background 0.15s",
                }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                    <div style={{
                        width: "30px", height: "30px",
                        background: "var(--brand-gradient)",
                        borderRadius: "8px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <Sparkles size={15} color="white" />
                    </div>
                    <div>
                        <div style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700, fontSize: "0.92rem",
                            color: "var(--text-primary)", lineHeight: 1.2,
                        }}>
                            CareerMentor<span style={{ color: "var(--brand-primary)" }}>.</span>ai
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 500 }}>
                            AI Career Coach
                        </div>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
                <p style={{
                    fontSize: "0.65rem", fontWeight: 600,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "var(--text-disabled)", padding: "8px 8px 4px",
                }}>Navigation</p>

                {NAV.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                    return (
                        <Link key={href} href={href} className="sidebar-nav-link" style={{
                            background: active ? "rgba(91,110,248,0.08)" : "transparent",
                            color: active ? "#818cf8" : "var(--text-muted)",
                            borderColor: active ? "rgba(91,110,248,0.15)" : "transparent",
                            fontWeight: active ? 600 : 500,
                        }}>
                            <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                            <span style={{ flex: 1 }}>{label}</span>
                            {active && (
                                <span style={{
                                    width: "6px", height: "6px",
                                    background: "var(--brand-primary)",
                                    borderRadius: "50%",
                                    flexShrink: 0,
                                }} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div style={{ padding: "10px", borderTop: "1px solid var(--border-subtle)" }}>
                {/* Settings */}
                <Link href="/dashboard/settings" className="sidebar-nav-link" style={{
                    marginBottom: "4px",
                    background: pathname === "/dashboard/settings" ? "rgba(91,110,248,0.08)" : "transparent",
                    color: pathname === "/dashboard/settings" ? "#818cf8" : "var(--text-muted)",
                    borderColor: pathname === "/dashboard/settings" ? "rgba(91,110,248,0.15)" : "transparent",
                }}>
                    <Settings size={15} />
                    <span>Settings</span>
                </Link>

                {/* User card */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px",
                    marginTop: "4px",
                    background: "var(--bg-overlay)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                }}>
                    <div style={{
                        width: "32px", height: "32px",
                        background: "var(--brand-gradient)",
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: 700, color: "white",
                        flexShrink: 0,
                    }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: "0.82rem", fontWeight: 600,
                            color: "var(--text-primary)",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>{userName}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Free plan</div>
                    </div>
                    <button onClick={handleLogout} title="Log out" style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--text-muted)", padding: "3px",
                        borderRadius: "5px", transition: "color 0.15s, background 0.15s",
                        display: "flex", alignItems: "center",
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.background = "none"; }}
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

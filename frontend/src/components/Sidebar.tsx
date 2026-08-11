"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Map, TrendingUp,
  MessageSquare, BrainCircuit, Settings, LogOut, Shield,
} from "lucide-react";
import { formatDisplayName } from "@/utils/formatName";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/full-analysis", icon: BrainCircuit, label: "Full Analysis" },
  { href: "/dashboard/resume", icon: FileText, label: "Resume" },
  { href: "/dashboard/roadmap", icon: Map, label: "Roadmap" },
  { href: "/dashboard/market", icon: TrendingUp, label: "Market" },
  { href: "/dashboard/linkedin", icon: MessageSquare, label: "LinkedIn" },
  { href: "/dashboard/interview", icon: MessageSquare, label: "Interview" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [initials, setInitials] = useState("U");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const load = () => {
      const storedName = localStorage.getItem("userName") || "";
      const storedEmail = localStorage.getItem("userEmail") || "";
      const n = storedName && storedName !== "Administrator"
        ? storedName
        : storedEmail
          ? formatDisplayName(storedEmail.split("@")[0])
          : "User";
      setUserName(n);
      setInitials(n.slice(0, 2).toUpperCase());
      setUserEmail(storedEmail);
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userName");
    router.replace("/login");
  };

  return (
    <aside
      className="flex flex-col h-full select-none"
      style={{
        width: "100%",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Logo */}
      <div className="px-3 pt-4 pb-3">
        <Link href="/" className="flex items-center gap-2.5 no-underline" style={{ padding: "6px 8px" }}>
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-md)",
              background: "#ffffff",
              padding: "2px",
            }}
          >
            <img src="/logo.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "var(--radius-sm)" }} />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-semibold" style={{ fontSize: "0.8125rem", color: "var(--fg-primary)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              CareerMentor
              <span style={{ color: "var(--brand)" }}>.ai</span>
            </span>
            <span style={{ fontSize: "0.625rem", color: "var(--fg-muted)", letterSpacing: "0.04em", lineHeight: 1.2 }}>
              AI Career Coach
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-1 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="sidebar-nav-link"
              style={{
                background: active ? "var(--brand-glow)" : "transparent",
                color: active ? "var(--brand-light)" : "var(--fg-muted)",
                borderColor: active ? "rgba(59, 130, 246, 0.10)" : "transparent",
                fontWeight: active ? 500 : 400,
                fontSize: "0.8125rem",
              }}
            >
              <Icon size={15} strokeWidth={active ? 2 : 1.5} />
              <span className="flex-1">{label}</span>
              {active && (
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--brand)" }} />
              )}
            </Link>
          );
        })}

        {userEmail === "anilpradhan9644@gmail.com" && (
          <Link
            href="/dashboard/admin/observability"
            className="sidebar-nav-link"
            style={{
              marginTop: "8px",
              paddingTop: "10px",
              borderTop: "1px solid var(--border-subtle)",
              background: pathname === "/dashboard/admin/observability" ? "var(--brand-glow)" : "transparent",
              color: pathname === "/dashboard/admin/observability" ? "var(--brand-light)" : "var(--fg-muted)",
            }}
          >
            <Shield size={15} strokeWidth={pathname === "/dashboard/admin/observability" ? 2 : 1.5} />
            <span className="flex-1">Admin Console</span>
          </Link>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <Link href="/dashboard/settings" className="sidebar-nav-link" style={{
          marginBottom: "6px",
          background: pathname === "/dashboard/settings" ? "var(--brand-glow)" : "transparent",
          color: pathname === "/dashboard/settings" ? "var(--brand-light)" : "var(--fg-muted)",
        }}>
          <Settings size={14} strokeWidth={1.5} />
          <span>Settings</span>
        </Link>

        <div
          className="flex items-center gap-2"
          style={{
            padding: "8px 10px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-elevated)",
          }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              background: "var(--brand)",
              fontSize: "0.625rem",
              fontWeight: 700,
              color: "white",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate" style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--fg-primary)", lineHeight: 1.2 }}>
              {userName}
            </div>
            <div style={{ fontSize: "0.625rem", color: "var(--fg-muted)", lineHeight: 1.2 }}>Free plan</div>
          </div>
          <button
            suppressHydrationWarning
            onClick={handleLogout}
            title="Log out"
            className="flex items-center justify-center"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--fg-muted)",
              padding: "3px",
              borderRadius: "var(--radius-sm)",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fb7185"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}
          >
            <LogOut size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}

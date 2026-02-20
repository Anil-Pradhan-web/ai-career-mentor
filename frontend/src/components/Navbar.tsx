"use client";

import { useState, useEffect } from "react";
import { Brain, Menu, X } from "lucide-react";
import Link from "next/link";

const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Resume Analyzer", href: "/resume" },
    { label: "Mock Interview", href: "/interview" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                transition: "all 0.3s ease",
                background: scrolled ? "rgba(2, 8, 23, 0.9)" : "transparent",
                backdropFilter: scrolled ? "blur(16px)" : "none",
                borderBottom: scrolled ? "1px solid rgba(148,163,184,0.1)" : "none",
                padding: "0 24px",
            }}
        >
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "68px",
                }}
            >
                {/* Logo */}
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                        style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Brain size={20} color="white" />
                    </div>
                    <span
                        style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            fontSize: "18px",
                            color: "#f1f5f9",
                        }}
                    >
                        AI Career Mentor
                    </span>
                </Link>

                {/* Desktop Links */}
                <div style={{ display: "flex", alignItems: "center", gap: "32px" }} className="hide-mobile">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            style={{
                                color: "#94a3b8",
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: 500,
                                transition: "color 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* CTA Button */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Link href="/dashboard">
                        <button
                            className="btn-glow"
                            style={{ padding: "10px 22px", fontSize: "14px" }}
                            id="navbar-get-started-btn"
                        >
                            <span>Get Started Free</span>
                        </button>
                    </Link>
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "none" }}
                        className="show-mobile"
                        id="navbar-menu-btn"
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div
                    className="glass"
                    style={{ margin: "0 16px 16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            style={{ color: "#94a3b8", textDecoration: "none", fontSize: "15px", padding: "8px 0" }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}

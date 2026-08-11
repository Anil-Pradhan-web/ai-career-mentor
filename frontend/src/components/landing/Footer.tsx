import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="px-6" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-6 h-6 rounded flex items-center justify-center overflow-hidden" style={{
              background: "#ffffff",
              padding: "1px",
            }}>
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" style={{ borderRadius: "2px" }} />
            </div>
            <span className="font-display font-bold text-xs" style={{ color: "var(--fg-primary)" }}>
              CareerMentor<span style={{ color: "var(--brand)" }}>.ai</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {[
              { label: "Features", href: "#ai-agents" },
              { label: "Showcase", href: "#demo" },
              { label: "Pricing", href: "#pricing" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                style={{ color: "var(--fg-muted)" }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Right: Copyright + Creator */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>
            © 2026 AI Career Mentor
          </span>
          <a
            href="https://my-portfolio-anil.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all"
            style={{
              color: "var(--fg-secondary)",
              background: "var(--bg-muted)",
              border: "1px solid var(--border-default)"
            }}
          >
            Anil Pradhan →
          </a>
        </div>
      </div>
    </footer>
  );
}

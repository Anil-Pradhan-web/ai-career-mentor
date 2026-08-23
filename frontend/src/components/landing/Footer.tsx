import React from "react";
import Link from "next/link";

const PRODUCT_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const TOOL_LINKS = [
  { label: "Resume Audit", href: "/dashboard/resume" },
  { label: "Mock Interviews", href: "/dashboard/interview" },
  { label: "Career Roadmaps", href: "/dashboard/roadmap" },
  { label: "Market Trends", href: "/dashboard/market" },
  { label: "LinkedIn SEO", href: "/dashboard/linkedin" },
];

const RESOURCE_LINKS = [
  { label: "Documentation", href: "#" },
  { label: "API Reference", href: "#" },
  { label: "Status Page", href: "#" },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 no-underline mb-4">
              <img src="/icon.svg" alt="CareerMentor.ai" className="w-7 h-7 object-contain shrink-0" />
              <span className="font-display font-bold text-sm" style={{ color: "var(--fg-primary)" }}>
                CareerMentor<span style={{ color: "var(--brand)" }}>.ai</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed mb-6 max-w-xs" style={{ color: "var(--fg-muted)" }}>
              Multi-agent AI platform helping developers audit resumes, build learning roadmaps, track market trends, optimize LinkedIn profiles, and ace interviews.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#10b981" }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#10b981" }}>All Systems Operational</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] mb-5" style={{ color: "var(--fg-primary)" }}>Product</h4>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
                    className="text-xs font-medium transition-colors cursor-pointer hover:underline"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] mb-5" style={{ color: "var(--fg-primary)" }}>AI Tools</h4>
            <ul className="space-y-3">
              {TOOL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] mb-5" style={{ color: "var(--fg-primary)" }}>Resources</h4>
            <ul className="space-y-3">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>
            &copy; 2026 CareerMentor.ai. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
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
              Built by Anil Pradhan &rarr;
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

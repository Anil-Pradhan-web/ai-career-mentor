"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Brain, RefreshCcw, Sparkles } from "lucide-react";

const COMPANIES = [
  { name: "Google", logo: "/google.svg" },
  { name: "Microsoft", logo: "/microsoft.svg" },
  { name: "Amazon", logo: "/amazon.svg" },
  { name: "Meta", logo: "/meta.svg" },
  { name: "Netflix", logo: "/netflix.svg" },
  { name: "OpenAI", logo: "/openai.svg" },
  { name: "Salesforce", logo: "/salesforce.svg" },
  { name: "Cisco", logo: "/cisco.svg" },
  { name: "NVIDIA", logo: "/nvidia.svg" },
  { name: "JPMorgan", logo: "/jpmorgan.svg" },
  { name: "Apple", logo: "/apple.svg" },
  { name: "Dell", logo: "/dell.svg" },
  { name: "Flipkart", logo: "/flipkart.svg" },
  { name: "SAP", logo: "/sap.svg" },
  { name: "Spotify", logo: "/spotify.svg" }
];

export default function InterviewPrep() {
  return (
    <section id="interviews" className="py-28 px-6 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <div className="absolute pointer-events-none" style={{ top: "50%", left: "25%", transform: "translateY(-50%)", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", filter: "blur(130px)" }} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] mb-4 inline-block" style={{ color: "var(--accent-purple)" }}>
            Mock Interviews
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-6 tracking-tight leading-none" style={{ color: "var(--fg-primary)" }}>
            Ace Your Next <span className="gradient-text">Interview</span>
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
            Face tailored engineering questions matching your experience level and target role. Real-time evaluation across core competencies, live coding, and system architecture.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: Brain, title: "Multi-Competency Assessment", desc: "Data structures, algorithms, system design trade-offs, and resume project defense.", color: "var(--accent-purple)" },
            { icon: RefreshCcw, title: "Adaptive Technical Drills", desc: "Dynamically escalates question complexity and provides Staff-level exemplar blueprints.", color: "var(--accent-cyan)" },
            { icon: Sparkles, title: "Enterprise-Calibrated Personas", desc: "Simulate high-bar interviews tailored to company culture, hiring bar, and technical expectations.", color: "var(--brand)" },
          ].map((item, i) => (
            <div key={i} className="p-6" style={{
              borderRadius: "var(--radius-2xl)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)"
            }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{
                background: `color-mix(in srgb, ${item.color} 8%, transparent)`,
                border: `1px solid color-mix(in srgb, ${item.color} 15%, transparent)`,
              }}>
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: "var(--fg-primary)" }}>{item.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--fg-secondary)" }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Company Logos */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "4rem" }}>
          <div className="text-center mb-10">
            <h3 className="font-display text-xl sm:text-2xl font-black mb-2 tracking-tight" style={{ color: "var(--fg-primary)" }}>
              Practice for roles at top companies
            </h3>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>Questions mapped to real interview formats</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {COMPANIES.map((company) => (
              <div
                key={company.name}
                className="h-16 flex items-center justify-center rounded-xl p-4 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.06)"
                }}
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

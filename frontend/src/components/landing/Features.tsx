"use client";

import React from "react";
import { Activity, Target, TrendingUp, MessageSquare, Code, Building2 } from "lucide-react";

const FEATURES = [
  {
    title: "Resume & ATS Diagnostic",
    desc: "Comprehensive evaluation of keyword density, technical competency alignment, and Google XYZ impact metrics with concrete before/after bullet enhancements.",
    icon: Target,
    color: "var(--accent-emerald)",
  },
  {
    title: "Strategic Growth Roadmap",
    desc: "Vector-indexed syllabus architecture broken into weekly milestones, project capstone architectures, and vetted industry documentation links.",
    icon: Activity,
    color: "var(--accent-purple)",
  },
  {
    title: "Technical Interview Sandbox",
    desc: "Adaptive question drills with real-time feedback, Staff-level model answer blueprints, and live code evaluation across CS, algorithms, and system design.",
    icon: Code,
    color: "var(--brand)",
  },
  {
    title: "Market & Salary Intelligence",
    desc: "Real-time compensation analytics, salary band benchmarks, negotiation playbooks, and high-growth emerging tech skill signals.",
    icon: TrendingUp,
    color: "var(--accent-cyan)",
  },
  {
    title: "Executive Profile Positioning",
    desc: "Personal branding optimization, recruiter search indexing keywords, tailored cold outreach templates, and viral project showcase posts.",
    icon: MessageSquare,
    color: "var(--accent-amber)",
  },
  {
    title: "Company-Specific Simulation Engine",
    desc: "Targeted technical drills calibrated across 200+ enterprise and startup hiring rubrics, testing real-world engineering standards and problem domains.",
    icon: Building2,
    color: "var(--accent-rose)",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-28 px-6 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <div className="absolute pointer-events-none" style={{ top: "33%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)", filter: "blur(180px)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-xs font-bold uppercase tracking-[0.2em] mb-4 inline-block" style={{ color: "var(--brand)" }}>
            Platform Capabilities
          </span>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight leading-none" style={{ color: "var(--fg-primary)" }}>
            Everything You Need to <span className="gradient-text">Succeed</span>
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
            Five specialized AI agents working together to accelerate every stage of your career journey
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group relative p-8 transition-all duration-300 flex flex-col min-h-[260px] overflow-hidden"
              style={{
                borderRadius: "var(--radius-2xl)",
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)"
              }}
            >
              {/* Corner Glow */}
              <div
                className="absolute -right-16 -top-16 w-36 h-36 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `color-mix(in srgb, ${f.color} 15%, transparent)` }}
              />

              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: `color-mix(in srgb, ${f.color} 8%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${f.color} 15%, transparent)`,
                  color: f.color
                }}
              >
                <f.icon size={20} />
              </div>

              <h3 className="text-lg font-bold mb-3 tracking-tight" style={{ color: "var(--fg-primary)" }}>
                {f.title}
              </h3>

              <p className="leading-relaxed text-sm flex-1" style={{ color: "var(--fg-secondary)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

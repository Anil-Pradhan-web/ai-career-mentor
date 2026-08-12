"use client";

import React from "react";
import { Activity, Target, TrendingUp, MessageSquare, Code, BrainCircuit, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    title: "ATS Auditing Engine",
    desc: "Deterministic keyword parsing, hard-coded experience extraction, and OCR noise removal. Automatically computes true ATS scores matching over 50,000+ benchmark specifications.",
    icon: Target,
    color: "var(--accent-emerald)",
  },
  {
    title: "Syllabus RAG Planner",
    desc: "Queries localized gold-standard links via ChromaDB vector embeddings. Generates weekly roadmap plans with detailed prerequisites, hands-on projects, and practice tests.",
    icon: Activity,
    color: "var(--accent-purple)",
  },
  {
    title: "Mock Interview Engine",
    desc: "Interactive text-based interviews with real-time feedback, powered by Groq/NVIDIA streaming. Runs under a strict 7-phase FSM with an integrated coding sandbox.",
    icon: Code,
    color: "var(--brand)",
  },
  {
    title: "Market Intelligence Scraper",
    desc: "Concurrently scrapes developer articles, job platforms, and salary trends. Automatically normalizes salary metrics across global currencies and filters outdated templates.",
    icon: TrendingUp,
    color: "var(--accent-cyan)",
  },
  {
    title: "LinkedIn Profile SEO",
    desc: "Audits profile keyword density, re-keys headlines for recruiter search algorithm indexing, and generates custom section-by-section rewrite strategies using enterprise LLM pipelines.",
    icon: MessageSquare,
    color: "var(--accent-amber)",
  },
  {
    title: "Full Career Analysis",
    desc: "A coordinated multi-agent LangGraph pipeline that cross-references your resume, learning roadmap, and live market data into one unified, actionable career plan.",
    icon: BrainCircuit,
    color: "var(--accent-rose)",
  },
];

export default function Features() {
  return (
    <section id="ai-agents" className="py-28 px-6 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <div className="absolute pointer-events-none" style={{ top: "33%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)", filter: "blur(180px)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight leading-none" style={{ color: "var(--fg-primary)" }}>
            Everything You Need to <span className="gradient-text">Succeed</span>
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
            AI agents working together to accelerate your career journey
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group relative p-8 transition-all duration-300 flex flex-col justify-between min-h-[290px] overflow-hidden"
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

              <div>
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

                <h3 className="text-lg sm:text-xl font-bold mb-3 tracking-tight" style={{ color: "var(--fg-primary)" }}>
                  {f.title}
                </h3>

                <p className="leading-relaxed text-xs sm:text-sm transition-colors" style={{ color: "var(--fg-secondary)" }}>
                  {f.desc}
                </p>
              </div>

              <div className="mt-8 flex items-center">
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1.5"
                  style={{ color: f.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

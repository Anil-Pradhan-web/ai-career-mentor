"use client";

import React from "react";
import { Sparkles, Activity, Target, TrendingUp, MessageSquare, Code, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    title: "ATS Auditing Engine",
    desc: "Deterministic keyword parsing, hard-coded experience extraction, and OCR noise removal. Automatically computes true ATS scores matching over 50,000+ benchmark specifications.",
    icon: Target,
    themeColor: "#10b981", // Green (Resume Analyzer style)
    glowColor: "rgba(16, 185, 129, 0.15)",
  },
  {
    title: "Syllabus RAG Planner",
    desc: "Queries localized gold-standard links via ChromaDB vector embeddings. Generates weekly roadmap plans with detailed prerequisites, hands-on projects, Google Search resources, and practice tests.",
    icon: Activity,
    themeColor: "#a855f7", // Purple (Roadmap Planner style)
    glowColor: "rgba(168, 85, 247, 0.15)",
  },
  {
    title: "Mock Interview Engine",
    desc: "Interactive text-based interviews with real-time feedback, powered by OpenRouter/Groq streaming. Runs under a strict 7-phase FSM with an integrated coding sandbox.",
    icon: Code,
    themeColor: "#f97316", // Orange (Mock Interviewer style)
    glowColor: "rgba(249, 115, 22, 0.15)",
  },
  {
    title: "Market Intelligence Scraper",
    desc: "Concurrently scrapes developer articles, job platforms, and salary trends. Automatically normalizes salary metrics across global currencies and filters outdated templates.",
    icon: TrendingUp,
    themeColor: "#3b82f6", // Blue (Job Matcher style)
    glowColor: "rgba(59, 130, 246, 0.15)",
  },
  {
    title: "Anya Voice Assistant",
    desc: "Real-time, bidirectional voice calls using the Gemini Multimodal Live API. Connect with Anya, our sweet Hinglish AI career coach, utilizing custom audio buffering for zero jitter.",
    icon: Sparkles,
    themeColor: "#ec4899", // Pink (Career Coach style)
    glowColor: "rgba(236, 72, 153, 0.15)",
  },
  {
    title: "LinkedIn Profile SEO",
    desc: "Audits profile keyword density, re-keys headlines for recruiter search algorithm indexing, and generates custom section-by-section rewrite strategies using enterprise LLM pipelines.",
    icon: MessageSquare,
    themeColor: "#06b6d4", // Cyan
    glowColor: "rgba(6, 182, 212, 0.15)",
  },
];

export default function Features() {
  return (
    <section id="ai-agents" className="py-28 px-6 relative overflow-hidden bg-slate-950">
      {/* Background decoration */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-500/5 via-purple-500/5 to-transparent blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-none">
            Everything You Need to <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Succeed</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            AI agents working together to accelerate your career journey
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div 
              key={i} 
              className="group relative p-8 rounded-[2rem] bg-[#070913]/70 border border-white/[0.06] hover:border-white/10 hover:bg-[#0c0e1a]/95 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between min-h-[290px] overflow-hidden"
            >
              {/* Corner Glow Highlight */}
              <div 
                className="absolute -right-16 -top-16 w-36 h-36 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: f.glowColor }}
              />

              <div>
                {/* Glowing Badge/Icon Container */}
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105"
                  style={{ 
                    background: `${f.themeColor}12`, 
                    border: `1px solid ${f.themeColor}22`,
                    color: f.themeColor 
                  }}
                >
                  <f.icon size={20} />
                </div>

                {/* Card Title */}
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 tracking-tight">
                  {f.title}
                </h3>
                
                {/* Card Description */}
                <p className="text-slate-400 leading-relaxed text-xs sm:text-sm group-hover:text-slate-300 transition-colors">
                  {f.desc}
                </p>
              </div>

              {/* Bottom Arrow Indicator */}
              <div className="mt-8 flex items-center">
                <ArrowRight 
                  size={18} 
                  className="transition-transform duration-300 group-hover:translate-x-1.5" 
                  style={{ color: f.themeColor }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

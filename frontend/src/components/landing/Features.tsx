"use client";

import React from "react";
import { Sparkles, Activity, Target, TrendingUp, Shield, Zap, MessageSquare, Code } from "lucide-react";


const FEATURES = [
  {
    title: "ATS Auditing Engine",
    desc: "Deterministic keyword parsing, hard-coded experience extraction, and OCR noise removal. Automatically computes true ATS scores matching over 50,000+ benchmark specifications.",
    badge: "Verification Engine",
    icon: Target,
    color: "from-indigo-500 to-blue-500",
    glow: "rgba(99, 102, 241, 0.12)",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Syllabus RAG Planner",
    desc: "Queries localized gold-standard links via ChromaDB vector embeddings. Generates weekly roadmap plans with custom programming quizzes and DuckDuckGo resource searches.",
    badge: "Vector Search",
    icon: Activity,
    color: "from-purple-500 to-indigo-500",
    glow: "rgba(168, 85, 247, 0.12)",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Mock Interview Engine",
    desc: "Interactive text-based interviews with real-time feedback, powered by Nvidia/Groq streaming. Runs under a strict 7-phase FSM with an integrated coding sandbox.",
    badge: "7-Phase FSM & Sandbox",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    glow: "rgba(6, 182, 212, 0.12)",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Anya Voice Assistant",
    desc: "Real-time, bidirectional voice calls using the Gemini Multimodal Live API. Connect with Anya, our sweet Hinglish AI career coach, utilizing custom audio buffering for zero jitter.",
    badge: "Gemini Live Audio WS",
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
    glow: "rgba(244, 63, 94, 0.15)",
    colSpan: "lg:col-span-1",
  },

  {
    title: "Market Intelligence Scraper",
    desc: "Concurrently scrapes developer articles, job platforms, and salary trends. Automatically normalizes salary metrics across global currencies and filters outdated templates.",
    badge: "Live Web Scraper",
    icon: TrendingUp,
    color: "from-amber-500 to-orange-500",
    glow: "rgba(245, 158, 11, 0.12)",
    colSpan: "lg:col-span-1",
  },
  {
    title: "LinkedIn Profile SEO",
    desc: "Audits profile keyword density, re-keys headlines for recruiter search algorithm indexing, and generates custom section-by-section rewrite strategies using enterprise LLM pipelines.",
    badge: "Search Index SEO",
    icon: MessageSquare,
    color: "from-emerald-500 to-teal-500",
    glow: "rgba(16, 185, 129, 0.12)",
    colSpan: "lg:col-span-1",
  },
];


export default function Features() {
  return (
    <section id="ai-agents" className="py-32 px-6 relative overflow-hidden bg-slate-950">
      {/* Background decoration */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary/5 via-secondary/5 to-transparent blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl mb-6">
            <Zap size={12} className="text-primary animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-white uppercase">Platform Infrastructure</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-none">
            Built for Scale. Engineered <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">For Career Optimization.</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Our multi-agent architecture runs independent workflows in parallel to build an exhaustive, high-fidelity profile index matching current industry requirements.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {FEATURES.map((f, i) => (
            <div 
              key={i} 
              className={`group relative p-8 sm:p-10 rounded-[2.5rem] bg-slate-900/30 border border-white/5 hover:border-white/10 hover:bg-slate-950/40 transition-all duration-300 flex flex-col justify-between overflow-hidden ${f.colSpan}`}
              style={{
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.01), 0 10px 40px -10px rgba(0,0,0,0.3)"
              }}
            >
              {/* Blur highlight background */}
              <div 
                className="absolute -right-20 -top-20 w-44 h-44 rounded-full blur-[50px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
                style={{ background: f.glow }}
              />

              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-lg shadow-black/30 group-hover:scale-105 transition-transform duration-300`}>
                    <f.icon size={22} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 border border-white/10 bg-white/5 px-3 py-1.5 rounded-lg">
                    {f.badge}
                  </span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-black text-white mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-xs sm:text-sm group-hover:text-slate-300 transition-colors">
                  {f.desc}
                </p>
              </div>

              <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors cursor-pointer">
                <span>View System Specifications</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


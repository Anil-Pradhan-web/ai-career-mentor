"use client";

import React from "react";
import { Sparkles, Activity, Target, TrendingUp, MessageSquare, Zap } from "lucide-react";

const FEATURES = [
  {
    title: "Resume Intelligence",
    desc: "AI agents extract skills, identify gaps, and compute ATS scores against 50,000+ benchmark requirements. Truncates and summarizes resume profiles dynamically to optimize LLM performance.",
    badge: "ATS Scoring & Audit",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    glow: "rgba(6, 182, 212, 0.15)"
  },
  {
    title: "Gamified Roadmaps",
    desc: "Adaptive 8-week learning paths tailored to your experience tier. Enriched with semantic ChromaDB RAG, live YouTube query resources, and NVIDIA NIM reasoning-powered output quizzes.",
    badge: "ChromaDB RAG & Quizzes",
    icon: Activity,
    color: "from-purple-500 to-indigo-500",
    glow: "rgba(168, 85, 247, 0.15)"
  },
  {
    title: "Live Market Explorer",
    desc: "Real-time hiring volumes and salary trends. Queries search APIs, performs deep URL web scraping of source pages, sanitizes HTML, and scales salary bands by regional currencies.",
    badge: "Deep URL Web Scraping",
    icon: TrendingUp,
    color: "from-amber-500 to-orange-500",
    glow: "rgba(245, 158, 11, 0.15)"
  },
  {
    title: "LinkedIn Optimizer",
    desc: "Boost your visibility to recruiters with targeted headline recommendations, profile rewrite strategy advice, and keyword density audits optimized for recruiter search indexes.",
    badge: "Recruiter Search SEO",
    icon: MessageSquare,
    color: "from-cyan-500 to-blue-600",
    glow: "rgba(14, 165, 233, 0.15)"
  },
  {
    title: "Adaptive Mock Interviews",
    desc: "Speak with AI interviewers over a real-time WebSocket connection. Backed by a strict 7-Phase FSM state transitions controller, project deep-dives, company domain system designs, and sub-second latency overrides.",
    badge: "7-Phase FSM WS Agent",
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
    glow: "rgba(244, 63, 94, 0.15)",
    featured: true
  }
];

export default function Features() {
  return (
    <section id="ai-agents" className="py-24 px-6 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary/5 to-secondary/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Zap size={12} className="text-primary animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-primary uppercase">PRODUCTION-GRADE AGENTIC PLATFORM</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-none">
            Equipped with 5 Specialized <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Career AI Workflows.</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Our multi-agent system orchestrates in parallel to reconstruct your professional profile, analyze salary metrics, and stress-test your code and logic.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {FEATURES.map((f, i) => (
            <div 
              key={i} 
              className={`group relative p-10 rounded-[3rem] bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-slate-950/60 flex flex-col justify-between overflow-hidden ${
                f.featured ? "md:col-span-2 lg:col-span-2 shadow-xl shadow-pink-500/5 border-pink-500/20" : ""
              }`}
              style={{
                boxShadow: `inset 0 1px 1px rgba(255,255,255,0.02), 0 10px 40px -10px rgba(0,0,0,0.3)`
              }}
            >
              {/* Glow backdrop behind the icon */}
              <div 
                className="absolute -right-24 -top-24 w-48 h-48 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                style={{ background: f.glow }}
              />

              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-lg group-hover:scale-115 transition-all duration-300`}>
                    <f.icon size={26} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 border border-white/5 bg-white/3 px-3 py-1.5 rounded-lg">
                    {f.badge}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-black text-white mb-4 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm group-hover:text-slate-300 transition-colors">
                  {f.desc}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2 text-xs font-black text-slate-500 group-hover:text-white transition-colors cursor-pointer">
                <span>Explore Workflow</span>
                <span className="group-hover:translate-x-1.5 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

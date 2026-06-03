import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Play, Shield, Zap, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-36 pb-36 overflow-hidden bg-slate-950">
      {/* Background Grid & Glowing Aura */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Decorative Blur Blobs */}
      <div className="absolute top-12 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-24 right-1/4 w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[90px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        {/* Combined Pill Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/60 border border-white/5 hover:border-primary/20 backdrop-blur-xl shadow-xl transition-all duration-300 group cursor-pointer">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
            </span>
            <span className="text-[10px] font-black text-slate-300 tracking-[0.25em] uppercase">
              Production-Grade v4.5 Live
            </span>
            <span className="w-px h-3 bg-white/10" />
            <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider flex items-center gap-1 group-hover:text-white transition-colors">
              Cooperative Multi-Agent <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] mb-6 tracking-tight">
          Maximize Your Career Path <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#6366f1] via-[#d946ef] to-[#06b6d4] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(217,70,239,0.15)]">
            With Cooperative Agents.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed mb-12">
          Empower your professional journey. CareerMentor orchestrates independent AI agents in parallel to audit your resume, simulate interviews with domain-specific state machines, and fetch real-time market data.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-20">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/10 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>Launch Platform</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a 
            href="#demo" 
            className="w-full sm:w-auto px-8 py-4 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/5 hover:border-white/10 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Play size={12} fill="currentColor" />
            <span>Explore Showcase</span>
          </a>
        </div>

        {/* Agent Grid */}
        <div className="mt-28 pt-12 border-t border-white/5">
          <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase mb-8">
            Decentralized Agents Collaborating Under 7-Phase FSM
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { name: "ATS Auditing", role: "Resume Agent", icon: Shield, color: "#6366f1" },
              { name: "Market Scrapes", role: "Metrics Agent", icon: TrendingUp, color: "#06b6d4" },
              { name: "Syllabus RAG", role: "Roadmap Agent", icon: Zap, color: "#a855f7" },
              { name: "Live Audio WS", role: "Interview Agent", icon: Sparkles, color: "#ec4899" }
            ].map((agent, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 bg-slate-900/35 border border-white/5 p-4 rounded-2xl shadow-xl backdrop-blur-xl hover:border-white/10 transition-colors text-left group"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}
                >
                  <agent.icon size={18} style={{ color: agent.color }} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-white uppercase tracking-wider">{agent.role}</div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{agent.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Play, Shield, Zap, TrendingUp } from "lucide-react";



export default function Hero() {
  return (
    <section className="relative pt-48 pb-32 overflow-hidden bg-slate-950">
      {/* Background Grid & Radial Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        {/* Badges */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/5 backdrop-blur-xl shadow-2xl">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase">
              Production-Grade v4.5 Live
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-xl hover:border-primary/40 transition-colors">
            <Sparkles className="text-secondary animate-pulse" size={14} />
            <span className="text-xs font-black text-white tracking-widest uppercase">
              Multi-Agent Career Orchestrator
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black text-white leading-[1] mb-8 tracking-tighter">
          Maximize Your Career Path <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            With Cooperative Agents.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed mb-14 animate-fade-up">
          Empower your professional journey. CareerMentor orchestrates independent AI agents in parallel to audit your resume, simulate interviews with domain-specific state machines, and fetch real-time market data.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xs mx-auto">
          <Link 
            href="/register" 
            className="w-full px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white text-xs font-black uppercase tracking-widest rounded-xl border border-primary/20 hover:from-primary/95 hover:to-secondary/95 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Launch Platform <ArrowRight size={16} />
          </Link>
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


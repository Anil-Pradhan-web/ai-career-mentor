import React from "react";
import Link from "next/link";
import { ArrowRight, Shield, Zap, TrendingUp, Sparkles, Play, CheckCircle, FileText, Users, Briefcase, Brain } from "lucide-react";

const MicIcon = ({ size = 24, style, className }: { size?: number; style?: React.CSSProperties; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-slate-950">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Status Badge */}
        <div className="flex lg:justify-start justify-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-white/5 backdrop-blur-xl">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
            </span>
            <span className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">
              Production-Grade • v4.5 Live
            </span>
          </div>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left Column: Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              Maximize Your Career Path{" "}
              <span className="bg-gradient-to-r from-[#6366f1] via-[#d946ef] to-[#06b6d4] bg-clip-text text-transparent">
                With Cooperative AI Agents.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
              CareerMentor.ai orchestrates specialized AI agents that analyze, strategize, and guide you at every step from resume to role.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-8">
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/10 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Get Started for Free</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a 
                href="#demo" 
                className="w-full sm:w-auto px-8 py-4 bg-slate-900/60 hover:bg-slate-800/60 text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Play size={12} fill="currentColor" />
                <span>View Demo</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-slate-500 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-[#10b981]" /> No Credit Card</span>
              <span className="flex items-center gap-1.5"><Shield size={13} className="text-[#10b981]" /> 7-Day Free Trial</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-[#10b981]" /> Cancel Anytime</span>
            </div>
          </div>

          {/* Right Column: Agent Network Visualization */}
          <div className="relative flex items-center justify-center">
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl blur-xl pointer-events-none" />
            
            {/* Agent Network Card */}
            <div className="relative w-full max-w-lg rounded-3xl border border-white/8 bg-[#0a0e1a]/90 backdrop-blur-xl p-6 shadow-2xl overflow-hidden">
              {/* Card Top Glow */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">CareerMentor Terminal</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span className="text-[9px] font-bold text-[#10b981] uppercase tracking-wider">Live</span>
                </div>
              </div>

              {/* Agent Network Label */}
              <div className="text-center mb-5">
                <span className="text-[9px] font-black text-primary/70 uppercase tracking-[0.3em]">Agent Network Online</span>
              </div>

              {/* Top Row: 2 Agents */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <AgentCard icon={FileText} name="Resume Analyzer" desc="ATS Score, Skills, Suggestions" color="#6366f1" />
                <AgentCard icon={Zap} name="Roadmap Planner" desc="Personalized learning path generation" color="#a855f7" />
              </div>

              {/* Center: Logo Hub */}
              <div className="flex items-center justify-center my-4 relative">
                {/* Connection Lines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 rounded-full border border-dashed border-white/5 animate-spin" style={{ animationDuration: "30s" }} />
                </div>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)] border border-white/10 relative z-10">
                  <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                </div>
              </div>

              {/* Bottom Row: 2 Agents */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <AgentCard icon={MicIcon} name="Mock Interviewer" desc="Real-time practice & feedback" color="#ec4899" />
                <AgentCard icon={Briefcase} name="Job Matcher" desc="Smart role matching & recommendations" color="#06b6d4" />
              </div>

              {/* Bottom Center: 1 Agent */}
              <div className="flex justify-center mt-3">
                <div className="w-full max-w-[calc(50%-6px)]">
                  <AgentCard icon={Brain} name="Career Coach" desc="Guidance, Strategy & Mentorship" color="#10b981" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="max-w-7xl mx-auto px-6 mt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, value: "10K+", label: "Active Users", color: "#6366f1" },
            { icon: FileText, value: "25K+", label: "Resumes Analyzed", color: "#a855f7" },
            { icon: MicIcon, value: "50K+", label: "Mock Interviews", color: "#ec4899" },
            { icon: Sparkles, value: "95%+", label: "User Satisfaction", color: "#10b981" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-sm hover:border-white/10 transition-colors group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}25` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Mini Agent Card Component */
function AgentCard({ icon: Icon, name, desc, color }: { icon: any; name: string; desc: string; color: string }) {
  return (
    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 hover:border-white/10 transition-all duration-200 group cursor-default">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-[10px] font-black text-white uppercase tracking-wider leading-tight">{name}</span>
      </div>
      <p className="text-[9px] text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Play, Shield, Zap, TrendingUp } from "lucide-react";

const TerminalIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const CpuIcon = ({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="15" x2="23" y2="15" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="15" x2="4" y2="15" />
  </svg>
);

export default function Hero() {
  const [logs, setLogs] = useState<string[]>([
    "❯ [System] Initializing Multi-Agent Cooperative Engine...",
    "❯ [System] Connected to secure model nodes successfully."
  ]);
  const [activeAgent, setActiveAgent] = useState(0); // 0: Resume, 1: Metrics, 2: Roadmap, 3: Interview

  useEffect(() => {
    const logTimeline = [
      { text: "❯ [ATS-Agent] Staging: Scanning resume formatting rules...", agent: 0 },
      { text: "❯ [ATS-Agent] Parsing structure: Education, Experience, Skills found.", agent: 0 },
      { text: "❯ [ATS-Agent] Audit complete: Score 87/100. Highlighted 3 missing keywords.", agent: 0 },
      { text: "❯ [Metrics-Agent] Activating search engine cluster...", agent: 1 },
      { text: "❯ [Metrics-Agent] Scraping live salaries for 'Software Engineer' in 'Bengaluru'...", agent: 1 },
      { text: "❯ [Metrics-Agent] Telemetry ready: Avg CTC range ₹12.5L - ₹24.0L.", agent: 1 },
      { text: "❯ [Roadmap-Agent] Triggering Syllabus RAG database lookups...", agent: 2 },
      { text: "❯ [Roadmap-Agent] Compiling 12-week custom node path... Success.", agent: 2 },
      { text: "❯ [Interview-Agent] Pre-warming Web Audio streaming context...", agent: 3 },
      { text: "❯ [Interview-Agent] Established wss socket link to Gemini Live API.", agent: 3 },
      { text: "❯ [Interview-Agent] Anya persona online. Awaiting candidate input...", agent: 3 },
      { text: "❯ [System] All cooperative agents processed successfully. System idle.", agent: -1 }
    ];

    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < logTimeline.length) {
        const item = logTimeline[logIdx];
        setLogs(prev => [...prev.slice(-5), item.text]); // Keep last 6 lines
        if (item.agent !== undefined && item.agent !== -1) {
          setActiveAgent(item.agent);
        }
        logIdx++;
      } else {
        logIdx = 0;
        setLogs([
          "❯ [System] Initializing Multi-Agent Cooperative Engine...",
          "❯ [System] Connected to secure model nodes successfully."
        ]);
        setActiveAgent(0);
      }
    }, 2800);

    return () => clearInterval(interval);
  }, []);

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

        {/* Live Telemetry Terminal Console (Mock Agent Simulation) */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-white/5 bg-[#030712]/80 backdrop-blur-xl shadow-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors duration-300">
          {/* Card Top Border Accent */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          {/* Top Header */}
          <div className="flex items-center justify-between border-bottom border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]/80" />
              <span className="w-px h-3 bg-white/10 mx-2" />
              <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                <TerminalIcon size={12} />
                <span>Agent Core Telemetry // Console</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10b981]/10 border border-[#10b981]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[#10b981] font-mono text-[9px] font-bold uppercase tracking-wider">Pipeline Active</span>
            </div>
          </div>

          {/* Split Content: Column 1 = Agents, Column 2 = Console logs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: 4 Agent status modules */}
            <div className="md:col-span-5 flex flex-col gap-3">
              {[
                { id: 0, name: "Resume Audit Agent", desc: "ATS Auditing Engine", icon: Shield, color: "#6366f1" },
                { id: 1, name: "Metrics Scraper Agent", desc: "Market Scrapes & Salary", icon: TrendingUp, color: "#06b6d4" },
                { id: 2, name: "Roadmap RAG Agent", desc: "Syllabus Generation", icon: Zap, color: "#a855f7" },
                { id: 3, name: "Interview Audio Agent", desc: "Anya Live Audio WS", icon: Sparkles, color: "#ec4899" }
              ].map((agent) => {
                const isActive = activeAgent === agent.id;
                return (
                  <div 
                    key={agent.id}
                    className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-300 text-left ${isActive ? "bg-slate-900/80 border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.08)] scale-[1.01]" : "bg-slate-950/20 border-white/5 opacity-55"}`}
                  >
                    <div 
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300`}
                      style={{ 
                        background: isActive ? `${agent.color}20` : "rgba(255,255,255,0.02)", 
                        border: isActive ? `1px solid ${agent.color}40` : "1px solid rgba(255,255,255,0.05)" 
                      }}
                    >
                      <agent.icon size={16} style={{ color: isActive ? agent.color : "#94a3b8" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black text-white uppercase tracking-wider">{agent.name}</div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{agent.desc}</div>
                    </div>
                    {isActive ? (
                      <span className="text-[8px] font-mono font-bold text-[#10b981] px-1.5 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/20 uppercase tracking-widest animate-pulse">Active</span>
                    ) : (
                      <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Idle</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Console log terminal */}
            <div className="md:col-span-7 rounded-xl border border-white/5 bg-slate-950 p-5 flex flex-col justify-between font-mono text-xs text-left min-h-[220px]">
              <div className="space-y-2.5 overflow-hidden">
                {logs.map((log, idx) => {
                  let color = "text-slate-400";
                  if (log.includes("[ATS-Agent]")) color = "text-[#818cf8]";
                  else if (log.includes("[Metrics-Agent]")) color = "text-[#22d3ee]";
                  else if (log.includes("[Roadmap-Agent]")) color = "text-[#c084fc]";
                  else if (log.includes("[Interview-Agent]")) color = "text-[#f472b6]";
                  else if (log.includes("[System]")) color = "text-slate-300";

                  if (log.includes("complete") || log.includes("ready") || log.includes("Success") || log.includes("online")) {
                    return (
                      <div key={idx} className={`${color} flex items-start gap-1.5`}>
                        <span className="text-slate-500 shrink-0">&gt;</span>
                        <span>{log.replace("❯ ", "")} <span className="text-[#10b981] font-bold text-[9px] px-1.5 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/20 uppercase ml-1 tracking-wider inline-block scale-90">Success</span></span>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className={`${color} flex items-start gap-1.5`}>
                      <span className="text-slate-500 shrink-0">&gt;</span>
                      <span>{log.replace("❯ ", "")}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-1.5 border-t border-white/5 pt-3.5 mt-3 text-slate-500 text-[10px]">
                <CpuIcon size={12} className="animate-spin text-primary" style={{ animationDuration: "3s" }} />
                <span>Engine Latency: 14ms // Parallel pipelines: 4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


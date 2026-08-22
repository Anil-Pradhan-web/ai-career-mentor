import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, TrendingUp, Sparkles, FileText, Users, Activity, MessageSquare } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "4rem 4rem",
        maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)"
      }} />

      {/* Ambient Glows */}
      <div className="absolute pointer-events-none" style={{ top: 0, left: "25%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", filter: "blur(120px)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: 0, right: "25%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", filter: "blur(100px)" }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left Column */}
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] mb-6 tracking-tight" style={{ color: "var(--fg-primary)" }}>
              Your Complete AI Career Co-Pilot.{" "}
              <span className="gradient-text block mt-2">
                From Resume Scan to Hired.
              </span>
            </h1>

            <p className="text-sm sm:text-base leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0" style={{ color: "var(--fg-secondary)" }}>
              Scan your resume for instant ATS scores, bridge skill gaps with personalized roadmaps, track salary and market trends for any role globally, build your recruiter brand with LinkedIn strategy, and ace mock interviews with real-time feedback.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-8">
              <Link
                href="/register"
                className="btn btn-primary w-full sm:w-auto"
                style={{ padding: "16px 32px", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}
              >
                <span>Get Started for Free</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column: Agent Network Visualization */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)", filter: "blur(60px)" }} />

            {/* Agent Network Card */}
            <div className="relative w-full max-w-lg p-6 overflow-hidden" style={{
              borderRadius: "var(--radius-2xl)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.4)"
            }}>
              {/* Top Glow Line */}
              <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(59,130,246,0.3), transparent)" }} />

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} style={{ color: "var(--brand)" }} />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--fg-primary)" }}>Platform Modules</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-emerald)" }} />
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--accent-emerald)" }}>Active</span>
                </div>
              </div>

              {/* Label */}
              <div className="text-center mb-5">
                <span className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: "var(--brand)", opacity: 0.7 }}>Services Sandbox</span>
              </div>

              {/* Top Row */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <AgentCard icon={FileText} name="Resume Audit" desc="ATS Score, Skills, Suggestions" color="var(--brand)" />
                <AgentCard icon={Zap} name="Roadmap Builder" desc="Personalized learning path generation" color="var(--accent-purple)" />
              </div>

              {/* Center Logo */}
              <div className="flex items-center justify-center my-4 relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 rounded-full animate-spin" style={{ border: "1px dashed rgba(255,255,255,0.04)", animationDuration: "30s" }} />
                </div>
                <img src="/icon.svg" alt="CareerMentor.ai" className="w-20 h-20 relative z-10 object-contain" style={{ filter: "drop-shadow(0 0 30px rgba(99,102,241,0.4))" }} />
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <AgentCard icon={Activity} name="Mock Interviews" desc="Real-time practice & feedback" color="var(--accent-rose)" />
                <AgentCard icon={TrendingUp} name="Market Explorer" desc="Live salary & job market insights" color="var(--accent-cyan)" />
              </div>

              {/* Bottom Center */}
              <div className="flex justify-center mt-3">
                <div className="w-full max-w-[calc(50%-6px)]">
                  <AgentCard icon={MessageSquare} name="LinkedIn Optimizer" desc="Recruiter-brand profile strategy" color="var(--accent-emerald)" />
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
            { icon: Users, value: "100+", label: "Active Users", color: "var(--brand)" },
            { icon: FileText, value: "500+", label: "Resumes Analyzed", color: "var(--accent-purple)" },
            { icon: Activity, value: "200+", label: "Mock Interviews", color: "var(--accent-rose)" },
            { icon: Sparkles, value: "92%", label: "User Satisfaction", color: "var(--accent-emerald)" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4 p-5 transition-colors group" style={{
              borderRadius: "var(--radius-xl)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)"
            }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{
                background: `color-mix(in srgb, ${stat.color} 8%, transparent)`,
                border: `1px solid color-mix(in srgb, ${stat.color} 15%, transparent)`
              }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight" style={{ color: "var(--fg-primary)" }}>{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentCard({ icon: Icon, name, desc, color }: { icon: any; name: string; desc: string; color: string }) {
  return (
    <div className="p-3.5 rounded-xl transition-all duration-200 group cursor-default" style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)"
    }}>
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{
          background: `color-mix(in srgb, ${color} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`
        }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider leading-tight" style={{ color: "var(--fg-primary)" }}>{name}</span>
      </div>
      <p className="text-[9px] leading-relaxed font-medium" style={{ color: "var(--fg-muted)" }}>{desc}</p>
    </div>
  );
}

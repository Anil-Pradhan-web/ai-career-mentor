"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity, Brain, ChevronRight, FileText, Map, MessageSquare,
  TrendingUp, Target, Zap, Flame, BookOpen, Trophy
} from "lucide-react";

const DASHBOARD_STATS = [
  { icon: Zap, value: "3", label: "Actions Today", color: "var(--accent-purple)" },
  { icon: Flame, value: "5", label: "Day Streak", color: "var(--accent-amber)" },
  { icon: BookOpen, value: "4", label: "Roadmaps Built", color: "var(--accent-cyan)" },
  { icon: Trophy, value: "2", label: "Analyses Done", color: "var(--accent-emerald)" },
];

const FEATURE_LIMITS = [
  { key: "resume", label: "Resume Scans", limit: "1 ATS Audit / day", icon: FileText, pct: 67, color: "#3b82f6" },
  { key: "roadmap", label: "Roadmaps", limit: "1 Syllabus / 5 days", icon: Map, pct: 100, color: "#8b5cf6" },
  { key: "interview", label: "Mock Interviews", limit: "1 Session / 7 days", icon: MessageSquare, pct: 100, color: "#06b6d4" },
  { key: "market", label: "Market Trends", limit: "1 Report / day", icon: TrendingUp, pct: 100, color: "#10b981" },
  { key: "analysis", label: "AI Analysis", limit: "1 DAG / 7 days", icon: Target, pct: 100, color: "#f59e0b" },
  { key: "linkedin", label: "LinkedIn Builder", limit: "1 Strategy / day", icon: Brain, pct: 25, color: "#6366f1" },
];

const ACTIVITY_LOG = [
  { label: "Resume ATS Analyzed", time: "5:45 PM", color: "#3b82f6" },
  { label: "Market Trends Scraped", time: "3:39 PM", color: "#10b981" },
  { label: "LinkedIn SEO Generated", time: "2:10 PM", color: "#6366f1" },
];

export default function Showcase() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "agents">("dashboard");

  return (
    <section id="demo" className="py-28 px-6 relative" style={{ background: "var(--bg-base)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.3)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] mb-4 inline-block" style={{ color: "var(--brand)" }}>
            Live Dashboard Preview
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-4 tracking-tighter" style={{ color: "var(--fg-primary)" }}>
            Your Career <span className="gradient-text">Command Center</span>
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
            A real-time view of your AI agents, usage limits, progress analytics, and activity trace.
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="relative p-[2px] rounded-[2.5rem] overflow-hidden" style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.15), transparent)"
        }}>
          <div className="rounded-[2.4rem] flex flex-col lg:flex-row overflow-hidden relative min-h-[560px]" style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)"
          }}>

            {/* Sidebar */}
            <div className="w-full lg:w-52 p-5 flex flex-col justify-between gap-6 shrink-0" style={{
              background: "var(--bg-surface)",
              borderRight: "1px solid var(--border-subtle)"
            }}>
              <div>
                <div className="flex items-center gap-2.5 mb-8">
                  <img src="/icon.svg" alt="CareerMentor.ai" className="w-8 h-8 object-contain shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-display font-black text-xs tracking-tight leading-none" style={{ color: "var(--fg-primary)" }}>
                      CareerMentor<span style={{ color: "var(--brand)" }}>.ai</span>
                    </span>
                    <span className="text-[7px] font-bold uppercase tracking-widest mt-1" style={{ color: "var(--fg-muted)" }}>
                      Live Preview
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {[
                    { id: "dashboard", icon: Activity, label: "Dashboard" },
                    { id: "agents", icon: Brain, label: "AI Agents" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-left"
                      style={{
                        background: activeTab === item.id ? "var(--brand-glow)" : "transparent",
                        color: activeTab === item.id ? "var(--brand-light)" : "var(--fg-muted)",
                        border: activeTab === item.id ? "1px solid rgba(59,130,246,0.15)" : "1px solid transparent"
                      }}
                    >
                      <item.icon size={14} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col relative overflow-y-auto" style={{ background: "var(--bg-card)" }}>

              {activeTab === "dashboard" ? (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{
                      background: "var(--brand-gradient)",
                      boxShadow: "0 4px 12px rgba(59,130,246,0.2)"
                    }}>
                      <Activity size={16} className="text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: "var(--brand)" }}>
                      <span>User Dashboard</span>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: "var(--fg-primary)" }}>
                    Good evening, <span className="gradient-text">Developer</span>
                  </h3>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DASHBOARD_STATS.map((stat, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3" style={{
                        borderRadius: "var(--radius-xl)",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)"
                      }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{
                          background: `color-mix(in srgb, ${stat.color} 10%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${stat.color} 20%, transparent)`,
                          color: stat.color
                        }}>
                          <stat.icon size={16} />
                        </div>
                        <div>
                          <div className="text-lg font-black" style={{ color: "var(--fg-primary)" }}>{stat.value}</div>
                          <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Feature Limits */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {FEATURE_LIMITS.map((limit, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3" style={{
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)"
                      }}>
                        <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path strokeWidth="3" stroke="var(--bg-muted)" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path stroke={limit.color} strokeDasharray={`${limit.pct}, 100`} strokeWidth="3.2" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <span className="absolute text-[8px] font-black" style={{ color: "var(--fg-primary)" }}>{limit.pct}%</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] font-black truncate leading-tight" style={{ color: "var(--fg-primary)" }}>{limit.label}</div>
                          <div className="text-[7px] font-bold truncate mt-0.5" style={{ color: "var(--fg-muted)" }}>{limit.limit}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Activity Trace */}
                  <div className="p-4" style={{
                    borderRadius: "var(--radius-xl)",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)"
                  }}>
                    <span className="text-[8px] font-black tracking-wider uppercase block mb-3" style={{ color: "var(--fg-secondary)" }}>Recent Activity</span>
                    <div className="space-y-3">
                      {ACTIVITY_LOG.map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: log.color }} />
                            <span className="text-[9px] font-bold" style={{ color: "var(--fg-secondary)" }}>{log.label}</span>
                          </div>
                          <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{
                      background: "var(--brand-gradient)",
                      boxShadow: "0 4px 12px rgba(59,130,246,0.2)"
                    }}>
                      <Brain size={16} className="text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: "var(--brand)" }}>
                      <span>AI Agent Network</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: "Resume Agent", desc: "ATS audit, keyword optimization, formatting", color: "var(--brand)" },
                      { name: "Roadmap Agent", desc: "Skill gap analysis, weekly learning plans", color: "var(--accent-purple)" },
                      { name: "Market Agent", desc: "Salary trends, job demand, skill popularity", color: "var(--accent-cyan)" },
                      { name: "LinkedIn Agent", desc: "Profile SEO, headline optimization", color: "var(--accent-emerald)" },
                      { name: "Interview Agent", desc: "7-phase assessment, real-time feedback", color: "var(--accent-rose)" },
                      { name: "Career Analyzer", desc: "Cross-agent pipeline, unified career plan", color: "var(--accent-amber)" },
                    ].map((agent, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4" style={{
                        borderRadius: "var(--radius-xl)",
                        background: "var(--bg-surface)",
                        border: `1px solid color-mix(in srgb, ${agent.color} 15%, var(--border-subtle))`
                      }}>
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 animate-pulse" style={{ background: agent.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--fg-primary)" }}>{agent.name}</span>
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.08)", color: "#10b981" }}>Active</span>
                          </div>
                          <p className="text-[9px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>{agent.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Footer */}
              <div className="mt-5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <div className="text-[8px] font-bold uppercase tracking-widest" style={{ color: "var(--fg-muted)" }}>Powered by Groq, Gemini & NVIDIA</div>
                <Link href="/register" className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all" style={{
                  color: "var(--fg-primary)",
                  background: "var(--brand-gradient)",
                  border: "1px solid rgba(59,130,246,0.2)"
                }}>
                  Try It Free <ChevronRight size={10} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

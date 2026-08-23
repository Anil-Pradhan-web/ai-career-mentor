"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity, Brain, ChevronRight, Zap, Shield, TrendingUp, Target, MessageSquare
} from "lucide-react";

export default function Showcase() {
  const [activeTab, setActiveTab] = useState<"overview" | "agents">("overview");

  return (
    <section id="demo" className="py-28 px-6 relative" style={{ background: "var(--bg-base)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.3)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] mb-4 inline-block" style={{ color: "var(--brand)" }}>
            Interactive Preview
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-4 tracking-tighter" style={{ color: "var(--fg-primary)" }}>
            Your Career <span className="gradient-text">Command Center</span>
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
            Preview the dashboards and AI agent modules that power your career growth.
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="relative p-[2px] rounded-[2.5rem] overflow-hidden" style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.15), transparent)"
        }}>
          <div className="rounded-[2.4rem] flex flex-col lg:flex-row overflow-hidden relative min-h-[520px]" style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)"
          }}>

            {/* Sidebar */}
            <div className="w-full lg:w-56 p-5 flex flex-col justify-between gap-6 shrink-0" style={{
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
                      Dashboard Preview
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {[
                    { id: "overview", icon: Brain, label: "Overview" },
                    { id: "agents", icon: Activity, label: "AI Agents" },
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

              <div className="p-4 hidden lg:block" style={{
                borderRadius: "var(--radius-xl)",
                background: "rgba(59,130,246,0.04)",
                border: "1px solid var(--border-subtle)"
              }}>
                <Shield size={14} style={{ color: "var(--brand)", marginBottom: "8px" }} />
                <h4 className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "var(--fg-primary)" }}>Enterprise Grade</h4>
                <p className="text-[8px] leading-normal" style={{ color: "var(--fg-muted)" }}>Autonomous agent pipelines running securely.</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative" style={{ background: "var(--bg-card)" }}>

              {activeTab === "overview" ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{
                      background: "var(--brand-gradient)",
                      boxShadow: "0 4px 12px rgba(59,130,246,0.2)"
                    }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: "var(--brand)" }}>
                      <span>User Dashboard</span>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black leading-tight uppercase" style={{ color: "var(--fg-primary)" }}>
                    Welcome to your <span className="gradient-text">Career Hub</span>
                  </h3>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: Zap, value: "5", label: "AI Agents", color: "var(--accent-purple)" },
                      { icon: Target, value: "92%", label: "ATS Score", color: "var(--accent-emerald)" },
                      { icon: TrendingUp, value: "+18%", label: "Salary Trend", color: "var(--accent-cyan)" },
                      { icon: MessageSquare, value: "3", label: "Interviews Done", color: "var(--accent-rose)" },
                    ].map((stat, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3.5" style={{
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

                  {/* Feature Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { title: "Resume Audit", desc: "ATS score, keyword gaps, formatting fixes", color: "var(--brand)" },
                      { title: "Market Trends", desc: "Live salary data, top skills, job demand", color: "var(--accent-cyan)" },
                      { title: "Career Roadmap", desc: "Personalized weekly learning plan", color: "var(--accent-purple)" },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4" style={{
                        borderRadius: "var(--radius-xl)",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)"
                      }}>
                        <div className="w-2 h-2 rounded-full mb-3" style={{ background: item.color }} />
                        <div className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "var(--fg-primary)" }}>{item.title}</div>
                        <div className="text-[9px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{
                      background: "var(--brand-gradient)",
                      boxShadow: "0 4px 12px rgba(59,130,246,0.2)"
                    }}>
                      <Activity size={16} className="text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: "var(--brand)" }}>
                      <span>AI Agent Network</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Resume Agent", desc: "ATS audit, keyword optimization, formatting", color: "var(--brand)", status: "Active" },
                      { name: "Roadmap Agent", desc: "Skill gap analysis, weekly learning plans", color: "var(--accent-purple)", status: "Active" },
                      { name: "Market Agent", desc: "Salary trends, job demand, skill popularity", color: "var(--accent-cyan)", status: "Active" },
                      { name: "LinkedIn Agent", desc: "Profile SEO, headline optimization", color: "var(--accent-emerald)", status: "Active" },
                      { name: "Interview Agent", desc: "7-phase assessment, real-time feedback", color: "var(--accent-rose)", status: "Active" },
                      { name: "Career Analyzer", desc: "Cross-agent pipeline, unified career plan", color: "var(--accent-amber)", status: "Active" },
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
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.08)", color: "#10b981" }}>{agent.status}</span>
                          </div>
                          <p className="text-[9px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>{agent.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Footer */}
              <div className="mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
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

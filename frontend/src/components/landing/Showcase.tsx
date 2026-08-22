"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity, Sparkles, TrendingUp, ChevronRight, Zap, Brain, Trophy, Star, Shield
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function Showcase() {
  const [activeTab, setActiveTab] = useState<"overview" | "analytics">("overview");

  return (
    <section id="demo" className="py-32 px-6 relative" style={{ background: "var(--bg-base)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.3)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6" style={{
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.15)"
          }}>
            <Activity size={12} className="animate-pulse" style={{ color: "var(--brand)" }} />
            <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: "var(--fg-primary)" }}>Interactive Showcase</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-4 tracking-tighter" style={{ color: "var(--fg-primary)" }}>
            Your Career <span className="gradient-text">Command Center.</span>
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
            Switch between telemetry dashboards to preview the live performance analytics and action hubs.
          </p>
        </div>

        {/* Dashboard Mockup Container */}
        <div className="relative p-[2px] rounded-[2.5rem] overflow-hidden" style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.15), transparent)"
        }}>
          <div className="rounded-[2.4rem] flex flex-col lg:flex-row overflow-hidden relative min-h-[640px]" style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)"
          }}>

            {/* Sidebar Mockup */}
            <div className="w-full lg:w-64 p-6 flex flex-col justify-between gap-8 shrink-0" style={{
              background: "var(--bg-surface)",
              borderRight: "1px solid var(--border-subtle)"
            }}>
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <img src="/icon.svg" alt="CareerMentor.ai" className="w-9 h-9 object-contain shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-display font-black text-sm tracking-tight leading-none" style={{ color: "var(--fg-primary)" }}>
                      CareerMentor<span style={{ color: "var(--brand)" }}>.ai</span>
                    </span>
                    <span className="text-[7px] font-bold uppercase tracking-widest mt-1.5 whitespace-nowrap" style={{ color: "var(--fg-muted)" }}>
                      A Project by Anil Pradhan
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {[
                    { id: "overview", icon: Brain, label: "Overview Dashboard" },
                    { id: "analytics", icon: Activity, label: "Performance Analytics" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-left"
                      style={{
                        background: activeTab === item.id ? "var(--brand-glow)" : "transparent",
                        color: activeTab === item.id ? "var(--brand-light)" : "var(--fg-muted)",
                        border: activeTab === item.id ? "1px solid rgba(59,130,246,0.15)" : "1px solid transparent"
                      }}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 hidden lg:block" style={{
                borderRadius: "var(--radius-xl)",
                background: "rgba(59,130,246,0.04)",
                border: "1px solid var(--border-subtle)"
              }}>
                <Shield size={16} style={{ color: "var(--brand)", marginBottom: "12px" }} />
                <h4 className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "var(--fg-primary)" }}>Enterprise Grade</h4>
                <p className="text-[9px] leading-normal mb-3" style={{ color: "var(--fg-muted)" }}>Autonomous agent pipelines running securely on hosted VDCs.</p>
                <div className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:underline" style={{ color: "var(--fg-primary)" }}>
                  Read SLA Docs <ChevronRight size={10} />
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative" style={{ background: "var(--bg-card)" }}>

              {activeTab === "overview" ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between w-full">
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
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span>User Dashboard</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black leading-tight uppercase" style={{ color: "var(--fg-primary)" }}>
                    Good evening, <span className="gradient-text">Anil Pradhan</span>
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Zap, value: "0", label: "Today's Actions", color: "var(--accent-purple)" },
                      { icon: () => <span className="text-sm">🔥</span>, value: "1", label: "Day Streak", color: "var(--accent-amber)" },
                      { icon: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, value: "6", label: "Roadmaps Built", color: "var(--accent-cyan)" },
                      { icon: Brain, value: "2", label: "Analyses Done", color: "var(--accent-emerald)" },
                    ].map((stat, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4" style={{
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
                          <div className="text-xl font-black" style={{ color: "var(--fg-primary)" }}>{stat.value}</div>
                          <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Weekly Engagement */}
                    <div className="flex flex-col justify-between h-64 p-5" style={{
                      borderRadius: "var(--radius-xl)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)"
                    }}>
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black tracking-wider uppercase" style={{ color: "var(--fg-secondary)" }}>Weekly Engagement</span>
                        <span className="text-[8px] font-black tracking-wider uppercase" style={{ color: "var(--brand)" }}>Today: 0</span>
                      </div>
                      <div className="flex items-end justify-between h-40 px-2 mt-4">
                        {[
                          { day: "Fri", val: 90 },
                          { day: "Sat", val: 15 },
                          { day: "Sun", val: 0 },
                          { day: "Mon", val: 0 },
                          { day: "Tue", val: 0 },
                          { day: "Wed", val: 25 },
                          { day: "Thu", val: 0 },
                        ].map((b, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                            <div className="w-3 rounded-full h-28 flex items-end overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                              <div
                                className={`w-full rounded-full transition-all duration-500 ${b.val > 0 ? "bg-gradient-to-t from-[#7c3aed] to-[#d946ef]" : ""}`}
                                style={{ height: `${b.val}%` }}
                              />
                            </div>
                            <span className="text-[8px] font-bold" style={{ color: "var(--fg-muted)" }}>{b.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Aptitude Radar */}
                    <div className="flex flex-col justify-between h-64 p-5" style={{
                      borderRadius: "var(--radius-xl)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)"
                    }}>
                      <span className="text-[8px] font-black tracking-wider uppercase" style={{ color: "var(--fg-secondary)" }}>Aptitude Radar</span>
                      <div className="flex items-center justify-center h-44 mt-2">
                        <svg className="w-36 h-36 overflow-visible" viewBox="0 0 100 100">
                          <polygon points="50,15 85,40 72,80 28,80 15,40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <polygon points="50,25 78,45 67,73 33,73 22,45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <polygon points="50,35 70,50 62,67 38,67 30,50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                          <line x1="50" y1="50" x2="50" y2="15" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <line x1="50" y1="50" x2="85" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <line x1="50" y1="50" x2="72" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <line x1="50" y1="50" x2="28" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <line x1="50" y1="50" x2="15" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <polygon
                            points="50,22 54,46 52,53 48,53 46,46"
                            fill="rgba(6, 182, 212, 0.15)"
                            stroke="#06b6d4"
                            strokeWidth="1.5"
                          />
                          <text x="50" y="10" textAnchor="middle" fill="var(--fg-muted)" fontSize="4.5" fontWeight="bold">ATS Overall</text>
                          <text x="88" y="42" textAnchor="start" fill="var(--fg-muted)" fontSize="4.5" fontWeight="bold">Keywords</text>
                          <text x="75" y="85" textAnchor="start" fill="var(--fg-muted)" fontSize="4.5" fontWeight="bold">Impact</text>
                          <text x="25" y="85" textAnchor="end" fill="var(--fg-muted)" fontSize="4.5" fontWeight="bold">Action Verbs</text>
                          <text x="12" y="42" textAnchor="end" fill="var(--fg-muted)" fontSize="4.5" fontWeight="bold">Formatting</text>
                        </svg>
                      </div>
                    </div>

                    {/* Goal Trajectory */}
                    <div className="flex flex-col justify-between h-64 p-5" style={{
                      borderRadius: "var(--radius-xl)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)"
                    }}>
                      <span className="text-[8px] font-black tracking-wider uppercase" style={{ color: "var(--fg-secondary)" }}>Goal Trajectory</span>
                      <div className="flex-1 flex flex-col items-center justify-center relative mt-2">
                        <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                          <defs>
                            <linearGradient id="cyanPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#06b6d4" />
                              <stop offset="100%" stopColor="#7c3aed" />
                            </linearGradient>
                          </defs>
                          <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="url(#cyanPurpleGrad)"
                            strokeWidth="7"
                            fill="transparent"
                            strokeDasharray="251.2"
                            strokeDashoffset={251.2 * (1 - 0.38)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-xl font-black font-display" style={{ color: "var(--fg-primary)" }}>38%</span>
                          <span className="text-[7px] font-black uppercase tracking-widest mt-0.5" style={{ color: "var(--fg-muted)" }}>Mastery</span>
                        </div>
                      </div>
                      <div
                        className="w-full rounded-xl py-2.5 px-4 flex items-center justify-between gap-2 cursor-pointer transition-all text-left"
                        style={{
                          background: "var(--bg-muted)",
                          border: "1px solid var(--border-default)"
                        }}
                        onClick={() => toast("Call with your personal agent connected.")}
                      >
                        <span className="text-[8px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--fg-secondary)" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94M21 16c-.78 0-1.56-.06-2.33-.18a.82.82 0 0 0-.82.23l-1.9 1.9A15.4 15.4 0 0 1 9 11l1.9-1.9a.83.83 0 0 0 .23-.82A13.8 13.8 0 0 1 11 5.92V3.41c-.06-.78-.71-1.41-1.5-1.41H5c-.83 0-1.5.67-1.5 1.5C3.5 13 11 20.5 20.5 20.5c.83 0 1.5-.67 1.5-1.5v-4.08c0-.79-.63-1.44-1.41-1.5" />
                          </svg>
                          Call with your personal agent
                        </span>
                        <span className="text-[10px] font-black" style={{ color: "var(--accent-purple)" }}>→</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
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
                      <Activity size={10} />
                      <span>Telemetry & Limits</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col justify-between h-56 p-5" style={{
                      borderRadius: "var(--radius-xl)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)"
                    }}>
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black tracking-wider uppercase flex items-center gap-1.5" style={{ color: "var(--fg-secondary)" }}>
                          <Trophy size={11} className="text-amber-500" /> Interview Score Trend
                        </span>
                      </div>
                      <div className="h-32 relative mt-4">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80">
                          <text x="15" y="12" textAnchor="end" fill="var(--fg-muted)" fontSize="6" fontWeight="bold">100</text>
                          <text x="15" y="27" textAnchor="end" fill="var(--fg-muted)" fontSize="6" fontWeight="bold">75</text>
                          <text x="15" y="42" textAnchor="end" fill="var(--fg-muted)" fontSize="6" fontWeight="bold">50</text>
                          <text x="15" y="57" textAnchor="end" fill="var(--fg-muted)" fontSize="6" fontWeight="bold">25</text>
                          <text x="15" y="72" textAnchor="end" fill="var(--fg-muted)" fontSize="6" fontWeight="bold">0</text>
                          <line x1="25" y1="10" x2="300" y2="10" stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />
                          <line x1="25" y1="25" x2="300" y2="25" stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />
                          <line x1="25" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />
                          <line x1="25" y1="55" x2="300" y2="55" stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />
                          <line x1="25" y1="70" x2="300" y2="70" stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />
                          <circle cx="70" cy="58" r="3.5" fill="#10b981" />
                          <text x="70" y="79" textAnchor="middle" fill="var(--fg-muted)" fontSize="6" fontWeight="bold">#1</text>
                        </svg>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between h-56 p-5" style={{
                      borderRadius: "var(--radius-xl)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)"
                    }}>
                      <span className="text-[8px] font-black tracking-wider uppercase flex items-center gap-1.5" style={{ color: "var(--fg-secondary)" }}>
                        <Star size={11} className="text-purple-400" /> Weekly Progress • This Month
                      </span>
                      <div className="flex items-end justify-around h-32 mt-4 px-4">
                        {[
                          { label: "W1", height: "0%", bg: "bg-transparent" },
                          { label: "W2", height: "0%", bg: "bg-transparent" },
                          { label: "W3", height: "85%", bg: "bg-gradient-to-t from-indigo-600 to-purple-500" },
                          { label: "W4", height: "55%", bg: "bg-gradient-to-t from-cyan-500 to-cyan-400" }
                        ].map((w, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                            <div className="w-4 rounded-t-lg h-24 flex items-end overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                              <div className={`w-full rounded-t-lg ${w.bg}`} style={{ height: w.height }} />
                            </div>
                            <span className="text-[8px] font-bold" style={{ color: "var(--fg-muted)" }}>{w.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2 p-5" style={{
                      borderRadius: "var(--radius-xl)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)"
                    }}>
                      <span className="text-[8px] font-black tracking-wider uppercase block mb-6" style={{ color: "var(--fg-secondary)" }}>Operational Limits</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { title: "Resume Scans", limit: "2/3 Requests / Day", pct: 67, color: "var(--brand)" },
                          { title: "Roadmaps", limit: "2/1 Requests / Day", pct: 100, color: "var(--accent-purple)" },
                          { title: "Interviews", limit: "6/1 Req / 2 Days", pct: 100, color: "var(--accent-cyan)" },
                          { title: "Market Trends", limit: "3/3 Requests / Day", pct: 100, color: "var(--brand)" },
                          { title: "AI Analysis", limit: "1/1 Req / 2 Days", pct: 100, color: "var(--accent-purple)" },
                          { title: "LinkedIn Reviews", limit: "1/4 Requests / Day", pct: 25, color: "var(--accent-cyan)" },
                        ].map((limit, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3" style={{
                            borderRadius: "var(--radius-md)",
                            background: "var(--bg-card)",
                            border: "1px solid var(--border-subtle)"
                          }}>
                            <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path stroke={limit.color} strokeDasharray={`${limit.pct}, 100`} strokeWidth="3.2" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                              </svg>
                              <span className="absolute text-[8px] font-black" style={{ color: "var(--fg-primary)" }}>{limit.pct}%</span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-[9px] font-black truncate leading-tight" style={{ color: "var(--fg-primary)" }}>{limit.title}</div>
                              <div className="text-[7px] font-bold truncate mt-0.5" style={{ color: "var(--fg-muted)" }}>{limit.limit}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-5" style={{
                      borderRadius: "var(--radius-xl)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)"
                    }}>
                      <div>
                        <span className="text-[8px] font-black tracking-wider uppercase block mb-4" style={{ color: "var(--fg-secondary)" }}>Recent Activity Trace</span>
                        <div className="space-y-4">
                          {[
                            { title: "Resume ATS Analyzed", time: "05:45 PM" },
                            { title: "Mock Interview Completed", time: "05:40 PM" },
                            { title: "Market Trends Scraped", time: "03:39 PM" }
                          ].map((log, idx) => (
                            <div key={idx} className="flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 animate-pulse" style={{ background: "var(--accent-rose)" }} />
                              <div>
                                <div className="text-[9px] font-black leading-none" style={{ color: "var(--fg-secondary)" }}>{log.title}</div>
                                <div className="text-[8px] font-bold mt-1 uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>{log.time}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Floating Headphone Button */}
              <div className="absolute bottom-16 right-6 z-20 sm:bottom-20">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300" style={{
                  background: "var(--brand-gradient)",
                  boxShadow: "0 0 20px rgba(59,130,246,0.4)"
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <div className="text-[8px] font-bold uppercase tracking-widest" style={{ color: "var(--fg-muted)" }}>Powered by NVIDIA NIMs & Upstash Caching</div>
                <Link href="/register" className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all" style={{
                  color: "var(--fg-primary)",
                  background: "var(--brand-gradient)",
                  border: "1px solid rgba(59,130,246,0.2)"
                }}>
                  Try Agent Module <ChevronRight size={10} />
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none rounded-[2.5rem]" style={{
            border: "1px solid rgba(255,255,255,0.05)"
          }} />
        </div>
      </div>
    </section>
  );
}

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
    <section id="demo" className="py-32 px-6 bg-slate-950/20 relative">
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl mb-6">
            <Activity size={12} className="text-primary animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-white uppercase">Interactive Showcase</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter">
            Your Career <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Command Center.</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Switch between telemetry dashboards to preview the live performance analytics and action hubs.
          </p>
        </div>

        {/* Dashboard Mockup Container */}
        <div className="relative group p-[2px] bg-gradient-to-br from-primary/20 to-transparent rounded-[2.5rem] shadow-2xl overflow-hidden shadow-primary/5">
          <div className="bg-[#050811] rounded-[2.4rem] flex flex-col lg:flex-row overflow-hidden border border-white/5 shadow-2xl relative min-h-[640px]">
            
            {/* Sidebar Mockup */}
            <div className="w-full lg:w-64 bg-[#090d16]/80 border-r border-white/5 p-6 flex flex-col justify-between gap-8 shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-purple-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-black text-sm text-white tracking-tight leading-none">
                      CareerMentor<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">.ai</span>
                    </span>
                    <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 whitespace-nowrap">
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
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-left ${activeTab === item.id ? "bg-primary/15 text-primary border border-primary/20 shadow-lg shadow-primary/5" : "text-slate-500 hover:text-white border border-transparent"}`}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-2xl border border-white/5 hidden lg:block">
                <Shield size={16} className="text-primary mb-3" />
                <h4 className="text-white text-[10px] font-black uppercase tracking-wider mb-1">Enterprise Grade</h4>
                <p className="text-[9px] text-slate-500 mb-3 leading-normal">Autonomous agent pipelines running securely on hosted VDCs.</p>
                <div className="text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1 cursor-pointer hover:underline">
                  Read SLA Docs <ChevronRight size={10} />
                </div>
              </div>
            </div>

            {/* Main Content Area - Replicating Real Dashboard */}
            <div className="flex-1 p-6 sm:p-8 lg:p-10 bg-[#050811] flex flex-col justify-between relative">
              
              {activeTab === "overview" ? (
                /* Tab 1: Dashboard Overview (Screenshot 3) */
                <div className="space-y-6">
                  {/* Top bar & Sub-label */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      {/* Blue Capsule Menu Button */}
                      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-b from-[#5b6ef8] to-[#7c3aed] text-white shadow-[0_4px_12px_rgba(91,110,248,0.25)]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </div>
                      
                      {/* Dashboard Tag */}
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-violet-400 tracking-[0.2em] uppercase">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span>User Dashboard</span>
                      </div>
                    </div>
                  </div>

                  {/* Header Title */}
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase">
                    Good evening, <span className="bg-gradient-to-r from-[#a855f7] via-[#6366f1] to-[#06b6d4] bg-clip-text text-transparent">Anil Pradhan</span>
                  </h3>

                  {/* Row of 4 Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Actions Card */}
                    <div className="bg-[#0b0f19]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                        <Zap size={16} />
                      </div>
                      <div>
                        <div className="text-xl font-black text-white">0</div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Today's Actions</div>
                      </div>
                    </div>

                    {/* Streak Card */}
                    <div className="bg-[#0b0f19]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                        <span className="text-sm">🔥</span>
                      </div>
                      <div>
                        <div className="text-xl font-black text-white flex items-center gap-1">
                          1 <span className="text-sm">🔥</span>
                        </div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Day Streak</div>
                      </div>
                    </div>

                    {/* Roadmaps Card */}
                    <div className="bg-[#0b0f19]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xl font-black text-white">6</div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Roadmaps Built</div>
                      </div>
                    </div>

                    {/* Analyses Card */}
                    <div className="bg-[#0b0f19]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                        <Brain size={16} />
                      </div>
                      <div>
                        <div className="text-xl font-black text-white">2</div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Analyses Done</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Grid: 3 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Weekly Engagement */}
                    <div className="bg-[#080b13] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-64">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase">Weekly Engagement</span>
                        <span className="text-[8px] font-black text-purple-400 tracking-wider uppercase">Today: 0</span>
                      </div>
                      {/* Bar Chart */}
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
                            <div className="w-3 bg-slate-900/60 rounded-full h-28 flex items-end overflow-hidden">
                              <div 
                                className={`w-full rounded-full transition-all duration-500 ${b.val > 0 ? "bg-gradient-to-t from-[#7c3aed] to-[#d946ef] shadow-[0_0_10px_rgba(217,70,239,0.2)]" : "bg-transparent"}`} 
                                style={{ height: `${b.val}%` }} 
                              />
                            </div>
                            <span className="text-[8px] font-bold text-slate-500">{b.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Aptitude Radar */}
                    <div className="bg-[#080b13] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-64">
                      <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase">Aptitude Radar</span>
                      {/* Radar SVG */}
                      <div className="flex items-center justify-center h-44 mt-2">
                        <svg className="w-36 h-36 overflow-visible" viewBox="0 0 100 100">
                          {/* Polygons */}
                          <polygon points="50,15 85,40 72,80 28,80 15,40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <polygon points="50,25 78,45 67,73 33,73 22,45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <polygon points="50,35 70,50 62,67 38,67 30,50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                          {/* Web lines */}
                          <line x1="50" y1="50" x2="50" y2="15" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <line x1="50" y1="50" x2="85" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <line x1="50" y1="50" x2="72" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <line x1="50" y1="50" x2="28" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <line x1="50" y1="50" x2="15" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          {/* Colored path */}
                          <polygon 
                            points="50,22 54,46 52,53 48,53 46,46" 
                            fill="rgba(6, 182, 212, 0.15)" 
                            stroke="#06b6d4" 
                            strokeWidth="1.5" 
                            className="drop-shadow-[0_0_4px_#06b6d4]"
                          />
                          {/* Labels */}
                          <text x="50" y="10" textAnchor="middle" fill="#5a6580" fontSize="4.5" className="font-bold uppercase tracking-widest">ATS Overall</text>
                          <text x="88" y="42" textAnchor="start" fill="#5a6580" fontSize="4.5" className="font-bold uppercase tracking-widest">Keywords</text>
                          <text x="75" y="85" textAnchor="start" fill="#5a6580" fontSize="4.5" className="font-bold uppercase tracking-widest">Impact</text>
                          <text x="25" y="85" textAnchor="end" fill="#5a6580" fontSize="4.5" className="font-bold uppercase tracking-widest">Action Verbs</text>
                          <text x="12" y="42" textAnchor="end" fill="#5a6580" fontSize="4.5" className="font-bold uppercase tracking-widest">Formatting</text>
                        </svg>
                      </div>
                    </div>

                    {/* Goal Trajectory */}
                    <div className="bg-[#080b13] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-64">
                      <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase">Goal Trajectory</span>
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
                          <span className="text-xl font-black text-white font-display">38%</span>
                          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Mastery</span>
                        </div>
                      </div>
                      <div 
                        className="w-full bg-[#090d16] border border-white/10 hover:border-purple-500/30 rounded-xl py-2.5 px-4 flex items-center justify-between gap-2 cursor-pointer transition-all text-left"
                        onClick={() => toast("📞 Call with your personal agent connected.")}
                      >
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 shrink-0">
                            <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94M21 16c-.78 0-1.56-.06-2.33-.18a.82.82 0 0 0-.82.23l-1.9 1.9A15.4 15.4 0 0 1 9 11l1.9-1.9a.83.83 0 0 0 .23-.82A13.8 13.8 0 0 1 11 5.92V3.41c-.06-.78-.71-1.41-1.5-1.41H5c-.83 0-1.5.67-1.5 1.5C3.5 13 11 20.5 20.5 20.5c.83 0 1.5-.67 1.5-1.5v-4.08c0-.79-.63-1.44-1.41-1.5" />
                          </svg>
                          Call with your personal agent
                        </span>
                        <span className="text-[10px] text-purple-400 font-black">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tab 2: Performance Analytics (Screenshot 2) */
                <div className="space-y-6">
                  {/* Top Capsule menu button */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-b from-[#5b6ef8] to-[#7c3aed] text-white shadow-[0_4px_12px_rgba(91,110,248,0.25)]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-violet-400 tracking-[0.2em] uppercase">
                      <Activity size={10} />
                      <span>Telemetry & Limits</span>
                    </div>
                  </div>

                  {/* Top row of 2 charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Line Chart: Interview Score Trend */}
                    <div className="bg-[#080b13] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-56">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                          <Trophy size={11} className="text-amber-500" /> Interview Score Trend
                        </span>
                      </div>
                      
                      {/* SVG Line Chart */}
                      <div className="h-32 relative mt-4">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80">
                          {/* Y-axis labels */}
                          <text x="15" y="12" textAnchor="end" fill="#5a6580" fontSize="6" className="font-bold">100</text>
                          <text x="15" y="27" textAnchor="end" fill="#5a6580" fontSize="6" className="font-bold">75</text>
                          <text x="15" y="42" textAnchor="end" fill="#5a6580" fontSize="6" className="font-bold">50</text>
                          <text x="15" y="57" textAnchor="end" fill="#5a6580" fontSize="6" className="font-bold">25</text>
                          <text x="15" y="72" textAnchor="end" fill="#5a6580" fontSize="6" className="font-bold">0</text>

                          {/* Dotted grid lines */}
                          <line x1="25" y1="10" x2="300" y2="10" stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />
                          <line x1="25" y1="25" x2="300" y2="25" stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />
                          <line x1="25" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />
                          <line x1="25" y1="55" x2="300" y2="55" stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />
                          <line x1="25" y1="70" x2="300" y2="70" stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />
                          
                          {/* Plotted Single Point (value 20 is around y=58) */}
                          <circle cx="70" cy="58" r="3.5" fill="#10b981" className="drop-shadow-[0_0_6px_#10b981]" />
                          
                          {/* Horizontal Axis label for #1 */}
                          <text x="70" y="79" textAnchor="middle" fill="#5a6580" fontSize="6" className="font-bold">#1</text>
                        </svg>
                      </div>
                    </div>

                    {/* Bar Chart: Weekly Progress */}
                    <div className="bg-[#080b13] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-56">
                      <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                        <Star size={11} className="text-purple-400" /> Weekly Progress • This Month
                      </span>
                      
                      {/* Bar Indicators */}
                      <div className="flex items-end justify-around h-32 mt-4 px-4">
                        {[
                          { label: "W1", height: "0%", bg: "bg-transparent" },
                          { label: "W2", height: "0%", bg: "bg-transparent" },
                          { label: "W3", height: "85%", bg: "bg-gradient-to-t from-indigo-600 to-purple-500" },
                          { label: "W4", height: "55%", bg: "bg-gradient-to-t from-[#06b6d4] to-cyan-400" }
                        ].map((w, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                            <div className="w-4 bg-slate-900/60 rounded-t-lg h-24 flex items-end overflow-hidden">
                              <div className={`w-full rounded-t-lg ${w.bg}`} style={{ height: w.height }} />
                            </div>
                            <span className="text-[8px] font-bold text-slate-500">{w.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row of Limits & Recent Activity */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Operational Limits (col-span-2) */}
                    <div className="md:col-span-2 bg-[#080b13] border border-white/5 rounded-2xl p-5">
                      <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase block mb-6">Operational Limits</span>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { title: "Resume Scans", limit: "2/3 Requests / Day", pct: 67, color: "text-indigo-500", stroke: "#5b6ef8" },
                          { title: "Roadmaps", limit: "2/1 Requests / Day", pct: 100, color: "text-purple-500", stroke: "#7c3aed" },
                          { title: "Interviews", limit: "6/1 Req / 2 Days", pct: 100, color: "text-cyan-500", stroke: "#06b6d4" },
                          { title: "Market Trends", limit: "3/3 Requests / Day", pct: 100, color: "text-indigo-500", stroke: "#5b6ef8" },
                          { title: "AI Analysis", limit: "1/1 Req / 2 Days", pct: 100, color: "text-purple-500", stroke: "#7c3aed" },
                          { title: "LinkedIn Reviews", limit: "1/4 Requests / Day", pct: 25, color: "text-cyan-500", stroke: "#06b6d4" },
                        ].map((limit, idx) => (
                          <div key={idx} className="bg-[#0b0f19]/70 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                            {/* Radial ring */}
                            <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className={limit.color} strokeDasharray={`${limit.pct}, 100`} strokeWidth="3.2" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                              </svg>
                              <span className="absolute text-[8px] font-black text-white">{limit.pct}%</span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-[9px] font-black text-white truncate leading-tight">{limit.title}</div>
                              <div className="text-[7px] text-slate-500 font-bold truncate mt-0.5">{limit.limit}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Activity Trace */}
                    <div className="bg-[#080b13] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase block mb-4">Recent Activity Trace</span>
                        <div className="space-y-4">
                          {[
                            { title: "Voice Call with Anya", time: "05:45 PM" },
                            { title: "Voice Call with Anya", time: "05:40 PM" },
                            { title: "Voice Call with Anya", time: "03:39 PM" }
                          ].map((log, idx) => (
                            <div key={idx} className="flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-pulse shadow-[0_0_6px_#f43f5e]" />
                              <div>
                                <div className="text-[9px] font-black text-slate-300 leading-none">{log.title}</div>
                                <div className="text-[8px] font-bold text-slate-600 mt-1 uppercase tracking-wider">{log.time}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Floating Headphone Icon Button in Bottom Right */}
              <div className="absolute bottom-16 right-6 z-20 sm:bottom-20">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#d946ef] to-[#8b5cf6] text-white flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
              </div>

              {/* Bottom footer text of terminal mockup */}
              <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Powered by NVIDIA NIMs & Upstash Caching</div>
                 <Link href="/register" className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-primary to-secondary px-4 py-2.5 rounded-lg border border-primary/20 hover:from-primary/95 hover:to-secondary/95 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all">
                    Try Agent Module <ChevronRight size={10} />
                 </Link>
              </div>

            </div>

          </div>
          
          {/* Overlay Glow for 3D effect */}
          <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]" />
        </div>
      </div>
    </section>
  );
}

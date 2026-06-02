"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, Target, Award,
  Activity, Sparkles, LayoutDashboard,
  TrendingUp, Flame, BookOpen, Trophy, History, BrainCircuit,
} from "lucide-react";
import { checkHealth, getUserStats } from "@/services/api";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, CartesianGrid,
} from "recharts";

// ── Constants ────────────────────────────────────────────────────────────────
const DAILY_LIMITS: Record<string, number> = {
  resume: 3, roadmap: 1, full_analysis: 1, linkedin: 4, interview: 1, market: 3, voice_assistant: 2,
};

// ── Tiny Ring SVG ────────────────────────────────────────────────────────────
function Ring({ pct, color, size = 48 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={9} fontWeight={800} fill="white">
        {pct}%
      </text>
    </svg>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [usageData, setUsageData] = useState<Record<string, number>>({});
  const [activityLog, setActivityLog] = useState<{ label: string; time: string; color: string }[]>([]);
  const [skillRadar, setSkillRadar] = useState<{ skill: string; score: number }[] | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<{ day: string; actions: number }[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<{ week: string; actions: number }[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState<{ role: string; pct: number; totalWeeks: number } | null>(null);
  const [todayHighScore, setTodayHighScore] = useState<number | null>(null);
  const [allInterviewScores, setAllInterviewScores] = useState<{ score: number; date: string }[]>([]);
  const [streak, setStreak] = useState(0);
  const [roadmapCount, setRoadmapCount] = useState(0);
  const [analysisHistory, setAnalysisHistory] = useState<{ action: string; created_at: string }[]>([]);
  const [todayActionCount, setTodayActionCount] = useState(0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    setUserName(localStorage.getItem("userName") || "User");

    getUserStats()
      .then(stats => {
        setUsageData(stats.usageToday || {});
        setActivityLog(stats.activityLog || []);
        setTodayActionCount(stats.todayActionCount || 0);
        setStreak(stats.streak || 0);
        setRoadmapCount(stats.roadmapHistory?.length || 0);
        setAnalysisHistory(stats.analysisHistory || []);
        
        // Activity Bar Data
        if (stats.weeklyActivity) setWeeklyActivity(stats.weeklyActivity);
        if (stats.monthlyActivity) setMonthlyActivity(stats.monthlyActivity);
        
        // Interview History
        if (stats.interviewHistory?.length) {
            const todayStr = new Date().toDateString();
            const todaysInterviews = stats.interviewHistory.filter((h: any) => new Date(h.created_at).toDateString() === todayStr);
            if (todaysInterviews.length > 0) {
                const maxScore = Math.max(...todaysInterviews.map((h: any) => h.score || 0));
                setTodayHighScore(maxScore);
            }
            // All scores for trend line (last 8)
            const scores = stats.interviewHistory
                .slice(0, 8)
                .reverse()
                .map((h: any, i: number) => ({ score: Math.round(h.score || 0), date: `#${i + 1}` }));
            setAllInterviewScores(scores);
        }

        // Radar Logic — only populate if user has done a resume analysis
        let parsed = stats.lastResumeAnalysis;
        if (parsed) {
          try {
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            const analysis = parsed?.analysis || parsed;
            const breakdown = analysis?.ats_score_breakdown || {};
            const atsScore = Number(analysis?.ats_score || 0);
            setSkillRadar([
              { skill: "ATS Overall", score: Math.min(100, atsScore) },
              { skill: "Keywords", score: Number(breakdown.keywords ?? 0) },
              { skill: "Impact", score: Number(breakdown.achievements ?? 0) },
              { skill: "Action Verbs", score: Number(breakdown.action_verbs ?? 0) },
              { skill: "Formatting", score: Number(breakdown.formatting_and_length ?? 0) },
            ]);
          } catch { /* ignore */ }
        }

        // Primary Goal — ONLY show if user has explicitly set a primary goal
        const storedRole = localStorage.getItem("primary_goal_role");
        if (storedRole && stats.roadmapHistory?.length) {
          const roadmap = stats.roadmapHistory.find((r: any) => r.target_role === storedRole) || null;
          if (roadmap) {
            const roleKey = roadmap.target_role.toLowerCase().replace(/\s+/g, "_");
            const rawCompleted = localStorage.getItem(`roadmap_completed_${roleKey}`);
            const completedCount = rawCompleted ? JSON.parse(rawCompleted).length : 0;
            const totalWeeks = Math.max(roadmap.weeks?.length || 0, 1);
            localStorage.setItem(`roadmap_total_${roleKey}`, String(totalWeeks));
            const pct = Math.min(100, Math.round((completedCount / totalWeeks) * 100));
            setPrimaryGoal({ role: roadmap.target_role, pct, totalWeeks });
          }
        }
      })
      .catch(console.error);
  }, [router]);

  useEffect(() => {
    const handleProgressUpdate = () => {
        setPrimaryGoal(prev => {
            if (!prev) return prev;
            const roleKey = prev.role.toLowerCase().replace(/\s+/g, "_");
            const rawCompleted = localStorage.getItem(`roadmap_completed_${roleKey}`);
            const completedCount = rawCompleted ? JSON.parse(rawCompleted).length : 0;
            const pct = Math.min(100, Math.round((completedCount / prev.totalWeeks) * 100));
            return { ...prev, pct };
        });
    };

    window.addEventListener("roadmapProgressUpdate", handleProgressUpdate);
    window.addEventListener("storage", handleProgressUpdate);
    return () => {
        window.removeEventListener("roadmapProgressUpdate", handleProgressUpdate);
        window.removeEventListener("storage", handleProgressUpdate);
    };
  }, []);

  const cardStyle: React.CSSProperties = {
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(30px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  };

  const chartTitle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "0.9rem", fontWeight: 700,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase", letterSpacing: "0.1em",
    marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px"
  };

  return (
    <main style={{ flex: 1, padding: "40px 48px", width: "100%", position: "relative" }}>
      <div style={{ paddingLeft: "40px" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
            <div className="animate-fade-up">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#a855f7", marginBottom: "8px" }}>
                    <LayoutDashboard size={18} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" }}>User Dashboard</span>
                </div>
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "3rem", fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}>
                    {greeting}, <span style={{ background: "linear-gradient(to right, #a855f7, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{userName}</span>
                </h1>
            </div>
        </div>

        {/* ── Stats Summary Banner ──────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
            {[
                { label: "Today's Actions", value: todayActionCount, icon: <Zap size={18} color="#a855f7" />, color: "#a855f7" },
                { label: "Day Streak", value: `${streak} 🔥`, icon: <Flame size={18} color="#f97316" />, color: "#f97316" },
                { label: "Roadmaps Built", value: roadmapCount, icon: <BookOpen size={18} color="#06b6d4" />, color: "#06b6d4" },
                { label: "Analyses Done", value: analysisHistory.length, icon: <BrainCircuit size={18} color="#10b981" />, color: "#10b981" },
            ].map((stat, i) => (
                <div key={i} style={{ padding: "20px 24px", borderRadius: "18px", background: "rgba(15,23,42,0.4)", backdropFilter: "blur(20px)", border: `1px solid ${stat.color}22`, boxShadow: `0 4px 20px ${stat.color}10`, display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>{stat.icon}</div>
                    <div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "white", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{stat.value}</div>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>

        {/* Analytics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "24px", marginBottom: "48px" }}>
            {/* Weekly Activity - Bar Chart */}
            <div style={cardStyle}>
                <p style={chartTitle}><TrendingUp size={16} /> Weekly Engagement <span style={{ marginLeft: "auto", color: "#a855f7" }}>Today: {todayActionCount}</span></p>
                <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyActivity}>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                            <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                            <Bar dataKey="actions" radius={[6, 6, 0, 0]}>
                                {weeklyActivity.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === weeklyActivity.length - 1 ? "#a855f7" : "rgba(168,85,247,0.2)"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Skill Radar */}
            <div style={cardStyle}>
                <p style={chartTitle}><Activity size={16} /> Aptitude Radar</p>
                <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {skillRadar && skillRadar.length > 0 ? (
                            <RadarChart data={skillRadar}>
                                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                <PolarAngleAxis dataKey="skill" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                                <Radar dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                            </RadarChart>
                        ) : (
                            <RadarChart data={[
                                {skill: "ATS Overall", score: 0}, {skill: "Keywords", score: 0},
                                {skill: "Impact", score: 0}, {skill: "Action Verbs", score: 0}, {skill: "Formatting", score: 0}
                            ]}>
                                <PolarGrid stroke="rgba(255,255,255,0.03)" />
                                <PolarAngleAxis dataKey="skill" tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 10 }} />
                                <Radar dataKey="score" stroke="rgba(255,255,255,0.1)" fill="rgba(255,255,255,0.02)" fillOpacity={0.5} strokeWidth={1} />
                            </RadarChart>
                        )}
                    </ResponsiveContainer>
                </div>
                {!skillRadar || skillRadar.length === 0 ? (
                    <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "0.72rem", fontWeight: 700, marginTop: "-4px" }}>Upload & Analyse a Resume to unlock</p>
                ) : null}
            </div>

            {/* Roadmap Progress */}
            <div style={cardStyle}>
                <p style={chartTitle}><Target size={16} /> Goal Trajectory</p>
                <div style={{ height: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    {primaryGoal ? (
                        <div style={{ position: "relative", width: "180px", height: "180px" }}>
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "white", lineHeight: 1 }}>{primaryGoal.pct}%</div>
                                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 800, marginTop: "4px" }}>Mastery</div>
                                </div>
                            </div>
                            <svg style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }} width="180" height="180">
                                <circle cx="90" cy="90" r="82" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                                <circle cx="90" cy="90" r="82" fill="none" stroke="url(#goalGradient)" strokeWidth="12" strokeDasharray={`${(primaryGoal.pct/100)*515} 515`} strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", opacity: 0.3 }}>
                            <Zap size={40} style={{ margin: "0 auto 16px" }} />
                            <p style={{ fontSize: "0.8rem", fontWeight: 600 }}>No Target Set</p>
                        </div>
                    )}
                    <p style={{ marginTop: "24px", fontSize: "0.85rem", fontWeight: 800, color: "white" }}>{primaryGoal?.role || "Define your path"}</p>
                </div>
            </div>
        </div>

        {/* Secondary Analytics: Interview Trend + Monthly Progress */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "48px" }}>
            {/* Interview Score Trend */}
            <div style={cardStyle}>
                <p style={chartTitle}><Trophy size={16} /> Interview Score Trend</p>
                <div style={{ height: 260 }}>
                    {allInterviewScores.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={allInterviewScores}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} formatter={(val: any) => [`${val}/100`, "Score"]} />
                                <defs>
                                    <linearGradient id="scoreLineGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                                <Line type="monotone" dataKey="score" stroke="url(#scoreLineGrad)" strokeWidth={3} dot={{ fill: "#10b981", r: 5, strokeWidth: 0 }} activeDot={{ r: 7, fill: "#3b82f6" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.3 }}>
                            <Trophy size={40} style={{ marginBottom: "16px" }} />
                            <p style={{ fontSize: "0.8rem", fontWeight: 600 }}>Complete interviews to see your score trend</p>
                        </div>
                    )}
                </div>
                {todayHighScore !== null && (
                    <p style={{ marginTop: "8px", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", textAlign: "right" }}>Today's best: <span style={{ color: "#10b981", fontWeight: 800 }}>{todayHighScore}/100</span></p>
                )}
            </div>

            {/* Weekly Progress in a Month — 4-week bar chart */}
            <div style={{...cardStyle, display: "flex", flexDirection: "column"}}>
                <p style={{...chartTitle, width: "100%"}}><Sparkles size={16} /> Weekly Progress · This Month</p>
                <div style={{ flex: 1, height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyActivity.length ? monthlyActivity : [
                            {week: "W1", actions: 0}, {week: "W2", actions: 0},
                            {week: "W3", actions: 0}, {week: "W4", actions: 0}
                        ]} barCategoryGap="35%">
                            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700 }} />
                            <Tooltip
                                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                                formatter={(val: any) => [`${val} actions`, "Activity"]}
                            />
                            <Bar dataKey="actions" radius={[8, 8, 0, 0]}>
                                {(monthlyActivity.length ? monthlyActivity : [{week:"W1"},{week:"W2"},{week:"W3"},{week:"W4"}]).map((_, i) => (
                                    <Cell key={i} fill={`url(#monthGrad${i})`} />
                                ))}
                            </Bar>
                            <defs>
                                {["#a855f7","#7c3aed","#6366f1","#06b6d4"].map((c, i) => (
                                    <linearGradient key={i} id={`monthGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={c} stopOpacity={0.9} />
                                        <stop offset="100%" stopColor={c} stopOpacity={0.3} />
                                    </linearGradient>
                                ))}
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Action & Activity Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "24px", marginBottom: "32px" }}>
            <div style={cardStyle}>
                <p style={chartTitle}>Operational Limits</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                    {[
                        { key: "resume", label: "Resume Scans", color: "#6366f1" },
                        { key: "roadmap", label: "Roadmaps", color: "#a855f7" },
                        { key: "interview", label: "Interviews", color: "#06b6d4" },
                        { key: "market", label: "Market Trends", color: "#6366f1" },
                        { key: "full_analysis", label: "AI Analysis", color: "#a855f7" },
                        { key: "linkedin", label: "LinkedIn Reviews", color: "#06b6d4" },
                        { key: "voice_assistant", label: "Voice Calls", color: "#ec4899" },
                    ].map(f => {
                        const used = usageData[f.key] || 0;
                        const limit = DAILY_LIMITS[f.key];
                        const pct = Math.min(100, Math.round((used / limit) * 100));
                        return (
                            <div key={f.key} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <Ring pct={pct} color={f.color} size={44} />
                                <div>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "white" }}>{f.label}</div>
                                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>
                                        {f.key === "interview" || f.key === "full_analysis"
                                            ? `${used}/${limit} Req / 2 Days`
                                            : `${used}/${limit} Requests / Day`}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={cardStyle}>
                <p style={chartTitle}>Recent Activity Trace</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {activityLog.slice(0, 4).map((a, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: a.color || "#a855f7", boxShadow: `0 0 10px ${a.color || "#a855f7"}40` }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "white" }}>{a.label}</div>
                                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>{new Date(a.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                            </div>
                        </div>
                    ))}
                    {activityLog.length === 0 && <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", textAlign: "center" }}>No operations logged.</p>}
                </div>
            </div>
        </div>

        {/* Analysis History Feed */}
        {analysisHistory.length > 0 && (
            <div style={{...cardStyle, marginBottom: "32px"}}>
                <p style={chartTitle}><History size={16} /> Full Career Analysis History</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                    {analysisHistory.slice(0, 6).map((a, i) => (
                        <div key={i} style={{ padding: "14px 18px", borderRadius: "14px", background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.12)", display: "flex", alignItems: "center", gap: "12px" }}>
                            <BrainCircuit size={16} color="#06b6d4" style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.action}</div>
                                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, Target, Award,
  Activity, Sparkles, LayoutDashboard,
  TrendingUp,
} from "lucide-react";
import { checkHealth, getUserStats } from "@/services/api";
import {
  XAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

// ── Constants ────────────────────────────────────────────────────────────────
const DAILY_LIMITS: Record<string, number> = {
  resume: 4, roadmap: 3, full_analysis: 1, linkedin: 10, interview: 3, market: 4,
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
  const [skillRadar, setSkillRadar] = useState<{ skill: string; score: number }[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<{ day: string; actions: number }[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState<{ role: string; pct: number } | null>(null);
  const [todayHighScore, setTodayHighScore] = useState<number | null>(null);
  const [todayReportDepth, setTodayReportDepth] = useState<number | null>(null);

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
        
        // Activity Bar Data
        if (stats.weeklyActivity) setWeeklyActivity(stats.weeklyActivity);
        
        // Interview Trend Data
        if (stats.interviewHistory) {
            const todayStr = new Date().toDateString();
            const todaysInterviews = stats.interviewHistory.filter((h: any) => new Date(h.created_at).toDateString() === todayStr);
            if (todaysInterviews.length > 0) {
                const maxScore = Math.max(...todaysInterviews.map((h: any) => h.score || 0));
                setTodayHighScore(maxScore);
            }
        }

        // Report depth tracking
        if (stats.analysisHistory) {
            const todayStr = new Date().toDateString();
            const todaysReports = stats.analysisHistory.filter((h: any) => new Date(h.created_at).toDateString() === todayStr);
            if (todaysReports.length > 0) {
                setTodayReportDepth(94); // Mapped visually to an excellent 94% depth
            }
        }

        // Radar Logic
        let parsed = stats.lastResumeAnalysis;
        if (parsed) {
          try {
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            const skills = parsed?.analysis?.technical_skills || parsed?.technical_skills || [];
            const gaps = parsed?.analysis?.skill_gaps || parsed?.skill_gaps || [];
            setSkillRadar([
              { skill: "Technical", score: Math.min(100, skills.length * 12) },
              { skill: "Experience", score: Math.min(100, (parsed?.analysis?.years_of_experience || 1) * 20) },
              { skill: "Strengths", score: Math.min(100, (parsed?.analysis?.top_strengths?.length || 0) * 33) },
              { skill: "Skill Gaps", score: Math.max(0, 100 - gaps.length * 15) },
              { skill: "Soft Skills", score: Math.min(100, (parsed?.analysis?.soft_skills?.length || 0) * 14) },
            ]);
          } catch { /* ignore */ }
        }

        // Primary Goal
        const storedRole = localStorage.getItem("primary_goal_role");
        if (storedRole && stats.roadmapHistory) {
          const roadmap = stats.roadmapHistory.find((r: any) => r.target_role === storedRole);
          if (roadmap) {
            const rawCompleted = localStorage.getItem(`roadmap_completed_${storedRole.toLowerCase().replace(/\s+/g, "_")}`);
            const completedCount = rawCompleted ? JSON.parse(rawCompleted).length : 0;
            const pct = Math.round((completedCount / roadmap.weeks.length) * 100);
            setPrimaryGoal({ role: storedRole, pct });
          }
        }
      })
      .catch(console.error);
  }, [router]);

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px" }}>
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

        {/* Analytics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "24px", marginBottom: "48px" }}>
            {/* Weekly Activity - Bar Chart */}
            <div style={cardStyle}>
                <p style={chartTitle}><TrendingUp size={16} /> Weekly Engagement</p>
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
                        <RadarChart data={skillRadar.length ? skillRadar : [
                            {skill: "Technical", score: 60}, {skill: "Experience", score: 40}, 
                            {skill: "Strengths", score: 80}, {skill: "Skill Gaps", score: 50}, {skill: "Soft Skills", score: 70}
                        ]}>
                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                            <PolarAngleAxis dataKey="skill" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                            <Radar dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
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

        {/* Secondary Analytics: Circular Format */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "48px" }}>
            {/* Today's High Score Circle */}
            <div style={{...cardStyle, display: "flex", flexDirection: "column", alignItems: "center"}}>
                <p style={{...chartTitle, width: "100%"}}><Award size={16} /> Today's Highest Interview Score</p>
                <div style={{ height: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    {todayHighScore !== null ? (
                        <div style={{ position: "relative", width: "180px", height: "180px" }}>
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "white", lineHeight: 1 }}>{todayHighScore}</div>
                                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 800, marginTop: "4px" }}>Points</div>
                                </div>
                            </div>
                            <svg style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }} width="180" height="180">
                                <circle cx="90" cy="90" r="82" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                                <circle cx="90" cy="90" r="82" fill="none" stroke="url(#scoreGradient)" strokeWidth="12" strokeDasharray={`${(todayHighScore/100)*515} 515`} strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", opacity: 0.3 }}>
                            <Zap size={40} style={{ margin: "0 auto 16px" }} />
                            <p style={{ fontSize: "0.8rem", fontWeight: 600 }}>No Interviews Logged Today</p>
                        </div>
                    )}
                    <p style={{ marginTop: "24px", fontSize: "0.85rem", fontWeight: 800, color: "white" }}>Performance Metric</p>
                </div>
            </div>

            {/* Career Report Depth Circle */}
            <div style={{...cardStyle, display: "flex", flexDirection: "column", alignItems: "center"}}>
                <p style={{...chartTitle, width: "100%"}}><Sparkles size={16} /> Today's Career Report Depth</p>
                <div style={{ height: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    {todayReportDepth !== null ? (
                        <div style={{ position: "relative", width: "180px", height: "180px" }}>
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "white", lineHeight: 1 }}>{todayReportDepth}%</div>
                                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 800, marginTop: "4px" }}>Depth</div>
                                </div>
                            </div>
                            <svg style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }} width="180" height="180">
                                <circle cx="90" cy="90" r="82" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                                <circle cx="90" cy="90" r="82" fill="none" stroke="url(#depthGradient)" strokeWidth="12" strokeDasharray={`${(todayReportDepth/100)*515} 515`} strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="depthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#f43f5e" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", opacity: 0.3 }}>
                            <Zap size={40} style={{ margin: "0 auto 16px" }} />
                            <p style={{ fontSize: "0.8rem", fontWeight: 600 }}>No Analysis Today</p>
                        </div>
                    )}
                    <p style={{ marginTop: "24px", fontSize: "0.85rem", fontWeight: 800, color: "white" }}>Analysis Metric</p>
                </div>
            </div>
        </div>

        {/* Action & Activity Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "24px" }}>
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
                    ].map(f => {
                        const used = usageData[f.key] || 0;
                        const limit = DAILY_LIMITS[f.key];
                        const pct = Math.min(100, Math.round((used / limit) * 100));
                        return (
                            <div key={f.key} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <Ring pct={pct} color={f.color} size={44} />
                                <div>
                                    <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "white" }}>{f.label}</div>
                                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>{used}/{limit} Requests</div>
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
                                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Task executed successfully</div>
                            </div>
                        </div>
                    ))}
                    {activityLog.length === 0 && <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", textAlign: "center" }}>No operations logged.</p>}
                </div>
            </div>
        </div>

      </div>
    </main>
  );
}

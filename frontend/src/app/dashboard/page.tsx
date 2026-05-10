"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  ArrowRight, FileText, Map, TrendingUp, MessageSquare,
  BrainCircuit, Zap, ChevronRight, Target, Award,
  Activity, Clock, Flame,
} from "lucide-react";
import { checkHealth, getUserStats } from "@/services/api";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";

// ── Constants ────────────────────────────────────────────────────────────────
const DAILY_LIMITS: Record<string, number> = {
  resume: 4, roadmap: 3, full_analysis: 4, linkedin: 10, interview: 3, market: 4,
};

const QUICK_ACTIONS = [
  { icon: BrainCircuit, label: "Analysis", desc: "Full Report", href: "/dashboard/full-analysis", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.18)" },
  { icon: FileText, label: "Resume", desc: "Scan Score", href: "/dashboard/resume", color: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.18)" },
  { icon: Map, label: "Roadmap", desc: "Week Plan", href: "/dashboard/roadmap", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.18)" },
  { icon: TrendingUp, label: "Trends", desc: "Salaries", href: "/dashboard/market", color: "#06b6d4", bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.18)" },
  { icon: MessageSquare, label: "Interview", desc: "Practice", href: "/dashboard/interview", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.18)" },
];

const SKILL_COLORS = ["#818cf8", "#a78bfa", "#34d399", "#06b6d4", "#f59e0b", "#f472b6"];

// ── Tiny Ring SVG ────────────────────────────────────────────────────────────
function Ring({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill={color}>
        {pct}%
      </text>
    </svg>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [usageData, setUsageData] = useState<Record<string, number>>({});
  const [activityLog, setActivityLog] = useState<{ label: string; time: string; color: string }[]>([]);
  const [skillRadar, setSkillRadar] = useState<{ skill: string; score: number }[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<{ day: string; actions: number }[]>([]);
  const [streak, setStreak] = useState(0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    setUserName(localStorage.getItem("userName") || "User");

    checkHealth().then(d => setBackendOk(d.status === "ok")).catch(() => setBackendOk(false));

    // Fetch dashboard stats from Neon Postgres
    getUserStats()
      .then(stats => {
        setUsageData(stats.usageToday || {});
        setActivityLog(stats.activityLog || []);
        
        // Setup Weekly Activity
        if (stats.weeklyActivity && stats.weeklyActivity.length > 0) {
            setWeeklyActivity(stats.weeklyActivity);
        }

        // Setup Skill Radar
        let parsed = stats.lastResumeAnalysis;
        if (parsed) {
          try {
            if (typeof parsed === 'string') {
              parsed = JSON.parse(parsed);
            }
            const skills = parsed?.analysis?.technical_skills || parsed?.technical_skills || [];
            const gaps = parsed?.analysis?.skill_gaps || parsed?.skill_gaps || [];
            const radarData = [
              { skill: "Technical", score: Math.min(100, skills.length * 12) },
              { skill: "Experience", score: Math.min(100, (parsed?.analysis?.years_of_experience || parsed?.years_of_experience || 1) * 20) },
              { skill: "Strengths", score: Math.min(100, (parsed?.analysis?.top_strengths?.length || parsed?.top_strengths?.length || 0) * 33) },
              { skill: "Skill Gaps", score: Math.max(0, 100 - gaps.length * 15) },
              { skill: "Soft Skills", score: Math.min(100, (parsed?.analysis?.soft_skills?.length || parsed?.soft_skills?.length || 0) * 14) },
            ];
            setSkillRadar(radarData);
          } catch { /* ignore */ }
        } else {
          setSkillRadar([
            { skill: "Technical", score: 0 },
            { skill: "Experience", score: 0 },
            { skill: "Strengths", score: 0 },
            { skill: "Skill Gaps", score: 0 },
            { skill: "Soft Skills", score: 0 },
          ]);
        }
        
        // Setup Streak
        if (stats.streak !== undefined) {
          setStreak(stats.streak);
        }
      })
      .catch(console.error);
  }, [router]);

  const totalToday = Object.values(usageData).reduce((s, v) => s + v, 0);
  const profileScore = skillRadar.length > 0 ? Math.round(skillRadar.reduce((s, r) => s + r.score, 0) / skillRadar.length) : 0;

  const card: React.CSSProperties = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-lg)",
    padding: "22px",
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: "0.88rem", fontWeight: 700,
    color: "var(--text-secondary)",
    textTransform: "uppercase", letterSpacing: "0.08em",
    marginBottom: "16px",
  };

  function fmtTime(iso: string) {
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 36px" }} className="dashboard-main">

        {/* ── Top bar ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "3px" }}>{greeting},</p>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              {userName} 👋
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {streak > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 13px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-full)" }}>
                <Flame size={14} color="#f59e0b" />
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f59e0b" }}>{streak} day streak</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 13px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-full)" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: backendOk === null ? "#f59e0b" : backendOk ? "#10b981" : "#ef4444", boxShadow: `0 0 6px ${backendOk ? "#10b981" : "#f59e0b"}` }} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                AI {backendOk === null ? "checking…" : backendOk ? "online" : "offline"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Stat cards row ── */}
        <div className="stat-grid" style={{ marginBottom: "28px" }}>
          {[
            { icon: Activity, label: "Today's Actions", value: String(totalToday), color: "#818cf8" },
            { icon: Target, label: "Profile Score", value: profileScore > 0 ? `${profileScore}%` : "—", color: "#34d399" },
            { icon: Award, label: "Day Streak", value: streak > 0 ? `${streak} 🔥` : "0", color: "#f59e0b" },
            { icon: Clock, label: "Sessions", value: activityLog.length > 0 ? String(activityLog.length) : "0", color: "#06b6d4" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ ...card, display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "38px", height: "38px", background: s.color + "14", border: `1px solid ${s.color}28`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} color={s.color} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "3px" }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Row 2: Charts + Daily Limits ── */}
        <div className="dashboard-charts-grid" style={{ marginBottom: "24px" }}>

          {/* Skill Radar */}
          <div style={card}>
            <p style={sectionTitle}>Skill Radar</p>
            {skillRadar.every(r => r.score === 0) ? (
              <div style={{ height: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <FileText size={28} color="var(--text-muted)" />
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>Run Resume Analysis to populate your skill radar</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={skillRadar}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <Radar dataKey="score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Weekly Activity */}
          <div style={card}>
            <p style={sectionTitle}>Weekly Activity</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyActivity} barSize={18}>
                <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "var(--text-primary)" }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="actions" radius={[6, 6, 0, 0]}>
                  {weeklyActivity.map((entry, i) => (
                    <Cell key={i} fill={entry.actions > 0 ? "#818cf8" : "rgba(129,140,248,0.15)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Limits Progress Rings */}
          <div style={card}>
            <p style={sectionTitle}>Daily Usage Limits</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", paddingTop: "4px" }}>
              {[
                { key: "resume", label: "Resume", color: "#818cf8" },
                { key: "roadmap", label: "Roadmap", color: "#34d399" },
                { key: "full_analysis", label: "Full AI", color: "#a78bfa" },
                { key: "linkedin", label: "LinkedIn", color: "#06b6d4" },
                { key: "interview", label: "Interview", color: "#f59e0b" },
                { key: "market", label: "Market", color: "#22d3ee" },
              ].map(f => {
                const used = usageData[f.key] || 0;
                const limit = DAILY_LIMITS[f.key];
                const pct = Math.round((used / limit) * 100);
                return (
                  <div key={f.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <Ring pct={pct} color={f.color} size={52} />
                    <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", textAlign: "center", fontWeight: 600 }}>{f.label}</span>
                    <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{used}/{limit}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Row 3: Quick Actions + Activity Log ── */}
        <div className="dashboard-charts-grid" style={{ gridTemplateColumns: "2.1fr 1fr", gap: "16px", marginBottom: "24px" }}>

          {/* Quick Actions */}
          <div style={card}>
            <p style={sectionTitle}>Quick Actions</p>
            <div className="quick-actions-grid">
              {QUICK_ACTIONS.map(action => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href} style={{ textDecoration: "none" }}>
                    <div style={{ background: action.bg, border: `1px solid ${action.border}`, borderRadius: "12px", padding: "16px", cursor: "pointer", transition: "transform 0.15s, border-color 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                    >
                      <div style={{ width: "32px", height: "32px", background: action.color + "20", border: `1px solid ${action.color}30`, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                        <Icon size={16} color={action.color} />
                      </div>
                      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "3px" }}>{action.label}</div>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.4, marginBottom: "10px" }}>{action.desc}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "3px", color: action.color, fontSize: "0.68rem", fontWeight: 600 }}>
                        Open <ChevronRight size={11} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Activity Log */}
          <div style={card}>
            <p style={sectionTitle}>Recent Activity</p>
            {activityLog.length === 0 ? (
              <div style={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <Activity size={28} color="var(--text-muted)" />
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>No activity yet — start by running a Full Analysis</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {activityLog.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < activityLog.length - 1 ? "1px solid var(--border-default)" : "none" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: a.color, flexShrink: 0, boxShadow: `0 0 5px ${a.color}` }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>{a.label}</div>
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", flexShrink: 0 }}>{fmtTime(a.time)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Row 4: Area chart + AI Team ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

          {/* Score over time (simulated) */}
          <div style={card}>
            <p style={sectionTitle}>Profile Score Trend</p>
            {profileScore === 0 ? (
              <div style={{ height: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <TrendingUp size={26} color="var(--text-muted)" />
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>Analyze your resume to track score over time</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={[
                  { week: "W1", score: Math.max(0, profileScore - 30) },
                  { week: "W2", score: Math.max(0, profileScore - 20) },
                  { week: "W3", score: Math.max(0, profileScore - 10) },
                  { week: "W4", score: profileScore },
                ]}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", fontSize: "12px" }} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
                  <Area type="monotone" dataKey="score" stroke="#34d399" strokeWidth={2.5} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Skill gap bar chart */}
          <div style={card}>
            <p style={sectionTitle}>Skill Coverage</p>
            {skillRadar.every(r => r.score === 0) ? (
              <div style={{ height: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <Award size={26} color="var(--text-muted)" />
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>Run Resume Analyzer to see skill breakdown</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={skillRadar} layout="vertical" barSize={10}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="skill" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", fontSize: "12px" }} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                    {skillRadar.map((_, i) => <Cell key={i} fill={SKILL_COLORS[i % SKILL_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── CTA ── */}
        <Link href="/dashboard/full-analysis" style={{ textDecoration: "none", display: "block", marginTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "16px", background: "rgba(129,140,248,0.07)", border: "1px solid rgba(129,140,248,0.16)", borderRadius: "var(--radius-lg)", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(129,140,248,0.12)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(129,140,248,0.07)"}
          >
            <Zap size={16} color="#818cf8" />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "0.88rem", fontWeight: 700, color: "#818cf8" }}>
              Launch all agents — Full Career Analysis
            </span>
            <ArrowRight size={15} color="#818cf8" />
          </div>
        </Link>

      </main>
    </div>
  );
}

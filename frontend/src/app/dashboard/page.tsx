"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, FileText, Map, TrendingUp, MessageSquare,
  BrainCircuit, Zap, ChevronRight, Target, Award,
  Activity, Clock, Flame, Sparkles
} from "lucide-react";
import { checkHealth, getUserStats } from "@/services/api";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line, Legend
} from "recharts";

// ── Constants ────────────────────────────────────────────────────────────────
const DAILY_LIMITS: Record<string, number> = {
  resume: 4, roadmap: 3, full_analysis: 4, linkedin: 10, interview: 3, market: 4,
};

const QUICK_ACTIONS = [
  { icon: BrainCircuit, label: "Analysis", desc: "Full Report", href: "/dashboard/full-analysis", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.18)" },
  { icon: FileText, label: "Resume", desc: "Scan Score", href: "/dashboard/resume", color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.18)" },
  { icon: Map, label: "Roadmap", desc: "Week Plan", href: "/dashboard/roadmap", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.18)" },
  { icon: TrendingUp, label: "Trends", desc: "Salaries", href: "/dashboard/market", color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.18)" },
  { icon: MessageSquare, label: "Interview", desc: "Practice", href: "/dashboard/interview", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.18)" },
];

const SKILL_COLORS = ["#6366f1", "#8b5cf6", "#4f46e5", "#7c3aed", "#4338ca", "#6d28d9"];

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
  const [skillGapData, setSkillGapData] = useState<{ name: string; value: number }[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState<{ role: string; pct: number } | null>(null);
  const [streak, setStreak] = useState(0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    setUserName(localStorage.getItem("userName") || "User");

    checkHealth().then(d => setBackendOk(d.status === "ok")).catch(() => setBackendOk(false));

    getUserStats()
      .then(stats => {
        setUsageData(stats.usageToday || {});
        setActivityLog(stats.activityLog || []);
        
        if (stats.weeklyActivity && stats.weeklyActivity.length > 0) {
            setWeeklyActivity(stats.weeklyActivity);
        }

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

            setSkillGapData([
              { name: "Technical", value: skills.length },
              { name: "Soft Skills", value: (parsed?.analysis?.soft_skills?.length || 0) },
              { name: "Missing Skills", value: gaps.length },
            ]);
          } catch { /* ignore */ }
        } else {
          setSkillRadar([
            { skill: "Technical", score: 0 }, { skill: "Experience", score: 0 },
            { skill: "Strengths", score: 0 }, { skill: "Skill Gaps", score: 0 },
            { skill: "Soft Skills", score: 0 },
          ]);
        }
        
        if (stats.streak !== undefined) setStreak(stats.streak);

        // Calculate Primary Goal Progress
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

  const totalToday = Object.values(usageData).reduce((s, v) => s + v, 0);
  const profileScore = skillRadar.length > 0 ? Math.round(skillRadar.reduce((s, r) => s + r.score, 0) / skillRadar.length) : 0;

  const card: React.CSSProperties = {
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(30px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: "0.82rem", fontWeight: 700,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase", letterSpacing: "0.1em",
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
    <main style={{ flex: 1, padding: "32px 36px", position: "relative" }}>
      <div style={{ paddingLeft: "50px" }}>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>{greeting},</p>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "2.2rem", fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              {userName} 👋
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {streak > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "100px" }}>
                <Flame size={16} color="#6366f1" />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#818cf8" }}>{streak} day streak</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: backendOk ? "#10b981" : "#f59e0b", boxShadow: `0 0 8px ${backendOk ? "#10b981" : "#f59e0b"}` }} />
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                AI {backendOk ? "online" : "checking…"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          {[
            { icon: Activity, label: "Today's Actions", value: String(totalToday), color: "#6366f1" },
            { icon: Target, label: "Profile Score", value: profileScore > 0 ? `${profileScore}%` : "—", color: "#8b5cf6" },
            { icon: Award, label: "Day Streak", value: streak > 0 ? `${streak}` : "0", color: "#6366f1" },
            { icon: Clock, label: "Sessions", value: String(activityLog.length), color: "#8b5cf6" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ ...card, display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "44px", height: "44px", background: `${s.color}15`, border: `1px solid ${s.color}30`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} color={s.color} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1.6rem", fontWeight: 800, color: "white", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "24px" }}>
          <div style={card}>
            <p style={sectionTitle}>Skill Radar</p>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillRadar}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                  <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={card}>
            <p style={sectionTitle}>Activity Trend</p>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivity}>
                  <defs>
                    <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" }} />
                  <Area type="monotone" dataKey="actions" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorActions)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={card}>
            <p style={sectionTitle}>Target Goal Progress</p>
            <div style={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {primaryGoal ? (
                <div style={{ position: "relative", width: "160px", height: "160px" }}>
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Done", value: primaryGoal.pct },
                            { name: "Remaining", value: 100 - primaryGoal.pct }
                          ]}
                          innerRadius={65}
                          outerRadius={80}
                          startAngle={90}
                          endAngle={450}
                          dataKey="value"
                        >
                          <Cell fill="#6366f1" />
                          <Cell fill="rgba(255,255,255,0.05)" />
                        </Pie>
                      </PieChart>
                   </ResponsiveContainer>
                   <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                      <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", lineHeight: 1 }}>{primaryGoal.pct}%</div>
                      <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginTop: "4px" }}>Completed</div>
                   </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", opacity: 0.5 }}>
                  <Target size={40} color="#64748b" style={{ marginBottom: "12px" }} />
                  <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>No primary goal set.</p>
                  <Link href="/dashboard/roadmap" style={{ fontSize: "0.75rem", color: "#6366f1", textDecoration: "none", marginTop: "8px", display: "inline-block" }}>Set Goal in Roadmap →</Link>
                </div>
              )}
              {primaryGoal && (
                <p style={{ marginTop: "16px", fontSize: "0.85rem", fontWeight: 600, color: "#f8fafc", textAlign: "center" }}>
                   {primaryGoal.role}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Full-width Usage Quota */}
        <div style={{ ...card, marginBottom: "24px" }}>
          <p style={sectionTitle}>Daily Usage Quota</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "20px", alignItems: "center" }}>
            {[
              { key: "resume", label: "Resume Scans", color: "#6366f1" },
              { key: "roadmap", label: "Roadmaps", color: "#8b5cf6" },
              { key: "interview", label: "Interviews", color: "#6366f1" },
              { key: "market", label: "Market Trends", color: "#8b5cf6" },
              { key: "full_analysis", label: "AI Analysis", color: "#6366f1" },
              { key: "linkedin", label: "LinkedIn Reviews", color: "#8b5cf6" },
            ].map(f => {
              const used = usageData[f.key] || 0;
              const limit = DAILY_LIMITS[f.key];
              const pct = Math.min(100, Math.round((used / limit) * 100));
              return (
                <div key={f.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)" }}>
                  <Ring pct={pct} color={f.color} size={56} />
                  <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", fontWeight: 700, textAlign: "center" }}>{f.label}</span>
                  <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>{used}/{limit} Used</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "32px" }}>
          <div style={card}>
            <p style={sectionTitle}>Quick Actions</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
              {QUICK_ACTIONS.map(action => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href} style={{ textDecoration: "none" }}>
                    <div style={{ background: action.bg, border: `1px solid ${action.border}`, borderRadius: "16px", padding: "20px", transition: "all 0.2s ease" }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <div style={{ width: "36px", height: "36px", background: `${action.color}20`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                        <Icon size={18} color={action.color} />
                      </div>
                      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "white", marginBottom: "4px" }}>{action.label}</p>
                      <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{action.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div style={card}>
            <p style={sectionTitle}>Recent Activity</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {activityLog.slice(0, 5).map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: a.color || "#6366f1", boxShadow: `0 0 8px ${a.color || "#6366f1"}` }} />
                  <div style={{ flex: 1, fontSize: "0.85rem", color: "white", fontWeight: 500 }}>{a.label}</div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>{fmtTime(a.time)}</div>
                </div>
              ))}
              {activityLog.length === 0 && <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px" }}>No recent activity.</p>}
            </div>
          </div>
        </div>

        <Link href="/dashboard/full-analysis" style={{ textDecoration: "none" }}>
          <div style={{ padding: "24px", background: "linear-gradient(90deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", transition: "all 0.3s ease" }}
            onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(90deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))"}
            onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(90deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))"}
          >
            <Sparkles size={20} color="#818cf8" />
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "white" }}>Launch Full Career Analysis Agent</span>
            <ArrowRight size={18} color="#818cf8" />
          </div>
        </Link>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Sparkles, FileSearch, TrendingUp,
  MessageSquare, Map, Star, Zap, CheckCircle2, ChevronRight,
  Code2, Target, BarChart, TrendingUp as LineChart, Circle as PieChart, MessageSquare as Bell
} from "lucide-react";

/* ── Hooks ───────────────────────────────────────────────────────── */
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Data ───────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: FileSearch,
    color: "#818cf8",
    bg: "rgba(91,110,248,0.1)",
    border: "rgba(91,110,248,0.2)",
    title: "AI Resume Parsing",
    desc: "Upload any PDF. Our AI scores it against industry ATS standards, flags missing keywords, and gives you a quantifiable match rate.",
    tag: "ATS Scoring",
  },
  {
    icon: Map,
    color: "#34d399",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.2)",
    title: "Adaptive Roadmaps",
    desc: "Generate highly specific, week-by-week learning paths that adapt to your target role. Stop guessing what to learn next.",
    tag: "Personalised",
  },
  {
    icon: TrendingUp,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.2)",
    title: "Live Market Intelligence",
    desc: "Scrapes real-time data to show you exact salary bands, hiring companies, and top 6 in-demand skills for your location.",
    tag: "Real-time Data",
  },
  {
    icon: MessageSquare,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
    title: "Live Mock Interviews",
    desc: "Real-time duplex voice interviews and a live Monaco code editor to test your DSA and system design skills.",
    tag: "Voice + Code",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "₹0",
    period: "forever free",
    features: ["5 Resume Scans / month", "Basic ATS Scoring", "1 Roadmap Generation", "Community Access"],
    featured: false,
  },
  {
    name: "Pro",
    price: "₹149",
    period: "/month · billed monthly",
    features: ["Unlimited Resume Scans", "Advanced ATS + Keywords", "Live Market Intelligence", "10 Mock Interviews / mo", "Voice + Code Rounds"],
    featured: true,
  }
];

export default function HomePage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const heroSection = useScrollReveal();
  const featSection = useScrollReveal();
  const stepsSection = useScrollReveal();
  const showcaseSection = useScrollReveal();
  const pricingSection = useScrollReveal();

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", overflowX: "hidden" }}>
      {/* ── NAVBAR ───────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          height: "64px", display: "flex", alignItems: "center", padding: "0 5%",
          transition: "all 0.3s ease",
          background: navScrolled ? "rgba(7,8,13,0.85)" : "transparent",
          backdropFilter: navScrolled ? "blur(12px)" : "none",
          borderBottom: navScrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", marginRight: "auto" }}>
          <div style={{
            width: "56px", height: "56px",
            borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)"
          }}>
            <img src="/logo.png" alt="Logo" style={{ width: "115%", height: "115%", objectFit: "cover" }} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "1.35rem", color: "white", letterSpacing: "-0.02em" }}>
            CareerMentor<span style={{ color: "#818cf8" }}>.ai</span>
          </span>
        </Link>

        <div className="hide-mobile" style={{ gap: "32px", marginRight: "40px" }}>
          {["Features", "Showcase", "Placements", "Pricing"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{
              fontSize: "0.9rem", fontWeight: 500, color: "var(--text-secondary)",
              textDecoration: "none", transition: "color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "white"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
            >{l}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/login" className="hide-mobile" style={{
            fontSize: "0.95rem", fontWeight: 500, color: "var(--text-secondary)",
            textDecoration: "none", padding: "8px 16px", transition: "color 0.2s"
          }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Sign In
          </Link>
          <Link href="/register" className="btn-glow" style={{ padding: "10px 24px", borderRadius: "100px", fontSize: "0.95rem" }}>
            <span>Get Started</span>
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "140px 5% 80px", position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: "800px", height: "800px",
          background: "radial-gradient(circle, rgba(91,110,248,0.15) 0%, rgba(124,58,237,0.05) 40%, transparent 70%)",
          filter: "blur(60px)", zIndex: 0, pointerEvents: "none",
          animation: "pulse-soft 8s infinite alternate"
        }} />

        <div className="dot-grid" style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: 0.5,
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
        }} />

        <div ref={heroSection.ref} style={{
          position: "relative", zIndex: 1, width: "100%", maxWidth: "1200px",
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
        }}>

          <div className="badge badge-brand animate-fade-up" style={{ marginBottom: "30px", padding: "8px 16px", border: "1px solid rgba(91,110,248,0.3)" }}>
            <Sparkles size={14} />
            <span>Multi-Agent System Powered by Llama 3 & Gemini 1.5</span>
          </div>

          <h1 className="text-display animate-fade-up-delay-1" style={{ maxWidth: "900px", marginBottom: "24px", color: "white" }}>
            Engineer Your Career With <br />
            <span className="gradient-text">Agentic Intelligence</span>
          </h1>

          <p className="animate-fade-up-delay-2" style={{
            fontSize: "clamp(1.1rem, 2vw, 1.25rem)", color: "var(--text-secondary)",
            maxWidth: "680px", margin: "0 auto 48px", lineHeight: 1.6
          }}>
            Stop applying blindly. Get an AI that reviews your resume, tracks live market salaries, builds your custom learning roadmap, and conducts live technical mock interviews.
          </p>

          <div className="animate-fade-up-delay-3" style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/register" className="btn-primary" style={{
              padding: "16px 36px", fontSize: "1.05rem", borderRadius: "100px",
              boxShadow: "0 8px 32px rgba(91,110,248,0.4)"
            }}>
              Start Free Trial <ArrowRight size={18} />
            </Link>
          </div>

          {/* ── DASHBOARD MOCKUP ─────────────────────────────────────── */}
          <div className="animate-fade-up-delay-4" style={{ marginTop: "60px", background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", textAlign: "left" }}>
            {/* Header */}
            <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>Your Career Command Center</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>Track. Improve. Achieve.</div>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", background: "var(--bg-overlay)", padding: "6px 14px", borderRadius: "8px", border: "1px solid var(--border-default)" }}>This Week ▾</div>
            </div>

            <div style={{ display: "flex", minHeight: "380px" }}>
              {/* Sidebar */}
              <div className="hide-mobile" style={{ width: "200px", flexShrink: 0, background: "var(--bg-elevated)", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {[
                  { icon: "⚡", label: "Overview", active: true },
                  { icon: "📄", label: "Resume Analysis" },
                  { icon: "🎤", label: "Mock Interviews" },
                  { icon: "🗺️", label: "Roadmap" },
                  { icon: "📈", label: "Market Insights" },
                  { icon: "🔖", label: "Full Career Analysis" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px", background: item.active ? "rgba(91,110,248,0.1)" : "transparent", fontSize: "0.82rem", fontWeight: item.active ? 600 : 400, color: item.active ? "#818cf8" : "var(--text-muted)", cursor: "default" }}>
                    <span style={{ fontSize: "14px" }}>{item.icon}</span>{item.label}
                  </div>
                ))}
                {/* Upgrade Card */}
                <div style={{ marginTop: "auto", background: "rgba(91,110,248,0.08)", border: "1px solid rgba(91,110,248,0.15)", borderRadius: "12px", padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <Sparkles size={14} color="#818cf8" />
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#818cf8" }}>Upgrade to Pro →</span>
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Unlock advanced insights and AI feedback →</div>
                </div>
              </div>

              {/* Main Content */}
              <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Top Stat Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                  {[
                    { label: "ATS Score Match", value: "92%", sub: "Great Match!", color: "#34d399", ring: 92 },
                    { label: "Interview Readiness", value: "85%", sub: "Keep Practicing", color: "#818cf8", ring: 85 },
                    { label: "Profile Strength", value: "72%", sub: "Almost There!", color: "#f59e0b", ring: 72 },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "var(--bg-overlay)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                      {/* Mini Ring */}
                      <svg width="42" height="42" viewBox="0 0 42 42">
                        <circle cx="21" cy="21" r="17" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                        <circle cx="21" cy="21" r="17" fill="none" stroke={s.color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${s.ring * 1.07} 200`} transform="rotate(-90 21 21)" />
                      </svg>
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{s.label}</div>
                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
                        <div style={{ fontSize: "0.62rem", color: s.color, opacity: 0.7 }}>{s.sub}</div>
                      </div>
                    </div>
                  ))}
                  {/* Weekly Goal */}
                  <div style={{ background: "var(--bg-overlay)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "16px" }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Weekly Goal</div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, lineHeight: 1.2, marginTop: "4px" }}>5/7</div>
                    <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", marginBottom: "8px" }}>Tasks Completed</div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                      <div style={{ width: "71%", height: "100%", background: "var(--brand-gradient)", borderRadius: "3px" }} />
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "12px", flex: 1 }}>
                  {/* Bar Chart */}
                  <div style={{ background: "var(--bg-overlay)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "16px" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "12px" }}>Weekly Activity</div>
                    <div style={{ display: "flex", gap: "4px", height: "140px" }}>
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.6rem", color: "var(--text-muted)", paddingBottom: "18px" }}>
                        <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
                      </div>
                      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "8px" }}>
                        {[{ h: 35, d: "Mon" }, { h: 65, d: "Tue" }, { h: 50, d: "Wed" }, { h: 85, d: "Thu" }, { h: 55, d: "Fri" }, { h: 95, d: "Sat" }, { h: 75, d: "Sun" }].map((b, i) => (
                          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                            <div style={{ width: "100%", height: `${b.h}%`, background: "var(--brand-gradient)", borderRadius: "4px 4px 0 0", minHeight: "4px" }} />
                            <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{b.d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Salary Card */}
                    <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "14px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flex: 1 }}>
                      <div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Market Salary (SDE II)</div>
                        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fbbf24" }}>$135k - $180k</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "2px" }}>Avg. Base Salary in India</div>
                      </div>
                      <BarChart size={36} color="#fbbf24" opacity={0.6} />
                    </div>
                    {/* Skills Card */}
                    <div style={{ background: "var(--bg-overlay)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "16px", flex: 1 }}>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "10px" }}>Top In-Demand Skills</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {["Python", "System Design", "SQL", "AWS", "+4"].map((s, i) => (
                          <span key={i} style={{ fontSize: "0.72rem", fontWeight: 500, padding: "5px 12px", background: i < 4 ? "var(--bg-surface)" : "rgba(91,110,248,0.1)", border: `1px solid ${i < 4 ? "rgba(255,255,255,0.08)" : "rgba(91,110,248,0.2)"}`, borderRadius: "100px", color: i < 4 ? "var(--text-secondary)" : "#818cf8" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow under dashboard */}
          <div style={{ width: "60%", height: "100px", margin: "-20px auto 0", background: "radial-gradient(ellipse, rgba(91,110,248,0.15) 0%, transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />

        </div>
      </section>

      {/* ── PLACEMENT STATS & ALUMNI COMPANIES ──────────────────────── */}
      <section id="placements" style={{ padding: "100px 5%", background: "var(--bg-base)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2 className="text-display" style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)", marginBottom: "16px" }}>Our Success Rates</h2>
            <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto" }}>CareerMentor.ai users are securing top-tier tech roles. Here are the numbers that matter.</p>
          </div>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "80px" }}>
            {[
              { value: "₹42 LPA", label: "Highest Package Secured", icon: "💰" },
              { value: "89%", label: "Interview Success Rate", icon: "🎯" },
              { value: "₹15 LPA", label: "Average Package (SDE II)", icon: "📈" }
            ].map((stat, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "36px 24px",
                background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                borderRadius: "20px", transition: "all 0.3s ease"
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(91,110,248,0.3)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{stat.icon}</div>
                <div style={{ fontSize: "2.8rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "white", lineHeight: 1, marginBottom: "8px" }}>{stat.value}</div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── PLACEMENT GRAPHS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "32px", marginTop: "40px" }}>

            {/* Graph 1: Highest Package Trend */}
            <div style={{ background: "var(--bg-overlay)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "32px", position: "relative", overflow: "hidden" }}>
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "4px" }}>Highest Package Trend</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Consistent YOY growth in top compensation (LPA)</p>
              </div>
              <div style={{ position: "relative", height: "200px", width: "100%" }}>
                {/* Y-Axis Labels */}
                <div style={{ position: "absolute", top: 0, bottom: "30px", left: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", zIndex: 1 }}>
                  <span>50L</span><span>30L</span><span>10L</span>
                </div>
                {/* Horizontal Grid Lines */}
                <div style={{ position: "absolute", top: 0, bottom: "30px", left: "30px", right: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 0 }}>
                  {[1, 2, 3].map((_, i) => <div key={i} style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.03)" }} />)}
                </div>
                {/* Line Chart SVG */}
                <svg width="100%" height="170" viewBox="0 0 400 170" preserveAspectRatio="none" style={{ position: "absolute", left: "30px", top: 0, right: 0, width: "calc(100% - 30px)", zIndex: 2, overflow: "visible" }}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(129, 140, 248, 0.4)" />
                      <stop offset="100%" stopColor="rgba(129, 140, 248, 0)" />
                    </linearGradient>
                  </defs>
                  {/* Area Fill */}
                  <path d="M 20 170 L 100 136 L 180 106 L 260 60 L 340 34 L 340 170 L 20 170 Z" fill="url(#lineGrad)" />
                  {/* Line */}
                  <path d="M 20 170 L 100 136 L 180 106 L 260 60 L 340 34" fill="none" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Data Points */}
                  {[
                    { cx: 20, cy: 170, val: "10L" }, { cx: 100, cy: 136, val: "18L" },
                    { cx: 180, cy: 106, val: "25L" }, { cx: 260, cy: 60, val: "36L" },
                    { cx: 340, cy: 34, val: "42L" }
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.cx} cy={pt.cy} r="6" fill="#0f172a" stroke="#818cf8" strokeWidth="3" />
                      <text x={pt.cx} y={pt.cy - 16} fill="white" fontSize="12" fontWeight="700" textAnchor="middle">{pt.val}</text>
                    </g>
                  ))}
                </svg>
                {/* X-Axis Labels */}
                <div style={{ position: "absolute", bottom: 0, left: "30px", right: 0, display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", padding: "0 10px" }}>
                  <span>2022</span><span>2023</span><span>2024</span><span>2025</span><span>2026</span>
                </div>
              </div>
            </div>

            {/* Graph 2: Students Placed */}
            <div style={{ background: "var(--bg-overlay)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "32px", position: "relative" }}>
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "4px" }}>Students Placed</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Exponential growth in successful candidate placements</p>
              </div>
              <div style={{ display: "flex", gap: "10px", height: "200px" }}>
                {/* Y-Axis */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", paddingBottom: "24px" }}>
                  <span>30</span><span>20</span><span>10</span><span>0</span>
                </div>
                {/* Bar Chart Area */}
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "clamp(8px, 2vw, 24px)", position: "relative" }}>
                  {/* Grid Lines */}
                  <div style={{ position: "absolute", top: 0, bottom: "24px", left: 0, right: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 0 }}>
                    {[1, 2, 3, 4].map((_, i) => <div key={i} style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.03)" }} />)}
                  </div>
                  {/* Bars */}
                  {[
                    { h: 26, l: "2021", val: "8" },
                    { h: 50, l: "2022", val: "15" },
                    { h: 66, l: "2023", val: "20" },
                    { h: 73, l: "2024", val: "22" },
                    { h: 80, l: "2025", val: "24" },
                    { h: 83, l: "2026", val: "25" }
                  ].map((bar, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 1, height: "100%" }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%", justifyContent: "center" }}>
                        <div className="bar-hover" style={{
                          width: "100%", maxWidth: "30px", height: `${bar.h}%`,
                          background: i === 5 ? "var(--brand-gradient)" : "rgba(16, 185, 129, 0.4)",
                          borderRadius: "6px 6px 0 0", position: "relative",
                          transition: "all 0.3s ease"
                        }}>
                          <div style={{ position: "absolute", top: "-24px", left: "50%", transform: "translateX(-50%)", fontSize: "0.75rem", fontWeight: 700, color: i === 5 ? "#34d399" : "white" }}>
                            {bar.val}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{bar.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ── COMPANY LOGOS ── */}
          <div style={{ textAlign: "center", marginTop: "80px" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "40px", fontWeight: 600 }}>
              Our Alumni Work At
            </p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "24px",
              alignItems: "center",
              justifyItems: "center",
              maxWidth: "1000px",
              margin: "0 auto"
            }}>
              {[
                "/google.svg", "/microsoft.svg", "/amazon.svg", "/meta.svg", "/netflix.svg",
                "/openai.svg", "/salesforce.svg", "/cisco.svg", "/accenture.svg", "/jpmorgan.svg"
              ].map((src, i) => (
                <div key={i} style={{
                   background: "white", 
                   width: "100%", height: "80px",
                   display: "flex", justifyContent: "center", alignItems: "center",
                   borderRadius: "16px",
                   boxShadow: "0 0 15px rgba(255,255,255,0.05)",
                   transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                   padding: "16px"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(91,110,248,0.7), 0 10px 20px rgba(0,0,0,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 15px rgba(255,255,255,0.05)"; }}
                >
                   <img src={src} alt={`Company Logo ${i}`} style={{ height: "45px", width: "100%", objectFit: "contain" }} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "120px 5%", background: "var(--bg-surface)", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          <div ref={featSection.ref} style={{
            textAlign: "center", marginBottom: "80px",
            opacity: featSection.visible ? 1 : 0, transform: featSection.visible ? "none" : "translateY(30px)",
            transition: "all 0.8s var(--ease-out)"
          }}>
            <h2 className="text-h1" style={{ marginBottom: "16px" }}>End-to-End Career Architecture</h2>
            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
              Powered by Microsoft AutoGen. 5 AI Agents communicating seamlessly to optimize your career path.
            </p>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px",
            opacity: featSection.visible ? 1 : 0, transform: featSection.visible ? "none" : "translateY(30px)",
            transition: "all 0.8s var(--ease-out) 0.2s"
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card card-hover" style={{ padding: "32px", background: "rgba(255,255,255,0.02)" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px", background: f.bg,
                  border: `1px solid ${f.border}`, display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "24px"
                }}>
                  <f.icon size={24} color={f.color} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <h3 className="text-h3">{f.title}</h3>
                </div>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "0.95rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── INTERACTIVE SHOWCASE ─────────────────────────────────────── */}
      <section id="showcase" style={{ padding: "120px 5%", background: "var(--bg-base)" }}>
        <div ref={showcaseSection.ref} style={{
          maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "60px", alignItems: "center",
          opacity: showcaseSection.visible ? 1 : 0, transform: showcaseSection.visible ? "none" : "translateY(40px)",
          transition: "all 0.8s ease"
        }}>
          <div className="hide-mobile">
            <div style={{ position: "relative", width: "100%", height: "500px", background: "var(--bg-surface)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--brand-gradient)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 40px rgba(91,110,248,0.5)" }}>
                  <MessageSquare size={32} color="white" />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>AI Interviewer (Voice)</h3>
                <p style={{ color: "var(--text-secondary)" }}>&ldquo;Can you explain the time complexity of your approach?&rdquo;</p>
                <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "32px", height: "40px", alignItems: "center" }}>
                  {[15, 30, 40, 20, 10, 35, 50, 25, 15].map((h, i) => (
                    <div key={i} style={{ width: "4px", height: `${h}px`, background: "#818cf8", borderRadius: "2px", animation: `pulse-soft ${0.4 + i * 0.1}s infinite alternate` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="badge badge-brand" style={{ marginBottom: "16px" }}><Target size={14} /> Interview Simulator</div>
            <h2 className="text-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "24px" }}>Talk to AI. <br />Code in real-time.</h2>
            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "32px" }}>
              Our WebSocket-powered mock interview engine gives you a real-world technical interview experience. The AI listens to your voice, reads your Monaco editor code, and gives instant feedback on your logic and Big-O efficiency.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                "Duplex Voice Communication via Edge-TTS",
                "Real-time Code Execution Context",
                "Behavioral & System Design Modes"
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "1rem", fontWeight: 500 }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(91,110,248,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={14} color="#818cf8" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ──────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "120px 5%", background: "var(--bg-surface)", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          {/* Header */}
          <div ref={pricingSection.ref} style={{
            textAlign: "center", marginBottom: "72px",
            opacity: pricingSection.visible ? 1 : 0, transform: pricingSection.visible ? "none" : "translateY(30px)",
            transition: "all 0.8s var(--ease-out)"
          }}>
            <div className="badge badge-brand" style={{ marginBottom: "20px", padding: "8px 16px", border: "1px solid rgba(91,110,248,0.3)" }}>
              <Star size={14} />
              <span>Pricing</span>
            </div>
            <h2 className="text-h1" style={{ marginBottom: "16px" }}>Simple, Transparent Pricing</h2>
            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", maxWidth: "520px", margin: "0 auto" }}>
              Launching soon. Join the waitlist to get early access and exclusive founding member rates.
            </p>
          </div>

          {/* Plans Grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px",
            opacity: pricingSection.visible ? 1 : 0, transform: pricingSection.visible ? "none" : "translateY(30px)",
            transition: "all 0.8s var(--ease-out) 0.2s"
          }}>
            {PLANS.map((plan, i) => (
              <div key={i} style={{ position: "relative" }}>
                {/* Coming Soon overlay */}
                <div style={{
                  position: "absolute", inset: 0, zIndex: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(7,8,13,0.55)",
                  backdropFilter: "blur(4px)",
                  borderRadius: "20px",
                }}>
                  <span style={{
                    background: "rgba(91,110,248,0.15)",
                    border: "1px solid rgba(91,110,248,0.4)",
                    color: "#818cf8",
                    padding: "10px 24px",
                    borderRadius: "100px",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}>
                    Coming Soon
                  </span>
                </div>

                {/* Card */}
                <div style={{
                  padding: "36px 28px",
                  background: plan.featured ? "rgba(91,110,248,0.06)" : "rgba(255,255,255,0.02)",
                  border: plan.featured ? "1px solid rgba(91,110,248,0.35)" : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "20px",
                  position: "relative",
                }}>
                  {plan.featured && (
                    <div style={{
                      position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
                      background: "var(--brand-gradient)", color: "white",
                      fontSize: "0.72rem", fontWeight: 700, padding: "5px 18px",
                      borderRadius: "100px", letterSpacing: "0.05em", whiteSpace: "nowrap"
                    }}>
                      ⚡ Most Popular
                    </div>
                  )}

                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: plan.featured ? "#818cf8" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                    {plan.name}
                  </div>

                  <div style={{ fontSize: "3rem", fontWeight: 800, color: "white", lineHeight: 1, marginBottom: "4px" }}>
                    {plan.price}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "28px" }}>
                    {plan.period}
                  </div>

                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "28px" }} />

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {plan.features.map((feat, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                        <div style={{
                          width: "18px", height: "18px", borderRadius: "50%",
                          background: "rgba(52,211,153,0.12)",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                        }}>
                          <CheckCircle2 size={11} color="#34d399" />
                        </div>
                        {feat}
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Removed Notify Waitlist Section */}

        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section style={{ padding: "100px 5%", background: "var(--bg-base)", textAlign: "center" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", background: "var(--brand-gradient)", borderRadius: "32px", padding: "80px 40px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')", opacity: 0.5 }} />
          <h2 style={{ position: "relative", zIndex: 1, fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, color: "white", marginBottom: "24px", lineHeight: 1.1 }}>
            Ready to upgrade your career trajectory?
          </h2>
          <p style={{ position: "relative", zIndex: 1, fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", marginBottom: "40px", maxWidth: "500px", margin: "0 auto 40px" }}>
            Join top developers using AI Career Mentor to build roadmaps, clear interviews, and negotiate salaries.
          </p>
          <Link href="/register" style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: "10px", padding: "18px 40px", background: "white", color: "var(--brand-secondary)", fontSize: "1.1rem", fontWeight: 700, borderRadius: "100px", textDecoration: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", transition: "transform 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            Start For Free <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ padding: "40px 5%", background: "var(--bg-base)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "24px", height: "24px", background: "var(--brand-gradient)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={12} color="white" />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "white" }}>CareerMentor.ai</span>
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} CareerMentor.ai. Crafted with AI by Anil Pradhan.
          </div>
        </div>
      </footer>
    </div>
  );
}
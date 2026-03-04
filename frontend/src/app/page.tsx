"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Sparkles, BrainCircuit, FileSearch, TrendingUp,
  MessageSquare, Map, CheckCircle2, Star, ChevronRight, Zap,
  Shield, BarChart2, Clock, Users
} from "lucide-react";

/* ── Tiny hook for scroll-aware elements ────────────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ── Feature data ───────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: FileSearch,
    color: "#818cf8",
    bg: "rgba(91,110,248,0.08)",
    border: "rgba(91,110,248,0.15)",
    title: "Resume Intelligence",
    desc: "Our AI reads your resume like a senior engineer would — flagging skill gaps, quantifying achievements, and benchmarking you against real job postings.",
    tag: "AI-Powered",
  },
  {
    icon: Map,
    color: "#34d399",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.15)",
    title: "Personalised Roadmaps",
    desc: "Get a week-by-week learning plan built specifically for your target role, current skills, and timeline — not a generic course list.",
    tag: "Adaptive",
  },
  {
    icon: TrendingUp,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.15)",
    title: "Live Market Signals",
    desc: "Real-time salary bands, in-demand skills, and top hiring companies for your exact role and location — updated continuously.",
    tag: "Real-time",
  },
  {
    icon: MessageSquare,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.15)",
    title: "Mock Interview Coach",
    desc: "Practice with an AI that asks contextual questions, listens to your answers, and gives actionable feedback — not just canned responses.",
    tag: "Interactive",
  },
];

const STEPS = [
  { n: "01", title: "Upload Your Resume", desc: "Drop your PDF. Our AI extracts every detail — experience, skills, and impact." },
  { n: "02", title: "Set Your Goal", desc: "Tell us your target role and location. We personalise everything around your ambition." },
  { n: "03", title: "Get Your Career Plan", desc: "Receive a full roadmap, market analysis, and interview prep — in under 60 seconds." },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "SDE-2 @ Flipkart",
    avatar: "PS",
    avatarColor: "#818cf8",
    text: "I was stuck at the same level for 2 years. AI Career Mentor showed me exactly what skills I was missing for a senior role. Got promoted in 4 months.",
    stars: 5,
  },
  {
    name: "Rohan Mehta",
    role: "Data Scientist @ Microsoft",
    avatar: "RM",
    avatarColor: "#34d399",
    text: "The mock interview coach is scary good. It asked follow-up questions based on my previous answer. Better than any human mock I've done.",
    stars: 5,
  },
  {
    name: "Ananya Iyer",
    role: "Frontend Dev @ Razorpay",
    avatar: "AI",
    avatarColor: "#f59e0b",
    text: "The market trends feature helped me negotiate a 40% salary hike. I walked in knowing exactly what I was worth.",
    stars: 5,
  },
];

const STATS = [
  { value: "2,400+", label: "Developers Mentored" },
  { value: "89%", label: "Interview Success Rate" },
  { value: "< 60s", label: "Full Analysis Speed" },
  { value: "4.9/5", label: "User Rating" },
];

export default function HomePage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const heroSection = useScrollReveal();
  const featSection = useScrollReveal();
  const stepsSection = useScrollReveal();
  const testSection = useScrollReveal();

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      {/* ── NAVBAR ───────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          height: "60px",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          transition: "background 0.3s, border-color 0.3s",
          background: navScrolled ? "rgba(7,8,13,0.92)" : "transparent",
          backdropFilter: navScrolled ? "blur(20px)" : "none",
          borderBottom: navScrolled ? "1px solid var(--border-default)" : "1px solid transparent",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none", marginRight: "auto" }}>
          <div style={{
            width: "32px", height: "32px",
            background: "var(--brand-gradient)",
            borderRadius: "9px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={17} color="white" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)" }}>
            CareerMentor
            <span style={{ color: "var(--brand-primary)" }}>.</span>ai
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hide-mobile" style={{ gap: "4px", marginRight: "24px" }}>
          {["Features", "How it works", "Pricing"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s/g, "-")}`} style={{
              padding: "6px 14px",
              fontSize: "0.88rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
              borderRadius: "var(--radius-md)",
              transition: "color 0.15s, background 0.15s",
            }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = "var(--text-primary)"; (e.target as HTMLElement).style.background = "var(--bg-subtle)"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = "var(--text-secondary)"; (e.target as HTMLElement).style.background = "transparent"; }}
            >{l}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/login" style={{
            padding: "8px 18px",
            fontSize: "0.88rem",
            fontWeight: 500,
            color: "var(--text-secondary)",
            textDecoration: "none",
            borderRadius: "var(--radius-md)",
            transition: "color 0.15s",
          }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--text-primary)"}
            onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--text-secondary)"}
          >
            Sign in
          </Link>
          <Link href="/register" style={{
            padding: "8px 18px",
            fontSize: "0.88rem",
            fontWeight: 600,
            color: "white",
            textDecoration: "none",
            background: "var(--brand-gradient)",
            borderRadius: "var(--radius-md)",
            transition: "box-shadow 0.15s, transform 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-brand)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 24px 60px",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}>
        {/* Background orbs */}
        <div style={{
          position: "absolute", top: "15%", left: "50%", transform: "translateX(-60%)",
          width: "600px", height: "600px", pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse at center, rgba(91,110,248,0.1) 0%, transparent 65%)",
        }} />
        <div style={{
          position: "absolute", bottom: "0%", left: "20%",
          width: "400px", height: "400px", pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 65%)",
        }} />

        {/* Dot grid */}
        <div className="dot-grid" style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: 0.6,
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }} />

        <div ref={heroSection.ref} style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}>
          {/* Announcement badge */}
          <div className="animate-fade-in" style={{ marginBottom: "28px" }}>
            <span className="badge badge-brand" style={{ cursor: "default" }}>
              <Sparkles size={11} />
              Powered by Amazon Nova · AutoGen · Multi-Agent AI
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-display animate-fade-up"
            style={{ marginBottom: "22px", color: "var(--text-primary)" }}
          >
            The AI that actually{" "}
            <span className="gradient-text">gets your career</span>
          </h1>

          {/* Subheadline */}
          <p
            className="animate-fade-up-delay-1"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "var(--text-secondary)",
              maxWidth: "560px",
              margin: "0 auto 36px",
              lineHeight: 1.7,
            }}
          >
            Resume analysis, personalised roadmaps, real-time market data, and
            mock interviews — all in one place. Built for developers who are serious
            about their next move.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-up-delay-2" style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }}>
            <Link href="/register" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "13px 28px",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "white",
              textDecoration: "none",
              background: "var(--brand-gradient)",
              borderRadius: "var(--radius-md)",
              transition: "box-shadow 0.15s, transform 0.15s",
              boxShadow: "0 4px 24px rgba(91,110,248,0.3)",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(91,110,248,0.4)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(91,110,248,0.3)"; }}
            >
              Start for free <ArrowRight size={16} />
            </Link>
            <Link href="/login" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "13px 28px",
              fontSize: "0.95rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              transition: "color 0.15s, border-color 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"; }}
            >
              Sign in
            </Link>
          </div>

          {/* Stats row */}
          <div className="animate-fade-up-delay-3" style={{
            display: "flex",
            gap: "0",
            justifyContent: "center",
            flexWrap: "wrap",
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "32px",
          }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                padding: "12px 32px",
                borderRight: i < STATS.length - 1 ? "1px solid var(--border-subtle)" : "none",
                textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  lineHeight: 1.1,
                }}>{s.value}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="animate-fade-up-delay-4" style={{
          position: "relative", zIndex: 1, marginTop: "60px", width: "100%", maxWidth: "900px",
        }}>
          <div style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          }}>
            {/* Fake browser chrome */}
            <div style={{
              padding: "12px 16px",
              background: "var(--bg-surface)",
              borderBottom: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <div style={{ display: "flex", gap: "6px" }}>
                {["#ef4444", "#f59e0b", "#10b981"].map(c => (
                  <div key={c} style={{ width: "11px", height: "11px", borderRadius: "50%", background: c, opacity: 0.7 }} />
                ))}
              </div>
              <div style={{
                flex: 1, height: "26px", background: "var(--bg-overlay)",
                borderRadius: "6px", margin: "0 12px",
                display: "flex", alignItems: "center", paddingLeft: "10px",
                fontSize: "0.72rem", color: "var(--text-muted)",
              }}>
                careermentor.ai/dashboard
              </div>
            </div>

            {/* Dashboard content mockup */}
            <div style={{ display: "flex", height: "320px" }}>
              {/* Sidebar */}
              <div style={{
                width: "180px", flexShrink: 0,
                background: "var(--bg-surface)",
                borderRight: "1px solid var(--border-default)",
                padding: "16px 10px",
                display: "flex", flexDirection: "column", gap: "4px",
              }}>
                {[
                  { icon: "⚡", label: "Dashboard", active: true },
                  { icon: "📄", label: "Resume" },
                  { icon: "🗺️", label: "Roadmap" },
                  { icon: "📈", label: "Market" },
                  { icon: "🎤", label: "Interview" },
                ].map(item => (
                  <div key={item.label} style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "7px 10px", borderRadius: "7px",
                    background: item.active ? "rgba(91,110,248,0.1)" : "transparent",
                    fontSize: "0.78rem", fontWeight: item.active ? 600 : 400,
                    color: item.active ? "#818cf8" : "var(--text-muted)",
                  }}>
                    <span style={{ fontSize: "12px" }}>{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Main area */}
              <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Good morning, Anil 👋</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {[
                    { label: "Resume Score", value: "82/100", color: "#818cf8" },
                    { label: "Skills Gap", value: "3 areas", color: "#f59e0b" },
                    { label: "Market Fit", value: "Strong", color: "#34d399" },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: "var(--bg-overlay)", borderRadius: "8px",
                      border: "1px solid var(--border-default)", padding: "12px",
                    }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: "4px" }}>{s.label}</div>
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {/* Skeleton roadmap */}
                <div style={{ flex: 1, background: "var(--bg-overlay)", borderRadius: "8px", border: "1px solid var(--border-default)", padding: "12px" }}>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: "10px" }}>UPCOMING ROADMAP</div>
                  {[80, 60, 45].map((w, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(91,110,248,0.15)", border: "1px solid rgba(91,110,248,0.25)", flexShrink: 0 }} />
                      <div style={{ height: "7px", width: `${w}%`, background: "var(--bg-surface)", borderRadius: "4px" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Glow under screenshot */}
          <div style={{
            position: "absolute",
            bottom: "-40px", left: "10%", right: "10%",
            height: "80px",
            background: "radial-gradient(ellipse, rgba(91,110,248,0.2) 0%, transparent 70%)",
            filter: "blur(20px)",
            pointerEvents: "none",
          }} />
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div ref={featSection.ref} style={{
            textAlign: "center", marginBottom: "56px",
            opacity: featSection.visible ? 1 : 0,
            transform: featSection.visible ? "none" : "translateY(24px)",
            transition: "opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)",
          }}>
            <span className="text-label" style={{ display: "block", marginBottom: "12px" }}>Capabilities</span>
            <h2 className="text-h1">Everything your career needs</h2>
            <p style={{ marginTop: "14px", color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "500px", margin: "14px auto 0" }}>
              Four AI agents working in concert, so you don't have to piece together your own stack of tools.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            opacity: featSection.visible ? 1 : 0,
            transform: featSection.visible ? "none" : "translateY(24px)",
            transition: "opacity 0.6s 0.1s var(--ease-out), transform 0.6s 0.1s var(--ease-out)",
          }}>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="feature-card" style={{
                  background: "var(--bg-elevated)",
                  border: `1px solid ${f.border}`,
                  borderRadius: "var(--radius-xl)",
                  padding: "28px",
                }}>
                  <div style={{
                    width: "42px", height: "42px",
                    background: f.bg,
                    border: `1px solid ${f.border}`,
                    borderRadius: "12px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "20px",
                  }}>
                    <Icon size={20} color={f.color} />
                  </div>
                  <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {f.title}
                    </h3>
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 600, padding: "2px 8px",
                      background: f.bg, border: `1px solid ${f.border}`,
                      color: f.color, borderRadius: "var(--radius-full)",
                    }}>{f.tag}</span>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "80px 24px", background: "var(--bg-surface)" }}>
        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          <div ref={stepsSection.ref} style={{
            textAlign: "center", marginBottom: "60px",
            opacity: stepsSection.visible ? 1 : 0,
            transform: stepsSection.visible ? "none" : "translateY(24px)",
            transition: "opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)",
          }}>
            <span className="text-label" style={{ display: "block", marginBottom: "12px" }}>Process</span>
            <h2 className="text-h1">From zero to career plan in 3 steps</h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2px",
            position: "relative",
          }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{
                padding: "36px 28px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: i === 0 ? "var(--radius-xl) 0 0 var(--radius-xl)" : i === 2 ? "0 var(--radius-xl) var(--radius-xl) 0" : "0",
                opacity: stepsSection.visible ? 1 : 0,
                transform: stepsSection.visible ? "none" : "translateY(20px)",
                transition: `opacity 0.5s ${0.1 * i}s var(--ease-out), transform 0.5s ${0.1 * i}s var(--ease-out)`,
              }}>
                <div style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontSize: "2.4rem",
                  fontWeight: 800,
                  color: "var(--border-strong)",
                  lineHeight: 1,
                  marginBottom: "16px",
                }}>{step.n}</div>
                <h3 style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                }}>{step.title}</h3>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div ref={testSection.ref} style={{
            textAlign: "center", marginBottom: "52px",
            opacity: testSection.visible ? 1 : 0,
            transform: testSection.visible ? "none" : "translateY(24px)",
            transition: "opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)",
          }}>
            <span className="text-label" style={{ display: "block", marginBottom: "12px" }}>Stories</span>
            <h2 className="text-h1">Developers who levelled up</h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="feature-card" style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xl)",
                padding: "28px",
                opacity: testSection.visible ? 1 : 0,
                transform: testSection.visible ? "none" : "translateY(20px)",
                transition: `opacity 0.5s ${0.1 * i}s var(--ease-out), transform 0.5s ${0.1 * i}s var(--ease-out)`,
              }}>
                {/* Stars */}
                <div style={{ display: "flex", gap: "3px", marginBottom: "16px" }}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={13} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p style={{
                  fontSize: "0.92rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: "20px",
                  fontStyle: "italic",
                }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                  <div style={{
                    width: "36px", height: "36px",
                    borderRadius: "50%",
                    background: t.avatarColor + "22",
                    border: `1px solid ${t.avatarColor}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 700, color: t.avatarColor,
                    flexShrink: 0,
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{t.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-brand)",
            borderRadius: "var(--radius-2xl)",
            padding: "60px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* BG Glow */}
            <div style={{
              position: "absolute", top: 0, left: "50%",
              transform: "translateX(-50%)",
              width: "300px", height: "150px",
              background: "radial-gradient(ellipse, rgba(91,110,248,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                width: "52px", height: "52px",
                background: "rgba(91,110,248,0.1)",
                border: "1px solid rgba(91,110,248,0.2)",
                borderRadius: "14px",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
              }}>
                <Zap size={24} color="#818cf8" />
              </div>
              <h2 style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: "14px",
                letterSpacing: "-0.02em",
              }}>
                Ready to accelerate your career?
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "32px", lineHeight: 1.6 }}>
                Join 2,400+ developers who use AI Career Mentor to land better roles, faster.
              </p>
              <Link href="/register" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 32px",
                fontSize: "1rem",
                fontWeight: 600,
                color: "white",
                textDecoration: "none",
                background: "var(--brand-gradient)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-brand)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
              >
                Get started — it&apos;s free <ArrowRight size={18} />
              </Link>
              <div style={{ marginTop: "20px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                No credit card needed · Works in 60 seconds
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid var(--border-default)",
        padding: "40px 24px",
        background: "var(--bg-surface)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div style={{ width: "28px", height: "28px", background: "var(--brand-gradient)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={14} color="white" />
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
              CareerMentor.ai
            </span>
          </div>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {["Features", "How it works", "Sign in", "Get started"].map(l => (
              <a key={l} href="#" style={{ fontSize: "0.83rem", color: "var(--text-muted)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--text-primary)"}
                onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--text-muted)"}
              >{l}</a>
            ))}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-disabled)" }}>
            © 2025 CareerMentor.ai · Built with ❤️
          </div>
        </div>
      </footer>
    </div>
  );
}

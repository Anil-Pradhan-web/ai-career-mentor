"use client";

import Link from "next/link";
import {
  Brain,
  FileSearch,
  Map,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Zap,
  Shield,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: FileSearch,
    title: "Resume Analyzer",
    description:
      "Upload your resume and get instant AI-powered skill analysis. Identify strengths, gaps, and opportunities in seconds.",
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.2)",
  },
  {
    icon: Map,
    title: "Personalized Roadmap",
    description:
      "Get a week-by-week learning plan tailored to your target role — with free resources, projects, and milestones.",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.2)",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description:
      "Real-time job market data. Know the top skills, salary ranges, and hiring companies for your target role.",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.2)",
  },
  {
    icon: MessageSquare,
    title: "Mock Interviews",
    description:
      "Practice with an AI interviewer. Get instant feedback and a score after 5 technical questions — just like the real thing.",
    color: "#10b981",
    glow: "rgba(16,185,129,0.2)",
  },
];

const steps = [
  { step: "01", title: "Upload Your Resume", desc: "Drop your PDF — our AI reads and understands it instantly." },
  { step: "02", title: "Set Your Career Goal", desc: "Tell us your target role. We handle the rest." },
  { step: "03", title: "Get Your AI Career Plan", desc: "4 agents collaborate to build your personalized roadmap, insights & interview prep." },
];

const stats = [
  { value: "4", label: "AI Agents" },
  { value: "<30s", label: "Full Analysis" },
  { value: "100%", label: "Personalized" },
  { value: "Free", label: "To Get Started" },
];

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <section
        className="grid-bg"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Orbs */}
        <div
          className="animate-pulse-glow"
          style={{
            position: "absolute",
            top: "15%",
            left: "10%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <div
          className="animate-pulse-glow"
          style={{
            position: "absolute",
            bottom: "15%",
            right: "10%",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
            animationDelay: "1.5s",
          }}
        />

        {/* Badge */}
        <div className="animate-fade-up" style={{ marginBottom: "24px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: "100px",
              padding: "8px 18px",
              fontSize: "13px",
              color: "#93c5fd",
              fontWeight: 500,
            }}
          >
            <Sparkles size={14} />
            Powered by Microsoft AutoGen &amp; Azure OpenAI
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up-delay-1"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: "900px",
            marginBottom: "24px",
          }}
        >
          Your AI Career Coach,{" "}
          <span className="gradient-text">Available 24/7</span>
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-up-delay-2"
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: "var(--text-muted)",
            maxWidth: "620px",
            lineHeight: 1.7,
            marginBottom: "40px",
          }}
        >
          Upload your resume. Set your goal. Let 4 AI agents collaborate to analyze your skills,
          research the job market, build your roadmap, and prep you for interviews — in under 30 seconds.
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-fade-up-delay-3"
          style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}
        >
          <Link href="/dashboard" id="hero-get-started-btn">
            <button
              className="btn-glow"
              style={{
                padding: "16px 36px",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                Start for Free <ArrowRight size={18} />
              </span>
            </button>
          </Link>
          <Link href="#how-it-works" id="hero-learn-more-btn">
            <button
              style={{
                padding: "16px 36px",
                fontSize: "16px",
                background: "transparent",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: "12px",
                color: "#94a3b8",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(148,163,184,0.5)";
                e.currentTarget.style.color = "#f1f5f9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(148,163,184,0.2)";
                e.currentTarget.style.color = "#94a3b8";
              }}
            >
              See How It Works
            </button>
          </Link>
        </div>

        {/* Stats Row */}
        <div
          className="animate-fade-up-delay-3"
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "64px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                className="gradient-text"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "2rem",
                  fontWeight: 800,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────────────────────────── */}
      <section
        id="features"
        style={{ padding: "100px 24px", maxWidth: "1200px", margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            Everything You Need to{" "}
            <span className="gradient-text">Land Your Dream Job</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "500px", margin: "0 auto" }}>
            Four specialized AI agents work together to give you a complete career advantage.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="glass feature-card"
              style={{ padding: "32px", cursor: "default" }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: f.glow,
                  border: `1px solid ${f.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <f.icon size={24} color={f.color} />
              </div>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  marginBottom: "12px",
                  color: "#f1f5f9",
                }}
              >
                {f.title}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: "100px 24px",
          background: "rgba(15,23,42,0.5)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              marginBottom: "64px",
            }}
          >
            How It <span className="gradient-text">Works</span>
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "32px",
            }}
          >
            {steps.map((s, i) => (
              <div
                key={s.step}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))",
                    border: "1px solid rgba(139,92,246,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "#a78bfa",
                  }}
                >
                  {s.step}
                </div>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    marginBottom: "12px",
                  }}
                >
                  {s.title}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <div
          className="glass animate-float"
          style={{
            padding: "64px 48px",
            border: "1px solid rgba(139,92,246,0.2)",
            background: "linear-gradient(135deg, rgba(59,130,246,0.05), rgba(139,92,246,0.08))",
          }}
        >
          <Zap size={40} color="#8b5cf6" style={{ margin: "0 auto 20px" }} />
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            Ready to Accelerate Your Career?
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "1rem", lineHeight: 1.7 }}>
            Join developers who are using AI to land their dream jobs faster.
            No credit card required. Start free today.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
            <Link href="/dashboard" id="cta-start-btn">
              <button
                className="btn-glow"
                style={{ padding: "16px 48px", fontSize: "16px" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  Get Started Free <ArrowRight size={18} />
                </span>
              </button>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "13px" }}>
              <CheckCircle size={14} color="#10b981" /> No signup required to explore
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px 24px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "13px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
          <Brain size={16} color="#3b82f6" />
          <span style={{ fontWeight: 600, color: "#f1f5f9" }}>AI Career Mentor</span>
        </div>
        <p>Built with ❤️ using Microsoft AutoGen · Azure OpenAI · Next.js</p>
        <p style={{ marginTop: "4px" }}>Microsoft AI Dev Days Hackathon 2026</p>
      </footer>
    </main>
  );
}

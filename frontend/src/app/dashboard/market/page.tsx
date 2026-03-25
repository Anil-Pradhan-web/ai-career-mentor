"use client";

import { useState } from "react";
import { TrendingUp, FileSearch, Building2, MapPin, Briefcase, Zap, Loader2, DollarSign } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { getMarketTrends } from "@/services/api";

type MarketTrendsResponse = {
    role: string;
    location: string;
    top_skills: string[];
    salary_range: string;
    top_companies: string[];
    market_trend: string;
};

// ─── roles.ts ────────────────────────────────────────────────────────────────

const TARGET_ROLES = [
  // Core Engineering
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile App Developer (Android)",
  "Mobile App Developer (iOS)",
  "QA / Automation Engineer",

  // Data & Analytics
  "Data Analyst",
  "Data Scientist",
  "Data Engineer",
  "Business Intelligence Engineer",

  // AI / ML
  "Machine Learning Engineer",
  "Deep Learning Engineer",
  "Generative AI / LLM Engineer",
  "Computer Vision Engineer",
  "NLP Engineer",
  "MLOps Engineer",
  "AI Research Engineer",

  // Infrastructure
  "DevOps Engineer",
  "Site Reliability Engineer (SRE)",
  "Cloud Engineer",
  "Cloud / Solutions Architect",
  "Network Engineer",
  "Systems Engineer",

  // Security
  "Cybersecurity Analyst",
  "Security Engineer",
  "Penetration Tester",

  // Product & Design
  "Product Manager",
  "Technical Product Manager",
  "UI/UX Designer",

  // Specialized
  "Blockchain Developer",
  "Game Developer",
  "AR/VR Developer",
  "Embedded Systems / IoT Engineer",
  "Robotics Engineer",
] as const;

type TargetRole = (typeof TARGET_ROLES)[number];


// ─── locations.ts ────────────────────────────────────────────────────────────

interface LocationProfile {
  label: string;           // shown in dropdown
  city: string;            // for search queries
  country: string;         // for agent context
  currency: string;        // e.g. "INR (LPA)", "USD", "GBP"
  salaryFormat: string;    // injected into Market Researcher prompt
  remote: boolean;
}

const LOCATION_PROFILES: LocationProfile[] = [
  // ── India Tier-1 ──────────────────────────────────────────────────────────
  {
    label: "Bangalore, India", city: "Bangalore", country: "India",
    currency: "INR (LPA)", salaryFormat: "₹X–Y LPA, broken down by 0–2 yrs / 3–5 yrs / 5+ yrs experience",
    remote: false,
  },
  {
    label: "Hyderabad, India", city: "Hyderabad", country: "India",
    currency: "INR (LPA)", salaryFormat: "₹X–Y LPA, broken down by 0–2 yrs / 3–5 yrs / 5+ yrs experience",
    remote: false,
  },
  {
    label: "Pune, India", city: "Pune", country: "India",
    currency: "INR (LPA)", salaryFormat: "₹X–Y LPA, broken down by 0–2 yrs / 3–5 yrs / 5+ yrs experience",
    remote: false,
  },
  {
    label: "Mumbai, India", city: "Mumbai", country: "India",
    currency: "INR (LPA)", salaryFormat: "₹X–Y LPA, broken down by 0–2 yrs / 3–5 yrs / 5+ yrs experience",
    remote: false,
  },
  {
    label: "Delhi NCR, India", city: "Delhi NCR", country: "India",
    currency: "INR (LPA)", salaryFormat: "₹X–Y LPA, broken down by 0–2 yrs / 3–5 yrs / 5+ yrs experience",
    remote: false,
  },
  {
    label: "Chennai, India", city: "Chennai", country: "India",
    currency: "INR (LPA)", salaryFormat: "₹X–Y LPA, broken down by 0–2 yrs / 3–5 yrs / 5+ yrs experience",
    remote: false,
  },

  // ── India Tier-2 (growing hubs) ───────────────────────────────────────────
  {
    label: "Ahmedabad, India", city: "Ahmedabad", country: "India",
    currency: "INR (LPA)", salaryFormat: "₹X–Y LPA, broken down by 0–2 yrs / 3–5 yrs experience",
    remote: false,
  },
  {
    label: "Kochi, India", city: "Kochi", country: "India",
    currency: "INR (LPA)", salaryFormat: "₹X–Y LPA, broken down by 0–2 yrs / 3–5 yrs experience",
    remote: false,
  },
  {
    label: "Kolkata, India", city: "Kolkata", country: "India",
    currency: "INR (LPA)", salaryFormat: "₹X–Y LPA, broken down by 0–2 yrs / 3–5 yrs experience",
    remote: false,
  },
  {
    label: "Bhubaneswar, India", city: "Bhubaneswar", country: "India",
    currency: "INR (LPA)", salaryFormat: "₹X–Y LPA, broken down by 0–2 yrs / 3–5 yrs experience",
    remote: false,
  },

  // ── India Remote ──────────────────────────────────────────────────────────
  {
    label: "Remote (India-based)", city: "Remote", country: "India",
    currency: "INR (LPA)", salaryFormat: "₹X–Y LPA for India-based remote roles",
    remote: true,
  },

  // ── USA ───────────────────────────────────────────────────────────────────
  {
    label: "San Francisco, USA", city: "San Francisco", country: "United States",
    currency: "USD/yr", salaryFormat: "$X–$Y per year (base), note equity/bonus separately if known",
    remote: false,
  },
  {
    label: "Seattle, USA", city: "Seattle", country: "United States",
    currency: "USD/yr", salaryFormat: "$X–$Y per year (base), note equity/bonus separately if known",
    remote: false,
  },
  {
    label: "New York, USA", city: "New York", country: "United States",
    currency: "USD/yr", salaryFormat: "$X–$Y per year (base), note equity/bonus separately if known",
    remote: false,
  },
  {
    label: "Austin, USA", city: "Austin", country: "United States",
    currency: "USD/yr", salaryFormat: "$X–$Y per year (base), note equity/bonus separately if known",
    remote: false,
  },
  {
    label: "Remote (USA-based)", city: "Remote", country: "United States",
    currency: "USD/yr", salaryFormat: "$X–$Y per year for US remote roles",
    remote: true,
  },

  // ── Canada ────────────────────────────────────────────────────────────────
  {
    label: "Toronto, Canada", city: "Toronto", country: "Canada",
    currency: "CAD/yr", salaryFormat: "CAD $X–$Y per year",
    remote: false,
  },
  {
    label: "Vancouver, Canada", city: "Vancouver", country: "Canada",
    currency: "CAD/yr", salaryFormat: "CAD $X–$Y per year",
    remote: false,
  },

  // ── Europe ────────────────────────────────────────────────────────────────
  {
    label: "London, UK", city: "London", country: "United Kingdom",
    currency: "GBP/yr", salaryFormat: "£X–£Y per year",
    remote: false,
  },
  {
    label: "Berlin, Germany", city: "Berlin", country: "Germany",
    currency: "EUR/yr", salaryFormat: "€X–€Y per year (gross)",
    remote: false,
  },
  {
    label: "Amsterdam, Netherlands", city: "Amsterdam", country: "Netherlands",
    currency: "EUR/yr", salaryFormat: "€X–€Y per year (gross)",
    remote: false,
  },
  {
    label: "Dublin, Ireland", city: "Dublin", country: "Ireland",
    currency: "EUR/yr", salaryFormat: "€X–€Y per year (gross)",
    remote: false,
  },

  // ── Asia / Middle East ────────────────────────────────────────────────────
  {
    label: "Singapore", city: "Singapore", country: "Singapore",
    currency: "SGD/yr", salaryFormat: "SGD $X–$Y per year",
    remote: false,
  },
  {
    label: "Dubai, UAE", city: "Dubai", country: "UAE",
    currency: "AED/yr", salaryFormat: "AED X–Y per year (tax-free, note this)",
    remote: false,
  },

  // ── Australia ─────────────────────────────────────────────────────────────
  {
    label: "Sydney, Australia", city: "Sydney", country: "Australia",
    currency: "AUD/yr", salaryFormat: "AUD $X–$Y per year",
    remote: false,
  },
  {
    label: "Melbourne, Australia", city: "Melbourne", country: "Australia",
    currency: "AUD/yr", salaryFormat: "AUD $X–$Y per year",
    remote: false,
  },

  // ── Global Remote ─────────────────────────────────────────────────────────
  {
    label: "Remote (Worldwide)", city: "Remote", country: "Global",
    currency: "USD/yr", salaryFormat: "USD $X–$Y per year (global remote benchmark)",
    remote: true,
  },
];

// Simple array for dropdown rendering
const TARGET_LOCATIONS = LOCATION_PROFILES.map(l => l.label);

// Helper for Market Researcher agent injection
function getLocationContext(label: string): Pick<LocationProfile, "city" | "country" | "currency" | "salaryFormat"> {
  const profile = LOCATION_PROFILES.find(l => l.label === label);
  return profile ?? {
    city: label,
    country: "Unknown",
    currency: "USD/yr",
    salaryFormat: "$X–$Y per year",
  };
}

export default function MarketPage() {
    const [role, setRole] = useState<TargetRole>(TARGET_ROLES[0]);
    const [location, setLocation] = useState<string>(TARGET_LOCATIONS[0]);
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const [trends, setTrends] = useState<MarketTrendsResponse | null>(null);

    const handleSearch = async () => {
        if (!role || !location) return;
        setStatus("loading");
        setError(null);
        try {
            const data = await getMarketTrends(role, location);
            setTrends(data);
            setStatus("done");
        } catch (err: any) {
            setStatus("error");
            setError(err.message || "Failed to fetch market trends.");
        }
    };

    return (
        <div className="dashboard-root" style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>
            {/* Dynamic Background */}
            <div
                className="animate-pulse-glow"
                style={{
                    position: "absolute",
                    top: "-15%",
                    right: "-10%",
                    width: "600px",
                    height: "600px",
                    background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 60%)",
                    zIndex: 0,
                    pointerEvents: "none"
                }}
            />

            <Sidebar />

            <main
                style={{
                    marginLeft: "240px",
                    flex: 1,
                    padding: "48px",
                    maxWidth: "calc(100vw - 240px)",
                    position: "relative",
                    zIndex: 1
                }}
            >
                {/* Header */}
                <div
                    className="animate-fade-up"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "48px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "14px",
                                background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))",
                                border: "1px solid rgba(6,182,212,0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <TrendingUp size={24} color="#22d3ee" />
                        </div>
                        <div>
                            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem", fontWeight: 800, color: "#f8fafc", marginBottom: "4px" }}>
                                Market Insights
                            </h1>
                            <p style={{ color: "#94a3b8", fontSize: "15px" }}>Live job market trends and salary data powered by Azure Web Search agents.</p>
                        </div>
                    </div>
                </div>

                {/* Search Bar section */}
                <div className="glass animate-fade-up-delay-1" style={{ padding: "28px", borderRadius: "16px", marginBottom: "40px" }}>
                    <div className="market-search-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "16px", alignItems: "end" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px" }}>
                                Target Role
                            </label>
                            <div style={{ position: "relative" }}>
                                <Briefcase size={16} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as TargetRole)}
                                    style={{ width: "100%", padding: "12px 16px 12px 40px", borderRadius: "10px", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(6,182,212,0.3)", color: "#f8fafc", outline: "none", appearance: "none", cursor: "pointer" }}
                                >
                                    {TARGET_ROLES.map(r => <option key={r} value={r} style={{ background: "#0f172a" }}>{r}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px" }}>
                                Location
                            </label>
                            <div style={{ position: "relative" }}>
                                <MapPin size={16} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    style={{ width: "100%", padding: "12px 16px 12px 40px", borderRadius: "10px", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(139,92,246,0.3)", color: "#f8fafc", outline: "none", appearance: "none", cursor: "pointer" }}
                                >
                                    {TARGET_LOCATIONS.map(l => <option key={l} value={l} style={{ background: "#0f172a" }}>{l}</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleSearch}
                            disabled={status === "loading"}
                            className="btn-glow"
                            style={{
                                padding: "13px 28px", height: "45px", display: "flex", alignItems: "center", gap: "8px",
                                background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", border: "none", borderRadius: "10px", color: "white",
                                fontWeight: 600, cursor: status === "loading" ? "not-allowed" : "pointer"
                            }}
                        >
                            {status === "loading" ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <FileSearch size={16} />}
                            {status === "loading" ? "Searching..." : "Analyze Market"}
                        </button>
                    </div>
                    {error && <p style={{ color: "#ef4444", fontSize: "14px", marginTop: "16px" }}>{error}</p>}
                </div>

                {/* Results Dashboard */}
                {status === "done" && trends && (
                    <div className="animate-fade-up market-results-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

                        {/* Overall Market Indicator Card */}
                        <div className="glass feature-card" style={{ padding: "32px", borderRadius: "20px", background: "linear-gradient(135deg, rgba(6,182,212,0.05), rgba(139,92,246,0.05))" }}>
                            <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
                                <TrendingUp size={14} color="#22d3ee" /> Market Trajectory
                            </p>
                            <h2 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "16px 0 8px", color: trends.market_trend.toLowerCase().includes("grow") ? "#34d399" : trends.market_trend.toLowerCase().includes("decline") ? "#f87171" : "#0ea5e9" }}>
                                {trends.market_trend}
                            </h2>
                            <p style={{ color: "#cbd5e1" }}>for {trends.role}s in {trends.location}.</p>
                        </div>

                        {/* Salary Insights Card */}
                        <div className="glass feature-card" style={{ padding: "32px", borderRadius: "20px" }}>
                            <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
                                <DollarSign size={14} color="#10b981" /> Average Salary Range
                            </p>
                            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, margin: "16px 0", color: "#f8fafc" }}>
                                {trends.salary_range}
                            </h2>
                            <div style={{ padding: "10px 14px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", color: "#34d399", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                <Zap size={14} /> Highly competitive comp
                            </div>
                        </div>

                        {/* Top Skills Card */}
                        <div className="glass feature-card" style={{ padding: "32px", borderRadius: "20px" }}>
                            <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "20px" }}>
                                <Zap size={14} color="#f59e0b" /> Top In-Demand Skills
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {trends.top_skills.map((skill, i) => (
                                    <span key={i} style={{ padding: "8px 16px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "100px", color: "#fbbf24", fontSize: "14px", fontWeight: 500 }}>
                                        {i + 1}. {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Top Companies Card */}
                        <div className="glass feature-card" style={{ padding: "32px", borderRadius: "20px" }}>
                            <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "20px" }}>
                                <Building2 size={14} color="#a78bfa" /> Top Hiring Companies
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {trends.top_companies.map((company, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(15,23,42,0.5)", border: "1px solid var(--border)", borderRadius: "12px" }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a78bfa" }} />
                                        <span style={{ fontSize: "15px", fontWeight: 500, color: "#e2e8f0" }}>{company}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}

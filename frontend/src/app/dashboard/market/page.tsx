"use client";

import { useState } from "react";
import { TrendingUp, FileSearch, Building2, MapPin, Briefcase, Zap, Loader2, DollarSign } from "lucide-react";
import { getMarketTrends } from "@/services/api";
import ModelSelector from "@/components/ModelSelector";

import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area,
  BarChart,
  Bar
} from "recharts";

type MarketTrendsResponse = {
    role: string;
    location: string;
    market_trend: string;
    salary_range: string;
    currency?: string;
    symbol?: string;
    is_remote?: boolean;
    market_confidence?: number;
    market_summary?: string;
    historical_salary: { year: number; salary: number; formatted: string }[];
    historical_hiring: { year: number; volume: number }[];
    company_hiring_stats: { name: string; hiring_volume: number }[];
    top_skills_freq: { skill: string; frequency: number }[];
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
        <main
            style={{
                flex: 1,
                padding: "40px",
                width: "100%",
                position: "relative",
                zIndex: 1
            }}
        >
            <div style={{ paddingLeft: "50px" }}>
                {/* Header */}
                <div
                    className="animate-fade-up"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "40px",
                        flexWrap: "wrap",
                        gap: "20px"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                            style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "14px",
                                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 8px 20px rgba(99, 102, 241, 0.2)"
                            }}
                        >
                            <TrendingUp size={28} color="#818cf8" />
                        </div>
                        <div>
                            <h1
                                style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: "2.2rem",
                                    fontWeight: 800,
                                    color: "#f8fafc",
                                    marginBottom: "4px",
                                    letterSpacing: "-0.02em"
                                }}
                            >
                                Market Explorer
                            </h1>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.05rem" }}>
                                    Real-time job market data and salary insights.
                                </p>
                                <ModelSelector />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar Container */}
                <div
                    className="animate-fade-up-delay-1"
                    style={{
                        padding: "32px",
                        borderRadius: "24px",
                        background: "rgba(15, 23, 42, 0.4)",
                        backdropFilter: "blur(30px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        marginBottom: "40px",
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
                    }}
                >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "20px", alignItems: "flex-end" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "10px" }}>
                                Targeted Role
                            </label>
                            <div style={{ position: "relative" }}>
                                <Briefcase size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as TargetRole)}
                                    style={{
                                        width: "100%",
                                        padding: "16px 16px 16px 48px",
                                        borderRadius: "14px",
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        color: "white",
                                        fontSize: "1rem",
                                        outline: "none",
                                        cursor: "pointer",
                                        appearance: "none",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {TARGET_ROLES.map(r => <option key={r} value={r} style={{ background: "#0f172a" }}>{r}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "10px" }}>
                                Target Location
                            </label>
                            <div style={{ position: "relative" }}>
                                <MapPin size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "16px 16px 16px 48px",
                                        borderRadius: "14px",
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        color: "white",
                                        fontSize: "1rem",
                                        outline: "none",
                                        cursor: "pointer",
                                        appearance: "none",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {TARGET_LOCATIONS.map(l => <option key={l} value={l} style={{ background: "#0f172a" }}>{l}</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleSearch}
                            disabled={status === "loading"}
                            style={{
                                height: "54px",
                                padding: "0 32px",
                                borderRadius: "14px",
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                border: "none",
                                color: "white",
                                fontWeight: 700,
                                fontSize: "1rem",
                                cursor: status === "loading" ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                transition: "all 0.2s",
                                opacity: status === "loading" ? 0.7 : 1,
                                boxShadow: "0 8px 25px rgba(99, 102, 241, 0.4)"
                            }}
                        >
                            {status === "loading" ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <FileSearch size={20} />
                            )}
                            Explore Trends
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                {status === "idle" && (
                  <div style={{ textAlign: "center", padding: "80px 0", opacity: 0.5 }}>
                    <TrendingUp size={64} style={{ marginBottom: "20px", color: "rgba(255,255,255,0.2)" }} />
                    <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.4)" }}>Select a role and location to see real-time insights.</p>
                  </div>
                )}

                {status === "loading" && (
                  <div 
                    className="animate-pulse-glow"
                    style={{ 
                        textAlign: "center", 
                        padding: "100px 0", 
                        background: "rgba(15, 23, 42, 0.2)", 
                        borderRadius: "24px",
                        border: "1px dashed rgba(99, 102, 241, 0.2)"
                    }}
                  >
                    <Loader2 size={48} className="animate-spin" style={{ marginBottom: "24px", color: "#6366f1" }} />
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", marginBottom: "8px" }}>Analyzing live market data...</h3>
                    <p style={{ color: "rgba(255,255,255,0.5)" }}>Our AI agents are crawling current job postings and salary benchmarks.</p>
                  </div>
                )}

                {status === "error" && (
                  <div style={{ padding: "32px", borderRadius: "20px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#fca5a5", textAlign: "center" }}>
                    <p>{error}</p>
                  </div>
                )}

                {status === "done" && trends && (
                    <div className="animate-fade-up">
                        {/* Top Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)", position: "relative" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Market Sentiment</p>
                                    {trends.market_confidence && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "rgba(99, 102, 241, 0.1)", borderRadius: "100px", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818cf8" }} />
                                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#818cf8" }}>{Math.round(trends.market_confidence * 100)}% Confidence</span>
                                        </div>
                                    )}
                                </div>
                                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.4rem", fontWeight: 800, margin: "16px 0", color: "#34d399", lineHeight: 1.1 }}>{trends.market_trend}</h2>
                                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                                    {trends.market_summary || "Based on last 30 days of hiring activity and company announcements."}
                                </p>
                            </div>

                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Compensation Benchmark</p>
                                    {trends.is_remote && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "100px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                                            <Zap size={10} color="#10b981" />
                                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#10b981" }}>REMOTE ENABLED</span>
                                        </div>
                                    )}
                                </div>
                                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.4rem", fontWeight: 800, margin: "16px 0", color: "white", lineHeight: 1.1 }}>{trends.salary_range}</h2>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#34d399", fontWeight: 600, fontSize: "0.95rem" }}>
                                    <span style={{ fontSize: "1.2rem", fontWeight: 800 }}>{trends.symbol || "$"}</span>
                                    Estimated annual base + benefits
                                </div>
                            </div>
                        </div>

                        {/* Charts Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                            {/* Salary Growth Chart */}
                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "white" }}>Salary Trend (4-Year View)</h3>
                                    <div style={{ padding: "4px 12px", background: "rgba(16,185,129,0.1)", borderRadius: "100px", color: "#10b981", fontSize: "0.75rem", fontWeight: 700 }}>LIVE DATA</div>
                                </div>
                                <div style={{ height: "300px", width: "100%" }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trends.historical_salary}>
                                            <defs>
                                                <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                                            <YAxis hide />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                                                itemStyle={{ color: '#6366f1', fontWeight: 700 }}
                                                formatter={(value: any) => [`${trends.symbol || "$"}${value.toLocaleString()}`, "Salary"]}
                                            />
                                            <Area type="monotone" dataKey="salary" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSalary)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Hiring Volume Chart */}
                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "white" }}>Hiring Demand Index</h3>
                                    <div style={{ padding: "4px 12px", background: "rgba(59,130,246,0.1)", borderRadius: "100px", color: "#3b82f6", fontSize: "0.75rem", fontWeight: 700 }}>MARKET VOLUME</div>
                                </div>
                                <div style={{ height: "300px", width: "100%" }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={trends.historical_hiring}>
                                            <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                                            <YAxis hide />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                                                itemStyle={{ color: '#8b5cf6', fontWeight: 700 }}
                                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                            />
                                            <Bar dataKey="volume" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Grid: Skills & Companies */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            {/* Skills Tag Cloud */}
                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "white", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Zap size={20} color="#f59e0b" />
                                    In-Demand Skills Frequency
                                </h3>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                    {trends.top_skills_freq.map((s, i) => (
                                        <div 
                                          key={i} 
                                          style={{ 
                                            padding: "10px 18px", 
                                            background: "rgba(245,158,11,0.1)", 
                                            border: "1px solid rgba(245,158,11,0.2)", 
                                            borderRadius: "100px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px"
                                          }}
                                        >
                                            <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.95rem" }}>{s.skill}</span>
                                            <span style={{ height: "20px", width: "20px", background: "rgba(245,158,11,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#fbbf24", fontWeight: 800 }}>{s.frequency}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Companies Hiring */}
                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "white", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Building2 size={20} color="#a855f7" />
                                    Top Hiring Hubs
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {trends.company_hiring_stats.map((c, i) => {
                                        const maxVol = Math.max(...trends.company_hiring_stats.map(x => x.hiring_volume));
                                        const pct = (c.hiring_volume / maxVol) * 100;
                                        return (
                                            <div key={i}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.95rem" }}>
                                                    <span style={{ color: "white", fontWeight: 500 }}>{c.name}</span>
                                                    <span style={{ color: "#a855f7", fontWeight: 700 }}>{c.hiring_volume} openings</span>
                                                </div>
                                                <div style={{ height: "8px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #a855f7, #6366f1)", borderRadius: "4px" }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

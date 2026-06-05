"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, AlertTriangle, RefreshCcw,
  TrendingUp, Users, Clock, ChevronDown, AlertCircle, Shield
} from "lucide-react";
import { getAdminMetrics } from "@/services/api";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, Legend, LineChart, Line
} from "recharts";
import toast from "react-hot-toast";

interface ErrorLog {
  timestamp: string;
  message: string;
  traceback: string;
}

interface HistoricalData {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
  fallbacks: number;
  errors: number;
  resumes?: number;
  interviews?: number;
  roadmaps?: number;
  full_analyses?: number;
  groq_cost?: number;
  nvidia_cost?: number;
  google_cost?: number;
}

interface MetricData {
  active_users: number;
  total_users: number;
  active_websockets: number;
  latencies: Record<string, number[]>;
  error_logs: ErrorLog[];
  historical_chart: HistoricalData[];
  settings: {
    llm_provider: string;
    active_model: string;
  };
  totals?: {
    resume: number;
    interview: number;
    roadmap: number;
    full_analysis: number;
    groq_cost: number;
    nvidia_cost: number;
    google_cost: number;
    all_time_cost: number;
  };
}

export default function ObservabilityDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedErrorIdx, setExpandedErrorIdx] = useState<number | null>(null);

  // 1. Guard route and authorization check
  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "";
    if (email.trim().toLowerCase() !== "anilpradhan9644@gmail.com") {
      toast.error("Unauthorized: Admin authorization required");
      router.replace("/dashboard");
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  }, [router]);

  // 2. Fetch metrics function
  const fetchMetrics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await getAdminMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error("Failed to load admin metrics:", err);
      toast.error(err.response?.data?.detail || "Failed to retrieve observability metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 3. Setup polling interval (5 seconds)
  useEffect(() => {
    if (authorized === true) {
      fetchMetrics();
      const interval = setInterval(() => {
        fetchMetrics();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [authorized]);

  if (authorized === null || loading) {
    return (
      <div style={{ display: "flex", flex: 1, height: "100vh", alignItems: "center", justifyContent: "center", background: "#020617" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <RefreshCcw size={36} className="animate-spin" style={{ color: "#6366f1" }} />
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  if (authorized === false) return null;

  // Latency Average Calculations
  const getAvgLatency = (arr?: number[]) => {
    if (!arr || !arr.length) return "N/A";
    const sum = arr.reduce((a, b) => a + b, 0);
    return (sum / arr.length).toFixed(3) + "s";
  };

  // Formulate data points for Provider Latencies Line Chart
  const formatLatencyChartData = () => {
    if (!metrics) return [];
    const maxLen = Math.max(
      metrics.latencies.nvidia?.length || 0,
      metrics.latencies.groq?.length || 0,
      metrics.latencies.google?.length || 0
    );
    // Show last 30 requests to keep it clean
    const startIndex = Math.max(0, maxLen - 30);
    
    return Array.from({ length: Math.min(30, maxLen) }).map((_, idx) => {
      const actualIdx = startIndex + idx;
      const nvidiaLat = metrics.latencies.nvidia?.[actualIdx];
      const groqLat = metrics.latencies.groq?.[actualIdx];
      const googleLat = metrics.latencies.google?.[actualIdx];
      return {
        request: actualIdx + 1,
        Nvidia: nvidiaLat !== undefined ? parseFloat(nvidiaLat.toFixed(3)) : null,
        Groq: groqLat !== undefined ? parseFloat(groqLat.toFixed(3)) : null,
        GoogleGemini: googleLat !== undefined ? parseFloat(googleLat.toFixed(3)) : null,
      };
    });
  };

  const latencyChartData = formatLatencyChartData();

  // Glassmorphic Card Styles
  const cardStyle: React.CSSProperties = {
    background: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(30px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.4)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden"
  };

  const headerLabelStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "0.75rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.15em",
  };

  return (
    <main style={{ flex: 1, padding: "40px 48px", width: "100%", position: "relative" }}>
      <div style={{ paddingLeft: "40px" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#6366f1", marginBottom: "8px" }}>
              <Shield size={18} />
              <span style={headerLabelStyle}>Admin Observability Console</span>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981", animation: "pulse 2s infinite" }} />
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.8rem", fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}>
              System <span style={{ background: "linear-gradient(to right, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Telemetry</span>
            </h1>
          </div>
          
          <button
            onClick={() => fetchMetrics(true)}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "#a5b4fc",
              padding: "10px 18px",
              borderRadius: "14px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.25)";
              e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)";
              e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)";
            }}
          >
            <RefreshCcw size={15} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Syncing..." : "Sync Now"}
          </button>
        </div>

        {/* ── Row 1: Live Status Cards ──────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          
          {/* Active Users */}
          <div style={{ ...cardStyle, borderLeft: "4px solid #3b82f6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Users</span>
              <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}><Users size={16} /></div>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>
              {metrics?.active_users ?? 0}
            </div>
            <div style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.55)", marginTop: "4px", fontWeight: 600 }}>
              Total Users: <span style={{ color: "#3b82f6" }}>{metrics?.total_users ?? 0}</span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60a5fa", animation: "pulse 1.5s infinite" }} />
              Last 5-minute sliding window
            </div>
          </div>

          {/* Active WebSockets */}
          <div style={{ ...cardStyle, borderLeft: "4px solid #10b981" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active WS</span>
              <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}><Activity size={16} /></div>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>
              {metrics?.active_websockets ?? 0}
            </div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", animation: "pulse 1.5s infinite" }} />
              Real-time socket sessions
            </div>
          </div>

          {/* Configured Provider */}
          <div style={{ ...cardStyle, borderLeft: "4px solid #a855f7" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Provider</span>
              <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}><Activity size={16} /></div>
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "white", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {metrics?.settings?.llm_provider || "N/A"}
            </div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Model: {metrics?.settings?.active_model || "unknown"}
            </div>
          </div>

          {/* Daily Costs */}
          <div style={{ ...cardStyle, borderLeft: "4px solid #eab308" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Today's LLM Cost</span>
              <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(234, 179, 8, 0.15)", color: "#facc15" }}><TrendingUp size={16} /></div>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>
              ${metrics?.historical_chart && metrics.historical_chart.length > 0
                ? (metrics.historical_chart[metrics.historical_chart.length - 1]?.cost?.toFixed(4) || "0.0000")
                : "0.0000"}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>
              <span>Tokens: {metrics?.historical_chart && metrics.historical_chart.length > 0
                ? (metrics.historical_chart[metrics.historical_chart.length - 1]?.tokens?.toLocaleString() || 0)
                : 0}</span>
              <span style={{ display: "flex", gap: "8px", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
                <span>Groq: ${metrics?.historical_chart && metrics.historical_chart.length > 0 ? (metrics.historical_chart[metrics.historical_chart.length - 1]?.groq_cost?.toFixed(4) || "0.0000") : "0.0000"}</span>
                <span>NV: ${metrics?.historical_chart && metrics.historical_chart.length > 0 ? (metrics.historical_chart[metrics.historical_chart.length - 1]?.nvidia_cost?.toFixed(4) || "0.0000") : "0.0000"}</span>
                <span>Gemini: ${metrics?.historical_chart && metrics.historical_chart.length > 0 ? (metrics.historical_chart[metrics.historical_chart.length - 1]?.google_cost?.toFixed(4) || "0.0000") : "0.0000"}</span>
              </span>
            </div>
          </div>

        </div>

        {/* ── Row 1.5: High-Level Task Executions (All-Time Cumulative) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          
          {/* Total Resumes Parsed */}
          <div style={{ ...cardStyle, borderLeft: "4px solid #3b82f6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Resumes Parsed</span>
              <div style={{ padding: "6px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.12)", color: "#60a5fa" }}><Users size={14} /></div>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>
              {metrics?.totals?.resume ?? 0}
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>Across all users of the platform</div>
          </div>

          {/* Total Mock Interviews */}
          <div style={{ ...cardStyle, borderLeft: "4px solid #10b981" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Mock Interviews</span>
              <div style={{ padding: "6px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.12)", color: "#34d399" }}><Activity size={14} /></div>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>
              {metrics?.totals?.interview ?? 0}
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>Interactive interview runs</div>
          </div>

          {/* Total Roadmaps Generated */}
          <div style={{ ...cardStyle, borderLeft: "4px solid #a855f7" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Roadmaps Created</span>
              <div style={{ padding: "6px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.12)", color: "#c084fc" }}><Activity size={14} /></div>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>
              {metrics?.totals?.roadmap ?? 0}
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>Multi-week custom learning plans</div>
          </div>

          {/* Total Full Analyses Run */}
          <div style={{ ...cardStyle, borderLeft: "4px solid #06b6d4" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Full Analyses Run</span>
              <div style={{ padding: "6px", borderRadius: "8px", background: "rgba(6, 182, 212, 0.12)", color: "#22d3ee" }}><Activity size={14} /></div>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>
              {metrics?.totals?.full_analysis ?? 0}
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>Parallel multi-agent evaluations</div>
          </div>

          {/* Cumulative LLM Costs Breakdown */}
          <div style={{ ...cardStyle, borderLeft: "4px solid #f97316", gridColumn: "span 4" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>All-Time Cumulative LLM Cost Breakdown</span>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#f97316", fontFamily: "'Space Grotesk', sans-serif" }}>
                Total: ${metrics?.totals?.all_time_cost?.toFixed(4) || "0.0000"}
              </div>
            </div>
            <div style={{ display: "flex", gap: "24px", fontSize: "0.8rem", color: "rgba(255,255,255,0.65)" }}>
              <div>Groq LLaMA: <span style={{ color: "#22c55e", fontWeight: 700 }}>${metrics?.totals?.groq_cost?.toFixed(4) || "0.0000"}</span></div>
              <div>NVIDIA NIM: <span style={{ color: "#3b82f6", fontWeight: 700 }}>${metrics?.totals?.nvidia_cost?.toFixed(4) || "0.0000"}</span></div>
              <div>Google Gemini: <span style={{ color: "#a855f7", fontWeight: 700 }}>${metrics?.totals?.google_cost?.toFixed(4) || "0.0000"}</span></div>
            </div>
          </div>

        </div>

        {/* ── Row 2: Charts (Historical Trends & Latencies) ────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
          
          {/* Latency History */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} style={{ color: "#6366f1" }} />
                Real-Time Provider Latencies
              </h3>
              <div style={{ display: "flex", gap: "8px", fontSize: "0.7rem" }}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Averages:</span>
                <span style={{ color: "#22c55e", fontWeight: 600 }}>Groq: {getAvgLatency(metrics?.latencies?.groq)}</span>
                <span style={{ color: "#3b82f6", fontWeight: 600 }}>NV: {getAvgLatency(metrics?.latencies?.nvidia)}</span>
                <span style={{ color: "#a855f7", fontWeight: 600 }}>Gemini: {getAvgLatency(metrics?.latencies?.google)}</span>
              </div>
            </div>
            
            <div style={{ height: "300px", width: "100%" }}>
              {latencyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="request" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} unit="s" />
                    <Tooltip 
                      contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                      labelStyle={{ color: "#94a3b8", fontWeight: 600 }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line type="monotone" dataKey="Groq" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Nvidia" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="GoogleGemini" stroke="#a855f7" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>
                  No latency records captured yet. Run LLM operations to trigger metrics.
                </div>
              )}
            </div>
          </div>

          {/* Historical Traffic / Requests & Cost */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={16} style={{ color: "#a855f7" }} />
              7-Day Rollup Activity & Cost (DB Summaries)
            </h3>
            
            <div style={{ height: "300px", width: "100%" }}>
              {metrics?.historical_chart && metrics.historical_chart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.historical_chart} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" fontSize={10} label={{ value: 'Requests', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.3)', offset: 10 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" fontSize={10} label={{ value: 'Cost ($)', angle: 90, position: 'insideRight', fill: 'rgba(255,255,255,0.3)', offset: 10 }} />
                    <Tooltip
                      contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Area yAxisId="left" type="monotone" dataKey="requests" name="Total Requests" stroke="#6366f1" fillOpacity={1} fill="url(#colorRequests)" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="cost" name="Estimated Cost ($)" stroke="#facc15" fillOpacity={1} fill="url(#colorCost)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>
                  No historical aggregates compiled yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Row 3: Fallbacks & Errors Overview ──────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
          
          {/* Circuit Breaker & Fallback Counters */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={16} style={{ color: "#eab308" }} />
              Provider Fallbacks & Reliability
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", height: "200px" }}>
              
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Total Fallback Shifts</span>
                <div style={{ fontSize: "3rem", fontWeight: 900, color: "#facc15", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {metrics?.historical_chart?.reduce((acc, curr) => acc + curr.fallbacks, 0) || 0}
                </div>
                <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>Cumulative 7-day shifts</span>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Active Error Threshold</span>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Shield size={18} />
                  Healthy
                </div>
                <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginTop: "8px", textAlign: "center" }}>Circuit breakers auto-trip at 5 failures</span>
              </div>

            </div>
          </div>

          {/* System Error Metrics Bar Chart */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={16} style={{ color: "#ef4444" }} />
              Daily System Exception Counts
            </h3>
            
            <div style={{ height: "200px", width: "100%" }}>
              {metrics?.historical_chart && metrics.historical_chart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.historical_chart} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={9} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                    <Bar dataKey="errors" name="Exception Logs" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>
                  No error trends captured.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Row 4: Live Exception Trace Feed ────────────────────────────────── */}
        <div style={{ ...cardStyle, marginBottom: "40px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={18} style={{ color: "#f43f5e" }} />
            Live Exception Feed & Stack Traces (Last 10 Errors)
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {metrics?.error_logs && metrics.error_logs.length > 0 ? (
              metrics.error_logs.map((log, idx) => {
                const isExpanded = expandedErrorIdx === idx;
                let timestampStr = log.timestamp || "";
                if (timestampStr.endsWith("+00:00Z")) {
                  timestampStr = timestampStr.replace("+00:00Z", "Z");
                }
                const dateVal = new Date(timestampStr);
                const formattedTime = isNaN(dateVal.getTime()) ? timestampStr : dateVal.toLocaleString();
                
                return (
                  <div 
                    key={idx} 
                    style={{
                      background: "rgba(244, 63, 94, 0.03)",
                      border: "1px solid rgba(244, 63, 94, 0.12)",
                      borderRadius: "14px",
                      overflow: "hidden"
                    }}
                  >
                    {/* Collapsible Header */}
                    <div 
                      onClick={() => setExpandedErrorIdx(isExpanded ? null : idx)}
                      style={{
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        userSelect: "none"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <AlertCircle size={16} style={{ color: "#f43f5e", flexShrink: 0 }} />
                        <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
                          {log.message || "Unknown Internal Exception"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
                          {formattedTime}
                        </span>
                        {isExpanded ? <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.4)", transform: "rotate(180deg)" }} /> : <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.4)" }} />}
                      </div>
                    </div>

                    {/* Expandable Traceback Body */}
                    {isExpanded && (
                      <div 
                        style={{
                          padding: "16px 18px",
                          borderTop: "1px solid rgba(244, 63, 94, 0.1)",
                          background: "#030712"
                        }}
                      >
                        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                          Python Exception Traceback
                        </p>
                        <pre 
                          style={{
                            margin: 0,
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.75rem",
                            color: "#fda4af",
                            overflowX: "auto",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                            maxHeight: "350px",
                            lineHeight: 1.5,
                            background: "rgba(244, 63, 94, 0.05)",
                            padding: "12px",
                            borderRadius: "10px",
                            border: "1px solid rgba(244, 63, 94, 0.08)"
                          }}
                        >
                          {log.traceback || "No Python traceback log provided for this error."}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: "16px", fontSize: "0.85rem" }}>
                🎉 System clean. No exceptions logged in the active sliding window database.
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

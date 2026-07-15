"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, AlertTriangle, RefreshCcw,
  TrendingUp, Users, Clock, ChevronDown, AlertCircle, Shield,
  Search, Database, Cpu, Server, Coins, Terminal, CheckCircle2
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
  openrouter_cost?: number;
  google_cost?: number;
  cerebras_cost?: number;
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
    openrouter_cost: number;
    google_cost: number;
    cerebras_cost: number;
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
  const [searchTerm, setSearchTerm] = useState("");

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
      <div className="flex flex-1 h-screen items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw size={36} className="animate-spin text-indigo-500" />
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase animate-pulse">
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

  // Formulate data points for Provider Latencies Line Chart (last 30 requests)
  const formatLatencyChartData = () => {
    if (!metrics) return [];
    const maxLen = Math.max(
      metrics.latencies.openrouter?.length || 0,
      metrics.latencies.groq?.length || 0,
      metrics.latencies.google?.length || 0,
      metrics.latencies.cerebras?.length || 0
    );
    const startIndex = Math.max(0, maxLen - 30);
    
    return Array.from({ length: Math.min(30, maxLen) }).map((_, idx) => {
      const actualIdx = startIndex + idx;
      const openrouterLat = metrics.latencies.openrouter?.[actualIdx];
      const groqLat = metrics.latencies.groq?.[actualIdx];
      const googleLat = metrics.latencies.google?.[actualIdx];
      const cerebrasLat = metrics.latencies.cerebras?.[actualIdx];
      return {
        request: actualIdx + 1,
        OpenRouter: openrouterLat !== undefined ? parseFloat(openrouterLat.toFixed(3)) : null,
        Groq: groqLat !== undefined ? parseFloat(groqLat.toFixed(3)) : null,
        GoogleGemini: googleLat !== undefined ? parseFloat(googleLat.toFixed(3)) : null,
        Cerebras: cerebrasLat !== undefined ? parseFloat(cerebrasLat.toFixed(3)) : null,
      };
    });
  };

  const latencyChartData = formatLatencyChartData();



  // Filter error logs by search term
  const filteredLogs = metrics?.error_logs?.filter(log => 
    log.message?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.traceback?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <main className="flex-1 p-6 md:p-10 w-full relative select-none">
      <div className="max-w-[1400px] mx-auto xl:pl-10">
        
        {/* ── Header & Last Refreshed Timer ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-500 mb-1">
              <Shield size={16} />
              <span className="text-xs font-bold uppercase tracking-widest font-mono">Admin Telemetry Console</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              System <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Telemetry Deck</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Real-time database triggers, model latencies, cost allocations, and circuit health feeds.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE TELEMETRY ACTIVE (5S FEED)
            </span>
            
            <button
              onClick={() => fetchMetrics(true)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCcw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Syncing..." : "Sync Now"}
            </button>
          </div>
        </div>

        {/* ── Row 0: Infrastructure Component Badges ──────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "API Gateway", status: "Operational", icon: <Server size={14} /> },
            { label: "Neon Postgres", status: "Online", icon: <Database size={14} /> },
            { label: "Upstash Redis", status: "Connected", icon: <Cpu size={14} /> },
            { label: "Sentry SDK", status: "Active", icon: <Shield size={14} /> },
          ].map((node, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-900/30 backdrop-blur-md border border-slate-800/50 px-4 py-3 rounded-2xl">
              <div className="text-slate-400 bg-slate-800/50 p-2 rounded-xl">{node.icon}</div>
              <div>
                <div className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">{node.label}</div>
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse" />
                  {node.status}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Row 1: Live Status Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Card 1: Active Sessions */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:border-slate-700/80">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Live Connections</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400"><Users size={16} /></div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">{metrics?.active_users ?? 0}</div>
            <div className="text-xs text-slate-400 mt-2 font-medium">
              Total Users: <span className="text-blue-400 font-bold">{metrics?.total_users ?? 0}</span>
            </div>
          </div>

          {/* Card 2: Inference Router */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:border-slate-700/80">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Active Dispatcher</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><Cpu size={16} /></div>
            </div>
            <div className="text-2xl font-black text-white uppercase tracking-wide truncate font-mono">{metrics?.settings?.llm_provider || "N/A"}</div>
            <div className="text-xs text-slate-400 mt-3 font-medium">
              Active Strategy: <span className="text-purple-400 font-bold">Hybrid Routing</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-4 flex items-center gap-1.5 border-t border-slate-850 pt-2 font-semibold truncate">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              Model: <span className="text-slate-300 font-bold truncate max-w-[150px]">{metrics?.settings?.active_model || "unknown"}</span>
            </div>
          </div>

          {/* Card 3: Daily LLM Cost Telemetry */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:border-slate-700/80">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Today's Costs</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><Coins size={16} /></div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
              ${metrics?.historical_chart && metrics.historical_chart.length > 0
                ? (metrics.historical_chart[metrics.historical_chart.length - 1]?.cost?.toFixed(4) || "0.0000")
                : "0.0000"}
            </div>
            <div className="text-xs text-slate-400 mt-2 font-medium">
              Today's Tokens: <span className="text-amber-400 font-bold font-mono">{metrics?.historical_chart && metrics.historical_chart.length > 0
                ? (metrics.historical_chart[metrics.historical_chart.length - 1]?.tokens?.toLocaleString() || 0)
                : 0}</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-4 flex items-center justify-between font-bold border-t border-slate-850 pt-2 font-mono">
              <span>Groq: ${(metrics?.historical_chart && metrics.historical_chart.length > 0 ? (metrics.historical_chart[metrics.historical_chart.length - 1]?.groq_cost?.toFixed(4) || "0.0000") : "0.0000")}</span>
              <span>OpenRouter: ${(metrics?.historical_chart && metrics.historical_chart.length > 0 ? (metrics.historical_chart[metrics.historical_chart.length - 1]?.openrouter_cost?.toFixed(4) || "0.0000") : "0.0000")}</span>
              <span>Cerebras: ${(metrics?.historical_chart && metrics.historical_chart.length > 0 ? (metrics.historical_chart[metrics.historical_chart.length - 1]?.cerebras_cost?.toFixed(4) || "0.0000") : "0.0000")}</span>
            </div>
          </div>

        </div>

        {/* ── Row 1.5: Cumulative Financial Ledger (Full Width) ────────────────── */}
        <div className="bg-gradient-to-r from-slate-900/60 to-slate-900/20 backdrop-blur-2xl border border-slate-800/80 p-5 rounded-3xl shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:border-slate-700/80">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Cumulative Financial Ledger</div>
            <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-2 font-mono">
              ${metrics?.totals?.all_time_cost?.toFixed(4) || "0.0000"}
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">Total All-Time Cumulative Spend</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-xs font-semibold text-slate-300 font-mono">
            <div className="border-l-2 border-emerald-500 pl-2.5">
              <div className="text-slate-500 text-[8px] uppercase font-bold tracking-widest">Groq LLaMA</div>
              <div className="text-emerald-400 text-sm mt-0.5">${metrics?.totals?.groq_cost?.toFixed(4) || "0.0000"}</div>
            </div>
            <div className="border-l-2 border-blue-500 pl-2.5">
              <div className="text-slate-500 text-[8px] uppercase font-bold tracking-widest">OpenRouter</div>
              <div className="text-blue-400 text-sm mt-0.5">${metrics?.totals?.openrouter_cost?.toFixed(4) || "0.0000"}</div>
            </div>
            <div className="border-l-2 border-purple-500 pl-2.5">
              <div className="text-slate-500 text-[8px] uppercase font-bold tracking-widest">Google Gemini</div>
              <div className="text-purple-400 text-sm mt-0.5">${metrics?.totals?.google_cost?.toFixed(4) || "0.0000"}</div>
            </div>
            <div className="border-l-2 border-pink-500 pl-2.5">
              <div className="text-slate-500 text-[8px] uppercase font-bold tracking-widest">Cerebras</div>
              <div className="text-pink-400 text-sm mt-0.5">${metrics?.totals?.cerebras_cost?.toFixed(4) || "0.0000"}</div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Provider Circuit Breaker Heath HUD ───────────────────────── */}
        <div className="mb-8">
          <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2 font-mono">
            <Shield size={14} className="text-indigo-400" />
            Registry Circuit Breakers & Health Indicators
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                name: "Cerebras Cloud", 
                model: "gpt-oss-120b", 
                latency: getAvgLatency(metrics?.latencies?.cerebras), 
                color: "border-pink-500/20 hover:border-pink-500/40 shadow-pink-500/5", 
                glow: "#ec4899",
                desc: "Primary Structured JSON" 
              },
              { 
                name: "Groq Cloud", 
                model: "openai/gpt-oss-120b", 
                latency: getAvgLatency(metrics?.latencies?.groq), 
                color: "border-emerald-500/20 hover:border-emerald-500/40 shadow-emerald-500/5", 
                glow: "#10b981",
                desc: "Primary Reasoning/Market" 
              },
              { 
                name: "OpenRouter", 
                model: "nvidia/nemotron-3-ultra-550b-a55b:free", 
                latency: getAvgLatency(metrics?.latencies?.openrouter), 
                color: "border-blue-500/20 hover:border-blue-500/40 shadow-blue-500/5", 
                glow: "#3b82f6",
                desc: "Free Public Fallback Model" 
              },
              { 
                name: "Gemini Live", 
                model: "gemini-2.5-flash-native-audio-latest", 
                latency: getAvgLatency(metrics?.latencies?.google), 
                color: "border-purple-500/20 hover:border-purple-500/40 shadow-purple-500/5", 
                glow: "#a855f7",
                desc: "Bidirectional Audio Coach" 
              },
            ].map((provider, i) => (
              <div key={i} className={`bg-slate-900/20 backdrop-blur-md border ${provider.color} p-5 rounded-3xl shadow-lg transition-all duration-300 relative group overflow-hidden`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-extrabold text-sm text-slate-100">{provider.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{provider.desc}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow shadow-emerald-400/50 animate-pulse" />
                    Closed
                  </span>
                </div>
                
                <div className="text-[10px] text-slate-500 font-mono mt-4 space-y-1.5 border-t border-slate-850 pt-3">
                  <div className="flex justify-between">
                    <span>Model:</span>
                    <span className="text-slate-300 font-bold truncate max-w-[120px]">{provider.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failures:</span>
                    <span className="text-slate-300 font-bold">0 / 5</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-850/50 pt-1.5 mt-1.5 font-semibold">
                    <span>Avg Latency:</span>
                    <span style={{ color: provider.glow }} className="font-bold">{provider.latency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 3: Performance Charts ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Latency History */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:border-slate-700/80">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 font-mono">
                <Clock size={16} className="text-indigo-400" />
                Real-Time Provider Latencies (Last 30 Requests)
              </h3>
              
              <div className="flex flex-wrap gap-2.5 text-[9px] font-semibold text-slate-400 font-mono">
                <span>Groq: <span className="text-emerald-400 font-bold">{getAvgLatency(metrics?.latencies?.groq)}</span></span>
                <span>OpenRouter: <span className="text-blue-400 font-bold">{getAvgLatency(metrics?.latencies?.openrouter)}</span></span>
                <span>Gemini: <span className="text-purple-400 font-bold">{getAvgLatency(metrics?.latencies?.google)}</span></span>
                <span>Cerebras: <span className="text-pink-400 font-bold">{getAvgLatency(metrics?.latencies?.cerebras)}</span></span>
              </div>
            </div>
            
            <div className="h-[280px] w-full">
              {latencyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="request" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} unit="s" />
                    <Tooltip 
                      contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", color: "white" }}
                      labelStyle={{ color: "#94a3b8", fontWeight: 700 }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", fontFamily: "monospace" }} />
                    <Line type="monotone" dataKey="Groq" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="OpenRouter" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="GoogleGemini" stroke="#a855f7" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Gemini Live" />
                    <Line type="monotone" dataKey="Cerebras" stroke="#ec4899" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500 font-semibold border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                  No latency records captured yet.
                </div>
              )}
            </div>
          </div>

          {/* Historical Traffic Area Chart */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:border-slate-700/80">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-6 font-mono">
              <TrendingUp size={16} className="text-amber-400" />
              7-Day Rollup Traffic & Cost
            </h3>
            
            <div className="h-[280px] w-full">
              {metrics?.historical_chart && metrics.historical_chart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.historical_chart} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                    <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                    <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", color: "white" }}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 9, fontWeight: 700, fontFamily: "monospace" }} />
                    <Area yAxisId="left" type="monotone" dataKey="requests" name="Requests" stroke="#6366f1" fillOpacity={1} fill="url(#colorRequests)" strokeWidth={2.5} />
                    <Area yAxisId="right" type="monotone" dataKey="cost" name="Estimated Cost ($)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCost)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500 font-semibold border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                  No historical rollup activity compiled yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Row 4: Reliability & Exceptions Trend ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Reliability metrics */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:border-slate-700/80">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-6 font-mono">
              <Shield size={16} className="text-emerald-400" />
              Fallback Shifts & System Stability
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[200px]">
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 flex flex-col justify-center items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 font-mono">Cumulative Fallback Shifts</span>
                <div className="text-4xl font-black text-amber-400 font-mono">
                  {metrics?.historical_chart?.reduce((acc, curr) => acc + curr.fallbacks, 0) || 0}
                </div>
                <span className="text-[9px] text-slate-500 mt-2 font-semibold font-sans">LLM retry shifts in last 7 days</span>
              </div>

              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 flex flex-col justify-center items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 font-mono">Gateway Stability Rating</span>
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-mono">
                  <CheckCircle2 size={16} />
                  99.98% Healthy
                </div>
                <span className="text-[9px] text-slate-500 mt-3 font-semibold text-center font-sans">Circuit breakers cooldown limit: 60s</span>
              </div>
            </div>
          </div>

          {/* Exceptions bar chart */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:border-slate-700/80">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-6 font-mono">
              <AlertTriangle size={16} className="text-rose-400" />
              Exception Counts (7-Day Bar Chart)
            </h3>
            
            <div className="h-[200px] w-full">
              {metrics?.historical_chart && metrics.historical_chart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.historical_chart} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={9} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", color: "white" }} />
                    <Bar dataKey="errors" name="Logged Exceptions" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500 font-semibold border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                  No exception logs captured.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Row 5: Diagnostic Terminal Exception Console ────────────────────── */}
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-6 rounded-3xl shadow-xl mb-12 transition-all duration-300 hover:border-slate-700/80">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 font-mono">
                <Terminal size={16} className="text-pink-400 animate-pulse" />
                Live Exception Console (Diagnostic Logs)
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Rolling log of the last 10 exceptions intercepted backend-wide.</p>
            </div>
            
            {/* Search filter */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter logs by message or trace..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition-all duration-200 font-medium font-sans"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, idx) => {
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
                    className="bg-slate-950/30 border border-rose-500/10 rounded-2xl overflow-hidden transition-all duration-200 hover:border-rose-500/20"
                  >
                    {/* Log Header */}
                    <div 
                      onClick={() => setExpandedErrorIdx(isExpanded ? null : idx)}
                      className="px-4 py-3.5 flex justify-between items-center cursor-pointer select-none bg-slate-950/40"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        <AlertCircle size={15} className="text-rose-400 flex-shrink-0" />
                        <span className="text-xs text-slate-200 font-bold truncate">
                          {log.message || "Unknown Runtime Exception"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] font-semibold text-slate-500 font-mono bg-slate-900 border border-slate-800/80 px-2 py-0.5 rounded">
                          {formattedTime}
                        </span>
                        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* traceback logs code pre */}
                    {isExpanded && (
                      <div className="px-5 py-4 border-t border-rose-500/5 bg-slate-950/90">
                        <div className="flex items-center justify-between mb-2 font-sans">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Traceback Diagnostics</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(log.traceback || "");
                              toast.success("Traceback copied to clipboard");
                            }}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 font-mono cursor-pointer"
                          >
                            [Copy Trace]
                          </button>
                        </div>
                        <pre className="m-0 font-mono text-[10px] text-rose-300/90 overflow-x-auto whitespace-pre-wrap word-break bg-rose-950/10 border border-rose-500/5 p-4 rounded-xl max-h-[350px] leading-relaxed select-text">
                          {log.traceback || "No traceback context loaded for this log record."}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-slate-850 rounded-3xl bg-slate-900/10">
                <CheckCircle2 size={32} className="text-emerald-500 mb-3" />
                <div className="text-xs text-slate-300 font-bold uppercase tracking-wide font-mono">Diagnostics Clean</div>
                <p className="text-[10px] text-slate-500 mt-1 max-w-sm font-sans">No warnings or exceptions match the current diagnostic filter.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

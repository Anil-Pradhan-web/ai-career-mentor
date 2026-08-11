"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Loader2, History } from "lucide-react";
import {
  uploadResume,
  runFullAnalysisNew,
  getMarketConfig,
  getCareerAnalysisHistory,
  deleteCareerAnalysis,
} from "@/services/api";
import { FullAnalysisResponse } from "@/types";
import { toast } from "react-hot-toast";

import ResumeAnalysisPanel from "@/components/ResumeAnalysisPanel";
import MarketAnalysisPanel from "@/components/full-analysis/MarketAnalysisPanel";
import RoadmapPanel from "@/components/full-analysis/RoadmapPanel";
import LinkedInPanel from "@/components/full-analysis/LinkedInPanel";
import ProcessLogs from "@/components/full-analysis/ProcessLogs";
import AnalysisWizard from "@/components/full-analysis/AnalysisWizard";
import AnalysisTabs from "@/components/full-analysis/AnalysisTabs";
import CareerAnalysisHistory from "@/components/full-analysis/CareerAnalysisHistory";

export default function FullAnalysisPage() {
  const [config, setConfig] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("intermediate_to_advanced");
  const [learningStyle, setLearningStyle] = useState("balanced");

  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FullAnalysisResponse | null>(null);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"resume" | "market" | "roadmap" | "linkedin">("resume");

  const [historyList, setHistoryList] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    getMarketConfig()
      .then((data) => {
        setConfig(data);
        if (data.roles?.length) setRole(data.roles[0]);
        if (data.locations?.length) setLocation(data.locations[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    getCareerAnalysisHistory()
      .then((data: any[]) => {
        if (data?.length > 0) {
          setHistoryList(data);
          const latest = data[0];
          setResults({
            status: "success",
            output: {
              resume_analysis: latest.resume_analysis,
              market_trends: latest.market_analysis,
              roadmap: latest.roadmap,
              linkedin_strategy: latest.linkedin_strategy,
            },
            logs: [],
            errors: [],
            metadata: {},
          });
          setRole(latest.target_role);
          setLocation(latest.location);
          setStep(3);
          setStatus("done");
        }
      })
      .catch(console.error);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      try {
        const data = await uploadResume(e.target.files[0]);
        setResumeText(data.full_text);
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
  };

  const runAgents = async () => {
    if (!resumeText) return setError("Resume text missing.");
    setStatus("loading");
    setError(null);
    setLiveLogs([]);
    setStep(3);

    try {
      const data = await runFullAnalysisNew(
        resumeText,
        role,
        location,
        undefined,
        experienceLevel,
        learningStyle,
        (log) => setLiveLogs((prev) => [...prev, log])
      );
      setResults(data);
      setStatus("done");
      if (typeof window !== "undefined") window.dispatchEvent(new Event("rateLimitUpdated"));
      getCareerAnalysisHistory()
        .then((data: any[]) => {
          if (data) setHistoryList(data);
        })
        .catch(console.error);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Orchestration failed.");
    }
  };

  const handleSelectHistory = (item: any) => {
    setResults({
      status: "success",
      output: {
        resume_analysis: item.resume_analysis,
        market_trends: item.market_analysis,
        roadmap: item.roadmap,
        linkedin_strategy: item.linkedin_strategy,
      },
      logs: [],
      errors: [],
      metadata: {},
    });
    setRole(item.target_role);
    setLocation(item.location);
    setStep(3);
    setStatus("done");
    setShowHistory(false);
    toast.success(`Loaded report for ${item.target_role}`);
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteCareerAnalysis(id);
      setHistoryList((prev) => prev.filter((h) => h.id !== id));
      toast.success("Analysis report deleted.");
    } catch {
      toast.error("Failed to delete history item.");
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10" style={{ maxWidth: "1200px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit size={15} style={{ color: "var(--accent-purple)" }} />
            <span className="text-label" style={{ color: "var(--accent-purple)" }}>Full Analysis</span>
          </div>
          <h1 className="text-h1" style={{ color: "var(--fg-primary)" }}>Career AI OS</h1>
          <p className="mt-2" style={{ color: "var(--fg-secondary)", fontSize: "0.9375rem" }}>
            Multi-Agent Parallel Orchestration (V3.5)
          </p>
          <div className="flex items-center gap-3 mt-3 flex-wrap" style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>
            <span>Active Agents: Resume Analyzer, Market Researcher, LinkedIn Optimizer, Syllabus Architect</span>
          </div>
        </div>

        <div className="flex gap-3">
          {(status === "done" || status === "error") && (
            <button
              onClick={() => { setStep(1); setStatus("idle"); setResults(null); }}
              className="btn btn-primary btn-sm"
            >
              ➕ New Analysis
            </button>
          )}
          <button
            onClick={() => setShowHistory(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <History size={15} /> History
          </button>
        </div>
      </div>

      {/* Steps 1 & 2: Wizard */}
      {step < 3 && config && (
        <div className="flex justify-center mt-10">
          <AnalysisWizard
            step={step} setStep={setStep} file={file} resumeText={resumeText}
            handleFileUpload={handleFileUpload} role={role} setRole={setRole}
            location={location} setLocation={setLocation} runAgents={runAgents}
            roles={config.roles} locations={config.locations}
            experienceLevel={experienceLevel} setExperienceLevel={setExperienceLevel}
            learningStyle={learningStyle} setLearningStyle={setLearningStyle}
          />
        </div>
      )}
      {step < 3 && !config && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin" size={36} style={{ color: "var(--brand)" }} />
          <p className="text-label">Syncing Global Market Context...</p>
        </div>
      )}

      {/* Step 3: Loading / Results */}
      {step === 3 && (
        <div className="animate-fade-up">
          {status === "loading" && (
            <div className="text-center py-16">
              <div className="animate-pulse-glow mb-10">
                <Loader2 size={44} className="animate-spin mx-auto mb-4" style={{ color: "var(--brand)" }} />
                <h2 className="text-h2" style={{ color: "var(--fg-primary)" }}>Synthesizing Intelligence...</h2>
                <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem", marginTop: "8px" }}>
                  Multi-agent pipeline running — live updates below
                </p>
              </div>
              <ProcessLogs logs={liveLogs} errors={[]} status={status} />
            </div>
          )}

          {status === "error" && (
            <div className="card text-center" style={{ padding: "40px", maxWidth: "500px", margin: "40px auto", borderColor: "rgba(239, 68, 68, 0.2)" }}>
              <p style={{ color: "var(--accent-rose)", fontSize: "0.9375rem", marginBottom: "20px" }}>{error}</p>
              <button onClick={() => setStep(2)} className="btn btn-danger btn-sm">Retry Configuration</button>
            </div>
          )}

          {status === "done" && results && (
            <div className="animate-fade-up">
              <AnalysisTabs activeTab={activeTab} setActiveTab={setActiveTab} />
              <div className="mt-8">
                {activeTab === "resume" && <ResumeAnalysisPanel analysis={results.output.resume_analysis} filename={file?.name || "Resume"} />}
                {activeTab === "market" && <MarketAnalysisPanel data={results.output.market_trends} role={role} />}
                {activeTab === "roadmap" && <RoadmapPanel roadmap={results.output.roadmap} />}
                {activeTab === "linkedin" && <LinkedInPanel strategy={results.output.linkedin_strategy} />}
              </div>
              <div className="mt-12">
                <ProcessLogs logs={results.logs} errors={results.errors} status={status} />
              </div>
            </div>
          )}
        </div>
      )}

      {showHistory && (
        <CareerAnalysisHistory
          history={historyList}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

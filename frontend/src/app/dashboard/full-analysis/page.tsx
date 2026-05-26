"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Loader2 } from "lucide-react";
import { uploadResume, runFullAnalysis, getMarketConfig } from "@/services/api";
import { FullAnalysisResponse } from "@/types";

// Components
import ModelSelector from "@/components/ModelSelector";
import ResumeAnalysisPanel from "@/components/ResumeAnalysisPanel";
import MarketAnalysisPanel from "@/components/full-analysis/MarketAnalysisPanel";
import RoadmapPanel from "@/components/full-analysis/RoadmapPanel";
import LinkedInPanel from "@/components/full-analysis/LinkedInPanel";
import ProcessLogs from "@/components/full-analysis/ProcessLogs";
import AnalysisWizard from "@/components/full-analysis/AnalysisWizard";
import AnalysisTabs from "@/components/full-analysis/AnalysisTabs";

export default function FullAnalysisPage() {
    const [config, setConfig] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState("");
    const [role, setRole] = useState("");
    const [location, setLocation] = useState("");

    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<FullAnalysisResponse | null>(null);
    const [liveLogs, setLiveLogs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"resume" | "market" | "roadmap" | "linkedin">("resume");

    useEffect(() => {
        getMarketConfig().then(data => {
            setConfig(data);
            if (data.roles?.length) setRole(data.roles[0]);
            if (data.locations?.length) setLocation(data.locations[0]);
        }).catch(console.error);
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
            const data = await runFullAnalysis(
                resumeText, role, location, undefined,
                (log) => setLiveLogs(prev => [...prev, log]),  // Live SSE log callback
            );
            setResults(data);
            setStatus("done");
        } catch (err: any) {
            setStatus("error");
            setError(err.message || "Orchestration failed.");
        }
    };

    return (
        <main style={{ flex: 1, padding: "48px 60px 48px 110px", width: "100%" }}>
            {/* Header */}
            <div className="animate-fade-up" style={{ marginBottom: "48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div style={{
                        width: "60px", height: "60px", borderRadius: "18px",
                        background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(6,182,212,0.2))",
                        border: "1px solid rgba(168,85,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 10px 25px rgba(168,85,247,0.2)"
                    }}>
                        <BrainCircuit size={30} color="#a855f7" />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.4rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
                            Career AI OS
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1rem" }}>Multi-Agent Parallel Orchestration (V3.5)</p>
                        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginTop: "6px", display: "flex", gap: "12px", alignItems: "center" }}>
                            <span>🤖 Default: <strong>Multi-agent Orchestration</strong></span>
                            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                            <span>⚙️ Allowed: All 3 (NVIDIA, Groq, Google)</span>
                        </div>
                    </div>
                </div>
                {status !== "loading" && <ModelSelector />}
            </div>

            {/* Steps 1 & 2: Wizard */}
            {step < 3 && config && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
                    <AnalysisWizard 
                        step={step} setStep={setStep} file={file} resumeText={resumeText}
                        handleFileUpload={handleFileUpload} role={role} setRole={setRole}
                        location={location} setLocation={setLocation} runAgents={runAgents}
                        roles={config.roles} locations={config.locations}
                    />
                </div>
            )}
            {step < 3 && !config && (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Global Market Context...</p>
                </div>
            )}

            {/* Step 3: Loading / Results */}
            {step === 3 && (
                <div className="animate-fade-up">
                    {status === "loading" && (
                        <div style={{ textAlign: "center", padding: "60px 0" }}>
                            <div className="animate-pulse-glow" style={{ marginBottom: "40px" }}>
                                <Loader2 size={50} className="animate-spin" color="#a855f7" style={{ margin: "0 auto 24px" }} />
                                <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>Synthesizing Intelligence...</h2>
                                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", marginTop: "8px" }}>Multi-agent pipeline running — live updates below</p>
                            </div>
                            <ProcessLogs logs={liveLogs} errors={[]} status={status} />
                        </div>
                    )}

                    {status === "error" && (
                        <div style={{ padding: "40px", textAlign: "center", background: "rgba(239,68,68,0.05)", borderRadius: "24px", border: "1px solid rgba(239,68,68,0.2)", maxWidth: "600px", margin: "40px auto" }}>
                            <p style={{ color: "#fca5a5", fontSize: "1.1rem", marginBottom: "20px" }}>{error}</p>
                            <button onClick={() => setStep(2)} style={{ padding: "12px 24px", background: "#ef4444", color: "white", borderRadius: "12px", border: "none", cursor: "pointer", fontWeight: 700 }}>Retry Configuration</button>
                        </div>
                    )}

                    {status === "done" && results && (
                        <div className="animate-fade-up">
                            <AnalysisTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                            <div style={{ marginTop: "32px" }}>
                                {activeTab === "resume" && <ResumeAnalysisPanel analysis={results.output.resume_analysis} filename={file?.name || "Resume"} />}
                                {activeTab === "market" && <MarketAnalysisPanel data={results.output.market_trends} role={role} />}
                                {activeTab === "roadmap" && <RoadmapPanel roadmap={results.output.roadmap} />}
                                {activeTab === "linkedin" && <LinkedInPanel strategy={results.output.linkedin_strategy} />}
                            </div>

                            <div style={{ marginTop: "60px" }}>
                                <ProcessLogs logs={results.logs} errors={results.errors} status={status} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}

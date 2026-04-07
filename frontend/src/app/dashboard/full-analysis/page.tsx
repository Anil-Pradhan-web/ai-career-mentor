"use client";

import { useState } from "react";
import { Upload, ChevronRight, Briefcase, MapPin, Zap, Bot, BrainCircuit, TrendingUp } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { uploadResume, runFullAnalysis } from "@/services/api";
import ResumeAnalysisPanel from "@/components/ResumeAnalysisPanel";

const TARGET_ROLES = [
    "Software Engineer",
    "Software Developer",
    "Data Scientist",
    "Data Analyst",
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "Web Developer",
    "Mobile App Developer",
    "Android Developer",
    "iOS Developer",
    "Cloud Engineer",
    "Cloud Architect",
    "DevOps Engineer",
    "Site Reliability Engineer",
    "Machine Learning Engineer",
    "AI Engineer",
    "Deep Learning Engineer",
    "Generative AI Engineer",
    "Prompt Engineer",
    "MLOps Engineer",
    "Data Engineer",
    "Big Data Engineer",
    "Product Manager",
    "Technical Product Manager",
    "Project Manager",
    "Cybersecurity Analyst",
    "Security Engineer",
    "Penetration Tester",
    "Blockchain Developer",
    "Game Developer",
    "AR/VR Developer",
    "Embedded Systems Engineer",
    "IoT Engineer",
    "Robotics Engineer",
    "Automation Engineer",
    "QA Engineer",
    "Test Engineer",
    "UI/UX Designer",
    "Solutions Architect",
    "IT Support Engineer",
    "Systems Engineer",
    "Network Engineer",
    "Research Engineer",
    "Computer Vision Engineer",
    "NLP Engineer",
];

const TARGET_LOCATIONS = [
    // India Tech Cities
    "Bangalore, India",
    "Hyderabad, India",
    "Pune, India",
    "Mumbai, India",
    "Delhi NCR, India",
    "Chennai, India",
    "Remote, India",

    // USA Tech Cities
    "San Francisco, United States",
    "Seattle, United States",
    "New York, United States",
    "Austin, United States",

    // Canada
    "Toronto, Canada",
    "Vancouver, Canada",

    // Europe Tech
    "London, United Kingdom",
    "Berlin, Germany",
    "Amsterdam, Netherlands",
    "Dublin, Ireland",

    // Asia / Middle East Tech
    "Singapore, Singapore",
    "Dubai, UAE",

    // Global Remote
    "Remote",
];

export default function FullAnalysisPage() {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState("");

    const [role, setRole] = useState(TARGET_ROLES[0]);
    const [location, setLocation] = useState(TARGET_LOCATIONS[0]);

    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"resume" | "market" | "roadmap">("resume");

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            try {
                // Just extract text for now
                const data = await uploadResume(e.target.files[0]);
                setResumeText(data.full_text);
            } catch (err) {
                console.error("Failed to read resume text", err);
            }
        }
    };

    const runAgents = async () => {
        if (!resumeText) {
            setError("Please upload a readable resume first.");
            return;
        }
        setStatus("loading");
        setError(null);
        setStep(3);

        try {
            const data = await runFullAnalysis(resumeText, role, location);
            setResults(data);
            setStatus("done");
        } catch (err: any) {
            setStatus("error");
            setError(err.message || "Failed to run agent orchestrator.");
        }
    };

    return (
        <div className="flex min-h-screen bg-[var(--bg-base)] relative overflow-hidden">
            <div className="animate-pulse-glow absolute -top-[15%] -right-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_60%)] z-0 pointer-events-none" />
            <div className="animate-pulse-glow absolute -bottom-[20%] -left-[5%] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_60%)] z-0 pointer-events-none animation-delay-[1.5s]" />

            <Sidebar />

            <main className="ml-[240px] flex-1 p-12 max-w-[calc(100vw-240px)] relative z-10">

                <div className="animate-fade-up mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[14px] bg-[linear-gradient(135deg,rgba(139,92,246,0.2),rgba(6,182,212,0.2))] border border-[rgba(139,92,246,0.3)] flex items-center justify-center">
                            <BrainCircuit size={24} color="#a855f7" />
                        </div>
                        <div>
                            <h1 className="font-['Space_Grotesk'] text-[2.2rem] font-800 text-[#f8fafc] mb-1">
                                Full Career Analysis
                            </h1>
                            <p className="text-[#94a3b8] text-[15px]">Multi-Agent Orchestration (Resume + Market + Coach)</p>
                        </div>
                    </div>
                </div>

                {/* Wizard Flow */}
                {step < 3 && (
                    <div className="glass animate-fade-up-delay-1 max-w-[700px] p-10 rounded-[20px]">

                        {/* Step Indicator */}
                        <div className="flex items-center mb-8">
                            <div className={`flex-1 text-center font-600 ${step === 1 ? 'text-[#a855f7]' : 'text-[#475569]'}`}>1. Upload Resume</div>
                            <ChevronRight size={16} color="#475569" />
                            <div className={`flex-1 text-center font-600 ${step === 2 ? 'text-[#a855f7]' : 'text-[#475569]'}`}>2. Set Goal</div>
                            <ChevronRight size={16} color="#475569" />
                            <div className="flex-1 text-center text-[#475569] font-600">3. AI Magic</div>
                        </div>

                        {/* Step 1: Upload */}
                        {step === 1 && (
                            <div>
                                <label className="flex flex-col items-center p-10 border-2 border-dashed border-[rgba(139,92,246,0.3)] rounded-[16px] cursor-pointer bg-[rgba(15,23,42,0.5)] transition-all duration-300">
                                    <Upload size={32} color="#a855f7" className="mb-4" />
                                    <span className="text-[#f1f5f9] font-500">{file ? file.name : "Click to upload your Resume (PDF)"}</span>
                                    <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
                                </label>
                                <button className="btn-glow disabled:opacity-50 disabled:cursor-not-allowed mt-6 w-full py-[14px] rounded-[12px] font-600 border-none" disabled={!resumeText} onClick={() => setStep(2)}>
                                    Continue to Goals
                                </button>
                            </div>
                        )}

                        {/* Step 2: Goals */}
                        {step === 2 && (
                            <div>
                                <div className="mb-5">
                                    <label className="block text-[12px] font-600 text-[#94a3b8] uppercase mb-2">Target Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full py-[12px] px-4 rounded-[10px] bg-[rgba(15,23,42,0.8)] border border-[rgba(139,92,246,0.3)] text-[#f8fafc] outline-none appearance-none cursor-pointer"
                                    >
                                        {TARGET_ROLES.map(r => <option key={r} value={r} className="bg-[#0f172a]">{r}</option>)}
                                    </select>
                                </div>
                                <div className="mb-8">
                                    <label className="block text-[12px] font-600 text-[#94a3b8] uppercase mb-2">Location</label>
                                    <select
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full py-[12px] px-4 rounded-[10px] bg-[rgba(15,23,42,0.8)] border border-[rgba(139,92,246,0.3)] text-[#f8fafc] outline-none appearance-none cursor-pointer"
                                    >
                                        {TARGET_LOCATIONS.map(l => <option key={l} value={l} className="bg-[#0f172a]">{l}</option>)}
                                    </select>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="flex-1 py-[14px] rounded-[12px] bg-transparent border border-[#475569] text-[#cbd5e1] cursor-pointer">Back</button>
                                    <button className="btn-glow flex-2 py-[14px] rounded-[12px] font-600 border-none cursor-pointer" onClick={runAgents}>
                                        Launch AI Agents ✨
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Loading / Results */}
                {step === 3 && (
                    <div>
                        {status === "loading" && (
                            <div className="glass p-[60px] text-center rounded-[20px] max-w-[600px] mx-auto">
                                <Bot size={64} color="#a855f7" className="animate-float mx-auto mb-6" />
                                <h2 className="text-[1.5rem] text-[#f8fafc] mb-4 font-700">Agents are collaborating...</h2>
                                <p className="text-[#94a3b8] mb-8">The Resume Analyst, Market Researcher, and Career Coach are securely reviewing your profile in a live GroupChat. This takes ~30 seconds.</p>
                                <div className="flex gap-3 justify-center">
                                    <div className="w-3 h-3 rounded-full bg-[#3b82f6] animate-pulse-glow" />
                                    <div className="w-3 h-3 rounded-full bg-[#8b5cf6] animate-pulse-glow animation-delay-[0.2s]" />
                                    <div className="w-3 h-3 rounded-full bg-[#06b6d4] animate-pulse-glow animation-delay-[0.4s]" />
                                </div>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="glass p-10 text-center rounded-[20px] border border-[rgba(239,68,68,0.3)]">
                                <p className="text-[#ef4444] text-[16px] font-500">{error}</p>
                                <button onClick={() => setStep(2)} className="mt-6 py-[10px] px-5 bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.3)] rounded-[8px] cursor-pointer">Try Again</button>
                            </div>
                        )}

                        {status === "done" && results && (
                            <div className="animate-fade-up">
                                {/* Tabs */}
                                <div className="flex gap-4 mb-8 border-b border-[rgba(148,163,184,0.1)] pb-4">
                                    <button onClick={() => setActiveTab("resume")} className={`bg-none border-none font-500 text-[16px] cursor-pointer flex items-center gap-2 ${activeTab === "resume" ? 'text-[#a855f7] font-700' : 'text-[#94a3b8]'}`}>
                                        <Briefcase size={18} /> Resume Analysis
                                    </button>
                                    <button onClick={() => setActiveTab("market")} className={`bg-none border-none font-500 text-[16px] cursor-pointer flex items-center gap-2 ${activeTab === "market" ? 'text-[#06b6d4] font-700' : 'text-[#94a3b8]'}`}>
                                        <TrendingUp size={18} /> Market Trends
                                    </button>
                                    <button onClick={() => setActiveTab("roadmap")} className={`bg-none border-none font-500 text-[16px] cursor-pointer flex items-center gap-2 ${activeTab === "roadmap" ? 'text-[#3b82f6] font-700' : 'text-[#94a3b8]'}`}>
                                        <Zap size={18} /> Learning Roadmap
                                    </button>
                                </div>

                                {/* Content */}
                                {activeTab === "resume" && (
                                    <ResumeAnalysisPanel analysis={results.resume_analysis} filename={file?.name || "Uploaded File"} />
                                )}

                                {activeTab === "market" && (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="glass feature-card p-8 rounded-[20px]">
                                            <p className="text-[12px] font-600 text-[#94a3b8] uppercase">Trend</p>
                                            <h2 className="text-[2rem] font-800 my-4 text-[#34d399]">{results.market_trends.market_trend}</h2>
                                        </div>
                                        <div className="glass feature-card p-8 rounded-[20px]">
                                            <p className="text-[12px] font-600 text-[#94a3b8] uppercase">Salary</p>
                                            <h2 className="text-[2rem] font-800 my-4 text-[#f8fafc]">{results.market_trends.salary_range}</h2>
                                        </div>
                                        {/* Top Skills Card */}
                                        <div className="glass feature-card p-8 rounded-[20px]">
                                            <p className="flex items-center gap-2 text-[12px] font-600 text-[#94a3b8] uppercase mb-5">
                                                <Zap size={14} color="#f59e0b" /> Top In-Demand Skills
                                            </p>
                                            <div className="flex flex-wrap gap-[10px]">
                                                {results.market_trends.top_skills.map((skill: string, i: number) => (
                                                    <span key={i} className="py-2 px-4 bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] rounded-[100px] text-[#fbbf24] text-[14px] font-500">
                                                        {i + 1}. {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Top Companies Card */}
                                        <div className="glass feature-card p-8 rounded-[20px]">
                                            <p className="flex items-center gap-2 text-[12px] font-600 text-[#94a3b8] uppercase mb-5">
                                                <Briefcase size={14} color="#a78bfa" /> Top Hiring Companies
                                            </p>
                                            <div className="flex flex-col gap-3">
                                                {results.market_trends.top_companies.map((company: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-[rgba(15,23,42,0.5)] border border-[var(--border)] rounded-[12px]">
                                                        <div className="w-2 h-2 rounded-full bg-[#a78bfa]" />
                                                        <span className="text-[15px] font-500 text-[#e2e8f0]">{company}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "roadmap" && (
                                    <div className="flex flex-col gap-4">
                                        {results.roadmap.weeks?.map((week: any, i: number) => (
                                            <div key={i} className="glass p-6 rounded-[16px]">
                                                <h3 className="text-[#f8fafc] text-[18px] mb-2">Week {week.week}: {week.topic}</h3>
                                                <p className="text-[#94a3b8] mb-3">{week.mini_project}</p>
                                                <a href={week.resource_url} target="_blank" rel="noreferrer" className="text-[#a855f7] no-underline font-600">Study Resource ↗</a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

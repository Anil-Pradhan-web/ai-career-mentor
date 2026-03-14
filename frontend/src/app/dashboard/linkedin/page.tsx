"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Linkedin, Send, Sparkles, AlertTriangle, TrendingUp, Key, Trophy, Loader2 } from "lucide-react";

interface LinkedInAnalysis {
    headline_suggestions: string[];
    about_section_feedback: string;
    key_keywords: string[];
    profile_score: number;
    general_tips: string[];
}

export default function LinkedInPage() {
    const [headlineText, setHeadlineText] = useState("");
    const [aboutText, setAboutText] = useState("");
    const [skillsText, setSkillsText] = useState("");
    const [experienceText, setExperienceText] = useState("");
    const [educationText, setEducationText] = useState("");
    const [achievementsText, setAchievementsText] = useState("");

    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<LinkedInAnalysis | null>(null);

    const handleAnalyze = async () => {
        const combinedText = `
Headline: ${headlineText}
About: ${aboutText}
Skills: ${skillsText}
Experience: ${experienceText}
Education/CGPA: ${educationText}
Achievements/Certificates: ${achievementsText}
        `.trim();

        if (combinedText.length < 50) {
            alert("Please provide more details across the fields for a proper AI review. At least 50 characters combined are required.");
            return;
        }

        setLoading(true);
        setAnalysis(null);

        try {
            const token = localStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            
            const response = await fetch(`${apiUrl}/linkedin/review`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` })
                },
                body: JSON.stringify({ profile_text: combinedText })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Failed to analyze LinkedIn profile");
            }

            const data = await response.json();
            setAnalysis(data.analysis);
            
            setTimeout(() => {
                document.getElementById("linkedin-analysis")?.scrollIntoView({ behavior: "smooth" });
            }, 300);

        } catch (error: any) {
            console.error("Error:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-root" style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>
            <div
                className="animate-pulse-glow"
                style={{
                    position: "absolute",
                    top: "-15%",
                    right: "-10%",
                    width: "600px",
                    height: "600px",
                    background: "radial-gradient(circle, rgba(14,118,168,0.12) 0%, transparent 60%)",
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
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header */}
                <div
                    className="animate-fade-up"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "48px"
                    }}
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, rgba(14,118,168,0.2), rgba(59,130,246,0.2))",
                            border: "1px solid rgba(14,118,168,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Linkedin size={24} color="#0b66c2" />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem", fontWeight: 800, color: "#f8fafc", marginBottom: "4px" }}>
                            LinkedIn Reviewer
                        </h1>
                        <p style={{ color: "#94a3b8", fontSize: "15px" }}>
                            Paste your LinkedIn "About" and "Experience" sections to get AI-driven optimization tips.
                        </p>
                    </div>
                </div>

                {/* Input Area */}
                <div className="glass animate-fade-up-delay-1" style={{ padding: "32px", borderRadius: "16px", border: "1px solid var(--border)", marginBottom: "40px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {[
                            { label: "Headline", value: headlineText, setter: setHeadlineText, placeholder: "e.g. Software Engineer at Google | React | Node.js" },
                            { label: "About Section", value: aboutText, setter: setAboutText, placeholder: "Your summary or bio..." },
                            { label: "Top Skills", value: skillsText, setter: setSkillsText, placeholder: "e.g. Python, React, AWS, Communication" },
                            { label: "Work Experience", value: experienceText, setter: setExperienceText, placeholder: "Your latest roles and responsibilities..." },
                            { label: "Marks / CGPA / Education", value: educationText, setter: setEducationText, placeholder: "e.g. B.Tech in CSE - 8.5 CGPA" },
                            { label: "Achievements / Certificates", value: achievementsText, setter: setAchievementsText, placeholder: "e.g. AWS Certified, 1st Prize Hackathon" }
                        ].map((field, idx) => (
                            <div key={idx} style={{ gridColumn: (field.label === "About Section" || field.label === "Work Experience") ? "1 / -1" : "auto" }}>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#f1f5f9", marginBottom: "8px" }}>
                                    {field.label}
                                </label>
                                <textarea
                                    value={field.value}
                                    onChange={(e) => field.setter(e.target.value)}
                                    placeholder={field.placeholder}
                                    style={{
                                        width: "100%",
                                        minHeight: (field.label === "About Section" || field.label === "Work Experience") ? "140px" : "80px",
                                        background: "rgba(15, 23, 42, 0.5)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "12px",
                                        padding: "16px",
                                        color: "#f1f5f9",
                                        fontSize: "14px",
                                        outline: "none",
                                        resize: "vertical",
                                        fontFamily: "inherit"
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || (headlineText.trim().length === 0 && aboutText.trim().length === 0)}
                            className="btn-glow"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "12px 24px",
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            {loading ? "Analyzing Profile..." : "Analyze Profile"}
                        </button>
                    </div>
                </div>

                {/* Analysis Results */}
                {analysis && (
                    <div id="linkedin-analysis" className="animate-fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", paddingBottom: "40px" }}>
                        
                        {/* Score Card */}
                        <div className="glass" style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(14,118,168,0.2)", display: "flex", alignItems: "center", gap: "20px", gridColumn: "1 / -1" }}>
                            <div style={{
                                width: "80px", height: "80px", borderRadius: "50%", background: `conic-gradient(#0b66c2 ${analysis.profile_score}%, transparent 0)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
                            }}>
                                <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                    <span style={{ fontSize: "20px", fontWeight: "bold", color: "#f1f5f9" }}>{analysis.profile_score}</span>
                                </div>
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "4px" }}>Profile Optimization Score</h3>
                                <p style={{ color: "#94a3b8", fontSize: "14px" }}>Based on visibility, keywords, and attractiveness to recruiters.</p>
                            </div>
                        </div>

                        {/* Headlines */}
                        <div className="glass" style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(59,130,246,0.2)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                <Trophy size={18} color="#3b82f6" />
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#f1f5f9" }}>Headline Suggestions</h3>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {analysis.headline_suggestions.map((h, i) => (
                                    <div key={i} style={{ padding: "12px", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: "8px", fontSize: "14px", color: "#e2e8f0" }}>
                                        {h}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="glass" style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(16,185,129,0.2)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                <TrendingUp size={18} color="#10b981" />
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#f1f5f9" }}>About Section Feedback</h3>
                            </div>
                            <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#cbd5e1", background: "rgba(16,185,129,0.05)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.1)" }}>
                                {analysis.about_section_feedback}
                            </p>
                        </div>

                        {/* Keywords */}
                        <div className="glass" style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(245,158,11,0.2)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                <Key size={18} color="#f59e0b" />
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#f1f5f9" }}>Missing Keywords</h3>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {analysis.key_keywords.map((k, i) => (
                                    <span key={i} style={{ padding: "6px 12px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "100px", fontSize: "13px", color: "#fbbf24" }}>
                                        {k}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* General Tips */}
                        <div className="glass" style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(239,68,68,0.2)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                <AlertTriangle size={18} color="#ef4444" />
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#f1f5f9" }}>General Actionable Tips</h3>
                            </div>
                            <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "14px", color: "#cbd5e1" }}>
                                {analysis.general_tips.map((tip, i) => (
                                    <li key={i} style={{ marginBottom: "8px" }}>{tip}</li>
                                ))}
                            </ul>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}

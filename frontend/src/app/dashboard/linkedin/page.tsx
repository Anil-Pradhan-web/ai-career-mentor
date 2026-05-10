"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ModelSelector from "@/components/ModelSelector";
import { Linkedin, Sparkles, AlertTriangle, TrendingUp, Key, Trophy, Loader2 } from "lucide-react";

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
            
            const activeProvider = localStorage.getItem("preferred_provider") || "groq";
            const response = await fetch(`${apiUrl}/linkedin/review`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` })
                },
                body: JSON.stringify({ 
                    profile_text: combinedText,
                    provider: activeProvider
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Failed to analyze LinkedIn profile");
            }

            const data = await response.json();
            setAnalysis(data.analysis);
            
            setTimeout(() => {
                document.getElementById("linkedin-analysis")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 300);

        } catch (error: any) {
            console.error("Error:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)", position: "relative", overflow: "hidden" }}>
            {/* Dynamic Background Blobs */}
            <div className="animate-pulse-glow" style={{
                position: "absolute", top: "-20%", right: "-10%", width: "50vw", height: "50vw",
                background: "radial-gradient(circle, rgba(14,118,168,0.15) 0%, transparent 60%)", filter: "blur(80px)",
                transform: "translateZ(0)", willChange: "transform, filter", zIndex: 0, pointerEvents: "none"
            }} />
            <div className="animate-pulse-glow" style={{
                position: "absolute", bottom: "-20%", left: "-10%", width: "50vw", height: "50vw",
                background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)", filter: "blur(80px)",
                transform: "translateZ(0)", willChange: "transform, filter", zIndex: 0, pointerEvents: "none", animationDelay: "2s"
            }} />

            <Sidebar />

            <main style={{
                marginLeft: "248px", flex: 1, padding: "48px 60px",
                maxWidth: "calc(100vw - 248px)", position: "relative", zIndex: 1,
                display: "flex", flexDirection: "column",
            }}>
                {/* Header */}
                <div className="animate-fade-up" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "48px" }}>
                    <div style={{
                        width: "56px", height: "56px", borderRadius: "16px",
                        background: "linear-gradient(135deg, rgba(14,118,168,0.2), rgba(59,130,246,0.2))",
                        border: "1px solid rgba(14,118,168,0.3)", boxShadow: "0 8px 20px rgba(14,118,168,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Linkedin size={28} color="#0b66c2" />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem", fontWeight: 800, color: "white", marginBottom: "6px", lineHeight: 1.1 }}>
                            LinkedIn Reviewer
                        </h1>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.05rem" }}>
                                Optimize your profile with AI to rank higher in recruiter searches.
                            </p>
                            {!loading && <ModelSelector />}
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="animate-fade-up-delay-1" style={{
                    padding: "40px", borderRadius: "24px", marginBottom: "48px", display: "flex", flexDirection: "column", gap: "24px",
                    background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)",
                    border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
                }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        {[
                            { label: "Headline", value: headlineText, setter: setHeadlineText, placeholder: "e.g. Software Engineer at Google | React | Node.js" },
                            { label: "About Section", value: aboutText, setter: setAboutText, placeholder: "Your summary or bio..." },
                            { label: "Top Skills", value: skillsText, setter: setSkillsText, placeholder: "e.g. Python, React, AWS, Communication" },
                            { label: "Work Experience", value: experienceText, setter: setExperienceText, placeholder: "Your latest roles and responsibilities..." },
                            { label: "Marks / CGPA / Education", value: educationText, setter: setEducationText, placeholder: "e.g. B.Tech in CSE - 8.5 CGPA" },
                            { label: "Achievements / Certificates", value: achievementsText, setter: setAchievementsText, placeholder: "e.g. AWS Certified, 1st Prize Hackathon" }
                        ].map((field, idx) => (
                            <div key={idx} style={{ gridColumn: (field.label === "About Section" || field.label === "Work Experience") ? "1 / -1" : "auto" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    {field.label}
                                </label>
                                <textarea
                                    value={field.value}
                                    onChange={(e) => field.setter(e.target.value)}
                                    placeholder={field.placeholder}
                                    style={{
                                        width: "100%",
                                        minHeight: (field.label === "About Section" || field.label === "Work Experience") ? "140px" : "80px",
                                        background: "rgba(255,255,255,0.02)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "14px",
                                        padding: "16px",
                                        color: "white",
                                        fontSize: "1rem",
                                        outline: "none",
                                        resize: "vertical",
                                        fontFamily: "inherit",
                                        transition: "border-color 0.15s ease, background 0.15s ease"
                                    }}
                                    onFocus={e => { e.currentTarget.style.borderColor = "#0b66c2"; e.currentTarget.style.background = "rgba(11,102,194,0.05)"; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || (headlineText.trim().length === 0 && aboutText.trim().length === 0)}
                            style={{
                                display: "flex", alignItems: "center", gap: "10px", padding: "16px 32px",
                                background: loading ? "rgba(11,102,194,0.5)" : "linear-gradient(135deg, #0b66c2, #3b82f6)",
                                border: "none", borderRadius: "14px", color: "white", fontWeight: 700, fontSize: "1rem",
                                opacity: (!headlineText && !aboutText) ? 0.5 : 1,
                                cursor: loading || (!headlineText && !aboutText) ? "not-allowed" : "pointer",
                                transition: "all 0.15s ease", boxShadow: loading ? "none" : "0 8px 25px rgba(11,102,194,0.4)"
                            }}
                            onMouseEnter={e => { if(!loading && (headlineText || aboutText)) e.currentTarget.style.transform = "translateY(-2px)" }}
                            onMouseLeave={e => { if(!loading) e.currentTarget.style.transform = "translateY(0)" }}
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                            {loading ? "Analyzing Profile..." : "Analyze Profile"}
                        </button>
                    </div>
                </div>

                {/* Analysis Results */}
                {analysis && (
                    <div id="linkedin-analysis" className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: "32px", paddingBottom: "60px" }}>
                        
                        {/* Score Card */}
                        <div style={{ padding: "40px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(14,118,168,0.3)", display: "flex", alignItems: "center", gap: "32px", boxShadow: "0 20px 40px -12px rgba(11,102,194,0.15)" }}>
                            <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: `conic-gradient(#0b66c2 ${analysis.profile_score}%, rgba(255,255,255,0.05) 0)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: "0 0 30px rgba(11,102,194,0.2)" }}>
                                <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span style={{ fontSize: "2rem", fontWeight: 800, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>{analysis.profile_score}</span>
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Overall Score</p>
                                <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "white", marginBottom: "8px", fontFamily: "'Space Grotesk', sans-serif" }}>Profile Optimization</h3>
                                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.05rem", maxWidth: "600px" }}>Based on visibility, keyword richness, and attractiveness to recruiters and ATS systems.</p>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                            {/* Headlines */}
                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", flexDirection: "column" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                                    <div style={{ padding: "10px", background: "rgba(59,130,246,0.1)", borderRadius: "12px" }}><Trophy size={20} color="#3b82f6" /></div>
                                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>Headline Suggestions</h3>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {analysis.headline_suggestions.map((h, i) => (
                                        <div key={i} style={{ padding: "16px", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: "14px", fontSize: "1rem", color: "white", lineHeight: 1.5 }}>
                                            {h}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* About Section */}
                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", flexDirection: "column" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                                    <div style={{ padding: "10px", background: "rgba(16,185,129,0.1)", borderRadius: "12px" }}><TrendingUp size={20} color="#10b981" /></div>
                                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>About Section Feedback</h3>
                                </div>
                                <p style={{ fontSize: "1rem", lineHeight: "1.7", color: "rgba(255,255,255,0.8)", background: "rgba(16,185,129,0.05)", padding: "20px", borderRadius: "14px", border: "1px solid rgba(16,185,129,0.1)" }}>
                                    {analysis.about_section_feedback}
                                </p>
                            </div>

                            {/* Keywords */}
                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", flexDirection: "column" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                                    <div style={{ padding: "10px", background: "rgba(245,158,11,0.1)", borderRadius: "12px" }}><Key size={20} color="#f59e0b" /></div>
                                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>Missing Keywords</h3>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                    {analysis.key_keywords.map((k, i) => (
                                        <span key={i} style={{ padding: "8px 16px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "100px", fontSize: "0.95rem", fontWeight: 600, color: "#fbbf24" }}>
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* General Tips */}
                            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", flexDirection: "column" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                                    <div style={{ padding: "10px", background: "rgba(239,68,68,0.1)", borderRadius: "12px" }}><AlertTriangle size={20} color="#ef4444" /></div>
                                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>Actionable Tips</h3>
                                </div>
                                <ul style={{ paddingLeft: "24px", margin: 0, fontSize: "1rem", color: "rgba(255,255,255,0.8)", display: "flex", flexDirection: "column", gap: "12px", lineHeight: 1.6 }}>
                                    {analysis.general_tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}

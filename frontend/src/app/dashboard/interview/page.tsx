"use client";

import React, { useState, useEffect } from "react";
import { History, Sparkles, Trophy, RotateCcw, FileText, X } from "lucide-react";
import { getInterviewHistory, deleteInterview, getInterviewDetails, getUserStats } from "@/services/api";
import InterviewWizard from "@/components/interview/InterviewWizard";
import InterviewInterface from "@/components/interview/InterviewInterface";
import InterviewHistory from "@/components/interview/InterviewHistory";
import InterviewScorecard from "@/components/interview/InterviewScorecard";
import { useRouter } from "next/navigation";

export default function InterviewPage() {
  const router = useRouter();
  const [view, setView] = useState<"wizard" | "active" | "result">("wizard");
  const [sessionData, setSessionData] = useState<{
    role: string;
    company: any;
    type: string;
    roleLevel: string;
    mode: string;
    topicFocus: string;
  } | null>(null);

  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalFeedback, setFinalFeedback] = useState<string>("");
  const [scorecardData, setScorecardData] = useState<any | null>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  const [showResumeModal, setShowResumeModal] = useState(false);
  const [checkingResume, setCheckingResume] = useState(false);

  useEffect(() => {
    getInterviewHistory().then((data) => setHistory(data.history || [])).catch(console.error);
  }, []);

  const handleStart = async (
    role: string,
    company: any,
    type: string,
    roleLevel: string,
    mode: string,
    topicFocus: string
  ) => {
    if (type === "technical") {
      setCheckingResume(true);
      try {
        const stats = await getUserStats();
        if (!stats.lastResumeAnalysis) {
          setShowResumeModal(true);
          return;
        }
      } catch (err) {
        console.error("Failed to check resume status", err);
      } finally {
        setCheckingResume(false);
      }
    }
    setSessionData({ role, company, type, roleLevel, mode, topicFocus });
    setView("active");
  };

  const handleEnd = (score: number, feedback: string, scorecard?: any) => {
    setFinalScore(score);
    setFinalFeedback(feedback);
    setScorecardData(scorecard || null);
    setView("result");
    getInterviewHistory().then((data) => setHistory(data.history || [])).catch(console.error);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInterview(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Delete failed");
    }
  };

  const handleSelectHistory = async (session: any) => {
    try {
      const fullDetails = await getInterviewDetails(session.id);
      setSelectedSession(fullDetails);
      setShowHistory(false);
      setView("result");
      setFinalScore(fullDetails.score);

      let feedback = "";
      let foundScorecard = null;

      if (fullDetails.chat_history) {
        const feedbackMsg = fullDetails.chat_history.find(
          (m: any) => m.type === "feedback" || (m.role === "interviewer" && m.content?.includes("That concludes our interview"))
        );
        if (feedbackMsg) {
          feedback = feedbackMsg.content;
          foundScorecard = feedbackMsg.scorecard;
        } else {
          const overallMsg = fullDetails.chat_history.find(
            (m: any) => m.role === "interviewer" && m.content?.includes("OVERALL SCORE")
          );
          if (overallMsg) feedback = overallMsg.content;
        }
      }
      setFinalFeedback(feedback);
      setScorecardData(foundScorecard || null);
    } catch (err) {
      console.error("Failed to load details");
    }
  };

  return (
    <div className={view === "active" ? "p-2 md:p-3" : "p-6 md:p-8 lg:p-10"} style={{ maxWidth: view === "active" ? "100%" : "1200px", margin: "0 auto" }}>
      {/* Header (Only when not in active live interview) */}
      {view !== "active" && (
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} style={{ color: "var(--brand)" }} />
              <span className="text-label" style={{ color: "var(--brand)" }}>Simulation Lab</span>
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--fg-primary)", letterSpacing: "-0.02em" }}>
              AI <span className="gradient-text-brand">Mock Interviewer</span>
            </h1>
            <p style={{ color: "var(--fg-secondary)", fontSize: "0.875rem", marginTop: "4px" }}>
              Authentic conversational practice tailored to 200+ top companies & your verified resume background.
            </p>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <History size={14} /> Past Simulations
          </button>
        </div>
      )}

      {/* Views */}
      {view === "wizard" && (
        <InterviewWizard onStart={handleStart} loading={checkingResume} />
      )}

      {view === "active" && sessionData && (
        <InterviewInterface
          role={sessionData.role}
          company={sessionData.company}
          type={sessionData.type}
          roleLevel={sessionData.roleLevel}
          mode={sessionData.mode}
          topicFocus={sessionData.topicFocus}
          onEnd={handleEnd}
          onBack={() => { setView("wizard"); setSessionData(null); }}
        />
      )}

      {view === "result" && (
        <InterviewScorecard
          score={finalScore}
          rawFeedback={finalFeedback}
          scorecardData={scorecardData}
          role={sessionData?.role || selectedSession?.target_role || "Engineering"}
          companyName={sessionData?.company?.name || "Target Company"}
          onRetake={() => {
            setView("wizard");
            setSelectedSession(null);
            setSessionData(null);
            setScorecardData(null);
          }}
          onViewHistory={() => setShowHistory(true)}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <InterviewHistory
          history={history}
          onSelect={handleSelectHistory}
          onDelete={handleDelete}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Resume Required Modal */}
      {showResumeModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(12px)",
          zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }}>
          <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "400px", padding: "28px", textAlign: "center" }}>
            <div className="flex justify-end" style={{ marginBottom: "12px" }}>
              <button onClick={() => setShowResumeModal(false)} className="btn btn-ghost btn-icon" style={{ color: "var(--fg-muted)" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "rgba(244, 63, 94, 0.08)", color: "var(--accent-rose)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px"
            }}>
              <FileText size={24} />
            </div>
            <h3 className="font-display" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "8px" }}>
              Resume Analysis Required
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--fg-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
              Technical mock interviews require a parsed resume to customize scenario questions to your projects. Please upload your resume first.
            </p>
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <button
                onClick={() => { setShowResumeModal(false); router.push("/dashboard/resume"); }}
                className="btn btn-primary w-full"
                style={{ padding: "11px", fontWeight: 600 }}
              >
                Go to Resume Upload
              </button>
              <button
                onClick={() => setShowResumeModal(false)}
                className="btn btn-secondary w-full"
                style={{ padding: "11px", fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

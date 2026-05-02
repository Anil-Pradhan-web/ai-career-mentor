import axios from "axios";
import type { AnalyzeResponse } from "@/types/resume";
import type { RoadmapResponse } from "@/types/roadmap";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    headers: { "Content-Type": "application/json" },
});

import { toast } from "react-hot-toast";

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Global response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || "";
        if (error.response?.status === 429) {
            const detail = error.response?.data?.detail || "Daily limit reached. Try again tomorrow.";
            toast.error(`🚫 ${detail}`, {
                duration: 6000, position: "top-center",
                style: { background: "#1e1e2e", color: "#fff", borderRadius: "10px", border: "1px solid #ef4444", maxWidth: "420px" },
            });
            error.message = detail;
        } else if (error.response?.status === 401 && !url.includes("/auth/")) {
            toast.error("Session expired. Please log in again.", {
                style: { background: "#333", color: "#fff" },
            });
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("userName");
                setTimeout(() => { window.location.href = "/login"; }, 1000);
            }
        }
        return Promise.reject(error);
    }
);

// ── Usage Tracker ──────────────────────────────────────────────────────────────
/**
 * Now handled entirely by the backend via the `ActivityLog` table.
 * The frontend no longer needs to track this in localStorage!
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function trackUsage(_feature: string, _analysisData?: unknown) {
    // Left intentionally blank - backend records this directly when the API is called
}

export const getUserStats = async () => {
    const { data } = await api.get("/user/stats");
    return data;
};

// ── Health ─────────────────────────────────────────────────────────────────────
export const checkHealth = async () => {
    const { data } = await api.get("/health");
    return data;
};

// ── Auth ───────────────────────────────────────────────────────────────────────
export const loginUser = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
};

export const googleLogin = async (credential: string) => {
    const { data } = await api.post("/auth/google", { credential });
    return data;
};

export const registerUser = async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    return data;
};

// ── Resume ─────────────────────────────────────────────────────────────────────
export const uploadResume = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/resume/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data as { filename: string; char_count: number; preview: string; full_text: string };
};

export const analyzeResume = async (file: File, provider?: string): Promise<AnalyzeResponse> => {
    const activeProvider = provider || localStorage.getItem("preferred_provider") || "groq";
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post(`/resume/analyze?provider=${activeProvider}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60_000,
    });
    trackUsage("resume", data);
    return data as AnalyzeResponse;
};

// ── Roadmap ────────────────────────────────────────────────────────────────────
export const generateRoadmap = async (
    targetRole: string,
    skillGaps: string[],
    provider?: string
): Promise<RoadmapResponse> => {
    const activeProvider = provider || localStorage.getItem("preferred_provider") || "groq";
    const { data } = await api.post(
        "/roadmap/generate",
        { target_role: targetRole, skill_gaps: skillGaps, provider: activeProvider },
        { timeout: 90_000 }
    );
    trackUsage("roadmap");
    return data as RoadmapResponse;
};

export const getRoadmapHistory = async () => {
    const { data } = await api.get("/roadmap/history");
    return data;
};

export const deleteRoadmap = async (roadmapId: string) => {
    const { data } = await api.delete(`/roadmap/${roadmapId}`);
    return data;
};

// ── Market ─────────────────────────────────────────────────────────────────────
export const getMarketTrends = async (role: string, location = "India", provider?: string) => {
    const activeProvider = provider || localStorage.getItem("preferred_provider") || "groq";
    const { data } = await api.get(`/market/trends?role=${role}&location=${location}&provider=${activeProvider}`);
    return data;
};

// ── Interview ──────────────────────────────────────────────────────────────────
export const startInterview = async (targetRole: string) => {
    const { data } = await api.post("/interview/start", { target_role: targetRole });
    return data;
};

export const getInterviewHistory = async () => {
    const { data } = await api.get("/interview/history");
    return data;
};

export const deleteInterview = async (sessionId: string) => {
    const { data } = await api.delete(`/interview/${sessionId}`);
    return data;
};

/** Call from interview page once a session completes */
export const trackInterviewSession = () => trackUsage("interview");

// ── LinkedIn ───────────────────────────────────────────────────────────────────
export const reviewLinkedin = async (profileText: string, provider?: string) => {
    const activeProvider = provider || localStorage.getItem("preferred_provider") || "groq";
    const { data } = await api.post("/linkedin/review", { 
        profile_text: profileText,
        provider: activeProvider 
    });
    trackUsage("linkedin");
    return data;
};

// ── Full Analysis ──────────────────────────────────────────────────────────────
export const runFullAnalysis = async (resumeText: string, targetRole: string, location: string, provider?: string) => {
    const activeProvider = provider || localStorage.getItem("preferred_provider") || "groq";
    const { data } = await api.post(
        "/career/full-analysis",
        { resume_text: resumeText, target_role: targetRole, location, provider: activeProvider },
        { timeout: 150_000 }
    );
    trackUsage("full_analysis");
    return data;
};

export default api;

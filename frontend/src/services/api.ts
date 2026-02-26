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

// Global response interceptor to handle rate limits and generic errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 429) {
            // Rate limit exceeded
            toast.error("🚨 Daily limit reached! Please try again tomorrow.", {
                duration: 5000,
                position: "top-center",
                style: {
                    background: "#333",
                    color: "#fff",
                    borderRadius: "10px",
                    border: "1px solid #ef4444"
                }
            });
        }
        return Promise.reject(error);
    }
);

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

export const registerUser = async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    return data;
};

// ── Resume ─────────────────────────────────────────────────────────────────────
/**
 * Step 1 — Upload PDF and extract text only (fast, no AI).
 * Used to validate the file before triggering the full analysis.
 */
export const uploadResume = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/resume/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data as { filename: string; char_count: number; preview: string; full_text: string };
};

/**
 * Step 2 — Upload PDF and run Resume Analyst Agent. Returns structured JSON.
 * Takes ~10-20 seconds (LLM call via Groq/Llama-3).
 */
export const analyzeResume = async (file: File): Promise<AnalyzeResponse> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/resume/analyze", form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60_000, // 60s timeout for the LLM call
    });
    return data as AnalyzeResponse;
};

// ── Roadmap ────────────────────────────────────────────────────────────────────
/**
 * Call Career Coach Agent to generate a 6-week personalised roadmap.
 * Takes ~15-25 seconds (LLM call via Groq/Llama-3).
 */
export const generateRoadmap = async (
    targetRole: string,
    skillGaps: string[]
): Promise<RoadmapResponse> => {
    const { data } = await api.post(
        "/roadmap/generate",
        { target_role: targetRole, skill_gaps: skillGaps },
        { timeout: 90_000 }   // 90s — LLM takes ~15-25s
    );
    return data as RoadmapResponse;
};

// ── Market ─────────────────────────────────────────────────────────────────────
export const getMarketTrends = async (role: string, location = "India") => {
    const { data } = await api.get(`/market/trends?role=${role}&location=${location}`);
    return data;
};

// ── Interview ──────────────────────────────────────────────────────────────────
export const startInterview = async (targetRole: string) => {
    const { data } = await api.post("/interview/start", { target_role: targetRole });
    return data;
};

// ── Full Analysis (Day 6) ──────────────────────────────────────────────────────
export const runFullAnalysis = async (resumeText: string, targetRole: string, location: string) => {
    const { data } = await api.post(
        "/career/full-analysis",
        { resume_text: resumeText, target_role: targetRole, location },
        { timeout: 150_000 } // Long timeout since 3 agents are executing
    );
    return data;
};

export default api;

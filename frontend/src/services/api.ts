import axios from "axios";
import type { AnalyzeResponse } from "@/types/resume";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Health ─────────────────────────────────────────────────────────────────────
export const checkHealth = async () => {
    const { data } = await api.get("/health");
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
export const generateRoadmap = async (targetRole: string, skillGaps: string[]) => {
    const { data } = await api.post("/roadmap/generate", { target_role: targetRole, skill_gaps: skillGaps });
    return data;
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

export default api;

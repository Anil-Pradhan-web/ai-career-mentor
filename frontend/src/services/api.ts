import axios from "axios";

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

// ── Health ────────────────────────────────────────────────────────────────────
export const checkHealth = async () => {
    const { data } = await api.get("/health");
    return data;
};

// ── Resume ────────────────────────────────────────────────────────────────────
export const uploadResume = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/resume/analyze", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

// ── Roadmap ───────────────────────────────────────────────────────────────────
export const generateRoadmap = async (targetRole: string, skillGaps: string[]) => {
    const { data } = await api.post("/roadmap/generate", { target_role: targetRole, skill_gaps: skillGaps });
    return data;
};

// ── Market ────────────────────────────────────────────────────────────────────
export const getMarketTrends = async (role: string, location = "India") => {
    const { data } = await api.get(`/market/trends?role=${role}&location=${location}`);
    return data;
};

// ── Interview ─────────────────────────────────────────────────────────────────
export const startInterview = async (targetRole: string) => {
    const { data } = await api.post("/interview/start", { target_role: targetRole });
    return data;
};

export default api;

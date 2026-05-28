import client from "./client";
import { AnalyzeResponse } from "@/types";

export const uploadResume = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await client.post("/resume/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data as { filename: string; char_count: number; preview: string; full_text: string };
};

export const analyzeResume = async (file: File, provider?: string): Promise<AnalyzeResponse> => {
    // SSR guard — localStorage is only available in browser
    const preferredProvider = typeof window !== "undefined" ? localStorage.getItem("preferred_provider") : null;
    const activeProvider = provider || preferredProvider || "groq";
    const form = new FormData();
    form.append("file", file);
    const { data } = await client.post(`/resume/analyze?provider=${activeProvider}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300_000,
    });
    return data as AnalyzeResponse;
};

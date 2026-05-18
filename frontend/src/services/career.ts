import { getBaseUrl, getAuthHeaders } from "./client";
import { FullAnalysisResponse } from "@/types";

export const runFullAnalysis = async (
    resumeText: string,
    targetRole: string,
    location: string,
    provider?: string,
    onLog?: (msg: string) => void,
): Promise<FullAnalysisResponse> => {
    const activeProvider = provider || localStorage.getItem("preferred_provider") || "groq";

    const response = await fetch(`${getBaseUrl()}/career/full-analysis/stream`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            resume_text: resumeText,
            target_role: targetRole,
            location,
            provider: activeProvider,
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Analysis failed" }));
        throw new Error(err.detail || `HTTP ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            try {
                const event = JSON.parse(raw);
                if (event.type === "log" && onLog) {
                    onLog(event.message);
                } else if (event.type === "result") {
                    return event.payload as FullAnalysisResponse;
                } else if (event.type === "error") {
                    throw new Error(event.message || "Analysis stream error");
                }
            } catch (e) {
                // Ignore parse errors for partial chunks
            }
        }
    }

    throw new Error("Stream ended without a result.");
};


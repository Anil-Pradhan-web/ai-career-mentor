import client from "./client";
import { FullAnalysisResponse } from "@/types";

export const runFullAnalysis = async (
    resumeText: string, 
    targetRole: string, 
    location: string, 
    provider?: string
): Promise<FullAnalysisResponse> => {
    const activeProvider = provider || localStorage.getItem("preferred_provider") || "groq";
    const { data } = await client.post<FullAnalysisResponse>(
        "/career/full-analysis",
        { resume_text: resumeText, target_role: targetRole, location, provider: activeProvider },
        { timeout: 150_000 }
    );
    return data;
};

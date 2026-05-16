// Matches the JSON structure returned by POST /resume/analyze
export interface ResumeAnalysis {
    technical_skills: string[];
    soft_skills: string[];
    years_of_experience: number;
    top_strengths: string[];
    skill_gaps: string[];
    ats_score: number;
    ats_score_breakdown?: {
        keywords?: number;
        achievements?: number;
        formatting?: number;
        action_verbs?: number;
        education?: number;
        length?: number;
    };
}

export interface AnalyzeResponse {
    filename: string;
    char_count: number;
    analysis: ResumeAnalysis;
}

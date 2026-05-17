// ── Resume ────────────────────────────────────────────────────────────────────
export interface ResumeAnalysis {
    technical_skills: string[];
    soft_skills: string[];
    years_of_experience: number;
    top_strengths: string[];
    skill_gaps: string[];
    ats_score?: number;
    ats_score_breakdown?: {
        keywords: number;
        achievements: number;
        action_verbs: number;
        formatting_and_length: number;
    };
}

export interface AnalyzeResponse {
    filename: string;
    char_count: number;
    analysis: ResumeAnalysis;
    cached: boolean;
}

// ── Roadmap ───────────────────────────────────────────────────────────────────
export interface RoadmapWeek {
    week: number;
    topic: string;
    skill_gap_addressed?: string;
    youtube_resources: string[];
    article_resources: string[];
    github_resources: string[];
    official_docs: string[];
    estimated_hours: number;
    mini_project: string;
    success_criteria?: string;
}

export interface Roadmap {
    target_role: string;
    weeks: RoadmapWeek[];
}

export type RoadmapResponse = Roadmap;

// ── Market ────────────────────────────────────────────────────────────────────
export interface MarketTrends {
    role: string;
    location: string;
    seniority?: string;
    market_trend: string;
    salary_range: string | { min?: number | null; max?: number | null; currency?: string; formatted?: string };
    hiring_volume?: string;
    summary?: string;
    market_confidence?: number;
    is_remote?: boolean;
    top_skills?: { skill: string }[];
    hiring_companies?: { name: string; hiring_volume?: string }[];
    historical_salary?: { year: number; salary: number; formatted?: string }[];
    historical_hiring?: { year: number; volume: number }[];
    company_hiring_stats?: { name: string; hiring_volume: number | string }[];
    top_skills_freq?: { skill: string; frequency: number }[];
    sources?: string[];
    is_live?: boolean;
    data_source?: string;
    provider?: string;
}

// ── Interview ─────────────────────────────────────────────────────────────────
export interface InterviewMessage {
    role: "interviewer" | "candidate";
    content: string;
    timestamp?: string;
}

export interface InterviewScoreCard {
    total_score: number;
    feedback: string;
    question_scores: Record<string, number>[];
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
    id: string;
    name: string;
    email: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
}

// ── LinkedIn Optimizer ───────────────────────────────────────────────────────
export interface LinkedInStrategy {
    headlines: string[];
    about_section: string;
    demanding_skills: string[];
    ats_keywords_to_inject?: string[];
    recruiter_search_trends?: string[];
    profile_density_advice?: string;
    certifications: string[];
}

// ── Full Analysis (AI OS) ────────────────────────────────────────────────────
export interface FullAnalysisOutput {
    resume_analysis: ResumeAnalysis;
    market_trends: MarketTrends;
    roadmap: Roadmap;
    linkedin_strategy: LinkedInStrategy;
}

export interface FullAnalysisResponse {
    status: "success" | "partial_success" | "error";
    output: FullAnalysisOutput;
    logs: string[];
    errors: string[];
    metadata: Record<string, any>;
}

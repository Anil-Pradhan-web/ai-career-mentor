// ── Resume ────────────────────────────────────────────────────────────────────
export interface ResumeAnalysis {
    technical_skills: string[];
    soft_skills: string[];
    years_of_experience: number;
    top_strengths: string[];
    skill_gaps: string[];
}

// ── Roadmap ───────────────────────────────────────────────────────────────────
export interface RoadmapWeek {
    week: number;
    topic: string;
    youtube_resources: string[];
    article_resources: string[];
    github_resources: string[];
    official_docs: string[];
    estimated_hours: number;
    mini_project: string;
}

export interface Roadmap {
    target_role: string;
    weeks: RoadmapWeek[];
}

// ── Market ────────────────────────────────────────────────────────────────────
export interface MarketTrends {
    role: string;
    location: string;
    market_trend: string;
    salary_range: string;
    historical_salary: { year: number; salary: number; formatted: string }[];
    historical_hiring: { year: number; volume: number }[];
    company_hiring_stats: { name: string; hiring_volume: number }[];
    top_skills_freq: { skill: string; frequency: number }[];
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

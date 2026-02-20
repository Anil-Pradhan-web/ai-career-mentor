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
    resource_url: string;
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
    top_skills: string[];
    salary_range: string;
    top_companies: string[];
    market_trend: "Growing" | "Stable" | "Declining";
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
    token_type: string;
}

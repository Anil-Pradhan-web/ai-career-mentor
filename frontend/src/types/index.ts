// ── Resume ────────────────────────────────────────────────────────────────────
export interface RagBenchmarks {
    gold_standard_skills: string[];
    common_toolchain: string[];
    action_verbs: string[];
    core_concepts: string[];
    experience_benchmarks: {
        junior: string;
        senior: string;
    };
}

export interface BulletImprovement {
    original: string;
    improved: string;
    reason?: string;
}

export interface PrioritizedGaps {
    critical: string[];
    differentiators: string[];
    bonus: string[];
}

export interface ResumeAnalysis {
    technical_skills: string[];
    soft_skills: string[];
    years_of_experience: number;
    experience_breakdown?: string[];
    top_strengths: string[];
    skill_gaps: string[];
    ats_score?: number;
    ats_score_breakdown?: {
        keywords: number;
        achievements: number;
        action_verbs: number;
        formatting_and_length: number;
    };
    rag_benchmarks?: RagBenchmarks;
    bullet_improvements?: BulletImprovement[];
    prioritized_gaps?: PrioritizedGaps;
    recruiter_pitch?: string;
}

export interface AnalyzeResponse {
    filename: string;
    char_count: number;
    analysis: ResumeAnalysis;
    cached: boolean;
}

// ── Roadmap ───────────────────────────────────────────────────────────────────
export interface ProjectMilestone {
    milestone: number;
    task: string;
    deliverable: string;
}

export interface InterviewPrepQuestion {
    question: string;
    answer_hint: string;
}

export interface CuratedResource {
    title: string;
    type: string;
    url: string;
}

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
    prerequisites?: string[];
    success_criteria?: string;
    why_it_matters?: string;
    completed?: boolean;
    explore_more_questions?: string[];
    project_milestones?: ProjectMilestone[];
    interview_prep_questions?: InterviewPrepQuestion[];
    curated_resources?: CuratedResource[];
}

export interface Roadmap {
    id?: string;
    target_role: string;
    weeks: RoadmapWeek[];
}

export type RoadmapResponse = Roadmap;

// ── Market ────────────────────────────────────────────────────────────────────
export interface NegotiationTactics {
    base_salary_leverage?: string;
    equity_and_bonuses?: string;
    counter_offer_playbook?: string;
}

export interface EmergingSignal {
    domain?: string;
    growth_factor?: string;
    recommended_focus?: string;
}

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
    negotiation_tactics?: NegotiationTactics;
    emerging_signals?: EmergingSignal[];
}

export interface MarketHistoryItem {
    id: string;
    target_role: string;
    location: string;
    analysis: MarketTrends;
    created_at?: string | null;
}

// ── Interview ─────────────────────────────────────────────────────────────────
export interface InterviewMessage {
    role: "interviewer" | "candidate" | "interviewer_stream" | "system";
    content: string;
    timestamp?: string;
    type?: string;
    ideal_model_answer?: string;
    company_principle_alignment?: string;
    follow_up_prompt?: string;
}

export interface InterviewScoreCard {
    total_score: number;
    feedback: string;
    question_scores: Record<string, number>[];
    ideal_model_answer?: string;
    company_principle_alignment?: string;
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
export interface OutreachTemplate {
    target: string;
    subject: string;
    message: string;
}

export interface FeaturedPostDraft {
    hook?: string;
    problem?: string;
    stack_and_architecture?: string;
    results_and_metrics?: string;
    call_to_action?: string;
    full_formatted_post?: string;
}

export interface LinkedInStrategy {
    headlines: string[];
    about_section: string;
    demanding_skills: string[];
    ats_keywords_to_inject?: string[];
    recruiter_search_trends?: string[];
    profile_density_advice?: string;
    certifications: string[];
    outreach_templates?: OutreachTemplate[];
    featured_post_draft?: FeaturedPostDraft;
}

// ── Full Analysis (AI OS) ────────────────────────────────────────────────────
export interface ExecutiveSummary {
    market_fit_narrative?: string;
    key_strengths_identified?: string[];
    primary_bottlenecks?: string[];
    execution_bridge?: string;
    offer_strategy?: string;
}

export interface FullAnalysisOutput {
    resume_analysis: ResumeAnalysis;
    market_trends: MarketTrends;
    roadmap: Roadmap;
    linkedin_strategy: LinkedInStrategy;
    executive_summary?: ExecutiveSummary;
}

export interface FullAnalysisResponse {
    status: "success" | "partial_success" | "error";
    id?: string;
    output: FullAnalysisOutput;
    logs: string[];
    errors: string[];
    metadata: Record<string, any>;
}

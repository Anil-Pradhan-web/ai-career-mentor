// Matches the JSON structure returned by POST /roadmap/generate

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

export interface RoadmapResponse {
    target_role: string;
    weeks: RoadmapWeek[];
}

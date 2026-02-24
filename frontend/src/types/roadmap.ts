// Matches the JSON structure returned by POST /roadmap/generate

export interface RoadmapWeek {
    week: number;
    topic: string;
    resource_url: string;
    estimated_hours: number;
    mini_project: string;
}

export interface RoadmapResponse {
    target_role: string;
    weeks: RoadmapWeek[];
}

import client from "./client";
import type { MarketHistoryItem } from "@/types";

export const getMarketConfig = async () => {
    const { data } = await client.get("/market/config");
    return data as { locations: string[], roles: string[], seniorities: string[], companies: any[] };
};

export const getMarketTrends = async (role: string, location = "India", provider?: string, seniority?: string) => {
    const activeProvider = provider || localStorage.getItem("preferred_provider") || "groq";
    const params = new URLSearchParams({
        role,
        location,
        provider: activeProvider,
    });
    if (seniority) params.set("seniority", seniority);
    const url = `/market/trends?${params.toString()}`;
    const { data } = await client.get(url);
    return data;
};

export const getMarketHistory = async (limit = 10) => {
    const { data } = await client.get(`/market/history?limit=${limit}`);
    return data as MarketHistoryItem[];
};

export const deleteMarketHistory = async (id: string) => {
    const { data } = await client.delete(`/market/${id}`);
    return data;
};

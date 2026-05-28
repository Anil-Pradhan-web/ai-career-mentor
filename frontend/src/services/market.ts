import client from "./client";
import type { MarketHistoryItem } from "@/types";

/** SSR-safe localStorage read — returns null on server */
const safeLocalStorage = (key: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
};

export const getMarketConfig = async () => {
    const { data } = await client.get("/market/config");
    return data as { locations: string[]; roles: string[]; seniorities: string[]; companies: any[] };
};

export const getMarketTrends = async (
    role: string,
    location = "India",
    provider?: string,
    seniority?: string,
) => {
    // SSR-safe: never call localStorage on server
    const activeProvider = provider || safeLocalStorage("preferred_provider") || "groq";

    const params = new URLSearchParams({ role, location, provider: activeProvider });
    if (seniority) params.set("seniority", seniority);

    const { data } = await client.get(`/market/trends?${params.toString()}`);
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
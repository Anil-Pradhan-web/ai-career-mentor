import client from "./client";

export const getMarketConfig = async () => {
    const { data } = await client.get("/market/config");
    return data as { locations: string[], roles: string[], seniorities: string[], companies: any[] };
};

export const getMarketTrends = async (role: string, location = "India", provider?: string, seniority?: string) => {
    const activeProvider = provider || localStorage.getItem("preferred_provider") || "groq";
    let url = `/market/trends?role=${role}&location=${location}&provider=${activeProvider}`;
    if (seniority) url += `&seniority=${seniority}`;
    const { data } = await client.get(url);
    return data;
};

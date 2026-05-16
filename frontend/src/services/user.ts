import client from "./client";

export const getUserStats = async () => {
    const { data } = await client.get("/user/stats");
    return data;
};

export const checkHealth = async () => {
    const { data } = await client.get("/health");
    return data;
};

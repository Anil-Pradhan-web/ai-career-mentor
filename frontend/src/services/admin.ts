import client from "./client";

export const getAdminMetrics = async () => {
    const { data } = await client.get("/admin/metrics");
    return data;
};

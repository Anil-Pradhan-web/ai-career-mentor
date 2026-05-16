import client from "./client";

export const getInterviewHistory = async () => {
    const { data } = await client.get("/interview/history");
    return data;
};

export const deleteInterview = async (sessionId: string) => {
    const { data } = await client.delete(`/interview/${sessionId}`);
    return data;
};

export const getInterviewDetails = async (sessionId: string) => {
    const { data } = await client.get(`/interview/${sessionId}`);
    return data;
};

import axios from "axios";
import client from "./client";

export const loginUser = async (email: string, password: string) => {
    const { data } = await client.post("/auth/login", { email, password });
    return data;
};

export const googleLogin = async (credential: string) => {
    const { data } = await client.post("/auth/google", { credential });
    return data;
};

export const registerUser = async (name: string, email: string, password: string) => {
    const { data } = await client.post("/auth/register", { name, email, password });
    return data;
};

export const refreshToken = async (token: string) => {
    const { data } = await axios.post(`${client.defaults.baseURL}/auth/refresh`, { refresh_token: token });
    return data;
};

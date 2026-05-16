import axios from "axios";
import { toast } from "react-hot-toast";

const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if available
client.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Global response interceptor
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const url = error.config?.url || "";
        if (error.response?.status === 429) {
            const detail = error.response?.data?.detail || "Daily limit reached. Try again tomorrow.";
            toast.error(`🚫 ${detail}`, {
                duration: 6000, position: "top-center",
                style: { background: "#1e1e2e", color: "#fff", borderRadius: "10px", border: "1px solid #ef4444", maxWidth: "420px" },
            });
            error.message = detail;
        } else if (error.response?.status === 401 && !url.includes("/auth/")) {
            const originalRequest = error.config as any;
            const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

            if (refreshToken && originalRequest && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const { data } = await axios.post(
                        `${client.defaults.baseURL}/auth/refresh`,
                        { refresh_token: refreshToken }
                    );
                    localStorage.setItem("token", data.access_token);
                    if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);
                    if (data.name) localStorage.setItem("userName", data.name);
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                    return client(originalRequest);
                } catch {
                    localStorage.removeItem("refreshToken");
                }
            }

            toast.error("Session expired. Please log in again.", {
                style: { background: "#333", color: "#fff" },
            });
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userName");
                setTimeout(() => { window.location.href = "/login"; }, 1000);
            }
        }
        return Promise.reject(error);
    }
);

export default client;

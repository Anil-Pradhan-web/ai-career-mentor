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

/** Returns the base API URL for use with native fetch() SSE calls. */
export const getBaseUrl = (): string =>
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Returns Authorization header for use with native fetch() calls. */
export const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Resolves the WebSocket base URL with automatic TLS/SSL protocol resolution (ws:// vs wss://).
 * Seamlessly derives from NEXT_PUBLIC_WS_URL or NEXT_PUBLIC_API_URL, with local fallback.
 */
export const getWsBaseUrl = (): string => {
    // 1. Explicit WS URL environment variable
    if (process.env.NEXT_PUBLIC_WS_URL) {
        const raw = process.env.NEXT_PUBLIC_WS_URL.trim();
        const cleanHost = raw.replace(/^https?:\/\//i, "").replace(/^wss?:\/\//i, "").replace(/\/+$/, "");
        const proto = raw.startsWith("wss://") ? "wss:" : raw.startsWith("ws://") ? "ws:" : (typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:");
        return `${proto}//${cleanHost}`;
    }

    // 2. Derive automatically from NEXT_PUBLIC_API_URL (Production Render/Vercel)
    if (process.env.NEXT_PUBLIC_API_URL) {
        const raw = process.env.NEXT_PUBLIC_API_URL.trim();
        const cleanHost = raw.replace(/^https?:\/\//i, "").replace(/^wss?:\/\//i, "").replace(/\/+$/, "");
        const proto = raw.startsWith("https://") ? "wss:" : raw.startsWith("http://") ? "ws:" : (typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:");
        return `${proto}//${cleanHost}`;
    }

    // 3. Browser environment fallback
    if (typeof window !== "undefined") {
        const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            return `${proto}//localhost:8000`;
        }
        return `${proto}//${window.location.host}`;
    }

    return "ws://localhost:8000";
};



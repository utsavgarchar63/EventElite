// src/plugins/axios.ts
import axios from "axios";

// Enable sending cookies with every request

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

// Request Interceptor (for auth tokens etc.)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor (for errors)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optionally clear auth and redirect
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/auth/login"; // or use router
        }
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;

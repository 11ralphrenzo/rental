// lib/axios.ts
import axios, { AxiosInstance } from "axios";

// Create an instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Optional: Add a request interceptor (e.g., attach token)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token"); // or Zustand
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Optional: Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors, e.g., logout on 401
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") localStorage.removeItem("admin_token");
      // You could also redirect to login
    }
    return Promise.reject(error);
  },
);

export default api;

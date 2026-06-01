/**
 * Axios instance pre-configured for the AI Knowledge Assistant API.
 */

import axios from "axios";
import { auth } from "@/config/firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  timeout: 180_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken(false);
        config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.warn("[api] Could not retrieve ID token:", err.message);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await auth.signOut();
      } catch (_) {}
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
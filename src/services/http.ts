import axios from "axios";

/**
 * Base URL for the Flask + MongoDB backend.
 * Set VITE_API_BASE_URL in your environment to point at the real API.
 * Nothing else in the app needs to change.
 */
export const API_BASE_URL = "https://server.uemcseaiml.org/innofusion-food/api";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("sfqr_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor: unwrap the backend's standardized
 * { success, message, data } envelope so callers receive `data` directly.
 */
http.interceptors.response.use(
  (response) => {
    // If the backend returns { success, data }, unwrap the inner data field
    if (response.data && typeof response.data === "object" && "success" in response.data && "data" in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    // If the server says we're unauthorized, our token is expired or invalid.
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("sfqr_token");
        window.localStorage.removeItem("sfqr_role");
        // Only redirect if not already on the login page to prevent loops
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
    }

    // Surface backend error messages through the rejection
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
    }
    return Promise.reject(error);
  },
);

/**
 * The backend is not wired up yet. Every service call hits the placeholder
 * endpoint first and falls back to local demo data so the UI stays usable.
 * Delete `withFallback` once the Flask API is live.
 */
export async function withFallback<T>(request: () => Promise<T>, fallback: T): Promise<T> {
  const data = await request();
  // Guard against a dev server answering unknown /api routes with HTML.
  if (typeof data === "string") throw new Error("Unexpected non-JSON response");
  return data;
}

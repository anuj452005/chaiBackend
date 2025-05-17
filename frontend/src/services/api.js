import axios from "axios";
import toast from "react-hot-toast";

// API URL configuration - use the full URL to the backend
const API_BASE_URL = "http://localhost:8000/api/v1";

// Log the API base URL for debugging
console.log("API Base URL:", API_BASE_URL);

// Log authentication status for debugging
const accessToken = localStorage.getItem("accessToken");
console.log(
  "Authentication status:",
  accessToken ? "Token exists" : "No token"
);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log all API errors for debugging
    console.error("API Error:", {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
    });

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("Attempting to refresh token due to 401 error");
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.log("No refresh token available, redirecting to login");
          toast.error("Your session has expired. Please log in again.");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        console.log("Sending refresh token request");
        const response = await axios.post(
          `${API_BASE_URL}/users/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );

        if (response.data.data && response.data.success) {
          console.log("Token refresh successful");
          // Update tokens in localStorage
          localStorage.setItem("accessToken", response.data.data.accessToken);
          localStorage.setItem("refreshToken", response.data.data.refreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
          return api(originalRequest);
        } else {
          console.error("Token refresh response did not contain expected data");
          throw new Error("Invalid refresh token response");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // If refresh fails, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        toast.error("Your session has expired. Please log in again.");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle CORS errors
    if (error.message === "Network Error") {
      console.error("Network error - possible CORS issue");
      toast.error(
        "Network error. Please check your connection or try again later."
      );
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      console.error("Server error:", error.response?.status);
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;

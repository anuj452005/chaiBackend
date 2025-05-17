import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    // In the checkAuthStatus function in AuthContext.js
    const checkAuthStatus = async () => {
      try {
        // Check if we have tokens before making the request
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!accessToken && !refreshToken) {
          console.log("No tokens found");
          setLoading(false);
          return;
        }

        try {
          // First try with the access token
          const response = await api.get("/users/current-user");
          if (response.data.success) {
            setUser(response.data.data);
            setLoading(false);
            return;
          }
        } catch (error) {
          // If access token fails, try to refresh it
          if (refreshToken) {
            try {
              const refreshResponse = await api.post("/users/refresh-token", {
                refreshToken,
              });

              if (refreshResponse.data.success) {
                // Update tokens in localStorage
                localStorage.setItem(
                  "accessToken",
                  refreshResponse.data.data.accessToken
                );
                localStorage.setItem(
                  "refreshToken",
                  refreshResponse.data.data.refreshToken
                );

                // Try again with the new access token
                const newResponse = await api.get("/users/current-user");
                if (newResponse.data.success) {
                  setUser(newResponse.data.data);
                  setLoading(false);
                  return;
                }
              }
            } catch (refreshError) {
              console.log("Failed to refresh token:", refreshError.message);
              // Clear tokens if refresh fails
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
            }
          }
        }
      } catch (error) {
        console.log("Authentication check failed:", error.message);
        // Clear tokens if authentication fails
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register a new user
  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);
    try {
      // Log the userData to debug
      console.log("Registration data:", userData);

      const formData = new FormData();

      // Append text fields
      formData.append("username", userData.username);
      formData.append("email", userData.email);
      formData.append("fullName", userData.fullName);
      formData.append("password", userData.password);

      // Append files - ensure they're being added correctly
      if (userData.avatar) {
        console.log("Adding avatar file:", userData.avatar.name);
        formData.append("avatar", userData.avatar);
      } else {
        console.error("No avatar file found in form data");
        setAuthError("Profile picture is required");
        setLoading(false);
        return;
      }

      if (userData.coverImage) {
        console.log("Adding cover image file:", userData.coverImage.name);
        formData.append("coverImage", userData.coverImage);
      }

      // Log all form data entries for debugging
      for (let pair of formData.entries()) {
        console.log(
          pair[0] + ": " + (pair[1] instanceof File ? pair[1].name : pair[1])
        );
      }

      // Make sure we're using the correct endpoint
      console.log(
        "Sending registration request to:",
        api.defaults.baseURL + "/users/register"
      );
      const response = await api.post("/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Registration successful! Please log in.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response);

      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setAuthError(null);
    try {
      console.log("Login attempt with credentials:", {
        email: credentials.email,
        passwordProvided: !!credentials.password,
      });

      // Make sure we're using the correct endpoint
      console.log(
        "Sending login request to:",
        api.defaults.baseURL + "/users/login"
      );
      const response = await api.post("/users/login", credentials);
      console.log("Login response:", response.data);

      if (response.data.success) {
        setUser(response.data.data.user);
        // Store tokens and user ID in localStorage for API calls
        localStorage.setItem("accessToken", response.data.data.accessToken);
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
        localStorage.setItem("userId", response.data.data.user._id);

        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error response:", error.response);

      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.post("/users/logout");
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      navigate("/login");
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    try {
      const response = await api.patch("/users/update", userData);
      if (response.data.success) {
        setUser(response.data.data);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    authError,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

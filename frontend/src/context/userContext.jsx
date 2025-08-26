import axios from 'axios';
import React, { createContext, useEffect, useState, useCallback } from 'react';

export const userDataContext = createContext();

function UserContext({ children }) {
  // Vite exposes envs on import.meta.env with VITE_ prefix
  const serverUrl = (import.meta && import.meta.env && import.meta.env.VITE_SERVER_URL) || "http://localhost:8000";

  // Load userData from localStorage if available
  const [userData, setUserData] = useState(() => {
    try {
      const saved = localStorage.getItem("userData");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      localStorage.removeItem("userData");
      return null;
    }
  });

  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error after timeout
  const clearError = useCallback(() => {
    if (error) {
      setTimeout(() => setError(null), 5000);
    }
  }, [error]);

  // Show error with auto-clear
  const showError = useCallback((message) => {
    setError(message);
    clearError();
  }, [clearError]);

  // Fetch current user from backend on mount
  const handleCurrentUser = useCallback(async () => {
    // If we don't have a session cookie yet, skip calling /current to avoid 401 spam
    if (!document.cookie || !document.cookie.includes('token=')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
        timeout: 10000 // 10 second timeout
      });

      if (result.data.success) {
        setUserData(result.data.user);
        console.log("Fetched user data:", result.data.user);
      } else {
        throw new Error(result.data.message || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Unauthorized - clear stored data
        setUserData(null);
        localStorage.removeItem("userData");
      } else if (error.code === 'ECONNABORTED') {
        showError("Request timeout. Please check your connection.");
      } else if (error.response?.status >= 500) {
        showError("Server error. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [serverUrl, showError]);

  // Get AI assistant's response with better error handling
  const getGeminiResponse = useCallback(async (command) => {
    try {
      if (!command || typeof command !== 'string' || command.trim() === '') {
        throw new Error("Invalid command provided");
      }

      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command: command.trim() },
        { 
          withCredentials: true,
          timeout: 30000 // 30 second timeout for AI responses
        }
      );

      if (result.data.success) {
        return result.data;
      } else {
        throw new Error(result.data.message || "Failed to get AI response");
      }
    } catch (error) {
      console.error("Error in getGeminiResponse:", error);
      
      // Provide user-friendly error messages
      if (error.code === 'ECONNABORTED') {
        throw new Error("Request timeout. Please try again.");
      } else if (error.response?.status === 401) {
        throw new Error("Session expired. Please sign in again.");
      } else if (error.response?.status === 429) {
        throw new Error("Too many requests. Please wait a moment.");
      } else if (error.response?.status >= 500) {
        throw new Error("AI service is temporarily unavailable.");
      } else {
        throw new Error(error.message || "Failed to get AI response. Please try again.");
      }
    }
  }, [serverUrl]);

  // Update user data in localStorage whenever it changes
  useEffect(() => {
    if (userData) {
      try {
        localStorage.setItem("userData", JSON.stringify(userData));
      } catch (error) {
        console.error("Error saving user data to localStorage:", error);
        // If localStorage is full or unavailable, try to clear old data
        try {
          localStorage.clear();
          localStorage.setItem("userData", JSON.stringify(userData));
        } catch (clearError) {
          console.error("Failed to clear localStorage:", clearError);
        }
      }
    } else {
      localStorage.removeItem("userData");
    }
  }, [userData]);

  // Fetch current user once on mount
  useEffect(() => {
    handleCurrentUser();
  }, [handleCurrentUser]);

  // Auto-clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Context value with all necessary functions and state
  const value = {
    serverUrl,
    userData,
    setUserData,
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse,
    isLoading,
    error,
    showError,
    clearError,
    handleCurrentUser
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
}

export default UserContext;

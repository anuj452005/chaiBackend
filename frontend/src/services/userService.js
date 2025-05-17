import api from "./api";

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/users/current-user");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.patch("/users/update", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user watch history
export const getWatchHistory = async () => {
  try {
    console.log("Requesting watch history from API...");
    const response = await api.get("/users/watch-history");
    console.log("Watch history API response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching watch history:",
      error.response?.data || error.message
    );
    // Return a structured error response instead of throwing
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch watch history",
      error: error.response?.data || error.message,
    };
  }
};

// Add video to watch history
export const addToWatchHistory = async (videoId) => {
  try {
    console.log("Adding to watch history, videoId:", videoId);
    const response = await api.post("/users/watch-history", { videoId });
    console.log("Watch history response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error adding to watch history:",
      error.response?.data || error.message
    );
    // Don't throw the error to prevent it from breaking the video playback
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to add to watch history",
    };
  }
};

// Change user password
export const changePassword = async (passwordData) => {
  try {
    const response = await api.post("/users/change-password", passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user avatar
export const updateAvatar = async (avatarFile) => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await api.patch("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user cover image
export const updateCoverImage = async (coverImageFile) => {
  try {
    const formData = new FormData();
    formData.append("coverImage", coverImageFile);

    const response = await api.patch("/users/cover-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user channel profile
export const getUserChannelProfile = async (username) => {
  try {
    const response = await api.get(`/users/channel/${username}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

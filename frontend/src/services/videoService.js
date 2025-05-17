import api from "./api";

// Get all videos
export const getAllVideos = async () => {
  try {
    const response = await api.get("/videos");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get video by ID
export const getVideoById = async (videoId) => {
  try {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload a new video
export const uploadVideo = async (videoData) => {
  try {
    const formData = new FormData();

    // Append text fields
    formData.append("title", videoData.title);
    formData.append("description", videoData.description);

    // Append files
    if (videoData.videoFile) {
      formData.append("videoFile", videoData.videoFile);
    }

    if (videoData.thumbnail) {
      formData.append("thumbnail", videoData.thumbnail);
    }

    const response = await api.post("/videos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update video
export const updateVideo = async (videoId, videoData) => {
  try {
    const response = await api.patch(`/api/v1/videos/${videoId}`, videoData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete video
export const deleteVideo = async (videoId) => {
  try {
    const response = await api.delete(`/api/v1/videos/${videoId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

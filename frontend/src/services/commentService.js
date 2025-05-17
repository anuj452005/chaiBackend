import api from "./api";

/**
 * Get comments for a video
 * @param {string} videoId - The ID of the video
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of comments per page
 * @returns {Promise<Object>} - API response with comments data
 */
export const getVideoComments = async (videoId, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/comments/${videoId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching comments:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Add a comment to a video
 * @param {string} videoId - The ID of the video
 * @param {string} content - The comment content
 * @returns {Promise<Object>} - API response with the created comment
 */
export const addComment = async (videoId, content) => {
  try {
    const response = await api.post(`/comments/${videoId}`, { content });
    return response.data;
  } catch (error) {
    console.error(
      "Error adding comment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Update a comment
 * @param {string} commentId - The ID of the comment to update
 * @param {string} content - The updated comment content
 * @returns {Promise<Object>} - API response with the updated comment
 */
export const updateComment = async (commentId, content) => {
  try {
    const response = await api.patch(`/comments/c/${commentId}`, { content });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating comment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Delete a comment
 * @param {string} commentId - The ID of the comment to delete
 * @returns {Promise<Object>} - API response
 */
export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/comments/c/${commentId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting comment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

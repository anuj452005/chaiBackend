import api from "./api";

/**
 * Toggle like on a video
 * @param {string} videoId - The ID of the video to like/unlike
 * @returns {Promise<Object>} - API response with like status
 */
export const toggleVideoLike = async (videoId) => {
  try {
    const response = await api.post(`/likes/toggle/v/${videoId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error toggling video like:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Toggle like on a comment
 * @param {string} commentId - The ID of the comment to like/unlike
 * @returns {Promise<Object>} - API response with like status
 */
export const toggleCommentLike = async (commentId) => {
  try {
    const response = await api.post(`/likes/toggle/c/${commentId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error toggling comment like:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Toggle like on a tweet
 * @param {string} tweetId - The ID of the tweet to like/unlike
 * @returns {Promise<Object>} - API response with like status
 */
export const toggleTweetLike = async (tweetId) => {
  try {
    const response = await api.post(`/likes/toggle/t/${tweetId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error toggling tweet like:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get all videos liked by the current user
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of videos per page
 * @returns {Promise<Object>} - API response with liked videos data
 */
export const getLikedVideos = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/likes/videos?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching liked videos:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Check if a video is liked by the current user
 * This is a helper function that makes a GET request to the backend
 * @param {string} videoId - The ID of the video to check
 * @returns {Promise<Object>} - Object containing isLiked status and like count
 */
export const checkVideoLikeStatus = async (videoId) => {
  try {
    const response = await api.get(`/likes/check/video/${videoId}`);

    if (response.data.success) {
      return {
        isLiked: response.data.data.isLiked,
        count: response.data.data.likeCount || 0,
      };
    }

    return { isLiked: false, count: 0 };
  } catch (error) {
    console.error(
      "Error checking video like status:",
      error.response?.data || error.message
    );
    // Return default values if there's an error
    return { isLiked: false, count: 0 };
  }
};

/**
 * Check if a comment is liked by the current user
 * This is a helper function that makes a GET request to the backend
 * @param {string} commentId - The ID of the comment to check
 * @returns {Promise<Object>} - Object containing isLiked status and like count
 */
export const checkCommentLikeStatus = async (commentId) => {
  try {
    const response = await api.get(`/likes/check/comment/${commentId}`);

    if (response.data.success) {
      return {
        isLiked: response.data.data.isLiked,
        count: response.data.data.likeCount || 0,
      };
    }

    return { isLiked: false, count: 0 };
  } catch (error) {
    console.error(
      "Error checking comment like status:",
      error.response?.data || error.message
    );
    // Return default values if there's an error
    return { isLiked: false, count: 0 };
  }
};

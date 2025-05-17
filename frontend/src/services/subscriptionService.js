import api from "./api";

/**
 * Toggle subscription to a channel
 * @param {string} channelId - The ID of the channel to subscribe/unsubscribe
 * @returns {Promise<Object>} - API response
 */
export const toggleSubscription = async (channelId) => {
  try {
    const response = await api.post(`/subscriptions/c/${channelId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error toggling subscription:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get subscribers of a channel
 * @param {string} channelId - The ID of the channel
 * @returns {Promise<Object>} - API response with subscribers data
 */
export const getChannelSubscribers = async (channelId) => {
  try {
    const response = await api.get(`/subscriptions/u/${channelId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting channel subscribers:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get channels that a user has subscribed to
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - API response with subscribed channels data
 */
export const getSubscribedChannels = async (userId) => {
  try {
    const response = await api.get(`/subscriptions/c/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting subscribed channels:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get subscribed channels for the current user
 * @returns {Promise<Object>} - API response with subscribed channels data
 */
export const getCurrentUserSubscribedChannels = async () => {
  try {
    const response = await api.get("/subscriptions/me/subscribed");
    return response.data;
  } catch (error) {
    console.error(
      "Error getting current user subscribed channels:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Check if the current user is subscribed to a specific channel
 * @param {string} channelId - The ID of the channel to check
 * @returns {Promise<boolean>} - True if subscribed, false otherwise
 */
export const checkSubscriptionStatus = async (channelId) => {
  try {
    if (!channelId) return false;

    // Get the current user's subscribed channels
    const response = await getCurrentUserSubscribedChannels();

    if (response.success && response.data) {
      // Check if the channelId exists in the user's subscriptions
      return response.data.some(
        (subscription) => subscription.channel._id === channelId
      );
    }
    return false;
  } catch (error) {
    console.error(
      "Error checking subscription status:",
      error.response?.data || error.message
    );
    return false;
  }
};

import api from "./api";

// Create a new playlist
export const createPlaylist = async (playlistData) => {
  try {
    const response = await api.post("/playlists", playlistData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user playlists
export const getUserPlaylists = async () => {
  try {
    const response = await api.get("/playlists");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get playlist by ID
export const getPlaylistById = async (playlistId) => {
  try {
    const response = await api.get(`/playlists/${playlistId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add video to playlist
export const addVideoToPlaylist = async (playlistId, videoId) => {
  try {
    const response = await api.post("/playlists/add-video", {
      playlistId,
      videoId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove video from playlist
export const removeVideoFromPlaylist = async (playlistId, videoId) => {
  try {
    const response = await api.post("/playlists/remove-video", {
      playlistId,
      videoId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update playlist
export const updatePlaylist = async (playlistData) => {
  try {
    const response = await api.patch("/playlists", playlistData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete playlist
export const deletePlaylist = async (playlistId) => {
  try {
    const response = await api.post("/playlists/delete", {
      playlistId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

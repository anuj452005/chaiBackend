import { Router } from "express";
import {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
  getUserPlaylists,
  getPlaylistById,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// Get all playlists for the user
router.route("/").get(getUserPlaylists);

// Get a specific playlist by ID
router.route("/:playlistId").get(getPlaylistById);

// Create a new playlist
router.route("/").post(createPlaylist);

// Add video to playlist
router.route("/add-video").post(addVideoToPlaylist);

// Remove video from playlist
router.route("/remove-video").post(removeVideoFromPlaylist);

// Update playlist
router.route("/").patch(updatePlaylist);

// Delete playlist
router.route("/delete").post(deletePlaylist);

export default router;

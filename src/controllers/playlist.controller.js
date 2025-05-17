
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const videos = req.body.videos ? [req.body.videos] : [];
  // Validate required fields
  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }
  const userId = req.user._id;
  let videoIds = [];
  if (!videos.length) {
    throw new ApiError(400, "Videos are required");
  }
  // Check if the user already has a playlist with the same name
  const existingPlaylist = await Playlist.findOne({ name, owner: userId });
  if (existingPlaylist) {
    throw new ApiError(400, "Playlist already exists");
  }
  // Create a new playlist
  const playlist = await Playlist.create({
    name,
    description,
    videos: videos,
    owner: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const addVideoToPlaylist = asyncHandler(async(req, res) => {
    //  console.log("Request body:", req.body);
    const {playlistId, videoId} = req.body;
    
    if(!playlistId || !videoId){
        throw new ApiError(400, "Playlist and video are required");
    }
    
    // Validate ObjectId format
    if(!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid playlist or video ID");
    }
    
    const userId = req.user._id;
    
    // Check if video exists
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    
    // Find the playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    
    // Check if the playlist belongs to the user
    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(401, "You are not authorized to add video to this playlist");
    }
    
    // Check if the video already exists in the playlist (comparing as strings)
    const videoExists = playlist.videos.some(vid => vid.toString() === videoId.toString());
    if (videoExists) {
        throw new ApiError(400, "Video already exists in the playlist");
    }
    
    // Add the video to the playlist
    playlist.videos.push(videoId);
    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to the playlist successfully"));
});

// remove the playlist
const removeVideoFromPlaylist = asyncHandler(async(req, res) => {
    const {playlistId, videoId} = req.body;
    
    if(!playlistId || !videoId){
        throw new ApiError(400, "Playlist and video are required");
    }
    
    // Validate ObjectId format
    if(!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid playlist or video ID");
    }
    
    const userId = req.user._id;
    
    // Check if video exists
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    
    // Find the playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    
    // Check if the playlist belongs to the user
    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(401, "You are not authorized to remove video from this playlist");
    }
    
    // Check if the video exists in the playlist (comparing as strings)
    const videoExists = playlist.videos.some(vid => vid.toString() === videoId.toString());
    if (!videoExists) {
        throw new ApiError(400, "Video not found in the playlist");
    }
    
    // Remove the video from the playlist
    playlist.videos = playlist.videos.filter(vid => vid.toString() !== videoId.toString());
    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video removed from the playlist successfully"));
});

const updatePlaylist= asyncHandler(async(req, res) => {
    const {playlistId, name, description} = req.body;
    const userId = req.user._id;
    if(!playlistId){
        throw new ApiError(400, "Playlist is required");
    }
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    if(playlist.owner.toString() !== userId.toString()){
        throw new ApiError(401, "You are not authorized to update this playlist");
    }
   // do it using the update 
   const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {name, description}, {new: true});
   
    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));    
});

const deletePlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.body;
    const userId = req.user._id;
    if(!playlistId){
        throw new ApiError(400, "Playlist is required");
    }
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    if(playlist.owner.toString() !== userId.toString()){
        throw new ApiError(401, "You are not authorized to delete this playlist");
    }
    await Playlist.findByIdAndDelete(playlistId);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});


export { createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist, updatePlaylist, deletePlaylist };
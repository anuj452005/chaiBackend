import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({ isPublished: true })
        .select("-__v")
        .populate("owner", "username fullName avatar");
    
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    
    const video = await Video.findById(videoId)
        .populate("owner", "username fullName avatar");
    
    if (!video || !video.isPublished) {
        throw new ApiError(404, "Video not found");
    }
    
    // Increment view count
    video.views += 1;
    await video.save();
    
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const createVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }
    
    // Check for video file and thumbnail
    if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }
    
    // Upload to cloudinary
    const videoFileLocalPath = req.files.videoFile[0].path;
    const thumbnailLocalPath = req.files.thumbnail[0].path;
    
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    
    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Error uploading files to cloudinary");
    }
    
    // Create video
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url, //vedioFile is a typo
        thumbnail: thumbnail.url,
        duration: videoFile.duration || 0,
        owner: req.user._id,
        isPublished: true
    });
    
    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, isPublished } = req.body;
    
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    
    // Find video
    const video = await Video.findById(videoId);
    
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    
    // Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update this video");
    }
    
    // Update fields
    if (title) video.title = title;
    if (description) video.description = description;
    if (isPublished !== undefined) video.isPublished = isPublished;
    
    await video.save();
    
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    
    // Find video
    const video = await Video.findById(videoId);
    
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    
    // Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to delete this video");
    }
    
    // Delete video
    await Video.findByIdAndDelete(videoId);
    
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

export {
    getAllVideos,
    getVideoById,
    createVideo,
    updateVideo,
    deleteVideo
};
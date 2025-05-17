import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Find if the user has already liked the video
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  // If like exists, remove it (unlike)
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Video unliked successfully")
      );
  }

  // If like doesn't exist, create it (like)
  await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // Find if the user has already liked the comment
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  // If like exists, remove it (unlike)
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Comment unliked successfully")
      );
  }

  // If like doesn't exist, create it (like)
  await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  // Find if the user has already liked the tweet
  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  // If like exists, remove it (unlike)
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Tweet unliked successfully")
      );
  }

  // If like doesn't exist, create it (like)
  await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  // Find all likes by the user that have a video reference
  const likes = await Like.find({ likedBy: userId, video: { $exists: true } })
    .populate({
      path: "video",
      select: "title description thumbnail duration views createdAt owner",
      populate: {
        path: "owner",
        select: "username avatar",
      },
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Filter out any likes where the video might have been deleted
  const validLikes = likes.filter((like) => like.video);

  // Extract just the video objects from the likes
  const likedVideos = validLikes.map((like) => like.video);

  // Count total liked videos for pagination
  const totalLikedVideos = await Like.countDocuments({
    likedBy: userId,
    video: { $exists: true },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos: likedVideos,
        totalVideos: totalLikedVideos,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalLikedVideos / limit),
      },
      "Liked videos fetched successfully"
    )
  );
});

const checkVideoLikeStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Check if the video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if the user has liked the video
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  // Get the total like count for the video
  const likeCount = await Like.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isLiked: !!existingLike,
        likeCount,
      },
      "Video like status retrieved successfully"
    )
  );
});

const checkCommentLikeStatus = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // Check if the user has liked the comment
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  // Get the total like count for the comment
  const likeCount = await Like.countDocuments({ comment: commentId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isLiked: !!existingLike,
        likeCount,
      },
      "Comment like status retrieved successfully"
    )
  );
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  checkVideoLikeStatus,
  checkCommentLikeStatus,
};

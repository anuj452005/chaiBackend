import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  // adding or removing the subscription
  // check if the user is already subscribed to the channel
  // if yes, then remove the subscription
  // if no, then add the subscription
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }
  const subscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });
  if (subscription) {
    // user is already subscribed
    await Subscription.findByIdAndDelete(subscription._id);
    // await Subscription.save(); // save all changes made to the subscription model
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Subscription removed successfully"));
  } else {
    await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
    // await Subscription.save(); // save all changes made to the subscription model
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Subscription added successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },
    {
      $unwind: "$subscriberDetails",
    },
    {
      $project: {
        _id: 0,
        subscriber: {
          _id: "$subscriberDetails._id",
          username: "$subscriberDetails.username",
          fullName: "$subscriberDetails.fullName",
          avatar: "$subscriberDetails.avatar",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Channel subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // If no subscriberId is provided, use the current authenticated user's ID
  const userId = subscriberId || req.user?._id;

  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: { subscriber: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelDetails",
      },
    },
    {
      $unwind: "$channelDetails",
    },
    {
      $project: {
        _id: 0,
        channel: {
          _id: "$channelDetails._id",
          username: "$channelDetails.username",
          fullName: "$channelDetails.fullName",
          avatar: "$channelDetails.avatar",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };

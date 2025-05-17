import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// Route for toggling subscription
router.route("/c/:channelId").post(toggleSubscription);

// Route for getting subscribers of a channel
router.route("/u/:channelId").get(getUserChannelSubscribers);

// Route for getting channels a user has subscribed to
router.route("/c/:subscriberId").get(getSubscribedChannels);

// Route for getting current user's subscribed channels
router.route("/me/subscribed").get(getSubscribedChannels);

export default router;

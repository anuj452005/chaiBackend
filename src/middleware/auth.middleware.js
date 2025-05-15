import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const accesToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!accesToken) {
      throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = await jwt.verify(
      accesToken,
      process.env.ACCESS_TOKEN_SECRET
    ); // verify the access token

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    ); // find the user by id and select the fields that we want to return
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user; // set the user in the request object
    next(); // call the next middleware
  } catch (error) {
    throw new Error(error?.message || "Invalid Access Token");
  }
});

export { verifyJWT };

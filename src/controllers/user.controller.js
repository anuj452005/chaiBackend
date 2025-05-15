import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // fronted se data aye ga phir usko
  // decontruct karege
  //validation -> not empty
  // check if user exist or not  :username or email
  //check for imgaes
  // check for avatar ->
  // upload to cloudinary
  //create the user
  // remove the password and refersh token from the user object
  // check for user creation
  //return res
  const { username, email, fullName, password } = req.body;
  if ([fullName, email, username, password].includes("")) {
    throw new ApiError(400, "All fields are required");
  }
  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (userExist) {
    throw new ApiError(400, "User already exist");
  }

  // Log the request files for debugging
  console.log("Request files:", JSON.stringify(req.files, null, 2));

  // Check if avatar files exist
  if (!req.files || !req.files.avatar || !req.files.avatar.length) {
    throw new ApiError(400, "Avatar file is missing in the request");
  }

  const avatarLocalPath = req.files.avatar[0].path; // extracts the local file path of the uploaded avatar image
  console.log("Avatar local path:", avatarLocalPath);

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path; // extracts the local file path of the uploaded cover image
  console.log("Cover image local path:", coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // Upload avatar to Cloudinary
  console.log("Uploading avatar to Cloudinary...");
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log("Avatar upload result:", avatar ? "Success" : "Failed");

  // Upload cover image if it exists
  let coverImage = null;
  if (coverImageLocalPath) {
    console.log("Uploading cover image to Cloudinary...");
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
    console.log(
      "Cover image upload result:",
      coverImage ? "Success" : "Failed"
    );
  }

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // user create
  const user = await User.create({
    username,
    email,
    fullName,
    password,
    avatar: avatar.url, // Cloudinary URL for the avatar image
    coverImage: coverImage?.url || "", // Cloudinary URL for the cover image
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  // send res using the ApiResponse class
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };

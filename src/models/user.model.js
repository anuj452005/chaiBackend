import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Create an index on the field for faster querying
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true, // Create an index on the field for faster querying
    },
    password: {
      type: String,
      required: [true, "Password is required"], // Password is required
    },
    avatar: {
      type: String, // Cloudinary URL for the avatar image
      required: true,
    },
    coverImage: {
      type: String, // Cloudinary URL for the cover image
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video", // Reference to the Vedio model
      },
    ],

    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  // before saving the user encrypt the password
  if (!this.isModified("password")) {
    return next(); // if password is not modified then return next
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  //
  return await bcrypt.compare(password, this.password); // compare the password with the hashed password . it returns true or false
};

UserSchema.methods.generateAccessToken = function () {
  // generate access token
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};


UserSchema.methods.generateRefreshToken = function () {
  // generate refresh token
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, // Corrected environment variable
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // Corrected environment variable name (assuming it's REFRESH_TOKEN_EXPIRY)
  );
};

export const User = mongoose.model("User", UserSchema);

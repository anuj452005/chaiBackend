# JWT Authentication: Access & Refresh Tokens

## Table of Contents

1. [Introduction to JWT Authentication](#introduction-to-jwt-authentication)
2. [What are Access and Refresh Tokens?](#what-are-access-and-refresh-tokens)
3. [Why Use This Authentication Pattern?](#why-use-this-authentication-pattern)
4. [Implementation: Beginner Level](#implementation-beginner-level)
5. [Implementation: Intermediate Level](#implementation-intermediate-level)
6. [Implementation: Production Level](#implementation-production-level)
7. [Workflow Diagram](#workflow-diagram)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting Common Issues](#troubleshooting-common-issues)
10. [Project Implementation](#project-implementation)

## Introduction to JWT Authentication

JSON Web Tokens (JWT) provide a compact, self-contained way to securely transmit information between parties as a JSON object. This information can be verified and trusted because it is digitally signed using a secret key.

### What is JWT?

A JWT consists of three parts separated by dots (`.`):

```
xxxxx.yyyyy.zzzzz
```

- **Header**: Contains the type of token and the signing algorithm
- **Payload**: Contains the claims (user data and metadata)
- **Signature**: Ensures the token hasn't been altered

## What are Access and Refresh Tokens?

### Access Token

**What**: A short-lived credential that grants access to protected resources.

**How**: Sent with each API request to authenticate the user.

**Why**: Short lifespan (typically 15 minutes to a few hours) minimizes the security risk if the token is compromised.

### Refresh Token

**What**: A longer-lived credential used to obtain new access tokens.

**How**: Stored securely and only sent to specific token refresh endpoints.

**Why**: Allows users to remain authenticated without frequent logins while maintaining security.

## Why Use This Authentication Pattern?

1. **Stateless Authentication**: Servers don't need to store session information.
2. **Security**: Short-lived access tokens limit exposure if compromised.
3. **User Experience**: Users don't need to log in frequently.
4. **Scalability**: Works well in distributed systems and microservices.
5. **Cross-Domain**: Can be used across different domains and services.

## Implementation: Beginner Level

### Setting Up Dependencies

```javascript
// Install required packages
// npm install jsonwebtoken express mongoose dotenv cookie-parser

// Required imports
const jwt = require("jsonwebtoken");
const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();
```

### Creating Tokens

```javascript
// User model method to generate access token
UserSchema.methods.generateAccessToken = function () {
  // Create a JWT with user information
  return jwt.sign(
    {
      _id: this._id, // Always include user ID
      email: this.email, // Include email for user identification
      username: this.username, // Include username for display purposes
      // Add any other non-sensitive data needed by your frontend
    },
    process.env.ACCESS_TOKEN_SECRET, // Secret key from environment variables
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" } // Short expiration time
  );
};

// User model method to generate refresh token
UserSchema.methods.generateRefreshToken = function () {
  // Create a JWT with minimal user information
  return jwt.sign(
    { _id: this._id }, // Only include user ID for security
    process.env.REFRESH_TOKEN_SECRET, // Different secret key
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" } // Longer expiration time
  );
};
```

### Basic Login Controller

```javascript
const loginUser = asyncHandler(async (req, res) => {
  // 1. Get user credentials from request
  const { email, password } = req.body;

  // 2. Validate input
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // 3. Find the user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // 4. Verify password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 5. Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // 6. Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // 7. Send tokens to client
  // - Access token in response body
  // - Refresh token in HTTP-only cookie
  const options = {
    httpOnly: true, // Cookie cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          user: { id: user._id, email: user.email, username: user.username },
        },
        "Login successful"
      )
    );
});
```

## Implementation: Intermediate Level

### Authentication Middleware

```javascript
// auth.middleware.js
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");

const verifyJWT = asyncHandler(async (req, res, next) => {
  // 1. Extract token from request
  // Check Authorization header first
  const token = req.headers.authorization?.replace("Bearer ", "");

  // 2. Verify token exists
  if (!token) {
    throw new ApiError(401, "Unauthorized request: No token provided");
  }

  // 3. Verify and decode token
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 4. Find user from token data
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    // 5. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Handle different JWT errors
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access Token expired");
    }
    throw new ApiError(401, "Invalid Access Token");
  }
});

module.exports = { verifyJWT };
```

### Refresh Token Controller

```javascript
const refreshAccessToken = asyncHandler(async (req, res) => {
  // 1. Extract refresh token from cookies or request body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // 2. Verify token exists
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request: No refresh token");
  }

  try {
    // 3. Verify refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // 4. Find user with this refresh token
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token: User not found");
    }

    // 5. Verify token matches stored token
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // 6. Generate new tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // 7. Update refresh token in database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // 8. Send new tokens to client
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
  } catch (error) {
    // Handle different JWT errors
    throw new ApiError(401, "Invalid refresh token");
  }
});
```

### Logout Controller

```javascript
const logoutUser = asyncHandler(async (req, res) => {
  // 1. Get user ID from authenticated request
  const userId = req.user._id;

  // 2. Clear refresh token in database
  await User.findByIdAndUpdate(
    userId,
    {
      $set: { refreshToken: null },
    },
    { new: true }
  );

  // 3. Clear cookies
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // 4. Send response
  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});
```

## Implementation: Production Level

### Enhanced Security Measures

```javascript
// Enhanced cookie options
const cookieOptions = {
  httpOnly: true, // Prevents JavaScript access
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict", // Prevents CSRF attacks
  maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiry (7 days)
  path: "/", // Available across the site
  domain: process.env.COOKIE_DOMAIN || undefined, // Specific domain in production
};

// Token rotation on refresh
const refreshAccessToken = asyncHandler(async (req, res) => {
  // ... existing code ...

  // Additional security: Track token version/usage
  user.tokenVersion = (user.tokenVersion || 0) + 1;

  // Store token metadata for auditing
  user.refreshTokens.push({
    token: refreshToken,
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // Limit number of active refresh tokens per user (e.g., 5)
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save({ validateBeforeSave: false });

  // ... rest of the code ...
});
```

### Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

// Apply rate limiting to authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many login attempts, please try again after 15 minutes",
});

// Apply to routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/refresh-token", authLimiter);
```

### Token Blacklisting for Critical Operations

```javascript
// Using Redis for token blacklisting
const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL);

// Blacklist a token on logout or security events
const blacklistToken = async (token, expirySeconds) => {
  await client.set(`bl_${token}`, "true");
  await client.expire(`bl_${token}`, expirySeconds);
};

// Check if token is blacklisted in auth middleware
const verifyJWT = asyncHandler(async (req, res, next) => {
  // ... existing token extraction ...

  // Check if token is blacklisted
  const isBlacklisted = await client.get(`bl_${token}`);
  if (isBlacklisted) {
    throw new ApiError(401, "Token has been revoked");
  }

  // ... rest of verification ...
});

// Enhanced logout with blacklisting
const logoutUser = asyncHandler(async (req, res) => {
  // ... existing logout code ...

  // Blacklist the current access token
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    // Extract expiry from token without verification
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const expirySeconds = payload.exp - Math.floor(Date.now() / 1000);

    if (expirySeconds > 0) {
      await blacklistToken(token, expirySeconds);
    }
  }

  // ... rest of logout ...
});
```

## Workflow Diagram

```
┌─────────────────┐                                              ┌─────────────────┐
│                 │                                              │                 │
│     Client      │                                              │     Server      │
│                 │                                              │                 │
└────────┬────────┘                                              └────────┬────────┘
         │                                                                │
         │                                                                │
         │  1. Login Request (username/password)                          │
         │ ─────────────────────────────────────────────────────────────► │
         │                                                                │
         │                                                                │
         │  2. Verify Credentials                                         │
         │                                                                │
         │  3. Generate Access & Refresh Tokens                           │
         │                                                                │
         │  4. Store Refresh Token in Database                            │
         │                                                                │
         │  5. Response with Access Token (body)                          │
         │     and Refresh Token (httpOnly cookie)                        │
         │ ◄───────────────────────────────────────────────────────────── │
         │                                                                │
         │                                                                │
         │  6. Request Protected Resource with Access Token               │
         │ ─────────────────────────────────────────────────────────────► │
         │                                                                │
         │  7. Verify Access Token                                        │
         │                                                                │
         │  8. Return Protected Resource                                  │
         │ ◄───────────────────────────────────────────────────────────── │
         │                                                                │
         │                                                                │
         │  9. Access Token Expires                                       │
         │                                                                │
         │ 10. Request New Access Token with Refresh Token                │
         │ ─────────────────────────────────────────────────────────────► │
         │                                                                │
         │ 11. Verify Refresh Token                                       │
         │                                                                │
         │ 12. Generate New Access Token                                  │
         │                                                                │
         │ 13. Optional: Generate New Refresh Token (Token Rotation)      │
         │                                                                │
         │ 14. Response with New Access Token                             │
         │ ◄───────────────────────────────────────────────────────────── │
         │                                                                │
         │                                                                │
         │ 15. Logout Request                                             │
         │ ─────────────────────────────────────────────────────────────► │
         │                                                                │
         │ 16. Invalidate Refresh Token in Database                       │
         │                                                                │
         │ 17. Clear Refresh Token Cookie                                 │
         │ ◄───────────────────────────────────────────────────────────── │
         │                                                                │
```

## Security Best Practices

1. **Store Tokens Properly**:

   - Access tokens: Store in memory (not localStorage)
   - Refresh tokens: Store in HttpOnly cookies

2. **Use HTTPS**: Always use HTTPS in production to encrypt tokens in transit.

3. **Token Expiration**:

   - Access tokens: Short lifetime (15 minutes to 1 hour)
   - Refresh tokens: Longer but reasonable (1-2 weeks)

4. **Token Payload**: Minimize sensitive data in tokens.

5. **Different Secret Keys**: Use different secrets for access and refresh tokens.

6. **Token Rotation**: Generate a new refresh token when refreshing access tokens.

7. **Invalidate on Security Events**: Logout from all devices option for users.

8. **Implement CSRF Protection**: Use CSRF tokens for sensitive operations.

9. **Monitor and Audit**: Log authentication events and implement alerts for suspicious activities.

10. **Secure Environment Variables**: Never commit secrets to version control.

## Troubleshooting Common Issues

### Invalid Token Errors

**Problem**: "Invalid token" or "jwt malformed" errors.

**Solutions**:

- Verify the token is being sent correctly in the Authorization header
- Check that the token hasn't been tampered with
- Ensure you're using the correct secret key for verification

### Token Expiration Issues

**Problem**: Tokens expire too quickly or unexpectedly.

**Solutions**:

- Check the expiration time configuration
- Ensure your client is properly handling token refresh
- Verify server and client clocks are synchronized

### Refresh Token Not Working

**Problem**: Unable to get a new access token using the refresh token.

**Solutions**:

- Verify the refresh token is being stored and sent correctly
- Check if the refresh token has expired
- Ensure the refresh token hasn't been invalidated (by logout or security event)

### Cross-Origin Issues

**Problem**: Cannot access tokens across different domains.

**Solutions**:

- Configure CORS properly on your server
- Set appropriate cookie options (domain, sameSite)
- Consider using a proxy for API requests

### Security Vulnerabilities

**Problem**: Concerns about token theft or misuse.

**Solutions**:

- Implement token blacklisting for critical operations
- Use short expiration times for access tokens
- Store tokens securely (HttpOnly cookies, memory)
- Implement IP binding for sensitive operations

## Project Implementation

This section details the actual implementation of JWT authentication in this project using Node.js, Express, and MongoDB.

### Token Generation in User Model

```javascript
// From src/models/user.model.js
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// User schema definition...

// Method to generate access token
UserSchema.methods.generateAccessToken = function () {
  // Generate access token with user information
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

// Method to generate refresh token
UserSchema.methods.generateRefreshToken = function () {
  // Generate refresh token with minimal user information
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", UserSchema);
```

### Token Generation Helper Function

```javascript
// From src/controllers/user.controller.js
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find user by ID
    const user = await User.findById(userId);

    // Generate tokens using user model methods
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // Skip validation for performance

    // Return both tokens
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};
```

### Authentication Middleware

```javascript
// From src/middleware/auth.middleware.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from cookies or Authorization header
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Check if token exists
    if (!accessToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify token with secret
    const decodedToken = await jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    // Find user by ID from token
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    // Check if user exists
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export { verifyJWT };
```

### Login Implementation

```javascript
// From src/controllers/user.controller.js
const loginUser = asyncHandler(async (req, res) => {
  // Extract credentials from request body
  const { email, username, password } = req.body;

  // Validate input - require either username or email
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  // Find user by username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // Check if user exists
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Verify password using custom method from user model
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Get user data without sensitive information
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Set cookie options
  const options = {
    httpOnly: true, // Prevents JavaScript access
    secure: true, // Requires HTTPS
  };

  // Send response with cookies and JSON data
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});
```

### Refresh Access Token Implementation

```javascript
// From src/controllers/user.controller.js
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookies or request body
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  // Check if refresh token exists
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request: No refresh token provided");
  }

  try {
    // Verify refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find user by ID from token
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Verify that incoming token matches stored token
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // Generate new tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    // Set cookie options
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Send response with new tokens
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
```

### Logout Implementation

```javascript
// From src/controllers/user.controller.js
const logoutUser = asyncHandler(async (req, res) => {
  // Update user document to remove refresh token
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined, // Remove refresh token
      },
    },
    {
      new: true, // Return updated document
    }
  );

  // Set cookie options
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Clear cookies and send response
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
```

### Routes Configuration

```javascript
// From src/routes/user.routes.js
import Router from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes (require authentication)
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
```

### Key Security Features in This Implementation

1. **Secure Cookie Settings**:

   - `httpOnly: true` - Prevents JavaScript access to cookies
   - `secure: true` - Ensures cookies are only sent over HTTPS

2. **Token Storage**:

   - Refresh tokens are stored in the database
   - Tokens are cleared on logout

3. **Password Security**:

   - Passwords are hashed using bcrypt before saving
   - Password verification is done securely with bcrypt.compare()

4. **Data Protection**:

   - Sensitive data (password, refreshToken) is excluded from responses
   - Minimal data in refresh tokens (only user ID)

5. **Error Handling**:

   - Specific error messages for different authentication scenarios
   - Proper HTTP status codes for authentication errors

6. **Token Verification**:
   - Tokens are verified with their respective secret keys
   - User existence is confirmed after token verification

### Environment Variables Used

```
ACCESS_TOKEN_SECRET=your-access-token-secret-key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key
REFRESH_TOKEN_EXPIRY=10d
```

These environment variables should be set in your `.env` file and kept secure.

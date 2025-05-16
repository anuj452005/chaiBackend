# Updating Controller Routes for JWT Authentication

This tutorial explains how to update your existing controller routes to work with the JWT authentication system implemented in this project.

## Table of Contents

1. [Introduction](#introduction)
2. [Understanding Protected Routes](#understanding-protected-routes)
3. [Implementing Authentication in Routes](#implementing-authentication-in-routes)
4. [Accessing User Data in Controllers](#accessing-user-data-in-controllers)
5. [Token Management in Controllers](#token-management-in-controllers)
6. [Authentication Flow After Registration](#authentication-flow-after-registration)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

## Introduction

After implementing JWT authentication with access and refresh tokens, you'll need to update your routes to:
- Protect certain endpoints that require authentication
- Access authenticated user data in your controllers
- Handle authentication errors properly
- Manage token refresh and validation

## Understanding Protected Routes

Protected routes are API endpoints that require a valid JWT access token to access. These typically include:
- User-specific data endpoints (profile, settings)
- Resource creation endpoints (posts, comments)
- Any endpoint that needs to know the user's identity

## Implementing Authentication in Routes

### Step 1: Import the Authentication Middleware

First, import the `verifyJWT` middleware in your route file:

```javascript
import { verifyJWT } from "../middleware/auth.middleware.js";
```

### Step 2: Apply Middleware to Routes

Apply the middleware to routes that need protection:

```javascript
// Public routes (no authentication required)
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes (authentication required)
router.route("/logout").post(verifyJWT, logoutUser);
```

## Accessing User Data in Controllers

When a route is protected with `verifyJWT`, the authenticated user's information is attached to the request object as `req.user`.

### Example from Project Implementation:

```javascript
const logoutUser = asyncHandler(async (req, res) => {
  // Access authenticated user from req.user
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  
  const options = {
    httpOnly: true,
    secure: true,
  };
  
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
```

## Token Management in Controllers

### Generating Tokens

Our project uses a helper function to generate both access and refresh tokens:

```javascript
// Helper function to generate tokens
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

## Authentication Flow After Registration

### 1. Registration Process

In your implementation, registration doesn't automatically log in the user. After registration, the user receives a success response but no authentication tokens:

```javascript
const registerUser = asyncHandler(async (req, res) => {
  // ... validation and user creation logic ...
  
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  
  // Note: No tokens are generated or sent during registration
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});
```

### 2. Login Process

After registration, the user must explicitly log in to receive authentication tokens:

```javascript
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  
  // ... validation logic ...
  
  // Generate tokens after successful authentication
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  
  // Set tokens in HTTP-only cookies
  const options = {
    httpOnly: true,
    secure: true,
  };
  
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

### 3. Authentication Verification for Each Route

For each protected route, your server verifies the user's authentication using the `verifyJWT` middleware:

```javascript
// From auth.middleware.js
const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Step 1: Extract the access token from cookies or Authorization header
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    
    // Step 2: Check if token exists
    if (!accessToken) {
      throw new ApiError(401, "Unauthorized request");
    }
    
    // Step 3: Verify token signature and expiration
    const decodedToken = await jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    
    // Step 4: Find the user in the database
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    
    // Step 5: Verify user exists
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    
    // Step 6: Attach user to request object
    req.user = user;
    
    // Step 7: Proceed to the route handler
    next();
  } catch (error) {
    // Step 8: Handle authentication errors
    throw new Error(error?.message || "Invalid Access Token");
  }
});
```

### 4. Authentication Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Register   │     │    Login    │     │  Protected  │
│    User     │────▶│    User     │────▶│    Route    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Create DB  │     │  Generate   │     │   Extract   │
│    Entry    │     │   Tokens    │     │    Token    │
└─────────────┘     └─────────────┘     └─────────────┘
                          │                   │
                          ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │ Store Token │     │   Verify    │
                    │  in Cookie  │     │    Token    │
                    └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │  Find User  │
                                        │  by Token   │
                                        └─────────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │ Attach User │
                                        │ to Request  │
                                        └─────────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │   Execute   │
                                        │   Handler   │
                                        └─────────────┘
```

### 5. How the Server Knows a User is Authenticated

1. **Token Presence**: The server checks for the presence of an access token in either:
   - HTTP-only cookies (`req.cookies?.accessToken`)
   - Authorization header (`req.header("Authorization")?.replace("Bearer ", "")`)

2. **Token Verification**: The server verifies the token's:
   - Signature (using `process.env.ACCESS_TOKEN_SECRET`)
   - Expiration time (embedded in the token)
   - Payload structure (contains user ID)

3. **User Existence**: The server confirms the user exists in the database:
   - Fetches user by ID from token payload
   - Excludes sensitive fields (`-password -refreshToken`)

4. **Request Augmentation**: The server attaches the user object to the request:
   - `req.user = user` makes user data available to route handlers

### 6. Client-Side Token Management

After login, the client should:

1. Store the access token (if needed for programmatic API calls)
2. Include the token in subsequent requests:
   - Automatically included in cookies for same-domain requests
   - Manually added to Authorization header for cross-domain requests:
     ```javascript
     headers: {
       'Authorization': `Bearer ${accessToken}`
     }
     ```

3. Use the refresh token endpoint when access token expires:
   ```javascript
   // When an API call returns 401, call the refresh endpoint
   const refreshTokens = async () => {
     const response = await fetch('/api/v1/users/refresh-token', {
       method: 'POST',
       credentials: 'include', // Includes cookies
     });
     
     if (response.ok) {
       // Continue with the original request
       return true;
     } else {
       // Redirect to login
       return false;
     }
   };
   ```

## Best Practices

### 1. Token Storage

- **Access Tokens**: 
  - Store in memory (for frontend applications)
  - Send in cookies with `httpOnly` and `secure` flags
  - Can also be sent in Authorization header for API clients

- **Refresh Tokens**:
  - Always store in HTTP-only cookies
  - Store in database for validation and revocation
  - Clear on logout

### 2. Token Security

```javascript
// Secure cookie options
const options = {
  httpOnly: true,  // Prevents JavaScript access to cookies
  secure: true,    // Ensures cookies are only sent over HTTPS
  // sameSite: "strict" // Consider adding for CSRF protection
};
```

### 3. Token Validation

```javascript
// From auth.middleware.js
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
    throw new Error(error?.message || "Invalid Access Token");
  }
});
```

### 4. Token Expiration

Set appropriate expiration times in environment variables:
```
ACCESS_TOKEN_EXPIRY=1d    # Short-lived
REFRESH_TOKEN_EXPIRY=10d  # Longer-lived
```

### 5. Error Handling

Always provide clear error messages for authentication issues:
```javascript
if (!incomingRefreshToken) {
  throw new ApiError(401, "Unauthorized request: No refresh token provided");
}

if (incomingRefreshToken !== user.refreshToken) {
  throw new ApiError(401, "Refresh token is expired or used");
}
```

### 6. Token Rotation

Generate new refresh tokens when refreshing access tokens to enhance security:
```javascript
// Generate new tokens on refresh
const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

// Update in database
user.refreshToken = refreshToken;
await user.save({ validateBeforeSave: false });
```

## Examples

### User Routes Example

```javascript
import Router from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserAvatar,
  updateUserCoverImage,
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

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

export default router;
```

### Video Routes Example

```javascript
import Router from "express";
import {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllVideos);
router.route("/:videoId").get(getVideoById);

// Protected routes
router.route("/").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createVideo
);

router.route("/:videoId").patch(verifyJWT, updateVideo);
router.route("/:videoId").delete(verifyJWT, deleteVideo);

export default router;
```

By following these patterns and best practices, you can effectively implement and manage JWT authentication in your application while maintaining security and user experience.
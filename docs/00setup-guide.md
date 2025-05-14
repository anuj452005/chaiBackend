# Backend Project Setup Guide

This guide provides comprehensive instructions for setting up and running the backend project from scratch. It covers installation, configuration, architecture, and key components.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Sequence](#setup-sequence)
3. [Project Setup](#project-setup)
4. [Environment Configuration](#environment-configuration)
5. [Project Structure](#project-structure)
6. [Database Setup](#database-setup)
7. [Authentication System](#authentication-system)
8. [File Upload System](#file-upload-system)
9. [Running the Project](#running-the-project)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have the following installed:

- Node.js (v16.20.1 or higher)
- npm (comes with Node.js)
- MongoDB (local installation or MongoDB Atlas account)
- Git (for version control)
- A Cloudinary account (for file storage)

## Setup Sequence

Follow this exact sequence to set up the project properly:

1. **Install Prerequisites**
   - Install Node.js (v16.20.1+) and npm
   - Install MongoDB or set up MongoDB Atlas account
   - Create a Cloudinary account for file storage
   - Install Git for version control

2. **Initialize Project**
   - Create project directory
   - Initialize npm project
   - Configure package.json

3. **Install Dependencies**
   - Install core dependencies
   - Install file handling dependencies
   - Install utility dependencies
   - Install development dependencies

4. **Configure Environment**
   - Create .env file
   - Set up server configuration
   - Configure MongoDB connection
   - Set up JWT secrets
   - Add Cloudinary credentials

5. **Create Project Structure**
   - Set up directory structure
   - Create necessary folders

6. **Set Up Database Connection**
   - Create database connection module
   - Define data models

7. **Implement Authentication System**
   - Create user model with authentication methods
   - Set up JWT token generation
   - Implement authentication middleware

8. **Configure File Upload System**
   - Set up Multer middleware
   - Configure Cloudinary integration
   - Create upload utility functions

9. **Create API Routes and Controllers**
   - Implement route handlers
   - Set up controller logic

10. **Run and Test**
    - Start the development server
    - Test API endpoints

## Project Setup

### 1. Initialize the Project

```bash
# Create a new directory for your project
mkdir chaibackend
cd chaibackend

# Initialize a new Node.js project
npm init -y

# Update package.json with project details
```

**Important considerations:**
- Use a descriptive project name that reflects its purpose
- Ensure you have write permissions in the directory where you're creating the project
- The `-y` flag accepts all defaults; you'll modify these settings later

### 2. Install Dependencies

```bash
# Core dependencies
npm install express mongoose dotenv bcrypt jsonwebtoken

# File handling
npm install multer cloudinary

# Utilities
npm install cors cookie-parser

# Development dependencies
npm install -D nodemon prettier
```

**Dependency explanations:**
- **express**: Web framework for handling HTTP requests and routing
- **mongoose**: MongoDB object modeling tool for data manipulation
- **dotenv**: Loads environment variables from .env file
- **bcrypt**: Library for hashing and comparing passwords securely
- **jsonwebtoken**: Implementation of JSON Web Tokens for authentication
- **multer**: Middleware for handling multipart/form-data (file uploads)
- **cloudinary**: Cloud service for storing and transforming media
- **cors**: Middleware to enable Cross-Origin Resource Sharing
- **cookie-parser**: Middleware to parse cookies from requests
- **nodemon**: Development tool that automatically restarts the server on file changes
- **prettier**: Code formatter to maintain consistent code style

**Potential pitfalls:**
- Ensure compatible versions of dependencies
- Some packages like bcrypt may require additional build tools
- Check for any security vulnerabilities in dependencies with `npm audit`

### 3. Configure npm Scripts

Update your `package.json` to include the following scripts:

```json
{
  "name": "chaibackend",
  "version": "1.0.0",
  "description": "Backend project with Express and MongoDB",
  "type": "module",  // Enable ES modules syntax
  "main": "index.js",
  "scripts": {
    "dev": "nodemon src/index.js",  // Development mode with auto-restart
    "start": "node src/index.js"    // Production mode
  },
  "author": "Your Name",
  "license": "ISC",
  "dependencies": {
    // dependencies will be listed here
  }
}
```

**Key points:**
- `"type": "module"` enables ES modules syntax (import/export) instead of CommonJS (require)
- `dev` script uses nodemon for automatic server restarts during development
- `start` script is used for production deployment

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=8000                           # Port on which the server will run
CORS_ORIGIN=http://localhost:3000   # Allowed origin for CORS

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017  # Connection string to MongoDB

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret    # Secret for signing access tokens
ACCESS_TOKEN_EXPIRY=1d                          # Expiry time for access tokens
REFRESH_TOKEN_SECRET=your_refresh_token_secret  # Secret for signing refresh tokens
REFRESH_TOKEN_EXPIRY=10d                        # Expiry time for refresh tokens

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name    # Cloudinary cloud name from dashboard
CLOUDINARY_API_KEY=your_api_key          # Cloudinary API key
CLOUDINARY_API_SECRET=your_api_secret    # Cloudinary API secret
```

**Important considerations:**
- Never commit the `.env` file to version control
- Use strong, unique secrets for JWT tokens
- In production, use longer and more complex secrets
- Add `.env` to your `.gitignore` file
- Consider using different environment files for development and production

## Project Structure

The project follows a modular structure:

```
chaibackend/
├── docs/                  # Documentation files
├── public/                # Public assets
│   └── temp/              # Temporary storage for uploads
├── src/                   # Source code
│   ├── controllers/       # Request handlers
│   ├── db/                # Database connection
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── app.js             # Express app configuration
│   ├── constants.js       # Application constants
│   └── index.js           # Entry point
├── .env                   # Environment variables
├── .gitignore             # Git ignore file
├── package.json           # Project metadata and dependencies
└── README.md              # Project overview
```

**Directory purposes:**
- **controllers/**: Contains logic for handling requests and responses
- **db/**: Database connection and configuration
- **middleware/**: Custom Express middleware functions
- **models/**: Mongoose schema definitions and models
- **routes/**: API route definitions
- **utils/**: Helper functions and utilities
- **public/temp/**: Temporary storage for uploaded files before moving to Cloudinary

## Database Setup

### MongoDB Connection

The database connection is managed in `src/db/index.js`:

```javascript
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from environment variables
    const connect = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
      useNewUrlParser: true,     // Use new URL parser to avoid deprecation warnings
      useUnifiedTopology: true,  // Use new server discovery and monitoring engine
    });

    // Log successful connection
    console.log(`\nMongoDB connected!! DB HOST: ${connect.connection.host}`);
  } catch (error) {
    // Log error and exit process if connection fails
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure code
  }
};

export default connectDB;
```

**Key points:**
- The function is asynchronous to properly handle the MongoDB connection promise
- Connection options prevent deprecation warnings
- Process exits with error code if connection fails, allowing process managers to restart the application
- DB_NAME is imported from constants.js for better configuration management

### Data Models

#### User Model (`src/models/user.model.js`)

The User model includes authentication methods and schema definition:

```javascript
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,        // Field must be provided
      unique: true,          // Must be unique in the collection
      lowercase: true,       // Automatically convert to lowercase
      trim: true,            // Remove whitespace from both ends
      index: true,           // Create an index for faster queries
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
      index: true,
    },
    avatar: {
      type: String,          // Cloudinary URL for profile picture
      required: true,
    },
    coverImage: {
      type: String,          // Cloudinary URL for cover image
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,  // Array of Video document references
        ref: "Video",                 // References the Video model
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],  // Custom error message
    },
    refreshToken: {
      type: String,          // Stores the current refresh token
    },
  },
  {
    timestamps: true,        // Automatically add createdAt and updatedAt fields
  }
);

// Password hashing middleware - runs before saving the document
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified
  if (!this.isModified("password")) return next();
  
  // Hash the password with a salt factor of 10
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to verify password during login
UserSchema.methods.isPasswordCorrect = async function (password) {
  // Compare provided password with stored hash
  return await bcrypt.compare(password, this.password);
};

// Method to generate short-lived access token
UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,           // User ID for identification
      email: this.email,       // Include email in token payload
      username: this.username, // Include username in token payload
      fullName: this.fullName, // Include fullName in token payload
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }  // Token expiration time
  );
};

// Method to generate longer-lived refresh token
UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },         // Only include user ID in refresh token
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }  // Longer expiration time
  );
};

export const User = mongoose.model("User", UserSchema);
```

**Key security features:**
- Passwords are automatically hashed before saving
- Password comparison is done securely with bcrypt
- JWT tokens are generated with appropriate expiration times
- Refresh token contains minimal information for security

#### Video Model (`src/models/video.model.js`)

```javascript
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema(
  {
    videoFile: {
      type: String,          // Cloudinary URL for video file
      required: true,
    },
    thumbnail: {
      type: String,          // Cloudinary URL for video thumbnail
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,          // Video duration in seconds
      required: true,
    },
    views: {
      type: Number,
      default: 0,            // Initialize view count to zero
    },
    isPublished: {
      type: Boolean,
      default: true,         // Videos are published by default
    },
    owner: {
      type: Schema.Types.ObjectId,  // Reference to User who uploaded the video
      ref: "User",                  // References the User model
    },
  },
  {
    timestamps: true,        // Automatically add createdAt and updatedAt fields
  }
);

// Add plugin for pagination in aggregation queries
VideoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", VideoSchema);
```

**Important features:**
- References to User model for ownership
- Timestamps for creation and update tracking
- Default values for views and publication status
- Mongoose Aggregate Paginate plugin for efficient pagination of video results

## Authentication System

The authentication system uses JWT (JSON Web Tokens) with access and refresh tokens:

### Authentication Flow

1. **Registration**: User provides credentials and profile information
2. **Password Hashing**: Password is hashed using bcrypt before storage
3. **Login**: User provides credentials, system verifies and issues tokens
4. **Token Management**: Access token for API requests, refresh token for getting new access tokens
5. **Protected Routes**: Middleware verifies tokens before allowing access

### Utility Classes

#### API Error Handling (`src/utils/ApiError.js`)

```javascript
class ApiError extends Error {
  constructor(
    statusCode,              // HTTP status code for the error
    message = "Something went wrong",  // Default error message
    errors = [],             // Array of detailed error messages
    stack = ""               // Error stack trace
  ) {
    super(message);          // Call parent Error constructor with message
    this.statusCode = statusCode;
    this.data = null;        // No data returned with error
    this.message = message;
    this.success = false;    // Indicate operation failure
    this.errors = errors;    // Detailed error information
    
    // Use provided stack trace or capture it automatically
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
```

**Usage importance:**
- Provides consistent error format across the API
- Includes HTTP status codes for proper client responses
- Supports detailed error information for debugging
- Preserves error stack traces for troubleshooting

#### API Response Formatting (`src/utils/ApiResponse.js`)

```javascript
class ApiResponse {
  constructor(
    statusCode,              // HTTP status code for the response
    data,                    // Data to return to the client
    message = "Success"      // Response message
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;  // Success is true for status codes < 400
  }
}

export { ApiResponse };
```

**Benefits:**
- Standardizes API response format
- Automatically determines success based on status code
- Provides consistent structure for frontend consumption

#### Async Handler (`src/utils/asyncHandler.js`)

```javascript
const asyncHandler = (fn) => async (req, res, next) => {
  // Wrap the controller function in a Promise and catch any errors
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export { asyncHandler };
```

**Why it's important:**
- Eliminates the need for try/catch blocks in every controller
- Ensures all errors are passed to Express error middleware
- Simplifies controller code and improves readability
- Handles both synchronous and asynchronous errors

## File Upload System

The file upload system uses Multer for local storage and Cloudinary for cloud storage:

### Multer Middleware (`src/middleware/multer.middleware.js`)

```javascript
import multer from "multer";
import crypto from "crypto";
import path from "path";

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/temp');  // Store files in public/temp directory
  },
  filename: function (req, file, cb) {
    // Generate random filename to prevent collisions and security issues
    const randomBytes = crypto.randomBytes(12).toString('hex');
    const filename = randomBytes + path.extname(file.originalname);
    cb(null, filename);
  }
});

// Create multer instance with configured storage
const upload = multer({ 
  storage: storage,
  // Optional: Add file size limits and file type filters here
});

export default upload;
```

**Security considerations:**
- Random filenames prevent overwriting and filename guessing
- Temporary storage allows validation before permanent storage
- Could add file type validation and size limits for additional security

### Cloudinary Integration (`src/utils/cloudinary.js`)

```javascript
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file to Cloudinary and removes the local copy
 * @param {string} localFilePath - Path to the file on local filesystem
 * @returns {Object|null} - Cloudinary response or null if upload failed
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    
    // Upload file to Cloudinary with automatic resource type detection
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"  // Automatically detect if it's image, video, etc.
    });
    
    // Log success and file URL
    console.log("File uploaded on cloudinary", response.url);
    
    // Remove temporary local file after successful upload
    fs.unlinkSync(localFilePath);
    
    return response;  // Return full Cloudinary response
  } catch (error) {
    // Clean up local file
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
```

### File Upload Workflow

1. Client sends multipart/form-data to server
2. Multer middleware processes the upload and stores it temporarily
3. The file is uploaded to Cloudinary
4. The Cloudinary URL is saved to the database
5. The temporary local file is deleted

## Running the Project

### Development Mode

```bash
# Start the server with nodemon for auto-reloading
npm run dev
```

### Production Mode

```bash
# Start the server
npm start
```

## Troubleshooting

### Common Issues and Solutions

#### MongoDB Connection Errors

- **Issue**: Cannot connect to MongoDB
- **Solution**: 
  - Verify MongoDB is running (`mongod` service)
  - Check connection string in `.env` file
  - Ensure network connectivity to MongoDB Atlas (if using cloud)

#### File Upload Issues

- **Issue**: Files not uploading to Cloudinary
- **Solution**:
  - Verify Cloudinary credentials in `.env`
  - Check if `public/temp` directory exists and is writable
  - Ensure file size is within limits set in Multer

#### JWT Authentication Issues

- **Issue**: "Invalid token" or authentication failures
- **Solution**:
  - Verify token secrets in `.env` file
  - Check token expiration times
  - Clear cookies and try logging in again

#### Node.js Version Compatibility

- **Issue**: Syntax errors or unexpected token errors
- **Solution**:
  - Ensure Node.js version is 16.20.1 or higher
  - Check for ES module compatibility

#### Missing Dependencies

- **Issue**: Module not found errors
- **Solution**:
  - Run `npm install` to install all dependencies
  - Check package.json for correct dependency versions

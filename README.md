# YouTube-like Video Platform

A full-stack video platform built with Node.js, Express, MongoDB, and React, featuring JWT-based authentication, video uploads, comments, likes, subscriptions, and more.

## Features

### Authentication & User Management

- User registration with avatar and cover image upload
- Secure login with JWT authentication (access and refresh tokens)
- Secure logout mechanism
- Password hashing with bcrypt
- User profile management

### Video Features

- Video upload with thumbnail generation
- Video playback with custom controls
- Video search and discovery
- Watch history tracking
- Like/dislike functionality

### Social Features

- Channel subscriptions
- Video comments with likes
- User playlists creation and management

### Technical Features

- File uploads with Multer and Cloudinary
- HTTP-only cookies for enhanced security
- Responsive frontend built with React
- RESTful API architecture

## Tech Stack

### Backend

- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- Cloudinary for cloud storage

### Frontend

- React.js
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- React Icons for UI elements

## API Endpoints

### Authentication

| Method | Endpoint                          | Description              | Authentication Required     |
| ------ | --------------------------------- | ------------------------ | --------------------------- |
| POST   | `/api/v1/users/register`          | Register a new user      | No                          |
| POST   | `/api/v1/users/login`             | Login user               | No                          |
| POST   | `/api/v1/users/logout`            | Logout user              | Yes                         |
| POST   | `/api/v1/users/refresh-token`     | Refresh access token     | No (requires refresh token) |
| POST   | `/api/v1/users/change-password`   | Change user password     | Yes                         |
| GET    | `/api/v1/users/current-user`      | Get current user details | Yes                         |
| PATCH  | `/api/v1/users/update`            | Update user details      | Yes                         |
| PATCH  | `/api/v1/users/avatar`            | Update user avatar       | Yes                         |
| PATCH  | `/api/v1/users/cover-image`       | Update user cover image  | Yes                         |
| GET    | `/api/v1/users/channel/:username` | Get user channel profile | Yes                         |

### Videos

| Method | Endpoint                  | Description        | Authentication Required |
| ------ | ------------------------- | ------------------ | ----------------------- |
| GET    | `/api/v1/videos`          | Get all videos     | No                      |
| GET    | `/api/v1/videos/:videoId` | Get video by ID    | No                      |
| POST   | `/api/v1/videos`          | Create a new video | Yes                     |
| PATCH  | `/api/v1/videos/:videoId` | Update video       | Yes                     |
| DELETE | `/api/v1/videos/:videoId` | Delete video       | Yes                     |

### Comments

| Method | Endpoint                        | Description              | Authentication Required |
| ------ | ------------------------------- | ------------------------ | ----------------------- |
| GET    | `/api/v1/comments/:videoId`     | Get comments for a video | Yes                     |
| POST   | `/api/v1/comments/:videoId`     | Add a comment to a video | Yes                     |
| PATCH  | `/api/v1/comments/c/:commentId` | Update a comment         | Yes                     |
| DELETE | `/api/v1/comments/c/:commentId` | Delete a comment         | Yes                     |

### Likes

| Method | Endpoint                                 | Description               | Authentication Required |
| ------ | ---------------------------------------- | ------------------------- | ----------------------- |
| POST   | `/api/v1/likes/toggle/v/:videoId`        | Toggle like on a video    | Yes                     |
| POST   | `/api/v1/likes/toggle/c/:commentId`      | Toggle like on a comment  | Yes                     |
| POST   | `/api/v1/likes/toggle/t/:tweetId`        | Toggle like on a tweet    | Yes                     |
| GET    | `/api/v1/likes/videos`                   | Get liked videos          | Yes                     |
| GET    | `/api/v1/likes/check/video/:videoId`     | Check if video is liked   | Yes                     |
| GET    | `/api/v1/likes/check/comment/:commentId` | Check if comment is liked | Yes                     |

### Subscriptions

| Method | Endpoint                                | Description                            | Authentication Required |
| ------ | --------------------------------------- | -------------------------------------- | ----------------------- |
| POST   | `/api/v1/subscriptions/c/:channelId`    | Toggle subscription to a channel       | Yes                     |
| GET    | `/api/v1/subscriptions/u/:channelId`    | Get channel subscribers                | Yes                     |
| GET    | `/api/v1/subscriptions/c/:subscriberId` | Get subscribed channels                | Yes                     |
| GET    | `/api/v1/subscriptions/me/subscribed`   | Get current user's subscribed channels | Yes                     |

### Playlists

| Method | Endpoint                        | Description           | Authentication Required |
| ------ | ------------------------------- | --------------------- | ----------------------- |
| GET    | `/api/v1/playlists`             | Get user playlists    | Yes                     |
| GET    | `/api/v1/playlists/:playlistId` | Get playlist by ID    | Yes                     |
| POST   | `/api/v1/playlists`             | Create a new playlist | Yes                     |
| POST   | `/api/v1/playlists/add-video`   | Add video to playlist | Yes                     |

### Watch History

| Method | Endpoint                      | Description                | Authentication Required |
| ------ | ----------------------------- | -------------------------- | ----------------------- |
| GET    | `/api/v1/users/watch-history` | Get user watch history     | Yes                     |
| POST   | `/api/v1/users/watch-history` | Add video to watch history | Yes                     |

## Setup Instructions

### Prerequisites

- Node.js (v16.20.1 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- npm or yarn package manager

### Backend Setup

#### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=8000
MONGODB_URI=mongodb://localhost:27017/your-database
CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. Install backend dependencies

   ```bash
   npm install
   ```

3. Start the backend development server
   ```bash
   npm run dev
   ```

### Frontend Setup

#### Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

#### Installation

1. Navigate to the frontend directory

   ```bash
   cd frontend
   ```

2. Install frontend dependencies

   ```bash
   npm install
   ```

3. Start the frontend development server
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000` and will connect to the backend API at `http://localhost:8000/api/v1`.

## API Usage Examples

### Authentication

#### Register a User

**Request:**

```
POST /api/v1/users/register
Content-Type: multipart/form-data

Fields:
- username: johndoe
- email: john@example.com
- fullName: John Doe
- password: securepassword
- avatar: [file upload]
- coverImage: [file upload] (optional)
```

#### Login

**Request:**

```
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "avatar": "https://cloudinary.url/avatar.jpg",
      "coverImage": "https://cloudinary.url/cover.jpg"
    },
    "accessToken": "your_access_token",
    "refreshToken": "your_refresh_token"
  },
  "message": "User logged in successfully"
}
```

#### Logout

**Request:**

```
POST /api/v1/users/logout
Authorization: Bearer your_access_token
```

### Video Operations

#### Upload a Video

**Request:**

```
POST /api/v1/videos
Content-Type: multipart/form-data
Authorization: Bearer your_access_token

Fields:
- title: My Awesome Video
- description: This is a description of my awesome video
- videoFile: [file upload]
- thumbnail: [file upload]
```

#### Get Video by ID

**Request:**

```
GET /api/v1/videos/video_id
```

### Social Features

#### Toggle Subscription

**Request:**

```
POST /api/v1/subscriptions/c/channel_id
Authorization: Bearer your_access_token
```

#### Add Comment to Video

**Request:**

```
POST /api/v1/comments/video_id
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "content": "This is an awesome video!"
}
```

#### Toggle Like on Video

**Request:**

```
POST /api/v1/likes/toggle/v/video_id
Authorization: Bearer your_access_token
```

### Watch History

#### Get Watch History

**Request:**

```
GET /api/v1/users/watch-history
Authorization: Bearer your_access_token
```

#### Add to Watch History

**Request:**

```
POST /api/v1/users/watch-history
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "videoId": "video_id"
}
```

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens with appropriate expiration times
- HTTP-only cookies for storing tokens
- Secure cookie options in production
- Refresh token rotation

## Frontend Features

- Responsive design using Tailwind CSS
- YouTube-like user interface
- Video player with custom controls
- Comment system with replies and likes
- Subscription management
- Watch history tracking
- Playlist creation and management
- Like/dislike functionality for videos and comments

## Project Structure

```
├── backend/                # Node.js backend API
│   ├── src/                # Source code
│   │   ├── controllers/    # API controllers
│   │   ├── db/             # Database connection
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── app.js          # Express app setup
│   │   ├── constants.js    # Application constants
│   │   └── index.js        # Entry point
│   └── public/             # Static files
│
├── frontend/               # React frontend
│   ├── src/                # Source code
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── public/             # Static files
```

## License

MIT

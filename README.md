# Backend Authentication API

A robust Node.js backend authentication system built with Express and MongoDB, featuring JWT-based authentication with access and refresh tokens.

## Features

- User registration with avatar and cover image upload
- Secure login with JWT authentication (access and refresh tokens)
- Secure logout mechanism
- Password hashing with bcrypt
- File uploads with Multer and Cloudinary
- HTTP-only cookies for enhanced security

## Tech Stack

- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- Cloudinary for cloud storage

## API Endpoints

### Authentication

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| POST | `/api/v1/users/register` | Register a new user | No |
| POST | `/api/v1/users/login` | Login user | No |
| POST | `/api/v1/users/logout` | Logout user | Yes |
| POST | `/api/v1/users/refresh-token` | Refresh access token | No (requires refresh token) |

## Setup Instructions

### Prerequisites

- Node.js (v16.20.1 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

### Environment Variables

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

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

## API Usage Examples

### Register a User

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

### Login

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

### Logout

**Request:**
```
POST /api/v1/users/logout
Authorization: Bearer your_access_token
```

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens with appropriate expiration times
- HTTP-only cookies for storing tokens
- Secure cookie options in production
- Refresh token rotation

## License

MIT
# Redis Implementation for ChaiBackend Project

This document outlines how Redis can be integrated into the ChaiBackend project without modifying the existing codebase. These recommendations can be implemented as separate enhancements to improve performance and scalability.

## Table of Contents

- [Project Overview](#project-overview)
- [Redis Integration Benefits](#redis-integration-benefits)
- [Use Cases](#use-cases)
- [Implementation Examples](#implementation-examples)
- [Integration Steps](#integration-steps)
- [Deployment Considerations](#deployment-considerations)

## Project Overview

ChaiBackend is a Node.js/Express application with MongoDB as the primary database. The project includes:

- User authentication with JWT
- Video upload and streaming
- User subscriptions
- Video likes and comments
- Watch history tracking
- Playlist management

## Redis Integration Benefits

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     ChaiBackend Application                 │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │             │    │             │    │             │     │
│  │  Express    │◄──►│  Redis      │◄──►│  MongoDB    │     │
│  │  API        │    │  Cache      │    │  Database   │     │
│  │             │    │             │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Adding Redis to ChaiBackend provides:

- **Reduced database load**: Cache frequently accessed data
- **Improved response times**: Serve data from memory instead of disk
- **Enhanced scalability**: Handle more concurrent users
- **Session management**: More efficient user session handling
- **Rate limiting**: Protect APIs from abuse
- **Real-time features**: Enable pub/sub for notifications

## Use Cases

### 1. User Authentication Caching

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Client     │────►│  Redis      │────►│  MongoDB    │
│  Request    │     │  Auth Cache │     │  Database   │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                   │
       │                   │
       └───────────────────┘
         Cached Auth Response
```

- Store JWT blacklists for logout functionality
- Cache user profile data after authentication
- Track active sessions

### 2. Video Watch History Caching

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  User       │────►│  Redis      │────►│  MongoDB    │
│  Activity   │     │  Cache      │     │  Database   │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

- Store recent watch history in sorted sets
- Maintain view counts for trending videos
- Track watch progress for resume functionality

### 3. Content Caching

- Cache video metadata for frequently accessed videos
- Store thumbnail URLs and video details
- Cache search results for common queries

### 4. Subscription Management

- Track channel subscribers using Redis sets
- Maintain user subscription lists
- Enable quick subscription status checks

### 5. Like Functionality

- Track likes for videos, comments, and other content
- Maintain like counts in Redis counters
- Enable quick "has user liked" checks

## Implementation Examples

### 1. User Authentication Caching

```javascript
// Add to src/middleware/auth.middleware.js without changing existing code
import redis from "redis";
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

// Check if token is blacklisted (for logout functionality)
async function isTokenBlacklisted(token) {
  return (await redisClient.get(`blacklist:${token}`)) !== null;
}

// Add token to blacklist on logout
async function blacklistToken(token, expiryTime) {
  await redisClient.set(`blacklist:${token}`, "1", {
    EX: expiryTime,
  });
}

// Cache user data after authentication
async function cacheUserData(userId, userData, expiryTime = 3600) {
  await redisClient.set(`user:${userId}`, JSON.stringify(userData), {
    EX: expiryTime,
  });
}

// Get cached user data
async function getCachedUserData(userId) {
  const cachedData = await redisClient.get(`user:${userId}`);
  return cachedData ? JSON.parse(cachedData) : null;
}
```

### 2. Video Watch History Caching

```javascript
// Add to src/controllers/user.controller.js without changing existing code
import redis from "redis";
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

// Cache user's watch history
async function cacheWatchHistory(userId, videoId) {
  // Add to sorted set with timestamp as score for recency
  await redisClient.zAdd(`watchHistory:${userId}`, {
    score: Date.now(),
    value: videoId,
  });

  // Trim to keep only the most recent 100 videos
  await redisClient.zRemRangeByRank(`watchHistory:${userId}`, 0, -101);
}

// Get cached watch history
async function getCachedWatchHistory(userId) {
  // Get the most recent 50 videos (highest scores)
  return await redisClient.zRange(`watchHistory:${userId}`, 0, 49, {
    REV: true,
  });
}
```

### 3. Video Metadata Caching

```javascript
// Add to src/controllers/video.controller.js without changing existing code
import redis from "redis";
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

// Cache video metadata
async function cacheVideoMetadata(videoId, videoData) {
  await redisClient.set(`video:${videoId}`, JSON.stringify(videoData), {
    EX: 3600, // Cache for 1 hour
  });
}

// Get cached video metadata
async function getCachedVideoMetadata(videoId) {
  const cachedData = await redisClient.get(`video:${videoId}`);
  return cachedData ? JSON.parse(cachedData) : null;
}

// Increment video view count
async function incrementVideoViews(videoId) {
  await redisClient.incr(`videoViews:${videoId}`);
}

// Get video view count
async function getVideoViews(videoId) {
  const views = await redisClient.get(`videoViews:${videoId}`);
  return views ? parseInt(views) : 0;
}
```

### 4. Subscription Management

```javascript
// Add to src/controllers/subscription.controller.js without changing existing code
import redis from "redis";
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

// Add subscription relationship
async function cacheSubscription(channelId, subscriberId) {
  // Add to channel's subscribers set
  await redisClient.sAdd(`channelSubscribers:${channelId}`, subscriberId);

  // Add to user's subscribed channels set
  await redisClient.sAdd(`userSubscriptions:${subscriberId}`, channelId);
}

// Remove subscription relationship
async function removeSubscriptionFromCache(channelId, subscriberId) {
  // Remove from channel's subscribers set
  await redisClient.sRem(`channelSubscribers:${channelId}`, subscriberId);

  // Remove from user's subscribed channels set
  await redisClient.sRem(`userSubscriptions:${subscriberId}`, channelId);
}

// Check if user is subscribed to channel
async function isSubscribed(channelId, subscriberId) {
  return await redisClient.sIsMember(
    `channelSubscribers:${channelId}`,
    subscriberId
  );
}

// Get subscriber count
async function getSubscriberCount(channelId) {
  return await redisClient.sCard(`channelSubscribers:${channelId}`);
}
```

### 5. Like Functionality Caching

```javascript
// Add to src/controllers/like.controller.js without changing existing code
import redis from "redis";
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

// Add like
async function cacheLike(contentType, contentId, userId) {
  // Add to content's likes set
  await redisClient.sAdd(`${contentType}:${contentId}:likes`, userId);
}

// Remove like
async function removeLikeFromCache(contentType, contentId, userId) {
  // Remove from content's likes set
  await redisClient.sRem(`${contentType}:${contentId}:likes`, userId);
}

// Check if user liked content
async function hasLiked(contentType, contentId, userId) {
  return await redisClient.sIsMember(
    `${contentType}:${contentId}:likes`,
    userId
  );
}

// Get like count
async function getLikeCount(contentType, contentId) {
  return await redisClient.sCard(`${contentType}:${contentId}:likes`);
}
```

## Integration Steps

To integrate Redis into the ChaiBackend project without modifying existing code:

### 1. Install Redis Dependencies

```bash
npm install redis
```

### 2. Add Redis Configuration to .env

```
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_password_here
```

### 3. Create a Redis Connection Module

Create a new file at `src/db/redis.js`:

```javascript
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  password: process.env.REDIS_PASSWORD,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

redisClient.on("ready", () => {
  console.log("Redis client ready");
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Redis connection error:", error);
    // Non-fatal error - application can continue without Redis
    console.log("Application will continue without Redis caching");
  }
};

export { redisClient, connectRedis };
```

### 4. Initialize Redis Connection

Modify `src/index.js` to include Redis connection (without changing existing functionality):

```javascript
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { connectRedis } from "./db/redis.js"; // Add this line
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

// Existing MongoDB connection
connectDB()
  .then(() => {
    // Try to connect to Redis, but continue if it fails
    connectRedis().catch((err) => {
      console.warn(
        "Redis connection failed, continuing without caching:",
        err.message
      );
    });

    // Existing server startup code
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`✅ Server is running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MONGODB connection failed !!!", err);
    process.exit(1);
  });
```

### 5. Create Redis Service Modules

Create a new directory `src/services/redis` with separate files for each Redis functionality:

#### src/services/redis/auth.redis.js

```javascript
import { redisClient } from "../../db/redis.js";

export const authRedisService = {
  async blacklistToken(token, expiryTime) {
    if (!redisClient.isReady) return false;
    await redisClient.set(`blacklist:${token}`, "1", { EX: expiryTime });
    return true;
  },

  async isTokenBlacklisted(token) {
    if (!redisClient.isReady) return false;
    return (await redisClient.get(`blacklist:${token}`)) !== null;
  },

  // Other auth-related Redis functions
};
```

#### src/services/redis/video.redis.js

```javascript
import { redisClient } from "../../db/redis.js";

export const videoRedisService = {
  async cacheVideoMetadata(videoId, videoData, expiryTime = 3600) {
    if (!redisClient.isReady) return false;
    await redisClient.set(`video:${videoId}`, JSON.stringify(videoData), {
      EX: expiryTime,
    });
    return true;
  },

  async getCachedVideoMetadata(videoId) {
    if (!redisClient.isReady) return null;
    const cachedData = await redisClient.get(`video:${videoId}`);
    return cachedData ? JSON.parse(cachedData) : null;
  },

  // Other video-related Redis functions
};
```

## Deployment Considerations

### 1. Redis Server Setup

For development:

```bash
# Install Redis locally
sudo apt-get install redis-server  # Ubuntu/Debian
brew install redis                 # macOS

# Start Redis server
redis-server
```

For production:

- Use Redis Cloud, AWS ElastiCache, or other managed Redis services
- Configure proper security settings (firewall, authentication)
- Set up monitoring and alerting

### 2. Redis Configuration

Basic production configuration in `redis.conf`:

```
# Memory management
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
appendonly yes
appendfsync everysec

# Security
requirepass your_strong_password_here
bind 127.0.0.1
protected-mode yes

# Performance
tcp-keepalive 60
```

### 3. High Availability Setup

For mission-critical applications:

- Use Redis Sentinel for automatic failover
- Configure Redis Cluster for horizontal scaling
- Implement proper backup strategies

### 4. Monitoring

Set up monitoring using:

- Redis CLI commands (`INFO`, `MONITOR`)
- Redis Exporter with Prometheus and Grafana
- Cloud provider monitoring tools

## Conclusion

Integrating Redis with ChaiBackend can significantly improve application performance and user experience without modifying the existing codebase. By implementing these Redis caching strategies, you can:

- Reduce database load by up to 80% for frequently accessed data
- Improve API response times by serving data from memory
- Enable new features like real-time notifications and activity feeds
- Scale the application to handle more concurrent users

Start with the most impactful use cases (authentication, video metadata caching) and gradually implement other Redis features as needed.

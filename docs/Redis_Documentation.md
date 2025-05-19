# Redis Documentation: From Basics to Production

## Table of Contents

- [Introduction to Redis](#introduction-to-redis)
- [Core Concepts](#core-concepts)
- [Data Structures](#data-structures)
- [Basic Commands](#basic-commands)
- [Persistence Options](#persistence-options)
- [Redis Architecture](#redis-architecture)
- [High Availability](#high-availability)
- [Redis Clustering](#redis-clustering)
- [Code Examples](#code-examples)
- [Production Best Practices](#production-best-practices)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Common Use Cases](#common-use-cases)

## Introduction to Redis

Redis (Remote Dictionary Server) is an open-source, in-memory data structure store that can be used as a database, cache, message broker, and streaming engine. It supports various data structures such as strings, hashes, lists, sets, sorted sets, bitmaps, hyperloglogs, geospatial indexes, and streams.

### Key Features

- **In-memory storage**: Extremely fast data access
- **Persistence options**: Can save data to disk
- **Versatile data structures**: Beyond simple key-value storage
- **Atomic operations**: Ensures data consistency
- **Pub/Sub messaging**: Enables event-driven architectures
- **Lua scripting**: For complex operations
- **Transactions**: Group commands for atomic execution
- **High availability**: Through replication and Redis Sentinel
- **Horizontal scaling**: Via Redis Cluster

## Core Concepts

### Redis Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Redis Clients  │◄────►  Redis Server   │
│                 │     │                 │
└─────────────────┘     └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │                 │
                        │  Memory (RAM)   │
                        │                 │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │                 │
                        │  Persistence    │
                        │  (RDB/AOF)      │
                        │                 │
                        └─────────────────┘
```

### Redis Workflow

1. **Client Connection**: Applications connect to Redis server via TCP
2. **Command Execution**: Client sends commands to server
3. **In-Memory Processing**: Redis processes commands in memory
4. **Response**: Server returns results to client
5. **Optional Persistence**: Data can be saved to disk based on configuration

## Data Structures

Redis supports several data structures, each with specific use cases:

| Data Structure | Description                             | Use Cases                         |
| -------------- | --------------------------------------- | --------------------------------- |
| Strings        | Binary-safe strings up to 512MB         | Caching, counters, bit operations |
| Lists          | Linked lists of strings                 | Queues, stacks, real-time feeds   |
| Sets           | Unordered collections of unique strings | Tracking unique items, relations  |
| Sorted Sets    | Sets ordered by a score                 | Leaderboards, priority queues     |
| Hashes         | Maps between string fields and values   | Object representation             |
| Streams        | Append-only log data structures         | Event sourcing, messaging         |
| Geospatial     | Longitude/latitude data                 | Location-based features           |
| HyperLogLog    | Probabilistic data structure            | Counting unique values            |

## Basic Commands

### String Operations

```redis
SET key value [EX seconds] [PX milliseconds] [NX|XX]
GET key
INCR key
DEL key
```

### Hash Operations

```redis
HSET key field value
HGET key field
HGETALL key
HDEL key field
```

### List Operations

```redis
LPUSH key value [value ...]
RPUSH key value [value ...]
LPOP key
RPOP key
LRANGE key start stop
```

### Set Operations

```redis
SADD key member [member ...]
SMEMBERS key
SISMEMBER key member
SREM key member [member ...]
```

### Sorted Set Operations

```redis
ZADD key score member [score member ...]
ZRANGE key start stop [WITHSCORES]
ZRANK key member
ZREM key member [member ...]
```

## Persistence Options

Redis offers two persistence mechanisms:

### RDB (Redis Database)

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Redis Server   │────►│  RDB Snapshot   │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

**Configuration Example:**

```redis
save 900 1      # Save if at least 1 key changed in 900 seconds
save 300 10     # Save if at least 10 keys changed in 300 seconds
save 60 10000   # Save if at least 10000 keys changed in 60 seconds
```

### AOF (Append Only File)

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Redis Commands │────►│  AOF File       │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

**Configuration Example:**

```redis
appendonly yes
appendfsync everysec  # Options: always, everysec, no
```

### Comparison

| Feature        | RDB          | AOF            |
| -------------- | ------------ | -------------- |
| Durability     | Less durable | More durable   |
| File Size      | Smaller      | Larger         |
| Performance    | Better       | Slightly worse |
| Recovery       | Faster       | Slower         |
| Human Readable | No           | Yes            |

## Redis Architecture

### Single Instance

```
┌─────────────┐     ┌─────────────┐
│             │     │             │
│  Client 1   │◄────►  Redis      │
│             │     │  Server     │
└─────────────┘     │             │
                    │             │
┌─────────────┐     │             │
│             │     │             │
│  Client 2   │◄────►             │
│             │     │             │
└─────────────┘     └─────────────┘
```

### Master-Replica Replication

```
┌─────────────┐     ┌─────────────┐
│             │     │             │
│  Clients    │◄────►  Redis      │
│             │     │  Master     │
└─────────────┘     └──────┬──────┘
                           │
                           ▼
              ┌────────────────────────┐
              │                        │
              ▼                        ▼
      ┌─────────────┐          ┌─────────────┐
      │             │          │             │
      │  Redis      │          │  Redis      │
      │  Replica 1  │          │  Replica 2  │
      │             │          │             │
      └─────────────┘          └─────────────┘
```

## High Availability

Redis offers high availability through Redis Sentinel, a system designed to manage Redis instances.

### Redis Sentinel Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Sentinel 1 │◄────►  Sentinel 2 │◄────►  Sentinel 3 │
│             │     │             │     │             │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────┬───────┴───────────┬───────┘
                   │                   │
                   ▼                   ▼
           ┌─────────────┐     ┌─────────────┐
           │             │     │             │
           │  Redis      │     │  Redis      │
           │  Master     │     │  Replica    │
           │             │     │             │
           └─────────────┘     └─────────────┘
```

### Sentinel Features

- **Monitoring**: Constantly checks if master and replica instances are working
- **Notification**: Alerts administrators about issues
- **Automatic failover**: Promotes a replica to master when the master fails
- **Configuration provider**: Clients connect to Sentinel to find the current master

### Sentinel Configuration Example

```redis
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
sentinel parallel-syncs mymaster 1
```

## Redis Clustering

Redis Cluster provides a way to run a Redis installation where data is automatically sharded across multiple Redis nodes.

### Redis Cluster Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Redis      │◄────►  Redis      │◄────►  Redis      │
│  Node 1     │     │  Node 2     │     │  Node 3     │
│  (0-5460)   │     │  (5461-10922)     │  (10923-16383)
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
       └───────────┬───────┴───────────┬───────┘
                   │                   │
                   ▼                   ▼
           ┌─────────────┐     ┌─────────────┐
           │             │     │             │
           │  Client 1   │     │  Client 2   │
           │             │     │             │
           └─────────────┘     └─────────────┘
```

### Clustering Features

- **Automatic sharding**: Distributes data across nodes using hash slots (16384 slots)
- **High availability**: Supports master-replica model for each shard
- **Fault tolerance**: Continues operations when a subset of nodes fails
- **Horizontal scaling**: Add more nodes to increase capacity

### Cluster Configuration Example

```redis
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
```

## Code Examples

### Node.js (with node-redis)

```javascript
// Connection setup
const redis = require("redis");

// Create client with options
const client = redis.createClient({
  url: "redis://username:password@localhost:6379",
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
  },
});

// Handle connection events
client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", () => console.log("Redis connected"));
client.on("ready", () => console.log("Redis ready"));

// Connect to Redis
async function connectRedis() {
  await client.connect();

  // Basic operations
  await client.set("key", "value");
  const value = await client.get("key");
  console.log(value); // 'value'

  // Working with hashes
  await client.hSet("user:1", {
    name: "John",
    email: "john@example.com",
    age: 30,
  });
  const user = await client.hGetAll("user:1");
  console.log(user); // { name: 'John', email: 'john@example.com', age: '30' }

  // Lists
  await client.lPush("tasks", ["task1", "task2", "task3"]);
  const tasks = await client.lRange("tasks", 0, -1);
  console.log(tasks); // ['task3', 'task2', 'task1']

  // Using transactions
  const multi = client.multi();
  multi.set("key1", "value1");
  multi.set("key2", "value2");
  const results = await multi.exec();

  // Disconnect
  await client.quit();
}

connectRedis().catch(console.error);
```

### Python (with redis-py)

```python
import redis

# Connect to Redis
r = redis.Redis(
    host='localhost',
    port=6379,
    password='your_password',  # Optional
    db=0,                      # Default database
    decode_responses=True      # Return strings instead of bytes
)

# Basic operations
r.set('key', 'value')
value = r.get('key')
print(value)  # 'value'

# Working with hashes
r.hset('user:1', mapping={
    'name': 'John',
    'email': 'john@example.com',
    'age': 30
})
user = r.hgetall('user:1')
print(user)  # {'name': 'John', 'email': 'john@example.com', 'age': '30'}

# Lists
r.lpush('tasks', 'task1', 'task2', 'task3')
tasks = r.lrange('tasks', 0, -1)
print(tasks)  # ['task3', 'task2', 'task1']

# Using pipelines (transactions)
pipe = r.pipeline()
pipe.set('key1', 'value1')
pipe.set('key2', 'value2')
results = pipe.execute()

# Pub/Sub example
def message_handler(message):
    print(f"Received: {message['data']} on channel {message['channel']}")

# In one process (subscriber)
pubsub = r.pubsub()
pubsub.subscribe(**{'channel': message_handler})
thread = pubsub.run_in_thread(sleep_time=0.01)

# In another process (publisher)
r.publish('channel', 'Hello Redis!')

# Clean up
thread.stop()
```

### Java (with Jedis)

```java
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;
import redis.clients.jedis.Transaction;

public class RedisExample {
    public static void main(String[] args) {
        // Configure connection pool
        JedisPoolConfig poolConfig = new JedisPoolConfig();
        poolConfig.setMaxTotal(10);
        poolConfig.setMaxIdle(5);
        poolConfig.setMinIdle(1);

        // Create connection pool
        try (JedisPool jedisPool = new JedisPool(poolConfig, "localhost", 6379)) {
            // Get connection from pool
            try (Jedis jedis = jedisPool.getResource()) {
                // Basic operations
                jedis.set("key", "value");
                String value = jedis.get("key");
                System.out.println(value); // "value"

                // Working with hashes
                jedis.hset("user:1", "name", "John");
                jedis.hset("user:1", "email", "john@example.com");
                jedis.hset("user:1", "age", "30");
                Map<String, String> user = jedis.hgetAll("user:1");
                System.out.println(user); // {name=John, email=john@example.com, age=30}

                // Lists
                jedis.lpush("tasks", "task1", "task2", "task3");
                List<String> tasks = jedis.lrange("tasks", 0, -1);
                System.out.println(tasks); // [task3, task2, task1]

                // Using transactions
                Transaction transaction = jedis.multi();
                transaction.set("key1", "value1");
                transaction.set("key2", "value2");
                List<Object> results = transaction.exec();
            }
        }
    }
}
```

## Production Best Practices

### Memory Management

```
┌─────────────────────────────────────────┐
│                                         │
│              Redis Instance             │
│                                         │
│  ┌─────────────┐     ┌─────────────┐   │
│  │             │     │             │   │
│  │  Used       │     │  Available  │   │
│  │  Memory     │     │  Memory     │   │
│  │             │     │             │   │
│  └─────────────┘     └─────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

- **Set maxmemory**: Limit Redis memory usage

  ```redis
  maxmemory 2gb
  ```

- **Configure eviction policy**: Determine how Redis removes keys when memory limit is reached

  ```redis
  maxmemory-policy allkeys-lru  # Least recently used keys are removed first
  ```

- **Use appropriate data structures**: Choose efficient data structures for your use case

- **Monitor memory usage**: Regularly check memory consumption
  ```redis
  INFO memory
  ```

### Connection Management

- **Use connection pooling**: Reuse connections instead of creating new ones for each operation

- **Set connection limits**: Prevent resource exhaustion

  ```redis
  timeout 300           # Close idle connections after 300 seconds
  tcp-keepalive 60      # TCP keepalive every 60 seconds
  ```

- **Monitor connections**: Track active connections
  ```redis
  CLIENT LIST
  INFO clients
  ```

### Security Best Practices

- **Set strong passwords**:

  ```redis
  requirepass "strong_password_here"
  ```

- **Bind to specific interfaces**:

  ```redis
  bind 127.0.0.1 192.168.1.100
  ```

- **Disable dangerous commands**:

  ```redis
  rename-command FLUSHALL ""
  rename-command CONFIG ""
  ```

- **Enable TLS/SSL for encrypted connections**:
  ```redis
  tls-port 6380
  tls-cert-file /path/to/cert.crt
  tls-key-file /path/to/cert.key
  tls-ca-cert-file /path/to/ca.crt
  ```

## Monitoring and Maintenance

### Monitoring Redis

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Redis Server   │────►│  Monitoring     │
│                 │     │  System         │
└─────────────────┘     └─────────────────┘
        │                        │
        │                        │
        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Metrics        │     │  Alerts         │
│  Dashboard      │     │  Notifications  │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

#### Key Metrics to Monitor

- **Memory usage**: Track memory consumption and fragmentation

  ```redis
  INFO memory
  ```

- **CPU usage**: Monitor CPU utilization

  ```redis
  INFO cpu
  ```

- **Connections**: Track client connections

  ```redis
  INFO clients
  ```

- **Command statistics**: Monitor command execution

  ```redis
  INFO commandstats
  ```

- **Keyspace statistics**: Track database size and key expiration
  ```redis
  INFO keyspace
  ```

#### Monitoring Tools

- **Redis CLI**: Built-in monitoring

  ```bash
  redis-cli --stat
  redis-cli monitor
  ```

- **Redis Exporter + Prometheus + Grafana**: Comprehensive monitoring stack
- **Redis Insight**: GUI for Redis monitoring and management
- **Datadog/New Relic**: SaaS monitoring solutions with Redis integration

### Maintenance Tasks

- **Regular backups**: Schedule RDB snapshots

  ```bash
  # Backup script example
  redis-cli SAVE
  cp /var/lib/redis/dump.rdb /backup/redis-$(date +%Y%m%d).rdb
  ```

- **Configuration tuning**: Regularly review and optimize configuration

  ```bash
  redis-cli CONFIG GET *
  ```

- **Version upgrades**: Keep Redis updated with security patches
  ```bash
  # Example upgrade process (Ubuntu)
  sudo service redis-server stop
  sudo apt update
  sudo apt upgrade redis-server
  sudo service redis-server start
  ```

## Common Use Cases

### Caching

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Client     │────►│  Redis      │────►│  Database   │
│  Request    │     │  Cache      │     │             │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                   │
       │                   │
       └───────────────────┘
         Cache Hit Response
```

**Implementation Example:**

```javascript
async function getUser(userId) {
  // Try to get from cache first
  const cachedUser = await redisClient.get(`user:${userId}`);

  if (cachedUser) {
    // Cache hit
    return JSON.parse(cachedUser);
  }

  // Cache miss - get from database
  const user = await database.getUser(userId);

  // Store in cache for future requests (expire after 1 hour)
  await redisClient.set(`user:${userId}`, JSON.stringify(user), { EX: 3600 });

  return user;
}
```

### Session Storage

```
┌─────────────┐     ┌─────────────┐
│             │     │             │
│  Web        │     │  Redis      │
│  Server     │◄────►  Session    │
│             │     │  Store      │
└─────────────┘     └─────────────┘
```

**Implementation Example (Express.js):**

```javascript
const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const redis = require("redis");

const app = express();
const redisClient = redis.createClient();

// Initialize store
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "session:",
  ttl: 86400, // 1 day in seconds
});

// Configure session middleware
app.use(
  session({
    store: redisStore,
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, maxAge: 86400000 }, // 1 day in milliseconds
  })
);

app.get("/profile", (req, res) => {
  // Access session data
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.send(`Welcome ${req.session.user.name}!`);
});
```

### Rate Limiting

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Client     │────►│  Rate       │────►│  API        │
│  Request    │     │  Limiter    │     │  Endpoint   │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          │
                    ┌─────▼─────┐
                    │           │
                    │  Redis    │
                    │           │
                    └───────────┘
```

**Implementation Example:**

```javascript
const rateLimit = async (userId, endpoint, limit, period) => {
  const key = `ratelimit:${userId}:${endpoint}`;

  // Get current count
  let count = await redisClient.get(key);

  if (!count) {
    // First request in this period
    await redisClient.set(key, 1, { EX: period });
    return true;
  }

  count = parseInt(count);

  if (count < limit) {
    // Increment count
    await redisClient.incr(key);
    return true;
  }

  // Rate limit exceeded
  return false;
};

// Usage
app.get("/api/resource", async (req, res) => {
  const userId = req.user.id;
  const allowed = await rateLimit(userId, "resource", 100, 3600); // 100 requests per hour

  if (!allowed) {
    return res.status(429).send("Too Many Requests");
  }

  // Process the request
  res.send("Resource data");
});
```

### Pub/Sub Messaging

```
┌─────────────┐     ┌─────────────┐
│             │     │             │
│  Publisher  │────►│  Redis      │
│             │     │  Server     │
└─────────────┘     └─────┬───────┘
                          │
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
      ┌─────────────┐         ┌─────────────┐
      │             │         │             │
      │ Subscriber 1│         │ Subscriber 2│
      │             │         │             │
      └─────────────┘         └─────────────┘
```

**Implementation Example:**

```javascript
// Publisher
const publishMessage = async (channel, message) => {
  await redisClient.publish(channel, JSON.stringify(message));
};

// Subscriber
const subscribe = async (channel, callback) => {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();

  await subscriber.subscribe(channel, (message) => {
    const data = JSON.parse(message);
    callback(data);
  });

  return subscriber;
};

// Usage
// In one service
publishMessage("user-events", {
  type: "USER_CREATED",
  data: { id: 123, name: "John" },
});

// In another service
subscribe("user-events", (message) => {
  if (message.type === "USER_CREATED") {
    // Handle user creation event
    console.log(`New user created: ${message.data.name}`);
  }
});
```

## Conclusion

Redis is a versatile and powerful in-memory data store that can significantly enhance application performance and enable complex distributed system patterns. By understanding its core concepts, data structures, and best practices, you can effectively leverage Redis in your applications from development to production environments.

Remember to:

- Choose the right data structures for your use case
- Implement proper persistence strategies
- Configure high availability for production
- Monitor performance metrics
- Follow security best practices

With these guidelines, you can successfully integrate Redis into your application architecture and take advantage of its speed and flexibility.

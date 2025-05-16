# JWT Authentication Flow Diagram

## Complete Authentication Flow

```
┌─────────────────┐                                              ┌─────────────────┐
│                 │                                              │                 │
│     Client      │                                              │     Server      │
│                 │                                              │                 │
└────────┬────────┘                                              └────────┬────────┘
         │                                                                │
         │                                                                │
         │  1. REGISTRATION REQUEST                                       │
         │  POST /api/auth/register                                       │
         │  {username, email, password}                                   │
         │ ─────────────────────────────────────────────────────────────► │
         │                                                                │
         │                                                                │
         │  2. Validate input                                             │
         │  3. Check if user exists                                       │
         │  4. Hash password                                              │
         │  5. Create user in database                                    │
         │                                                                │
         │  6. REGISTRATION RESPONSE                                      │
         │  {user data without password}                                  │
         │ ◄───────────────────────────────────────────────────────────── │
         │                                                                │
         │                                                                │
         │  7. LOGIN REQUEST                                              │
         │  POST /api/auth/login                                          │
         │  {email/username, password}                                    │
         │ ─────────────────────────────────────────────────────────────► │
         │                                                                │
         │                                                                │
         │  8. Find user in database                                      │
         │  9. Verify password                                            │
         │  10. Generate access token                                     │
         │  11. Generate refresh token                                    │
         │  12. Save refresh token in database                            │
         │                                                                │
         │  13. LOGIN RESPONSE                                            │
         │  {user, accessToken, refreshToken}                             │
         │  + Set HTTP-only cookies                                       │
         │ ◄───────────────────────────────────────────────────────────── │
         │                                                                │
         │  14. Store access token in memory                              │
         │  15. Refresh token stored in HTTP-only cookie                  │
         │                                                                │
         │                                                                │
         │  16. PROTECTED RESOURCE REQUEST                                │
         │  GET /api/user/profile                                         │
         │  Authorization: Bearer {accessToken}                           │
         │ ─────────────────────────────────────────────────────────────► │
         │                                                                │
         │                                                                │
         │  17. Verify access token                                       │
         │  18. Find user from token                                      │
         │  19. Attach user to request                                    │
         │  20. Process request                                           │
         │                                                                │
         │  21. PROTECTED RESOURCE RESPONSE                               │
         │  {protected data}                                              │
         │ ◄───────────────────────────────────────────────────────────── │
         │                                                                │
         │                                                                │
         │  22. ACCESS TOKEN EXPIRES                                      │
         │                                                                │
         │  23. REFRESH TOKEN REQUEST                                     │
         │  POST /api/auth/refresh                                        │
         │  Cookie: refreshToken={refreshToken}                           │
         │ ─────────────────────────────────────────────────────────────► │
         │                                                                │
         │                                                                │
         │  24. Verify refresh token                                      │
         │  25. Check if token matches stored token                       │
         │  26. Generate new access token                                 │
         │  27. Generate new refresh token (token rotation)               │
         │  28. Update stored refresh token                               │
         │                                                                │
         │  29. REFRESH TOKEN RESPONSE                                    │
         │  {accessToken, refreshToken}                                   │
         │  + Set HTTP-only cookies                                       │
         │ ◄───────────────────────────────────────────────────────────── │
         │                                                                │
         │  30. Update access token in memory                             │
         │  31. Refresh token updated in HTTP-only cookie                 │
         │                                                                │
         │                                                                │
         │  32. LOGOUT REQUEST                                            │
         │  POST /api/auth/logout                                         │
         │  Authorization: Bearer {accessToken}                           │
         │ ─────────────────────────────────────────────────────────────► │
         │                                                                │
         │                                                                │
         │  33. Identify user from token                                  │
         │  34. Remove refresh token from database                        │
         │                                                                │
         │  35. LOGOUT RESPONSE                                           │
         │  + Clear HTTP-only cookies                                     │
         │ ◄───────────────────────────────────────────────────────────── │
         │                                                                │
         │  36. Remove access token from memory                           │
         │  37. Cookies cleared automatically                             │
         │                                                                │
```

## Token Generation and Verification

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         ACCESS TOKEN GENERATION                         │
│                                                                         │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│  │                 │     │                 │     │                 │   │
│  │   User Data     │     │  JWT Signing    │     │  Access Token   │   │
│  │ - User ID       │ ──► │ - Add payload   │ ──► │                 │   │
│  │ - Email         │     │ - Add expiry    │     │ xxxxx.yyyyy.zzzzz   │
│  │ - Username      │     │ - Sign with     │     │                 │   │
│  │                 │     │   secret key    │     │                 │   │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        REFRESH TOKEN GENERATION                         │
│                                                                         │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│  │                 │     │                 │     │                 │   │
│  │   User Data     │     │  JWT Signing    │     │ Refresh Token   │   │
│  │ - User ID only  │ ──► │ - Add payload   │ ──► │                 │   │
│  │                 │     │ - Add expiry    │     │ xxxxx.yyyyy.zzzzz   │
│  │                 │     │ - Sign with     │     │                 │   │
│  │                 │     │   different     │     │                 │   │
│  │                 │     │   secret key    │     │                 │   │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                          TOKEN VERIFICATION                             │
│                                                                         │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│  │                 │     │                 │     │                 │   │
│  │  Incoming JWT   │     │  JWT Verify     │     │  Decoded Token  │   │
│  │                 │ ──► │ - Check signature│ ──► │ - User ID       │   │
│  │ xxxxx.yyyyy.zzzzz     │ - Verify expiry │     │ - Email         │   │
│  │                 │     │ - Decode payload│     │ - Username      │   │
│  │                 │     │                 │     │ - Expiry time   │   │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘   │
│                                │                                        │
│                                │                                        │
│                                ▼                                        │
│                      ┌─────────────────┐                               │
│                      │                 │                               │
│                      │  Database Check │                               │
│                      │ - Find user     │                               │
│                      │ - Verify token  │                               │
│                      │   (for refresh) │                               │
│                      │                 │                               │
│                      └─────────────────┘                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Token Storage and Security

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           CLIENT-SIDE STORAGE                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                 │   │
│  │                         WEB BROWSER                             │   │
│  │                                                                 │   │
│  │   ┌─────────────────┐            ┌─────────────────────────┐   │   │
│  │   │                 │            │                         │   │   │
│  │   │   Memory/State  │            │     HTTP-only Cookie    │   │   │
│  │   │                 │            │                         │   │   │
│  │   │  Access Token   │            │     Refresh Token       │   │   │
│  │   │                 │            │                         │   │   │
│  │   │ - Short-lived   │            │  - Longer-lived         │   │   │
│  │   │ - Not accessible│            │  - Not accessible by    │   │   │
│  │   │   from disk     │            │    JavaScript           │   │   │
│  │   │ - Lost on page  │            │  - Sent automatically   │   │   │
│  │   │   refresh       │            │    with requests to     │   │   │
│  │   │                 │            │    same domain          │   │   │
│  │   └─────────────────┘            └─────────────────────────┘   │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           SERVER-SIDE STORAGE                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                 │   │
│  │                           DATABASE                              │   │
│  │                                                                 │   │
│  │   ┌─────────────────────────────────────────────────────────┐  │   │
│  │   │                                                         │  │   │
│  │   │                      USER DOCUMENT                      │  │   │
│  │   │                                                         │  │   │
│  │   │  {                                                      │  │   │
│  │   │    "_id": "user_id",                                    │  │   │
│  │   │    "username": "user",                                  │  │   │
│  │   │    "email": "user@example.com",                         │  │   │
│  │   │    "password": "$2b$10$hashed_password",                │  │   │
│  │   │    "refreshToken": "refresh_token_value",               │  │   │
│  │   │    "createdAt": "2023-01-01T00:00:00.000Z",             │  │   │
│  │   │    "updatedAt": "2023-01-01T12:00:00.000Z"              │  │   │
│  │   │  }                                                      │  │   │
│  │   │                                                         │  │   │
│  │   └─────────────────────────────────────────────────────────┘  │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           TOKEN LIFECYCLE                               │
│                                                                         │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐             │
│  │             │      │             │      │             │             │
│  │   Creation  │ ───► │    Usage    │ ───► │  Expiration │             │
│  │             │      │             │      │             │             │
│  └─────────────┘      └─────────────┘      └──────┬──────┘             │
│                                                   │                     │
│                                                   │                     │
│                                                   ▼                     │
│                                            ┌─────────────┐              │
│                                            │             │              │
│                                            │   Refresh   │              │
│                                            │             │              │
│                                            └──────┬──────┘              │
│                                                   │                     │
│                                                   │                     │
│                                                   ▼                     │
│                                            ┌─────────────┐              │
│                                            │             │              │
│                                            │ Invalidation│              │
│                                            │  (Logout)   │              │
│                                            │             │              │
│                                            └─────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Security Considerations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        SECURITY CONSIDERATIONS                          │
│                                                                         │
│  ┌─────────────────────────┐      ┌─────────────────────────────────┐  │
│  │                         │      │                                 │  │
│  │    TOKEN PROTECTION     │      │       TRANSPORT SECURITY        │  │
│  │                         │      │                                 │  │
│  │ • Access token in memory│      │ • HTTPS only in production      │  │
│  │ • Refresh token in      │      │ • Secure cookie flag            │  │
│  │   HTTP-only cookie      │      │ • SameSite cookie attribute     │  │
│  │ • Different secrets for │      │ • CORS configuration            │  │
│  │   each token type       │      │                                 │  │
│  │                         │      │                                 │  │
│  └─────────────────────────┘      └─────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────┐      ┌─────────────────────────────────┐  │
│  │                         │      │                                 │  │
│  │    TOKEN MANAGEMENT     │      │         ATTACK PREVENTION       │  │
│  │                         │      │                                 │  │
│  │ • Short access token    │      │ • Rate limiting                 │  │
│  │   lifetime              │      │ • Token validation              │  │
│  │ • Token rotation        │      │ • CSRF protection               │  │
│  │ • Proper invalidation   │      │ • XSS protection                │  │
│  │   on logout             │      │ • Input validation              │  │
│  │ • Blacklisting for      │      │                                 │  │
│  │   critical operations   │      │                                 │  │
│  │                         │      │                                 │  │
│  └─────────────────────────┘      └─────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
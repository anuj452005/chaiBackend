# JWT Authentication Flow Documentation

This document provides a comprehensive explanation of the JWT-based authentication system implemented in this application. The sections below detail the complete flow for user registration, login, token verification, and refresh token management.

## Authentication Flows

### Registration Flow

**Process Overview:**

1. Client submits registration data to server
2. Server validates and creates new user account
3. Server generates authentication tokens
4. Client stores tokens securely

**Detailed Flow:**

1. **Client Initiates Registration**

   - User fills out registration form with username, email, password, etc.
   - Client sends POST request to `/api/v1/users/register` with user data

2. **Server Processes Registration**

   - Server checks if username/email already exists in database
   - If user exists: Returns 409 Conflict with message "User already exists"
   - If new user:
     - Server hashes password using bcrypt with salt rounds
     - Server saves new user record with hashed password in MongoDB
     - Database returns confirmation and user ID

3. **Token Generation**

   - Server generates access token (JWT, short-lived)
   - Server generates refresh token (longer-lived)
   - Server returns 201 Created with tokens and user info

4. **Client-side Storage**
   - Client stores tokens securely (HTTP-only cookies or secure storage)
   - User is now registered and authenticated

### Login Flow

**Process Overview:**

1. Client submits login credentials
2. Server authenticates user
3. Server generates new authentication tokens
4. Client stores tokens securely

**Detailed Flow:**

1. **Client Initiates Login**

   - User enters username/email and password
   - Client sends POST request to `/api/v1/users/login` with credentials

2. **Server Authenticates User**

   - Server queries database for user by username/email
   - If user not found: Returns 404 Not Found with message "User not found"
   - If user found:
     - Server compares submitted password with stored hash using bcrypt.compare()
     - If password incorrect: Returns 401 Unauthorized with message "Invalid credentials"

3. **Token Generation**

   - If authentication successful:
     - Server generates new access token (JWT)
     - Server generates new refresh token
     - Server optionally stores refresh token with user record in database
     - Server returns 200 OK with tokens and user info

4. **Client-side Storage**
   - Client stores tokens securely
   - User is now authenticated

### Token Verification & Protected Resource Access

**Process Overview:**

1. Client requests protected resource with access token
2. Server verifies token validity
3. Server returns requested resource if authorized

**Detailed Flow:**

1. **Client Requests Protected Resource**

   - Client includes access token in request header
   - Format: `Authorization: Bearer {accessToken}`
   - Client sends request to protected endpoint (e.g., GET `/api/v1/protected-resource`)

2. **Server Verifies Token**

   - Server extracts token from Authorization header
   - Server verifies JWT signature using secret key
   - Server checks token expiration

3. **Resource Access**
   - If token invalid/expired: Returns 401 Unauthorized with message "Invalid or expired token"
   - If token valid:
     - Server processes the request (e.g., fetches requested data from database)
     - Server returns 200 OK with requested data

### Refresh Token Flow

**Process Overview:**

1. Access token expires
2. Client uses refresh token to obtain new access token
3. Server verifies refresh token and issues new tokens

**Detailed Flow:**

1. **Client Detects Expired Access Token**

   - Client receives 401 Unauthorized from a protected resource request
   - Client initiates token refresh process

2. **Client Requests Token Refresh**

   - Client sends POST request to `/api/v1/refresh-token` with refresh token

3. **Server Processes Refresh Request**

   - Server verifies refresh token signature and expiration
   - Server checks if refresh token is valid and not revoked in database
   - If refresh token invalid/revoked: Returns 401 Unauthorized with message "Invalid refresh token"

4. **New Token Generation**

   - If refresh token valid:
     - Server generates new access token
     - Server optionally generates new refresh token
     - Server optionally updates stored refresh token in database
     - Server returns 200 OK with new tokens

5. **Client Updates Tokens**
   - Client stores new tokens
   - Client retries original request with new access token

## Implementation Details

The authentication flow is implemented using the following technologies and methods:

1. **Password Hashing**: Using bcrypt with salt rounds for secure password storage
2. **JWT Tokens**:
   - Access tokens: Short-lived (typically 15min-1hr)
   - Refresh tokens: Longer-lived (typically 7-30 days)
3. **Token Storage**:
   - Client-side: HTTP-only cookies or secure local storage
   - Server-side: Refresh tokens stored in database for additional security

## Security Considerations

- Access tokens have limited lifespan to reduce risk if compromised
- Refresh tokens can be revoked server-side if needed
- Passwords are never stored in plain text
- All API endpoints that handle authentication use HTTPS
- Sensitive user data is not included in JWT payload
- Rate limiting is implemented on authentication endpoints to prevent brute force attacks

# User Model Authentication Explained

This document explains the authentication mechanisms implemented in the Mongoose `User` model. These methods are crucial for securing user accounts and managing access to the application.

## Key Authentication Methods

Our `User` model includes several important methods to handle user authentication:

1.  **Password Hashing (Pre-save Hook):**

    - **What it does:** Before a new user's information is saved to the database, or when a user updates their password, this function automatically takes the plain-text password and converts it into a secure, unreadable format called a hash. This is done using the `bcrypt` library.
    - **Why it's important:** We never store passwords directly. If our database were ever compromised, attackers wouldn't be able to see the actual passwords, only the scrambled hashes. This significantly protects user accounts.
    - **How it works:** It uses a `pre("save", ...)` Mongoose middleware. If the password field has been modified, it hashes the password with `bcrypt.hash()` before saving.

2.  **Password Checking (`isPasswordCorrect` method):**

    - **What it does:** When a user tries to log in, they provide their password. This method takes that provided password, hashes it using the same `bcrypt` algorithm, and then compares it to the hashed password stored in the database for that user.
    - **Why it's important:** This is how we verify if the password entered during login is correct without ever needing to know or store the original password.
    - **How it works:** It uses `bcrypt.compare()` to compare the input password with the stored hashed password. It returns `true` if they match, and `false` otherwise.

3.  **Access Token Generation (`generateAccessToken` method):**

    - **What it does:** Once a user successfully logs in (meaning their password was correct), this method creates a special, short-lived digital key called an Access Token. This token contains some basic, non-sensitive information about the user (like their ID, email, and username).
    - **Why it's important:** Instead of sending their username and password with every request to access protected parts of the application, the user's browser/app sends this Access Token. The server can quickly verify the token to grant access. Access tokens are usually short-lived (e.g., 15 minutes to a few hours) to limit the damage if one is stolen.
    - **How it works:** It uses `jsonwebtoken` (jwt) to sign a payload (user information) with a secret key (`ACCESS_TOKEN_SECRET` from environment variables) and sets an expiration time (`ACCESS_TOKEN_EXPIRY`).

4.  **Refresh Token Generation (`generateRefreshToken` method):**
    - **What it does:** Along with the Access Token, this method generates another, longer-lived digital key called a Refresh Token. This token usually only contains the user's ID.
    - **Why it's important:** Since Access Tokens expire quickly, we need a way for users to get a new Access Token without having to log in again every time. When the Access Token expires, the application can send the Refresh Token to a special endpoint. If the Refresh Token is valid and hasn't expired, the server issues a new Access Token.
    - **How it works:** It uses `jsonwebtoken` (jwt) to sign a payload (just the user ID) with a different secret key (`REFRESH_TOKEN_SECRET` from environment variables) and sets a longer expiration time (`REFRESH_TOKEN_EXPIRY`).

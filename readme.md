# How It Works
## Signup:

    Accepts username, email, and password from the client.
    Hashes the password using bcrypt and stores it in MongoDB.

## Signin:

    Accepts email and password.
    Verifies the password against the stored hash and returns success.

## Forgot Password:

    Generates a JWT token, stores it in the user record, and emails it.
    Token expires in 1 hour.

## Reset Password:

    Validates the token.
    Hashes the new password and updates the user's record.


# Testing
    Use Postman or cURL to test the endpoints:
        POST /auth/signup
        POST /auth/signin
        POST /auth/forgot-password
        POST /auth/reset-password
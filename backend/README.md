# FastAPI Backend - User Login System

A FastAPI backend for user login authentication using the users_4syz collection in MongoDB.

## Features

- **FastAPI** - Modern, fast web framework for building APIs
- **MongoDB** - NoSQL database with Motor async driver
- **Pydantic** - Data validation and serialization
- **JWT Authentication** - Secure token-based authentication with access/refresh token pattern
- **Token Blacklisting** - Secure logout functionality
- **CORS** - Cross-origin resource sharing enabled
- **Email Validation** - Only @4syz.com domain emails are accepted
- **Secure Password Hashing** - bcrypt with pepper for maximum security
- **Token Refresh** - Automatic token renewal system

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── config.py               # Environment configuration
├── database.py             # MongoDB connection
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
├── auth/                   # Authentication system
│   ├── __init__.py
│   ├── auth_utils.py       # JWT and token utilities
│   ├── dependencies.py     # Auth dependencies
│   ├── routes.py           # Auth endpoints
│   └── token_blacklist.py  # Token blacklist for logout
├── models/                 # Pydantic models
│   ├── __init__.py
│   └── foursyz/           # FourSyz specific models
│       ├── __init__.py
│       └── users_4syz.py  # Users4syz collection models
└── README.md              # This file
```

## Database Schema

The `users_4syz` collection contains the following fields:
- `username` - User's username
- `email` - User's email (must be @4syz.com domain)
- `password` - Hashed password
- `designation` - User's job designation
- `date_of_joining` - Date when user joined
- `date_of_relieving` - Date when user left (optional)
- `active` - Whether user account is active
- `notes` - Additional notes (optional)

## Model Classes

- `Users4syzLogin` - Login request validation
- `Users4syzResponse` - User data response
- `Users4syzLoginResponse` - Login API response
- `Users4syzCreate` - Create user request validation
- `Users4syzCreateResponse` - Create user API response
- `Users4syzLogoutResponse` - Logout API response
- `Users4syz` - Complete user model

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start MongoDB:**
   Make sure MongoDB is running on `localhost:27017`

3. **Environment Variables:**
   Create a `.env` file with:
   ```
   # Database Configuration
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=infotech4syz
   
       # JWT Configuration
    SECRET_KEY=your-super-secret-key-change-this-in-production-environment
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    REFRESH_TOKEN_EXPIRE_DAYS=7
    
    # Password Security
    BCRYPT_ROUNDS=12
    PEPPER=your-pepper-key-change-this-in-production
   
   # API Configuration
   API_BASE_URL=http://localhost:8000
   FRONTEND_URL=http://localhost:3000
   
   # Server Configuration
   HOST=0.0.0.0
   PORT=8000
   DEBUG=False
   
   # Optional: Additional CORS origins (comma-separated)
   ADDITIONAL_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
   ```

       **Environment Variable Details:**
    - `MONGODB_URL`: MongoDB connection string
    - `DATABASE_NAME`: Database name (default: infotech4syz)
    - `SECRET_KEY`: Secret key for JWT token signing
    - `ACCESS_TOKEN_EXPIRE_MINUTES`: Access token expiration time (default: 30 minutes)
    - `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration time (default: 7 days)
    - `BCRYPT_ROUNDS`: bcrypt rounds for password hashing (default: 12)
    - `PEPPER`: Additional secret for password hashing
    - `API_BASE_URL`: Base URL for the API (used for documentation)
    - `FRONTEND_URL`: Frontend URL for CORS configuration
    - `HOST`: Server host (default: 0.0.0.0)
    - `PORT`: Server port (default: 8000)
    - `DEBUG`: Enable debug mode (default: False)
    - `ADDITIONAL_ORIGINS`: Additional CORS origins (comma-separated)

4. **Run the server:**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

## API Documentation

- **Interactive API docs:** `http://localhost:8000/docs`
- **ReDoc documentation:** `http://localhost:8000/redoc`

## API Endpoints

### Health & Info
- `GET /health` - Health check

### Authentication
- `POST /auth/login` - User login with email and password (returns access and refresh tokens)
- `POST /auth/refresh` - Refresh access token using refresh token
- `POST /auth/logout` - User logout (blacklists token)
- `GET /auth/me` - Get current authenticated user information

### User Management
- `POST /auth/users` - Create a new user

## Example Usage

### Health Check
```bash
curl http://localhost:8000/health
```

### User Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@4syz.com",
       "password": "your_password"
     }'
```

### Create User
```bash
curl -X POST "http://localhost:8000/auth/users" \
     -H "Content-Type: application/json" \
     -d '{
       "username": "newuser",
       "email": "newuser@4syz.com",
       "password": "password123",
       "designation": "Software Engineer",
       "date_of_joining": "2024-01-01T00:00:00",
       "active": true
     }'
```

### Logout
```bash
curl -X POST "http://localhost:8000/auth/logout" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Refresh Token
```bash
curl -X POST "http://localhost:8000/auth/refresh" \
     -H "Content-Type: application/json" \
     -d '{
       "refresh_token": "YOUR_REFRESH_TOKEN"
     }'
```

### Get Current User Info
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     http://localhost:8000/auth/me
```

## Response Format

### Successful Login
```json
{
  "status": "success",
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "user@4syz.com",
    "designation": "Software Engineer",
    "date_of_joining": "2024-01-01T00:00:00",
    "date_of_relieving": null,
    "active": true,
    "notes": null
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 1800
}
```

### Successful User Creation
```json
{
  "status": "success",
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "username": "newuser",
    "email": "newuser@4syz.com",
    "designation": "Software Engineer",
    "date_of_joining": "2024-01-01T00:00:00",
    "date_of_relieving": null,
    "active": true,
    "notes": null
  }
}
```

### Successful Logout
```json
{
  "status": "success",
  "message": "Successfully logged out"
}
```

### Error Response
```json
{
  "detail": "Invalid email or password"
}
```

### Token Expired Response
```json
{
  "detail": "Token has expired"
}
```

### Token Revoked Response
```json
{
  "detail": "Token has been revoked"
}
```

### Successful Token Refresh
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 1800
}
``` 
# Infotech4Syz Project

A full-stack web application with Next.js frontend and FastAPI backend for user authentication.

## Project Structure

```
infotech4syz/
├── frontend/          # Next.js application
│   ├── src/           # Source code
│   │   └── app/
│   │       └── foursyz/
│   │           └── login/  # Login page
│   ├── public/        # Static assets
│   ├── package.json   # Node.js dependencies
│   └── README.md      # Frontend documentation
├── backend/           # FastAPI backend
│   ├── main.py        # FastAPI application
│   ├── database.py    # Database connection
│   ├── requirements.txt # Python dependencies
│   └── README.md      # Backend documentation
└── README.md          # This file
```

## Quick Start

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /health` - Health check
- `POST /login` - User login with email and password
- `GET /users_4syz` - Get all active users

## API Documentation

- **Interactive docs:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## User Authentication

### Database Schema
The `users_4syz` collection contains:
- `username` - User's username
- `email` - User's email (must be @4syz.com domain)
- `password` - Hashed password
- `designation` - User's job designation
- `date_of_joining` - Date when user joined
- `date_of_relieving` - Date when user left (optional)
- `active` - Whether user is active
- `notes` - Additional notes (optional)

### Login Process
1. User enters email and password on login page
2. Email domain is validated (@4syz.com only)
3. Password is hashed and compared with database
4. User data is returned on successful login

## Technologies Used

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ESLint** - Code linting

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## Development

Both frontend and backend are configured for development with:
- Hot reloading
- CORS enabled for local development
- MongoDB integration
- Modern async/await patterns

## Next Steps

1. Start both servers
2. Access login page at `http://localhost:3000/foursyz/login`
3. Add users to the `users_4syz` collection in MongoDB
4. Test login functionality

For detailed setup instructions, see the individual README files in each directory. 
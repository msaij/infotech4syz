# Infotech4Syz Full-Stack Project

This project is a full-stack web application using a Django REST Framework (DRF) backend (with MySQL) and a Next.js frontend. It follows best practices for secure authentication, API integration, and modern web development.

## Features
- Django REST Framework backend with MySQL database
- Next.js frontend with React and Tailwind CSS
- Secure user authentication using DRF session authentication, CSRF protection, and HTTP-only cookies
- Seamless login/logout flow (no use of localStorage for tokens)
- Protected routes: users must be authenticated to access dashboard and other private pages
- Password reset and forgot password support
- Modern, responsive UI

## Getting Started

### Backend (Django)
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Configure your MySQL database settings in `backend/settings.py`.
3. Run migrations:
   ```bash
   python manage.py migrate
   ```
4. Start the backend server:
   ```bash
   python manage.py runserver
   ```

### Frontend (Next.js)
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env.local` file in the `frontend` directory and set:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow
- Login and session management use DRF session authentication with CSRF protection.
- All API requests from the frontend use `credentials: "include"` and send the CSRF token in the `X-CSRFToken` header.
- No authentication tokens are stored in localStorage.

## Deployment
- For production, set `DEBUG = False` and configure allowed hosts, CORS, and CSRF settings in Django.
- Use a production-ready database and email backend.
- Deploy the frontend using Vercel, Netlify, or your preferred platform.

## Learn More
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)

---

For any issues or contributions, please open an issue or pull request.

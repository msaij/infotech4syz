# Full Stack Django + Next.js + MySQL Project

## Overview
This project contains:
- **Backend:** Django REST Framework (DRF) with MySQL
- **Frontend:** Next.js (JavaScript, Tailwind CSS)

## Getting Started

### Backend (Django)
1. Set your MySQL credentials in your Django settings or environment variables.
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create migrations:
   ```bash
   python manage.py makemigrations
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend (Next.js)
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Authentication & API Integration
- The frontend consumes the REST API exposed by the Django backend.
- All authentication uses DRF's session authentication with secure HTTP-only cookies. No tokens are stored in localStorage.
- For login, POST username and password to `/api/session-login/` with the CSRF token in the `X-CSRFToken` header. On success, the session cookie is set.
- For logout, POST to `/api/session-logout/` with the CSRF token to clear the session.
- For authenticated requests, always include `credentials: "include"` and the CSRF token for unsafe methods (POST/PUT/DELETE).
- To check if a user is logged in, GET `/api/users/me/`.
- If a user is logged in, they are redirected away from `/login` to `/start/dashboard`. If not logged in, any `/start/*` route redirects to `/login`.
- The home page (`/`) redirects to dashboard if logged in.

## Customization
- Add your Django models, serializers, and views in the `api` app.
- Add your React components and pages in the `frontend/src/app` directory.

---

For more details, see the documentation for [Django REST Framework](https://www.django-rest-framework.org/) and [Next.js](https://nextjs.org/).

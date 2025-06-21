# Full Stack Django + Next.js + MySQL Project

## Overview
This project contains:
- **Backend:** Django REST Framework (DRF) with MySQL
- **Frontend:** Next.js (JavaScript, Tailwind CSS)

## Getting Started

### Backend (Django)
1. Create a `.env` file for your MySQL credentials.
2. Activate the virtual environment:
   ```bash
   source venv/Scripts/activate
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
2. Start the development server:
   ```bash
   npm run dev
   ```

## API Integration
- The frontend consumes the REST API exposed by the Django backend.
- Configure the API base URL by creating a `frontend/.env.local` file:
  ```
  NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
  ```
  All fetch requests reference this variable. For authenticated requests, fetch a CSRF token from `/api/csrf/` and include it as the `X-CSRFToken` header.

## Customization
- Add your Django models, serializers, and views in the `api` app.
- Add your React components and pages in the `frontend/src/app` directory.

---

For more details, see the documentation for [Django REST Framework](https://www.django-rest-framework.org/) and [Next.js](https://nextjs.org/).

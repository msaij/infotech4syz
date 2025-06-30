# DC Tracker - User Management & Real-Time Data Platform

A comprehensive user management and data tracking platform with role-based access control, real-time data capabilities, and advanced administrative features.

## Overview
This project contains:
- **Backend:** Django REST Framework (DRF) with MySQL
- **Frontend:** Next.js (JavaScript, Tailwind CSS)
- **API Service:** FastAPI for high-performance endpoints
- **Message Streaming:** Kafka for real-time data processing

## 🌟 Key Features

### Core Capabilities

### User Management
- **Admin Console**: Custom frontend user management interface
- **Role-Based Access Control**: Different permission levels for users
- **Secure Authentication**: User login with domain-based restrictions
- **User Administration**: Create, update, and manage user accounts

### DC Tracker
- **Real-Time Data**: Live data tracking and monitoring
- **CRUD Operations**: View, search, update, add, and delete records based on user roles
- **File Management**: Upload and store files remotely
- **Data Export**: Copy selected columns to clipboard for easy data transfer
- **Advanced Search**: Comprehensive search functionality

### Security & Access Control
- **Domain Restriction**: Access limited to `@4syz.com` domain users
- **Superadmin Override**: Superadmin users have unrestricted access to all pages
- **Protected Routes**: `/start/*` routes accessible only to authenticated users
- **Role-Based Permissions**: Different capabilities based on user roles

## 🏗️ Architecture & Scalability

### Microservices Architecture
- **Service Separation**: Django REST Framework, FastAPI, and Next.js deployed as independent services
- **Database Isolation**: External MySQL hosting for improved scalability and maintenance
- **Message Queue**: Kafka for asynchronous processing and service communication
- **Horizontal Scaling**: Each service can be scaled independently based on demand

### Performance & Reliability
- **Session-based Authentication**: Secure HTTP-only cookies eliminate token storage vulnerabilities
- **CSRF Protection**: Built-in protection against cross-site request forgery
- **API Versioning**: RESTful API design supports backward compatibility
- **File Storage**: Configurable storage solution for asset management

### Security Standards
- **Domain-based Access Control**: Restricts access to authorized email domains
- **Role-based Authorization**: Granular permissions system
- **Secure Headers**: CSRF tokens for all state-changing operations
- **Session Management**: Server-side session handling with automatic cleanup

## 🛠️ Technology Stack

### Backend Services
- **Django REST Framework**: API development and backend logic
- **FastAPI**: High-performance API endpoints
- **MySQL**: External hosted database
- **Kafka**: Message streaming and real-time data processing

### Frontend Application
- **Next.js**: React-based frontend framework with Tailwind CSS

### Data & Infrastructure
- **Docker**: Used for Kafka and Zookeeper services

## 🚀 Deployment & Operations

### Development Setup

## 📋 System Requirements

### Development Environment
- **Node.js**: Latest LTS version recommended
- **Python**: 3.8 or higher
- **Docker**: For Kafka infrastructure services
- **Database Access**: Connection to hosted MySQL instance

### Production Deployment Considerations
- **Load Balancing**: Configure reverse proxy (Nginx/Apache) for production
- **SSL/TLS**: Implement HTTPS for all communications
- **Database**: Use connection pooling and read replicas for high availability
- **Monitoring**: Implement logging and monitoring for all services
- **Backup Strategy**: Regular database backups and disaster recovery plan
- **Security**: Keep all dependencies updated and follow security best practices

### Quick Start Guide

1. **Repository Setup**
   ```bash
   git clone <repository-url>
   cd dc-tracker
   ```

2. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   # Configure your environment variables
   ```

3. **Start Kafka Services (Docker)**
   ```bash
   # Start Kafka and Zookeeper services
   docker-compose up kafka zookeeper -d
   ```

4. **Backend Setup (Django REST Framework)**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   uvicorn backend.asgi:application --host 127.0.0.1 --port 8000
   ```

5. **FastAPI Service Setup**
   ```bash
   cd fastapi-service
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

6. **Frontend Setup (Next.js)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. **Create Superuser**
   ```bash
   # Navigate to backend directory
   cd backend
   python manage.py createsuperuser
   ```

## 📁 Project Structure

```
├── backend/                 # Django REST Framework
├── frontend/               # Next.js application
├── fastapi-service/        # FastAPI microservice
├── docker-compose.yml      # Docker services configuration
├── requirements.txt        # Python dependencies
├── package.json           # Node.js dependencies
└── README.md             # Project documentation
```

## 🔐 Authentication & Authorization

### Authentication Flow
- The frontend consumes the REST API exposed by the Django backend
- All authentication uses DRF's session authentication with secure HTTP-only cookies (no tokens stored in localStorage)
- For login, POST username and password to `/api/session-login/` with the CSRF token in the `X-CSRFToken` header
- On successful login, the session cookie is set automatically
- For logout, POST to `/api/session-logout/` with the CSRF token to clear the session
- For authenticated requests, always include `credentials: "include"` and the CSRF token for unsafe methods (POST/PUT/DELETE)
- To check if a user is logged in, GET `/api/users/me/`

### Route Protection
- If a user is logged in, they are redirected away from `/login` to `/start/dashboard`
- If not logged in, any `/start/*` route redirects to `/login`
- The home page (`/`) redirects to dashboard if logged in

### User Access Rules
- Only users with `@4syz.com` email domain can access the platform
- Superadmin users have unrestricted access to all features
- Regular users have role-based access limitations
- All `/start/*` routes require authentication

### User Roles
- **Superadmin**: Full system access
- **Admin**: User management capabilities
- **User**: Limited access based on assigned permissions

## 🔧 Environment Configuration

### Required Environment Variables
```env
# Database Configuration
DB_HOST=your_hosted_mysql_host
DB_PORT=3306
DB_NAME=dc_tracker
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SSL_CA=/path/to/ca-cert.pem  # Optional: for SSL connections

# Application Security
SECRET_KEY=your_django_secret_key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,localhost

# Message Queue
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_TOPIC_PREFIX=dc_tracker

# File Storage Configuration
STORAGE_BACKEND=local  # Options: local, s3, azure, gcp (configurable)
# AWS S3 (if using S3)
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_STORAGE_BUCKET_NAME=your_bucket_name
# AWS_S3_REGION_NAME=your_region

# API Configuration
DJANGO_API_URL=http://localhost:8000
FASTAPI_URL=http://localhost:8001
NEXTJS_URL=http://localhost:3000

# CORS and Security
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
CSRF_TRUSTED_ORIGINS=http://localhost:3000,https://your-domain.com
```

## 📊 API Endpoints

### Authentication
- `POST /api/session-login/` - User login
- `POST /api/session-logout/` - User logout
- `GET /api/users/me/` - Get current user info

### User Management
- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

### DC Tracker
- `GET /api/tracker/data/` - Get tracker data
- `POST /api/tracker/data/` - Add new record
- `PUT /api/tracker/data/{id}/` - Update record
- `DELETE /api/tracker/data/{id}/` - Delete record
- `POST /api/tracker/upload/` - Upload files

## 🚦 Development

### Running Services

**Kafka Services (Docker)**
```bash
# Start Kafka and Zookeeper
docker-compose up kafka zookeeper -d
```

**Backend (Django REST Framework)**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
uvicorn backend.asgi:application --host 127.0.0.1 --port 8000
```

**FastAPI Service**
```bash
cd fastapi-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend (Next.js)**
```bash
cd frontend
npm install
npm run dev
```

## 🐳 Docker Services

Only Kafka and Zookeeper are containerized:

- **kafka**: Message streaming service
- **zookeeper**: Kafka dependency

*Note: Django REST Framework, FastAPI, Next.js, and MySQL are deployed as standalone services without Docker.*

### docker-compose.yml (Kafka Only)
```yaml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

## 📝 Customization
- Add your Django models, serializers, and views in the `api` app
- Add your React components and pages in the `frontend/src/app` directory
- Configure FastAPI endpoints in the `fastapi-service` directory

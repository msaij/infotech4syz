<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

<!-- Workspace-specific Copilot instructions for infotech4syz -->

- This project contains:
  - A Django REST Framework backend (with MySQL)
  - A FastAPI microservice for SSE (Server-Sent Events)
  - A Next.js frontend (TypeScript)

## General Best Practices
- Use environment variables for all secrets, credentials, and service URLs. Never hardcode sensitive data.
- Follow 12-factor app principles for configuration and deployment.
- Write clear, modular, and well-documented code.

## Django Backend
- Use Django REST Framework for all API endpoints.
- Use MySQL as the database backend; ensure all models and migrations are compatible.
- Organize models in `api/models/` submodules for clarity.
- Use serializers for all API data exchange.
- Use viewsets and routers for RESTful endpoints.
- Use `.env` or `config.env` for environment-specific settings.
- Write tests in `api/tests.py` and keep them up to date.

## FastAPI Microservice
- Use FastAPI for real-time features (SSE, etc.).
- Restrict access to local requests for development; document any changes for production.
- Use routers for modular API structure.
- Log errors and handle exceptions gracefully.
- Use environment variables for configuration.

## Next.js Frontend
- Use TypeScript and modern React best practices.
- Use environment variables for API URLs and secrets.
- Integrate with Django and FastAPI APIs using fetch/axios and handle errors gracefully.
- Organize code in `src/app/` and use modular components.
- Use ESLint and Prettier for code quality and formatting.

## API Integration
- Use OpenAPI/Swagger for backend API documentation.
- Ensure CORS is configured securely for production.
- Use token-based authentication (JWT or session) for protected endpoints.
- Validate all user input on both frontend and backend.

## Environment Configuration
- Use `.env` files for all services; never commit secrets to version control.
- Document required environment variables in `README.md`.
- Use Docker or virtual environments for local development if possible.

## Testing & Deployment
- Write and maintain tests for backend and frontend.
- Use CI/CD for automated testing and deployment.
- Ensure all services can be started independently for local development.

---
For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file

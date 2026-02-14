# Laravel Developer Technical Assessment

## Objective

Build a secure, API-driven User Management system using Laravel. The system must follow clean architecture principles, security best practices, and production-ready standards.
In addition to API endpoints, create simple frontend pages to access authentication and CRUD features.

---

## 1️⃣ Authentication System (API + Simple UI)

Implement full authentication using token-based access.

You may use:
- Laravel Sanctum (preferred)
- Laravel Passport (optional)

### Required API Features

- User Registration
- User Login
- Logout (invalidate token)
- Forgot Password (send reset email)
- Reset Password
- Protected routes via token authentication
- All endpoints must return JSON responses.

### Simple Frontend Pages (Blade or Minimal UI)

Create simple, clean pages to access:
- Login page
- Register page
- Forgot Password page
- Reset Password page
- Dashboard (after login)

The frontend can be:
- Blade templates (recommended for simplicity)
- OR simple Vue/React (optional)
- OR basic HTML forms consuming your own API

No heavy design required — functionality and structure are the priority.

---

## 2️⃣ User Management CRUD (API + UI)

Create a User Management module accessible only to authenticated users.

### Required API Endpoints

- Create User
- Get All Users (paginated)
- Get Single User
- Update User
- Delete User

### Simple CRUD Pages

Create a simple admin-style interface:
- Users List Page
- Create User Page
- Edit User Page
- Delete confirmation action

The UI should consume your own API endpoints (not bypass them).

---

## 3️⃣ Email System

- Configure proper mail driver
- Forgot Password must send reset email
- Use queue system for email sending (preferred for senior-level)
- Include mail configuration instructions in README

---

## 4️⃣ Security Requirements

- Token-based authentication
- Password hashing
- Input validation via Form Requests
- Prevent SQL injection
- Use Policies or middleware for authorization
- Hide sensitive fields
- Proper error handling
- Production-ready configuration (APP_DEBUG=false)

---

## 5️⃣ Architecture Expectations

Your implementation should demonstrate:
- Clean Controller structure
- Separation of concerns
- Service layer (if needed)
- Proper use of Resources
- Custom API responses
- Exception handling
- Middleware usage
- Organized folder structure
- Environment-based config

---

## 6️⃣ Bonus (Highly Recommended)

- Role-based access control (Admin/User)
- API rate limiting
- Unit & Feature tests
- Docker setup
- Postman collection
- Swagger/OpenAPI docs
- GitHub Actions CI/CD

---

## Deliverables

- GitHub Repository
- README.md including:
  - Installation steps
  - Environment setup
  - Migration commands
  - Mail setup
  - API endpoint documentation
  - Sample API requests/responses
- .env.example
- Migrations
- Seeders (optional)

---

## Evaluation Criteria

- Clean and maintainable code
- Security best practices
- API structure quality
- Proper validation
- Error handling quality
- Git commit quality
- Laravel conventions
- Scalability readiness
- UI consumes API properly

---

## Technical Stack

- Laravel (latest stable)
- MySQL or PostgreSQL
- Sanctum for authentication
- GitHub for version control

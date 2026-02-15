# User Management System

A secure, API-driven User Management system built with Laravel 12 and Sanctum. Features token-based authentication, role-based access control, queued email notifications, and a Blade frontend that consumes its own API.

## Tech Stack

- **Backend:** PHP 8.5, Laravel 12, Laravel Sanctum 4
- **Database:** PostgreSQL 18
- **Cache/Queue:** Redis
- **Frontend:** Blade templates, Bootstrap 5, Tailwind CSS 4, vanilla JS
- **Testing:** Pest 4
- **Containerization:** Docker via Laravel Sail

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Composer](https://getcomposer.org/) installed
- [Node.js](https://nodejs.org/) with pnpm (`npm install -g pnpm`)

## Installation

```bash
# 1. Clone the repository
git clone <repo-url> user-management
cd user-management

# 2. Install PHP dependencies
composer install

# 3. Copy environment file
cp .env.example .env

# 4. Generate application key
php artisan key:generate

# 5. Start Docker containers
./vendor/bin/sail up -d

# 6. Run migrations and seed the database
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan db:seed

# 7. Install frontend dependencies and build
./vendor/bin/sail shell
pnpm install
pnpm run build
exit
```

The application is now running at **http://localhost**.

## Environment Setup

### Database (Docker)

```env
DB_CONNECTION=pgsql
DB_HOST=pgsql
DB_PORT=5432
DB_DATABASE=user_management
DB_USERNAME=sail
DB_PASSWORD=password
```

### Redis / Queue

```env
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
REDIS_HOST=redis
```

### Mail (Gmail SMTP)

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD="your-16-char-app-password"
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

To get a Gmail app password: https://myaccount.google.com/apppasswords (requires 2FA enabled).

### Mail (Mailpit - Local Testing)

```env
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_FROM_ADDRESS="noreply@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

Mailpit inbox available at http://localhost:8025.

**Important:** The queue worker must be running for emails to send:

```bash
./vendor/bin/sail artisan queue:work
```

## Default Login

After seeding, an admin account is available:

- **Email:** `admin@example.com`
- **Password:** `password`

## Running Tests

```bash
./vendor/bin/sail artisan test --compact
```

To run a specific test:

```bash
./vendor/bin/sail artisan test --compact --filter=testName
```

## Project Structure

```
app/
├── Enums/
│   └── UserRole.php                  # Admin, User roles
├── Http/
│   ├── Controllers/
│   │   ├── Api/V1/
│   │   │   ├── AuthController.php    # Auth endpoints
│   │   │   └── UserController.php    # CRUD endpoints
│   │   └── Web/
│   │       ├── AuthViewController.php
│   │       ├── DashboardController.php
│   │       └── UserViewController.php
│   ├── Middleware/
│   │   └── EnsureUserIsAdmin.php
│   ├── Requests/
│   │   ├── Auth/                     # Login, Register, ForgotPassword, ResetPassword
│   │   └── User/                     # StoreUser, UpdateUser
│   └── Resources/
│       └── UserResource.php
├── Models/
│   └── User.php
├── Notifications/
│   └── ResetPasswordNotification.php # Queued password reset email
└── Policies/
    └── UserPolicy.php                # RBAC authorization
```

## API Documentation

Base URL: `http://localhost/api/v1`

All API endpoints return JSON responses. Protected endpoints require a Bearer token in the `Authorization` header.

### Authentication

#### Register

```
POST /api/v1/register
```

**Request:**

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

**Response (201):**

```json
{
    "message": "User registered successfully.",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "created_at": "2026-02-15T10:00:00.000000Z",
        "updated_at": "2026-02-15T10:00:00.000000Z"
    },
    "token": "1|abc123..."
}
```

#### Login

```
POST /api/v1/login
```

**Request:**

```json
{
    "email": "admin@example.com",
    "password": "password"
}
```

**Response (200):**

```json
{
    "message": "Login successful.",
    "user": {
        "id": 1,
        "name": "Admin",
        "email": "admin@example.com",
        "role": "admin",
        "created_at": "2026-02-15T10:00:00.000000Z",
        "updated_at": "2026-02-15T10:00:00.000000Z"
    },
    "token": "2|xyz789..."
}
```

#### Logout

```
POST /api/v1/logout
Authorization: Bearer {token}
```

**Response (200):**

```json
{
    "message": "Logged out successfully."
}
```

#### Get Authenticated User

```
GET /api/v1/user
Authorization: Bearer {token}
```

**Response (200):**

```json
{
    "data": {
        "id": 1,
        "name": "Admin",
        "email": "admin@example.com",
        "role": "admin",
        "created_at": "2026-02-15T10:00:00.000000Z",
        "updated_at": "2026-02-15T10:00:00.000000Z"
    }
}
```

#### Forgot Password

```
POST /api/v1/forgot-password
```

**Request:**

```json
{
    "email": "john@example.com"
}
```

**Response (200):**

```json
{
    "message": "We have emailed your password reset link."
}
```

#### Reset Password

```
POST /api/v1/reset-password
```

**Request:**

```json
{
    "token": "reset-token-from-email",
    "email": "john@example.com",
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
}
```

**Response (200):**

```json
{
    "message": "Your password has been reset."
}
```

### User Management (Requires Authentication)

All user endpoints require `Authorization: Bearer {token}` header.

#### List Users (Paginated)

```
GET /api/v1/users?page=1&search=john
Authorization: Bearer {token}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `search` | string | Search by name or email (optional) |

**Response (200):**

```json
{
    "data": [
        {
            "id": 1,
            "name": "Admin",
            "email": "admin@example.com",
            "role": "admin",
            "created_at": "2026-02-15T10:00:00.000000Z",
            "updated_at": "2026-02-15T10:00:00.000000Z"
        }
    ],
    "links": {
        "first": "http://localhost/api/v1/users?page=1",
        "last": "http://localhost/api/v1/users?page=1",
        "prev": null,
        "next": null
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "per_page": 15,
        "to": 1,
        "total": 1
    }
}
```

#### Get Single User

```
GET /api/v1/users/{id}
Authorization: Bearer {token}
```

**Response (200):**

```json
{
    "data": {
        "id": 1,
        "name": "Admin",
        "email": "admin@example.com",
        "role": "admin",
        "created_at": "2026-02-15T10:00:00.000000Z",
        "updated_at": "2026-02-15T10:00:00.000000Z"
    }
}
```

#### Create User (Admin Only)

```
POST /api/v1/users
Authorization: Bearer {token}
```

**Request:**

```json
{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "user"
}
```

**Response (201):**

```json
{
    "message": "User created successfully.",
    "user": {
        "id": 2,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "user",
        "created_at": "2026-02-15T10:00:00.000000Z",
        "updated_at": "2026-02-15T10:00:00.000000Z"
    }
}
```

#### Update User (Admin or Self)

```
PUT /api/v1/users/{id}
Authorization: Bearer {token}
```

**Request:**

```json
{
    "name": "Jane Updated"
}
```

**Response (200):**

```json
{
    "message": "User updated successfully.",
    "user": {
        "id": 2,
        "name": "Jane Updated",
        "email": "jane@example.com",
        "role": "user",
        "created_at": "2026-02-15T10:00:00.000000Z",
        "updated_at": "2026-02-15T10:05:00.000000Z"
    }
}
```

#### Delete User (Admin Only, Cannot Delete Self)

```
DELETE /api/v1/users/{id}
Authorization: Bearer {token}
```

**Response (204):** No content.

### Error Responses

**Validation Error (422):**

```json
{
    "message": "The email field is required.",
    "errors": {
        "email": ["The email field is required."]
    }
}
```

**Unauthenticated (401):**

```json
{
    "message": "Unauthenticated."
}
```

**Forbidden (403):**

```json
{
    "message": "This action is unauthorized."
}
```

**Not Found (404):**

```json
{
    "message": "Resource not found."
}
```

## Security

- Token-based authentication via Laravel Sanctum
- Passwords hashed with bcrypt
- Input validation via Form Request classes
- SQL injection prevention via Eloquent ORM
- Role-based access control (Admin/User) via Policies
- Sensitive fields hidden from API responses (`password`, `remember_token`)
- API rate limiting (60 req/min general, 5 req/min for auth endpoints)
- Structured JSON error handling for all API responses

## Authorization Rules

| Action | Admin | Regular User |
|---|---|---|
| List users | Yes | Yes |
| View user | Yes | Yes |
| Create user | Yes | No |
| Update user | Yes | Self only |
| Delete user | Yes (not self) | No |

## Common Commands

```bash
# Start containers
./vendor/bin/sail up -d

# Stop containers
./vendor/bin/sail down

# Run migrations
./vendor/bin/sail artisan migrate

# Reset database (drop all tables, re-migrate, re-seed)
./vendor/bin/sail artisan migrate:fresh --seed

# Process queued jobs (emails)
./vendor/bin/sail artisan queue:work

# Run tests
./vendor/bin/sail artisan test --compact

# Build frontend
./vendor/bin/sail shell
pnpm run build
exit

# Start Vite dev server (hot reload)
./vendor/bin/sail shell
pnpm run dev
exit

# Code formatting
./vendor/bin/sail shell
vendor/bin/pint
exit
```

# User Management Application Documentation

## Overview

The User Management application is a comprehensive Laravel 12 API-driven system with a Blade-based frontend. It provides user authentication, role-based access control, and full CRUD operations for user management. The system uses token-based authentication via Laravel Sanctum and implements both API and web routes for complete user management functionality.

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Routes & Endpoints](#api-routes--endpoints)
6. [Web Routes](#web-routes)
7. [Frontend Architecture](#frontend-architecture)
8. [Installation & Setup](#installation--setup)
9. [Running Tests](#running-tests)
10. [Security Features](#security-features)
11. [Common Tasks](#common-tasks)

## Technology Stack

| Component | Version |
|-----------|---------|
| PHP | 8.5.2 |
| Laravel Framework | 12.51.0 |
| PostgreSQL | - |
| Laravel Sanctum | 4.3.1 |
| Tailwind CSS | 4 |
| Pest | 4 |
| Vite | - |

### Key Dependencies

- **Laravel Sanctum**: Token-based authentication for API endpoints
- **Pest**: Testing framework for unit and feature tests
- **Vite**: Frontend bundling and asset compilation
- **Tailwind CSS**: Utility-first CSS framework for styling

## Project Structure

```
app/
├── Enums/
│   └── UserRole.php                         # String-backed enum: Admin, User
│
├── Http/
│   ├── Controllers/
│   │   ├── Api/V1/
│   │   │   ├── AuthController.php           # register, login, logout, forgotPassword, resetPassword
│   │   │   └── UserController.php           # index, store, show, update, destroy
│   │   │
│   │   └── Web/
│   │       ├── AuthViewController.php       # Blade page rendering for auth
│   │       ├── DashboardController.php      # Dashboard page
│   │       └── UserViewController.php       # User CRUD pages
│   │
│   ├── Middleware/
│   │   └── EnsureUserIsAdmin.php            # Returns 403 if not admin
│   │
│   ├── Requests/
│   │   ├── Auth/
│   │   │   ├── LoginRequest.php
│   │   │   ├── RegisterRequest.php
│   │   │   ├── ForgotPasswordRequest.php
│   │   │   └── ResetPasswordRequest.php
│   │   │
│   │   └── User/
│   │       ├── StoreUserRequest.php
│   │       └── UpdateUserRequest.php
│   │
│   └── Resources/
│       └── UserResource.php                 # Returns: id, name, email, role, created_at, updated_at
│
├── Models/
│   └── User.php                             # HasApiTokens, role cast to UserRole enum
│
├── Notifications/
│   └── ResetPasswordNotification.php         # Queued password reset email
│
├── Policies/
│   └── UserPolicy.php                       # Authorization rules for User model
│
└── Providers/
    └── AppServiceProvider.php               # Rate limiters configuration
```

### Frontend Structure

```
resources/js/
├── app.js                                   # Entry point + page router
├── bootstrap.js                             # Axios setup
│
├── api/
│   └── client.js                            # API request helpers (apiRequest, publicRequest)
│
├── services/
│   └── auth.js                              # Token and user management
│
├── utils/
│   └── ui.js                                # UI helpers (showErrors, showSuccess, etc.)
│
└── pages/
    ├── auth/
    │   ├── login.js
    │   ├── register.js
    │   ├── forgot-password.js
    │   └── reset-password.js
    │
    └── users/
        ├── index.js
        ├── create.js
        └── edit.js
```

## Database Schema

### Users Table

The core `users` table structure:

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | bigint | No | Primary key, auto-increment |
| name | varchar(255) | No | User's full name |
| email | varchar(255) | No | Unique email address |
| email_verified_at | timestamp | Yes | NULL unless email verified |
| password | varchar(255) | No | Hashed password (bcrypt) |
| role | varchar(255) | No | Default: 'user'. Values: 'admin' \| 'user' |
| remember_token | varchar(100) | Yes | Password reset token |
| created_at | timestamp | No | Record creation time |
| updated_at | timestamp | No | Record update time |

### Related Tables

- **personal_access_tokens**: Stores Sanctum authentication tokens for API access
- **password_reset_tokens**: Stores temporary password reset tokens

## Authentication & Authorization

### User Roles

The application implements a two-tier role system via the `UserRole` enum:

```php
enum UserRole: string
{
    case Admin = 'admin';
    case User = 'user';
}
```

### Role-Based Permissions (UserPolicy)

| Action | Permission | Details |
|--------|-----------|---------|
| View Any Users | Any authenticated user | All users can view user list |
| View Single User | Any authenticated user | All users can view any user profile |
| Create User | Admin only | Only admins can create new users |
| Update User | Admin or self | Admins can update any user; users can update their own profile |
| Delete User | Admin only (not self) | Admins can delete users but cannot delete themselves |

### Authentication Flow

1. **Registration/Login**: User submits credentials to API endpoint
2. **Token Generation**: API returns a plain-text Sanctum token
3. **Token Storage**: JavaScript stores token in `localStorage` as `auth_token`
4. **API Requests**: All subsequent requests include `Authorization: Bearer {token}` header
5. **Token Validation**: Server validates token for each protected request
6. **401 Handling**: On 401 response, client clears token and redirects to `/login`
7. **Logout**: Client revokes token server-side and clears localStorage

### Helper Methods

The `User` model provides a helper method:

```php
public function isAdmin(): bool
{
    return $this->role === UserRole::Admin;
}
```

## API Routes & Endpoints

All API endpoints are prefixed with `/api/v1`.

### Public Endpoints (Throttled: 5 requests/minute)

#### POST /register

Register a new user account.

**Request:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

**Validation:**
- `name`: required, string, max 255 characters
- `email`: required, email format, unique in users table
- `password`: required, minimum 8 characters, must match password_confirmation

**Response (201 Created):**
```json
{
    "message": "User registered successfully.",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "created_at": "2026-02-15T10:00:00Z",
        "updated_at": "2026-02-15T10:00:00Z"
    },
    "token": "1|AbCdEfGhIjKlMnOpQrStUvWxYz"
}
```

#### POST /login

Authenticate user and receive access token.

**Request:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Validation:**
- `email`: required, email format
- `password`: required

**Response (200 OK):**
```json
{
    "message": "Login successful.",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "created_at": "2026-02-15T10:00:00Z",
        "updated_at": "2026-02-15T10:00:00Z"
    },
    "token": "2|XyZaBcDeFgHiJkLmNoPqRsTuVwX"
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
    "message": "The provided credentials are incorrect.",
    "errors": {
        "email": ["The provided credentials are incorrect."]
    }
}
```

#### POST /forgot-password

Initiate password reset process via email.

**Request:**
```json
{
    "email": "john@example.com"
}
```

**Validation:**
- `email`: required, email format

**Response (200 OK):**
```json
{
    "message": "We have emailed your password reset link."
}
```

#### POST /reset-password

Reset password using token from email link.

**Request:**
```json
{
    "token": "abc123def456...",
    "email": "john@example.com",
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
}
```

**Validation:**
- `token`: required
- `email`: required, email format
- `password`: required, minimum 8 characters, must match password_confirmation

**Response (200 OK):**
```json
{
    "message": "Your password has been reset."
}
```

### Protected Endpoints (Requires Authentication via `auth:sanctum`)

All protected endpoints require the `Authorization: Bearer {token}` header.

#### General Rate Limiting

Protected API endpoints are throttled at 60 requests per minute.

#### POST /logout

Revoke the current access token.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
    "message": "Logged out successfully."
}
```

The server deletes the current token, preventing further API access with that token.

#### GET /user

Retrieve authenticated user's profile.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2026-02-15T10:00:00Z",
    "updated_at": "2026-02-15T10:00:00Z"
}
```

#### GET /users

List all users with pagination.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional, integer, default: 1): Page number
- Returns 15 users per page

**Response (200 OK):**
```json
{
    "data": [
        {
            "id": 1,
            "name": "Admin User",
            "email": "admin@example.com",
            "role": "admin",
            "created_at": "2026-02-15T10:00:00Z",
            "updated_at": "2026-02-15T10:00:00Z"
        },
        {
            "id": 2,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "user",
            "created_at": "2026-02-15T10:05:00Z",
            "updated_at": "2026-02-15T10:05:00Z"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 1,
        "per_page": 15,
        "total": 2
    }
}
```

**Example Request:**
```
GET /api/v1/users?page=1
```

#### POST /users

Create a new user (Admin only).

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "user"
}
```

**Validation:**
- `name`: required, string, max 255 characters
- `email`: required, email format, unique in users table
- `password`: required, minimum 8 characters, must match password_confirmation
- `role`: optional, must be valid UserRole enum value ('admin' or 'user')

**Response (201 Created):**
```json
{
    "message": "User created successfully.",
    "user": {
        "id": 3,
        "name": "New User",
        "email": "newuser@example.com",
        "role": "user",
        "created_at": "2026-02-15T10:10:00Z",
        "updated_at": "2026-02-15T10:10:00Z"
    }
}
```

**Error Response - Not Admin (403 Forbidden):**
```json
{
    "message": "This action is unauthorized."
}
```

#### GET /users/{id}

Retrieve a specific user's details.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2026-02-15T10:00:00Z",
    "updated_at": "2026-02-15T10:00:00Z"
}
```

**Error Response - User Not Found (404 Not Found):**
```json
{
    "message": "Resource not found."
}
```

#### PUT /users/{id}

Update a user (Admin can update any user, users can update themselves).

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
    "name": "Updated Name",
    "email": "newemail@example.com",
    "password": "newpassword123",
    "password_confirmation": "newpassword123",
    "role": "admin"
}
```

**Validation:**
- `name`: optional, string, max 255 characters
- `email`: optional, email format, unique in users table (except current user)
- `password`: optional, minimum 8 characters, must match password_confirmation if provided
- `role`: optional, must be valid UserRole enum value

**Response (200 OK):**
```json
{
    "message": "User updated successfully.",
    "user": {
        "id": 1,
        "name": "Updated Name",
        "email": "newemail@example.com",
        "role": "admin",
        "created_at": "2026-02-15T10:00:00Z",
        "updated_at": "2026-02-15T10:15:00Z"
    }
}
```

**Error Response - Unauthorized (403 Forbidden):**
```json
{
    "message": "This action is unauthorized."
}
```

Users can only update their own profile unless they are admins.

#### DELETE /users/{id}

Delete a user (Admin only, cannot delete self).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (204 No Content):**

Empty response body with 204 status code.

Before deletion, the server revokes all access tokens for that user.

**Error Response - Not Admin (403 Forbidden):**
```json
{
    "message": "This action is unauthorized."
}
```

**Error Response - Attempting Self-Delete (403 Forbidden):**
```json
{
    "message": "This action is unauthorized."
}
```

### Common Error Responses

All API endpoints follow standard HTTP status codes:

| Status | Code | Message |
|--------|------|---------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 204 | No Content | Successful deletion |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 422 | Unprocessable Entity | Validation errors |

**Standard Error Response (401):**
```json
{
    "message": "Unauthenticated."
}
```

**Standard Error Response (422):**
```json
{
    "message": "The email field is required.",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

## Web Routes

The web routes provide server-side rendered Blade templates. These routes are primarily for displaying forms and pages that use JavaScript for API communication.

| Method | Route | Controller | Purpose |
|--------|-------|-----------|---------|
| GET | / | - | Welcome page |
| GET | /login | AuthViewController | Login form |
| GET | /register | AuthViewController | Registration form |
| GET | /forgot-password | AuthViewController | Forgot password form |
| GET | /reset-password | AuthViewController | Reset password form |
| GET | /dashboard | DashboardController | Dashboard (authenticated) |
| GET | /users | UserViewController | Users list page (admin) |
| GET | /users/create | UserViewController | Create user form (admin) |
| GET | /users/{user}/edit | UserViewController | Edit user form (admin or self) |

### Route Details

#### GET /login
Displays the login form. Accessible to all users. The form submits to the API at `POST /api/v1/login`.

#### GET /register
Displays the registration form. Accessible to guests. The form submits to the API at `POST /api/v1/register`.

#### GET /forgot-password
Displays the forgot password form. Accessible to all users. The form submits to the API at `POST /api/v1/forgot-password`.

#### GET /reset-password
Displays the password reset form. Accepts query parameter `token` from email. The form submits to the API at `POST /api/v1/reset-password`.

#### GET /dashboard
Displays the authenticated user's dashboard. Requires authentication (checked via JavaScript token).

#### GET /users
Displays a paginated list of all users. Admin only (enforced via JavaScript and API policy).

#### GET /users/create
Displays the form to create a new user. Admin only.

#### GET /users/{user}/edit
Displays the form to edit a user. Admin only, or the authenticated user editing their own profile.

## Frontend Architecture

The frontend uses a modular JavaScript architecture with Blade templates and a page-routing system based on `data-page` attributes.

### Page Router

The application implements a client-side page router in `/resources/js/app.js`:

1. Blade template sets `@section('page', 'page-name')` in the `<body data-page="page-name">`
2. JavaScript reads the `data-page` attribute on document load
3. Router calls the matching page module's `init()` function

**Supported Pages:**
- `auth.login` → `/resources/js/pages/auth/login.js`
- `auth.register` → `/resources/js/pages/auth/register.js`
- `auth.forgot-password` → `/resources/js/pages/auth/forgot-password.js`
- `auth.reset-password` → `/resources/js/pages/auth/reset-password.js`
- `dashboard` → `/resources/js/pages/dashboard.js`
- `users.index` → `/resources/js/pages/users/index.js`
- `users.create` → `/resources/js/pages/users/create.js`
- `users.edit` → `/resources/js/pages/users/edit.js`

### API Client (`/resources/js/api/client.js`)

The API client handles all HTTP communication with automatic token injection:

```javascript
// Authenticated request (includes Bearer token)
const response = await apiRequest('/users', { method: 'GET' });

// Public/guest request (no token)
const response = await publicRequest('/login', { email: 'user@example.com', password: '...' });
```

**Features:**
- Automatic `Authorization: Bearer {token}` header injection
- 401 response handling (clears token and redirects to /login)
- Consistent `Content-Type: application/json` and `Accept: application/json` headers
- Supports custom headers and options via spread operator

### Authentication Service (`/resources/js/services/auth.js`)

Manages token and user data in localStorage:

```javascript
import { getToken, setToken, removeToken, getUser, setUser, isAuthenticated } from './services/auth';

// Check if user is authenticated
if (isAuthenticated()) {
    const user = getUser();
    const token = getToken();
}

// Store token after login
setToken(response.token);
setUser(response.user);

// Clear authentication on logout
removeToken();
```

**localStorage Keys:**
- `auth_token`: Sanctum plain-text token
- `auth_user`: Current user object (JSON)

### UI Utilities (`/resources/js/utils/ui.js`)

Helper functions for common UI tasks:

- `showNav()`: Show/hide navigation based on authentication status
- `showErrors(errors)`: Display validation errors to user
- `showSuccess(message)`: Display success message
- `clearMessages()`: Clear all displayed messages

### Template Structure

All Blade templates extend `layouts/app.blade.php` and set the page identifier:

```blade
@extends('layouts.app')

@section('page', 'auth.login')

@section('content')
    <!-- Form HTML here -->
@endsection
```

The `data-page` attribute is automatically rendered on the `<body>` tag by the layout template.

### No Inline JavaScript

All JavaScript logic is in modular files under `/resources/js/`. Blade templates contain only HTML markup—no inline `<script>` tags. This ensures clean separation of concerns and makes testing easier.

## Installation & Setup

### Prerequisites

- PHP 8.2 or higher
- Node.js 16+
- PostgreSQL (or another supported database)
- Composer

### Step-by-Step Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd user-management
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Install Node dependencies:**
   ```bash
   npm install
   ```

4. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

5. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

6. **Configure database in `.env`:**
   ```
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=user_management
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   ```

7. **Run database migrations:**
   ```bash
   php artisan migrate
   ```

8. **Seed the database (optional):**
   ```bash
   php artisan db:seed
   ```

   This creates:
   - Admin user: `admin@example.com` / password: `password`
   - 10 regular users with factory-generated data

9. **Build frontend assets:**
   ```bash
   npm run build
   ```

10. **Start development server:**
    ```bash
    composer run dev
    ```

    This command starts:
    - Laravel development server (port 8000)
    - Queue listener (for email processing)
    - Pail (log viewer)
    - Vite (frontend bundler)

### Development Commands

| Command | Purpose |
|---------|---------|
| `composer run dev` | Start all development services |
| `npm run build` | Build frontend assets for production |
| `npm run dev` | Start Vite in development mode |
| `php artisan serve` | Start Laravel server on port 8000 |
| `php artisan queue:listen` | Listen for queued jobs (emails) |
| `php artisan tinker` | Interactive PHP shell |

### Mail Configuration

**Local Development:**
```
MAIL_MAILER=log
```
Emails are logged to `storage/logs/laravel.log`

**Production:**
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="User Management"
```

Password reset emails are queued via the `ShouldQueue` interface. In production, ensure a queue worker is running.

## Running Tests

The application includes 32 comprehensive tests across feature and unit test suites.

### Run All Tests

```bash
php artisan test --compact
```

The `--compact` flag provides a concise output format.

### Run Specific Test Suite

```bash
# Run only feature tests
php artisan test --compact tests/Feature

# Run only unit tests
php artisan test --compact tests/Unit
```

### Run Specific Test File

```bash
php artisan test --compact tests/Feature/Api/V1/AuthControllerTest.php
```

### Run Tests Matching Pattern

```bash
php artisan test --compact --filter=testLoginSuccessfully
```

### Test Coverage

The test suite covers:

**AuthControllerTest (11 tests)**
- User registration (success and validation failures)
- User login (success and credential validation)
- Logout (token revocation)
- Forgot password (email sending)
- Reset password (token validation and password update)

**UserControllerTest (11 tests)**
- List users (pagination)
- Get single user
- Create user (admin only)
- Update user (admin and self permissions)
- Delete user (admin only, cannot delete self)
- Authorization checks

**UserTest (3 tests)**
- `isAdmin()` helper method
- Password and remember_token are hidden
- Role casting to UserRole enum

**UserRoleTest (2 tests)**
- Enum case values
- Total enum case count

All tests pass with the application in its current state.

## Security Features

### Authentication

- **Token-based**: Laravel Sanctum plain-text tokens
- **Password Hashing**: bcrypt with 12 rounds (configurable via `BCRYPT_ROUNDS`)
- **Token Revocation**: Tokens deleted on logout and password reset
- **Self-Delete Prevention**: Admins cannot delete their own accounts

### Validation

- **Form Requests**: All input validated via dedicated FormRequest classes
- **Email Validation**: Unique constraints prevent duplicate registrations
- **Password Confirmation**: All password changes require confirmation field
- **Enum Validation**: Role field restricted to valid enum values

### Authorization

- **Role-Based Access Control**: UserPolicy defines granular permissions
- **Gate Authorization**: `Gate::authorize()` checks permissions before sensitive operations
- **Policy Enforcement**: API resource routes respect policy rules

### Data Protection

- **Hidden Attributes**: Password and remember_token excluded from API responses
- **UserResource**: Explicitly lists safe fields in API responses
- **Eager Loading**: Prevents N+1 query vulnerabilities

### Rate Limiting

- **Authentication Endpoints**: 5 requests per minute (throttle:auth)
- **API Endpoints**: 60 requests per minute (default throttle)
- **IP-Based**: Rate limits applied per IP address

### Input Handling

- **ORM Protection**: All queries use Eloquent to prevent SQL injection
- **CSRF Protection**: Configured in bootstrap/app.php
- **CORS**: Properly configured for API consumption
- **JSON Exceptions**: API returns consistent JSON error format

### Email Security

- **Queued Notifications**: Password reset emails processed asynchronously
- **Token Expiration**: Reset tokens expire after configured period
- **One-Time Use**: Each reset link is single-use

## Common Tasks

### Creating a New User (As Admin)

```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "SecurePassword123",
    "password_confirmation": "SecurePassword123",
    "role": "user"
  }'
```

### Updating Your Profile (As User)

```bash
curl -X PUT http://localhost:8000/api/v1/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "newemail@example.com"
  }'
```

### Testing with Tinker

Access the Laravel interactive shell:

```bash
php artisan tinker
```

Common operations:

```php
// Get a user
$user = App\Models\User::find(1);

// Check if admin
$user->isAdmin();

// Create a user
App\Models\User::create([
    'name' => 'Test User',
    'email' => 'test@example.com',
    'password' => bcrypt('password'),
    'role' => 'user'
]);

// Generate a token
$user->createToken('auth-token')->plainTextToken;

// Delete all tokens for a user
$user->tokens()->delete();
```

### Debugging Failed Tests

```bash
# Run a specific test with verbose output
php artisan test --compact tests/Feature/Api/V1/AuthControllerTest --verbose

# Run a single test method
php artisan test --compact --filter=testRegisterSuccessfully
```

### Clearing Application Cache

```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
```

### Resetting Database During Development

```bash
# Drop all tables and re-run migrations
php artisan migrate:refresh

# Migrations + seeding
php artisan migrate:refresh --seed
```

## Troubleshooting

### "Vite Manifest Not Found" Error

If you see `Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest`, run:

```bash
npm run build
# or for development
npm run dev
```

### 401 Unauthorized on Protected Routes

Ensure:
1. Token is stored correctly in `localStorage.auth_token`
2. Token is included in request header: `Authorization: Bearer {token}`
3. Token has not expired
4. Token was not deleted (check with `/api/v1/user` endpoint)

### Queue Jobs Not Processing

Ensure the queue listener is running:

```bash
php artisan queue:listen
```

Or use the combined dev command:

```bash
composer run dev
```

### Database Connection Errors

Verify your `.env` file has correct database credentials:

```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=user_management
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

Then test the connection:

```bash
php artisan tinker
# Then in tinker:
DB::connection()->getPdo();
```

## API Integration Examples

### JavaScript Fetch Example

```javascript
// Import auth services
import { getToken, setToken, removeToken } from './services/auth';
import { apiRequest } from './api/client';

// Login
const loginResponse = await publicRequest('/login', {
    email: 'user@example.com',
    password: 'password123'
});
const loginData = await loginResponse.json();
setToken(loginData.token);
setUser(loginData.user);

// Get authenticated user
const userResponse = await apiRequest('/user', { method: 'GET' });
const user = await userResponse.json();

// Create new user (admin)
const createResponse = await apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'user'
    })
});
const newUser = await createResponse.json();

// Logout
await apiRequest('/logout', { method: 'POST' });
removeToken();
window.location.href = '/login';
```

### cURL Examples

```bash
# Register
curl -X POST http://localhost:8000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get authenticated user
curl -X GET http://localhost:8000/api/v1/user \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"

# List users with pagination
curl -X GET "http://localhost:8000/api/v1/users?page=1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"

# Update user
curl -X PUT http://localhost:8000/api/v1/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'

# Delete user (admin)
curl -X DELETE http://localhost:8000/api/v1/users/2 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Architecture Decisions

### Token-Based Authentication

The application uses Laravel Sanctum for stateless token-based authentication, enabling:
- Decoupled frontend and backend
- Mobile app compatibility
- Scalable to multiple servers
- No session dependencies

### Role-Based Authorization

A simple two-tier system (Admin/User) provides:
- Clear permission model
- Easy to understand and implement
- Extensible for future roles
- Defined via UserPolicy for consistency

### Modular Frontend

Page-based JavaScript modules provide:
- Separation of concerns
- Easy testing
- Clear entry points for each page
- Automatic routing based on page identifier

### Form Request Validation

Dedicated FormRequest classes offer:
- Centralized validation rules
- Custom error messages
- Reusable validation logic
- Clean controller code

### Eloquent Resources

API resources provide:
- Consistent response formatting
- Hidden sensitive fields
- Easy to version or modify
- Type-safe data transformation

## Version Information

- Laravel: 12.51.0
- PHP: 8.5.2
- PostgreSQL: Latest stable
- Laravel Sanctum: 4.3.1
- Pest: 4
- Vite: Latest
- Tailwind CSS: 4

---

**Last Updated**: February 15, 2026
**Documentation Version**: 1.0

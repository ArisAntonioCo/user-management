# Section 1: Authentication System (API + Simple UI)

## What This Section Is About

The app needs a way for users to sign up, log in, log out, and reset their passwords. Everything happens through API endpoints (the backend sends and receives JSON data), and we also built simple web pages so users can actually interact with these features in a browser.

We used **Laravel Sanctum** for authentication. Sanctum is Laravel's built-in package for token-based auth — think of it like giving each logged-in user a unique "key card" (token) that they show every time they want to access something protected.

---

## How It Works (The Big Picture)

1. User fills out a form on the frontend (e.g., login page)
2. JavaScript sends the form data to our API endpoint (e.g., `POST /api/v1/login`)
3. The API validates the data, does the work, and sends back a JSON response
4. If login is successful, the response includes a **token** — the frontend saves this token in the browser's `localStorage`
5. For all future requests, the frontend attaches that token in the `Authorization` header so the API knows who's making the request

---

## API Endpoints We Built

All auth endpoints live under `/api/v1/` and are handled by `AuthController`.

| Method | Endpoint | What It Does | Auth Required? |
|--------|----------|-------------|----------------|
| POST | `/api/v1/register` | Create a new account | No |
| POST | `/api/v1/login` | Log in and get a token | No |
| POST | `/api/v1/logout` | Invalidate the current token | Yes |
| GET | `/api/v1/user` | Get the currently logged-in user's info | Yes |
| POST | `/api/v1/forgot-password` | Send a password reset email | No |
| POST | `/api/v1/reset-password` | Reset password using the email link | No |

---

## Key Files and What They Do

### Controller: `app/Http/Controllers/Api/V1/AuthController.php`

This is the brain of the auth system. Each method handles one endpoint:

- **`register()`** — Creates a new user in the database, then generates a Sanctum token for them so they're automatically logged in after signing up.

- **`login()`** — Looks up the user by email, checks if the password matches using `Hash::check()`. If it matches, creates a new token. If not, throws a validation error.

- **`logout()`** — Finds the user's current token and deletes it. Once deleted, that token can never be used again — they'd need to log in again to get a new one.

- **`user()`** — Simply returns the authenticated user's data. This is how the frontend knows who's logged in.

- **`forgotPassword()`** — Uses Laravel's built-in `Password::sendResetLink()` to send a reset email. We don't reinvent the wheel here — Laravel handles generating the token and sending the email.

- **`resetPassword()`** — Uses `Password::reset()` to verify the token from the email and update the password. Also deletes all the user's existing tokens so they have to log in fresh.

### Form Requests (Validation)

Instead of validating data inside the controller (which gets messy), we use **Form Request** classes. These are separate files that define what data is required and what rules it must follow.

| File | What It Validates |
|------|-------------------|
| `app/Http/Requests/Auth/RegisterRequest.php` | name (required), email (required, unique), password (min 8, must be confirmed) |
| `app/Http/Requests/Auth/LoginRequest.php` | email (required), password (required) |
| `app/Http/Requests/Auth/ForgotPasswordRequest.php` | email (required, valid format) |
| `app/Http/Requests/Auth/ResetPasswordRequest.php` | token (required), email (required), password (min 8, must be confirmed) |

If the data doesn't pass validation, Laravel automatically returns a `422` error with details about what went wrong. The controller code never even runs.

### Web Controllers (Page Rendering)

These controllers don't do any logic — they just serve up the Blade HTML pages.

| File | What It Does |
|------|-------------|
| `app/Http/Controllers/Web/AuthViewController.php` | Renders the login, register, forgot-password, and reset-password pages |
| `app/Http/Controllers/Web/DashboardController.php` | Renders the dashboard page |

For example, when someone visits `/login`, `AuthViewController@login` just returns the `auth.login` Blade view. All the real work (actually logging in) happens via JavaScript calling the API.

### Frontend (Blade + JavaScript)

The frontend pages are Blade templates, but the forms don't do traditional HTML form submissions. Instead, they use JavaScript to call our API:

| Page | File | API It Calls |
|------|------|-------------|
| Login | `resources/views/auth/login.blade.php` | `POST /api/v1/login` |
| Register | `resources/views/auth/register.blade.php` | `POST /api/v1/register` |
| Forgot Password | `resources/views/auth/forgot-password.blade.php` | `POST /api/v1/forgot-password` |
| Reset Password | `resources/views/auth/reset-password.blade.php` | `POST /api/v1/reset-password` |
| Dashboard | `resources/views/dashboard.blade.php` | `GET /api/v1/user` |

### Token Management: `resources/js/services/auth.js`

This small utility file handles saving and retrieving the auth token from `localStorage`:

- `setToken(token)` — Saves the token after login/register
- `getToken()` — Retrieves it for API requests
- `removeToken()` — Clears it on logout
- `isAuthenticated()` — Quick check if a token exists

### API Client: `resources/js/api/client.js`

An **Axios instance** with interceptors. It automatically:

- Attaches the `Authorization: Bearer {token}` header to every request via a request interceptor
- Sets `Content-Type` and `Accept` to `application/json` as defaults
- Redirects to `/login` if the API returns a `401` (token expired or invalid) via a response interceptor

---

## Routes

### API Routes (`routes/api.php`)

```php
Route::prefix('v1')->group(function () {
    // Public routes (with rate limiting to prevent brute force)
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // Protected routes (need a valid token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});
```

The `throttle:auth` middleware limits these endpoints to 5 requests per minute per IP — this prevents someone from trying thousands of passwords in a brute-force attack.

The `auth:sanctum` middleware checks that the request has a valid Bearer token. If not, it returns a `401 Unauthenticated` response.

### Web Routes (`routes/web.php`)

```php
Route::redirect('/', '/login');

Route::get('/login', [AuthViewController::class, 'login'])->name('login');
Route::get('/register', [AuthViewController::class, 'register'])->name('register');
Route::get('/forgot-password', [AuthViewController::class, 'forgotPassword'])->name('password.request');
Route::get('/reset-password', [AuthViewController::class, 'resetPassword'])->name('password.reset');
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
```

---

## How Sanctum Tokens Work (In Simple Terms)

1. When a user logs in, we call `$user->createToken('auth-token')`. This creates a row in the `personal_access_tokens` database table with a hashed version of the token.
2. The unhashed token is returned to the frontend (e.g., `2|abc123xyz...`).
3. The frontend stores it and sends it with every request as `Authorization: Bearer 2|abc123xyz...`.
4. Sanctum's middleware reads the token, finds the matching row in the database, and identifies which user it belongs to.
5. On logout, we delete that row — the token is now dead.

The `personal_access_tokens` table was created by the migration at `database/migrations/2026_02_14_142451_create_personal_access_tokens_table.php`.

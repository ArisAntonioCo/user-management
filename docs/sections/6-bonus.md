# Section 6: Bonus Features

## What This Section Is About

These are extra features that demonstrate senior-level skills. The assessment marks them as "Highly Recommended." We implemented 4 out of 7.

---

## 1. Role-Based Access Control (Admin/User) -- IMPLEMENTED

**What it is:** Different users have different permissions. An admin can do everything, a regular user has limited access.

**How we did it:**

### The UserRole Enum (`app/Enums/UserRole.php`)

```php
enum UserRole: string
{
    case Admin = 'admin';
    case User = 'user';
}
```

A PHP enum is like a strict dropdown — the role can only be `admin` or `user`, nothing else. If someone tries to set it to `superadmin` or anything invalid, Laravel will reject it.

### The `role` Column

Added via migration `database/migrations/2026_02_15_080120_add_role_to_users_table.php`. The column defaults to `'user'`, so anyone who registers through the normal flow gets the regular user role.

### How the User Model Uses It

```php
// app/Models/User.php
protected function casts(): array
{
    return [
        'role' => UserRole::class,  // Automatically converts string to enum
    ];
}

public function isAdmin(): bool
{
    return $this->role === UserRole::Admin;
}
```

The `isAdmin()` helper makes permission checks readable: `$user->isAdmin()` instead of `$user->role === UserRole::Admin` everywhere.

### Where Roles Are Enforced

| Location | How |
|---|---|
| `StoreUserRequest` | `authorize()` returns `$this->user()->isAdmin()` |
| `UpdateUserRequest` | `authorize()` allows admin or self |
| `UserPolicy` | Each method checks `$user->isAdmin()` |
| `EnsureUserIsAdmin` middleware | Blocks non-admins from certain routes |
| Frontend JS | Hides Create/Delete buttons for non-admin users |

### Seeding

The `DatabaseSeeder` creates one admin and 10 regular users:

```php
User::factory()->admin()->create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
]);

User::factory(10)->create();  // All get UserRole::User by default
```

The `admin()` factory state is defined in `UserFactory`:

```php
public function admin(): static
{
    return $this->state(fn (array $attributes) => [
        'role' => UserRole::Admin,
    ]);
}
```

---

## 2. API Rate Limiting -- IMPLEMENTED

**What it is:** Limiting how many requests a user/IP can make in a time window. Prevents abuse and brute-force attacks.

**How we did it:** In `app/Providers/AppServiceProvider.php`:

```php
public function boot(): void
{
    // General API: 60 requests per minute per user (or per IP if not logged in)
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });

    // Auth endpoints: 5 requests per minute per IP
    RateLimiter::for('auth', function (Request $request) {
        return Limit::perMinute(5)->by($request->ip());
    });
}
```

**Two tiers of limiting:**

| Limiter | Applies To | Limit | Tracked By |
|---|---|---|---|
| `api` | All API routes | 60/min | User ID (or IP if guest) |
| `auth` | Login, register, forgot/reset password | 5/min | IP address |

The `auth` limiter is stricter because these are the endpoints most likely to be attacked. 5 attempts per minute means a brute-force attacker can only try 5 passwords per minute — making it practically useless.

Applied in routes:
```php
Route::middleware('throttle:auth')->group(function () {
    Route::post('/login', ...);
    Route::post('/register', ...);
    // ...
});
```

When the limit is hit, the API returns a `429 Too Many Requests` response with a `Retry-After` header telling the client when they can try again.

---

## 3. Unit & Feature Tests -- IMPLEMENTED

**What it is:** Automated tests that verify the app works correctly. Feature tests make HTTP requests to test entire flows. Unit tests verify individual pieces of logic in isolation.

**How we did it:** We use **Pest 4** (a testing framework built on top of PHPUnit with a cleaner syntax).

### Test Files

| File | Type | What It Tests | Test Count |
|---|---|---|---|
| `tests/Feature/Api/V1/AuthControllerTest.php` | Feature | Registration, login, logout, forgot/reset password | 12 tests |
| `tests/Feature/Api/V1/UserControllerTest.php` | Feature | CRUD operations, permissions, pagination | 11 tests |
| `tests/Unit/Models/UserTest.php` | Unit | isAdmin(), hidden attributes, role casting | 3 tests |
| `tests/Unit/Enums/UserRoleTest.php` | Unit | Enum values, case count | 2 tests |
| `tests/Feature/ExampleTest.php` | Feature | Root URL redirects to login | 1 test |

### What the Tests Cover

**Auth tests** verify:
- Registration works with valid data and creates a user in the database
- Registration fails with invalid data (empty name, bad email, short password)
- Registration fails with a duplicate email
- Login works with correct credentials and returns a token
- Login fails with wrong password
- Login fails with non-existent email
- Logout works and invalidates the token
- Logout fails without authentication
- Forgot password sends a reset link
- Forgot password validates the email field
- Reset password works with a valid token
- Reset password fails with invalid data

**CRUD tests** verify:
- Listing users works and returns paginated data
- Unauthenticated users get a 401
- Viewing a single user works
- Non-existent users return 404
- Admins can create users
- Non-admins get a 403 when trying to create
- Validation errors work on create
- Admins can update any user
- Users can update their own profile
- Non-admins can't update other users
- Admins can delete users
- Admins can't delete themselves
- Non-admins can't delete users

**Unit tests** verify:
- `isAdmin()` returns true for admins, false for regular users
- Password and remember_token are hidden from serialization
- The role field is properly cast to the UserRole enum
- The enum has exactly 2 values with the correct strings

### Running Tests

```bash
# Run all tests
./vendor/bin/sail artisan test --compact

# Run a specific test file
./vendor/bin/sail artisan test --compact --filter=AuthControllerTest

# Run a specific test by name
./vendor/bin/sail artisan test --compact --filter="user can register"
```

### How Tests Use Factories

Tests don't manually create users with SQL. They use **factories** which generate realistic fake data:

```php
// Create a regular user
$user = User::factory()->create();

// Create an admin
$admin = User::factory()->admin()->create();

// Create a user with specific attributes
$user = User::factory()->create(['email' => 'specific@example.com']);
```

The `UserFactory` (`database/factories/UserFactory.php`) defines default values and the `admin()` state.

---

## 4. Docker Setup -- IMPLEMENTED

**What it is:** Docker packages the entire app and its dependencies (PHP, PostgreSQL, Redis, etc.) into containers. Anyone can run the app on any machine without installing PHP, PostgreSQL, or anything else locally.

**How we did it:** We use **Laravel Sail**, which is Laravel's official Docker development environment.

### Containers (`compose.yaml`)

| Service | Image | What It Does | Port |
|---|---|---|---|
| `laravel.test` | `sail-8.5/app` | The Laravel app (PHP 8.5, Nginx) | 80 |
| `pgsql` | `postgres:18-alpine` | PostgreSQL database | 5432 |
| `redis` | `redis:alpine` | Cache, queue, and session storage | 6379 |
| `mailpit` | `axllent/mailpit:latest` | Fake email server for testing | 1025, 8025 |
| `pgadmin` | `dpage/pgadmin4:latest` | Database management UI | 5050 |

### How to Use

```bash
# Start everything
./vendor/bin/sail up -d

# Stop everything
./vendor/bin/sail down

# Run artisan commands
./vendor/bin/sail artisan migrate

# Enter the container
./vendor/bin/sail shell

# Enter as root (for installing global packages)
./vendor/bin/sail root-shell
```

---

## 5. Postman Collection -- NOT IMPLEMENTED

A Postman collection is a pre-configured set of API requests that you can import into Postman (an API testing tool) and test all endpoints with one click. We documented all API endpoints with sample requests/responses in the README instead.

---

## 6. Swagger/OpenAPI Docs -- NOT IMPLEMENTED

Swagger is an interactive API documentation page (usually at `/api/docs`) where you can see all endpoints, their parameters, and test them in the browser. This typically requires a package like `l5-swagger` or `scramble`.

---

## 7. GitHub Actions CI/CD -- NOT IMPLEMENTED

CI/CD (Continuous Integration/Continuous Deployment) means automatically running tests and deploying the app whenever you push code to GitHub. This would be a `.github/workflows/` YAML file that runs `php artisan test` on every push.

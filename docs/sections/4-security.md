# Section 4: Security Requirements

## What This Section Is About

Security is about protecting the app and its users from attacks and data leaks. The assessment lists 8 specific security requirements. Here's how we implemented each one, in plain English.

---

## 1. Token-Based Authentication

**What it means:** Instead of using cookies and sessions (the traditional way), we use tokens. After logging in, the server gives you a unique string (a token). You include that token in every request to prove who you are.

**How we did it:** We use **Laravel Sanctum**, which creates tokens stored in the `personal_access_tokens` table.

**Where to look:**
- `app/Http/Controllers/Api/V1/AuthController.php` — The `login()` method creates tokens, `logout()` deletes them
- `routes/api.php` — Protected routes use `middleware('auth:sanctum')`
- `resources/js/api/client.js` — Axios request interceptor attaches `Authorization: Bearer {token}` to every API request

**Why it matters:** Tokens are stateless (the server doesn't need to remember sessions), which makes the API easier to scale and more secure against CSRF attacks.

---

## 2. Password Hashing

**What it means:** We never store passwords as plain text. If someone breaks into the database, they'll see scrambled gibberish instead of actual passwords.

**How we did it:** The User model has a `hashed` cast on the password field:

```php
// app/Models/User.php
protected function casts(): array
{
    return [
        'password' => 'hashed',  // Automatically bcrypt any password before saving
    ];
}
```

This means every time you set a password (whether creating a user or resetting a password), Laravel automatically hashes it with **bcrypt** before saving it to the database. You never have to manually call `Hash::make()` — the model handles it.

**Where to look:**
- `app/Models/User.php` — The `casts()` method
- `.env` — `BCRYPT_ROUNDS=12` (higher = more secure but slower)

---

## 3. Input Validation via Form Requests

**What it means:** Never trust data from users. Always check that it's the right format, length, and type before doing anything with it.

**How we did it:** We created 6 **Form Request** classes — separate files dedicated to validating input:

| Form Request | What It Validates |
|---|---|
| `LoginRequest` | Email must be a valid email, password is required |
| `RegisterRequest` | Name required, email unique, password min 8 chars with confirmation |
| `ForgotPasswordRequest` | Email required and valid format |
| `ResetPasswordRequest` | Token required, email valid, password min 8 with confirmation |
| `StoreUserRequest` | Name, email (unique), password (min 8, confirmed), role (valid enum) |
| `UpdateUserRequest` | All optional but must be valid if provided, email unique except self |

**Where to look:** `app/Http/Requests/Auth/` and `app/Http/Requests/User/`

**Why Form Requests instead of inline validation?** It keeps the controller clean and follows the **Single Responsibility Principle** — the controller handles logic, the Form Request handles validation. They're also reusable and easier to test.

**What happens when validation fails?** Laravel automatically returns a `422 Unprocessable Entity` response with details:

```json
{
    "message": "The email field is required.",
    "errors": {
        "email": ["The email field is required."]
    }
}
```

The controller code never runs — the request is rejected before it gets there.

---

## 4. Prevent SQL Injection

**What it means:** SQL injection is when an attacker puts malicious SQL code into form fields (like typing `'; DROP TABLE users; --` in the email field). If the app blindly puts user input into SQL queries, the attacker can read, modify, or delete data.

**How we did it:** We use **Eloquent ORM** exclusively. We never write raw SQL.

```php
// SAFE - Eloquent parameterizes the query automatically
User::where('email', $request->email)->first();

// UNSAFE - Never do this (we don't)
DB::select("SELECT * FROM users WHERE email = '$email'");
```

Eloquent uses **prepared statements** under the hood, which means user input is always treated as data, never as SQL code. Even if someone types `'; DROP TABLE users; --` as their email, Eloquent treats it as a literal string to search for — the database never executes it as SQL.

**Where to look:**
- `app/Http/Controllers/Api/V1/AuthController.php` — Uses `User::where()`, `User::create()`
- `app/Http/Controllers/Api/V1/UserController.php` — Uses `User::paginate()`, `$user->update()`
- You won't find a single `DB::` call in the entire app

---

## 5. Policies and Middleware for Authorization

**What it means:** Authentication is "who are you?" — Authorization is "are you allowed to do this?"

**How we did it:** We use two authorization mechanisms:

### Policies (`app/Policies/UserPolicy.php`)

Policies define fine-grained rules for each action on a model:

| Action | Who Can Do It |
|--------|--------------|
| View any / View single | Any authenticated user |
| Create | Admin only |
| Update | Admin, or the user editing themselves |
| Delete | Admin only (cannot delete yourself) |

### Middleware (`app/Http/Middleware/EnsureUserIsAdmin.php`)

A middleware that blocks non-admin users from accessing certain routes. Returns `403 Forbidden` if the user isn't an admin.

### Form Request Authorization

The `StoreUserRequest` and `UpdateUserRequest` also have `authorize()` methods that check permissions before the request even reaches the controller:

```php
// StoreUserRequest
public function authorize(): bool
{
    return $this->user()->isAdmin();
}
```

**Where to look:**
- `app/Policies/UserPolicy.php`
- `app/Http/Middleware/EnsureUserIsAdmin.php`
- `app/Http/Requests/User/StoreUserRequest.php` and `UpdateUserRequest.php`
- `bootstrap/app.php` — Registers the `admin` middleware alias

---

## 6. Hide Sensitive Fields

**What it means:** When the API returns user data, it should never include passwords, tokens, or other internal fields.

**How we did it:** Two layers of protection:

### Layer 1: Model `$hidden` property

```php
// app/Models/User.php
protected $hidden = [
    'password',
    'remember_token',
];
```

Even if you do `User::all()`, the `password` and `remember_token` fields are automatically excluded from JSON output.

### Layer 2: API Resource

```php
// app/Http/Resources/UserResource.php
return [
    'id' => $this->id,
    'name' => $this->name,
    'email' => $this->email,
    'role' => $this->role,
    'created_at' => $this->created_at,
    'updated_at' => $this->updated_at,
];
```

The UserResource explicitly lists only the fields we want to expose. This is a whitelist approach — if we add a new column to the database later, it won't accidentally show up in the API.

---

## 7. Proper Error Handling

**What it means:** When something goes wrong, the API should return clear, structured JSON error messages instead of HTML error pages or stack traces.

**How we did it:** In `bootstrap/app.php`, we configured custom exception handling:

```php
$exceptions->shouldRenderJsonWhen(function (Request $request) {
    return $request->is('api/*') || $request->expectsJson();
});

$exceptions->render(function (AuthenticationException $e, Request $request) {
    if ($request->is('api/*') || $request->expectsJson()) {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
});

$exceptions->render(function (NotFoundHttpException $e, Request $request) {
    if ($request->is('api/*') || $request->expectsJson()) {
        return response()->json(['message' => 'Resource not found.'], 404);
    }
});
```

This ensures:
- `401` for unauthenticated requests (trying to access a protected route without a token)
- `403` for unauthorized requests (trying to do something you're not allowed to)
- `404` for resources that don't exist (e.g., `GET /api/v1/users/99999`)
- `422` for validation errors (bad input data)

No raw exceptions, no HTML, no stack traces — just clean JSON every time.

---

## 8. Production-Ready Configuration

**What it means:** The app should be configured so that in production, it doesn't leak debug information or expose internal errors to users.

**How we did it:**

- **`APP_DEBUG=false`** in production `.env` — Hides stack traces and error details
- **All errors return structured JSON** — Even if `APP_DEBUG=true`, our custom exception handlers return clean JSON for API requests
- **`.env.example`** ships with `APP_DEBUG=true` for local development — developers switch to `false` for production
- **Sensitive env vars are not committed** — The `.env` file is in `.gitignore`

---

## Rate Limiting (Bonus Security)

On top of the 8 requirements, we also added rate limiting in `app/Providers/AppServiceProvider.php`:

```php
// General API: 60 requests per minute
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

// Auth endpoints: 5 requests per minute (brute-force protection)
RateLimiter::for('auth', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip());
});
```

The `auth` limiter is applied to login, register, forgot-password, and reset-password endpoints. If someone tries to brute-force a password by attempting thousands of logins, they'll be blocked after 5 attempts per minute.

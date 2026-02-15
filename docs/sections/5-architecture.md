# Section 5: Architecture Expectations

## What This Section Is About

Architecture is about how the code is organized. Good architecture means the code is easy to read, easy to change, and each piece has a clear job. The assessment wants to see clean patterns, not just "code that works."

---

## 1. Clean Controller Structure

**What it means:** Controllers should be thin — they coordinate the work but don't do the heavy lifting themselves.

**How we did it:** Our controllers are short. Here's the entire `store()` method from UserController:

```php
public function store(StoreUserRequest $request): JsonResponse
{
    $user = User::create($request->validated());

    return response()->json([
        'message' => 'User created successfully.',
        'user' => new UserResource($user),
    ], 201);
}
```

That's it — 3 lines. The validation happens in `StoreUserRequest`, the authorization happens in the Form Request's `authorize()` method, and the response formatting happens in `UserResource`. The controller just connects the dots.

**Where to look:**
- `app/Http/Controllers/Api/V1/AuthController.php` (6 methods, all concise)
- `app/Http/Controllers/Api/V1/UserController.php` (5 methods, all concise)
- `app/Http/Controllers/Web/` (3 controllers that only return views)

---

## 2. Separation of Concerns

**What it means:** Each class or file should have one job. Validation code shouldn't live in the controller. Authorization logic shouldn't live in the view. Etc.

**How we separated responsibilities:**

| Responsibility | Where It Lives |
|---|---|
| Routing | `routes/api.php`, `routes/web.php` |
| Request validation | `app/Http/Requests/Auth/`, `app/Http/Requests/User/` |
| Authorization (who can do what) | `app/Policies/UserPolicy.php`, Form Request `authorize()` |
| Business logic | Controllers (`app/Http/Controllers/Api/V1/`) |
| Data transformation (API output) | `app/Http/Resources/UserResource.php` |
| Data modeling | `app/Models/User.php` |
| Page rendering | `app/Http/Controllers/Web/` |
| Frontend interactivity | `resources/js/` |
| Email content | `app/Notifications/ResetPasswordNotification.php` |
| Rate limiting, boot logic | `app/Providers/AppServiceProvider.php` |
| Middleware, exceptions | `bootstrap/app.php` |

No one file tries to do everything. If you need to change how validation works, you go to the Request file. If you need to change what data the API returns, you go to the Resource.

---

## 3. Service Layer

**What it means:** For complex business logic, you'd create a Service class (e.g., `UserService`) to keep that logic out of the controller. Services sit between the controller and the model.

**Our approach:** We didn't add a service layer because our logic is straightforward (simple CRUD). Adding a `UserService` that just calls `User::create()` would be over-engineering. The assessment says "if needed" — and for our use case, it's not needed. If the app grew to include things like "when creating a user, also send a welcome email, assign default permissions, and notify the admin," then a service layer would make sense.

---

## 4. Proper Use of Resources

**What it means:** API Resources are Laravel's way of controlling what data gets sent to the frontend. Instead of returning raw Eloquent models, you return a Resource that explicitly defines the output shape.

**How we did it:** Every API response goes through `UserResource`:

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

For single users: `new UserResource($user)`
For collections: `UserResource::collection(User::paginate(15))` (this also wraps pagination metadata automatically)

---

## 5. Custom API Responses

**What it means:** The API should return consistent, predictable JSON structures. Not sometimes an array, sometimes an object, sometimes a random string.

**Our response patterns:**

**Success with data:**
```json
{
    "message": "User created successfully.",
    "user": { "id": 1, "name": "...", ... }
}
```

**Success without data (delete):**
```
HTTP 204 No Content
```

**Validation error:**
```json
{
    "message": "The email field is required.",
    "errors": { "email": ["The email field is required."] }
}
```

**Auth error:**
```json
{
    "message": "Unauthenticated."
}
```

**Not found:**
```json
{
    "message": "Resource not found."
}
```

Every response follows the same pattern: a `message` field, and optionally a `user` or `errors` field. The frontend always knows what to expect.

---

## 6. Exception Handling

**What it means:** When something goes wrong (invalid token, missing resource, server error), the API should handle it gracefully instead of crashing.

**How we did it:** In `bootstrap/app.php`:

```php
->withExceptions(function (Exceptions $exceptions): void {
    // Force JSON responses for API routes
    $exceptions->shouldRenderJsonWhen(function (Request $request) {
        return $request->is('api/*') || $request->expectsJson();
    });

    // Custom 401 response
    $exceptions->render(function (AuthenticationException $e, Request $request) { ... });

    // Custom 404 response
    $exceptions->render(function (NotFoundHttpException $e, Request $request) { ... });
})
```

This catches exceptions before they reach the user and turns them into clean JSON responses. No HTML error pages, no stack traces leaking.

---

## 7. Middleware Usage

**What it means:** Middleware is code that runs before or after a request hits your controller. Think of it as a series of checkpoints.

**Middleware we use:**

| Middleware | What It Does | Where It's Applied |
|---|---|---|
| `auth:sanctum` | Checks for a valid Bearer token | All protected API routes |
| `throttle:auth` | Limits to 5 requests/min | Login, register, forgot-password, reset-password |
| `throttle:api` | Limits to 60 requests/min | All API routes (configured in framework) |
| `admin` (custom) | Checks if the user has the admin role | Available for admin-only routes |

Custom middleware is registered in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'admin' => EnsureUserIsAdmin::class,
    ]);
})
```

---

## 8. Organized Folder Structure

```
app/
├── Enums/                    # PHP enums (UserRole)
├── Http/
│   ├── Controllers/
│   │   ├── Api/V1/           # API controllers (versioned)
│   │   └── Web/              # Web controllers (page rendering)
│   ├── Middleware/            # Custom middleware
│   ├── Requests/
│   │   ├── Auth/             # Auth validation rules
│   │   └── User/             # CRUD validation rules
│   └── Resources/            # API output transformers
├── Models/                   # Eloquent models
├── Notifications/            # Email/notification classes
├── Policies/                 # Authorization rules
└── Providers/                # Service providers

resources/
├── js/
│   ├── api/                  # Axios API client with interceptors
│   ├── services/             # Auth token management
│   ├── utils/                # UI utilities
│   └── pages/                # Page-specific JS (grouped by feature)
│       ├── auth/             # Login, register, etc.
│       └── users/            # CRUD pages
└── views/
    ├── layouts/              # Base layout template
    ├── auth/                 # Auth page templates
    └── users/                # CRUD page templates

routes/
├── api.php                   # API endpoints
├── web.php                   # Web page routes
└── console.php               # Artisan commands

tests/
├── Feature/Api/V1/           # API integration tests
└── Unit/
    ├── Models/               # Model unit tests
    └── Enums/                # Enum unit tests
```

Key principles:
- **API versioning** (`Api/V1/`) — If we need to make breaking changes later, we can create `V2/` without breaking existing clients
- **Feature grouping** — Auth files go together, User files go together
- **Separation of API and Web** — API controllers handle JSON, Web controllers handle HTML pages

---

## 9. Environment-Based Config

**What it means:** The app behaves differently based on the environment (local, staging, production). Configuration is stored in `.env` files, not hardcoded.

**How we did it:**
- `.env` contains environment-specific values (database credentials, mail settings, debug mode)
- `.env.example` is committed to Git as a template — it shows what variables are needed without revealing actual secrets
- `.env` is in `.gitignore` — secrets never get committed
- Config files in `config/` reference env vars via `env('KEY', 'default')`, and the rest of the app uses `config('key')` to read them
- Different `.env` files for different environments (local uses Mailpit, production uses Gmail SMTP)

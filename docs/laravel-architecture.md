# Laravel 12 File & Folder Architecture Best Practices

## Table of Contents

- [Default Directory Structure](#default-directory-structure)
- [Root Directory](#root-directory)
- [The App Directory](#the-app-directory)
- [Generated Directories (On Demand)](#generated-directories-on-demand)
- [Scaling Patterns](#scaling-patterns)
- [Naming Conventions](#naming-conventions)
- [Key Principles](#key-principles)

---

## Default Directory Structure

Laravel 12 uses a streamlined structure compared to earlier versions. The framework imposes almost no restrictions on where classes are located — as long as Composer can autoload them.

```
project-root/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   └── Providers/
├── bootstrap/
│   ├── app.php
│   ├── cache/
│   └── providers.php
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   ├── schema/
│   └── seeders/
├── public/
│   └── index.php
├── resources/
│   ├── css/
│   ├── js/
│   └── views/
├── routes/
│   ├── web.php
│   ├── api.php (if needed)
│   └── console.php
├── storage/
│   ├── app/
│   │   ├── private/
│   │   └── public/
│   ├── framework/
│   └── logs/
├── tests/
│   ├── Feature/
│   ├── Unit/
│   ├── Pest.php
│   └── TestCase.php
└── vendor/
```

---

## Root Directory

| Directory     | Purpose |
|---------------|---------|
| `app/`        | Core application code. Namespaced under `App\` via PSR-4. |
| `bootstrap/`  | `app.php` bootstraps the framework. `cache/` holds framework-generated route/service caches. |
| `config/`     | All configuration files. Access via `config('key')`, never `env()` directly outside config files. |
| `database/`   | Migrations, factories, seeders. Can also hold SQLite databases. |
| `public/`     | Web entry point (`index.php`). Houses public assets (images, compiled CSS/JS). |
| `resources/`  | Views (Blade templates) and raw un-compiled frontend assets (CSS, JS). |
| `routes/`     | Route definitions. `web.php`, `api.php`, `console.php`. |
| `storage/`    | Logs, compiled Blade, sessions, file caches, app-generated files. |
| `tests/`      | Feature and Unit tests. This project uses Pest. |
| `vendor/`     | Composer dependencies. Never edit directly. |

### Laravel 12 Key Files

- **`bootstrap/app.php`** — Registers middleware, exceptions, and routing (replaces the old `app/Http/Kernel.php`).
- **`bootstrap/providers.php`** — Lists application service providers (replaces the old `config/app.php` providers array).
- **`routes/console.php`** — Console command scheduling and closures (replaces the old `app/Console/Kernel.php`).

---

## The App Directory

The `app/` directory contains the core of your application. By default it ships with three subdirectories:

### Always Present

| Directory           | Purpose |
|---------------------|---------|
| `Http/Controllers/` | Request handlers. Keep controllers thin — delegate logic to services/actions. |
| `Http/Middleware/`   | HTTP middleware classes. Registered in `bootstrap/app.php`. |
| `Http/Requests/`     | Form Request classes for validation. Always prefer these over inline validation in controllers. |
| `Models/`            | Eloquent model classes. One model per database table. |
| `Providers/`         | Service providers. `AppServiceProvider` is the main one. Create additional providers for large apps with granular bootstrapping needs. |

---

## Generated Directories (On Demand)

These directories are created automatically by `php artisan make:*` commands when needed. Do not create them manually if empty.

| Directory        | Artisan Command          | Purpose |
|------------------|--------------------------|---------|
| `Broadcasting/`  | `make:channel`           | Broadcast channel classes for real-time events. |
| `Console/`       | `make:command`           | Custom Artisan commands. Auto-discovered — no manual registration needed in Laravel 12. |
| `Events/`        | `make:event`             | Event classes for decoupled communication between app components. |
| `Exceptions/`    | `make:exception`         | Custom exception classes. |
| `Jobs/`          | `make:job`               | Queueable job classes. Use `ShouldQueue` interface for async processing. |
| `Listeners/`     | `make:listener`          | Event listener classes. Pair with events for decoupled architecture. |
| `Mail/`          | `make:mail`              | Mailable classes representing email messages. |
| `Notifications/` | `make:notification`      | Notification classes (email, SMS, database, broadcast). |
| `Policies/`      | `make:policy`            | Authorization policy classes. Auto-discovered if following naming conventions (`UserPolicy` for `User` model). |
| `Rules/`         | `make:rule`              | Custom validation rule objects. |
| `Enums/`         | `make:enum`              | PHP 8.1+ backed enums. Keys should be TitleCase. |

---

## Scaling Patterns

As your application grows beyond the default structure, consider these patterns:

### 1. Actions Pattern

Single-purpose classes that encapsulate a discrete piece of business logic. Keeps controllers thin and logic reusable.

```
app/
└── Actions/
    ├── User/
    │   ├── CreateUserAction.php
    │   ├── UpdateUserAction.php
    │   └── DeleteUserAction.php
    └── Order/
        ├── PlaceOrderAction.php
        └── CancelOrderAction.php
```

```php
// app/Actions/User/CreateUserAction.php
namespace App\Actions\User;

use App\Models\User;

class CreateUserAction
{
    public function execute(array $data): User
    {
        return User::create($data);
    }
}
```

### 2. Services Pattern

For complex operations that coordinate multiple models, external APIs, or orchestrate multiple actions.

```
app/
└── Services/
    ├── PaymentService.php
    ├── NotificationService.php
    └── ReportService.php
```

### 3. Data Transfer Objects (DTOs)

Typed objects for passing structured data between layers. Prefer over raw arrays for clarity and type safety.

```
app/
└── DataTransferObjects/
    ├── UserData.php
    └── OrderData.php
```

### 4. Domain-Driven Structure (Large Applications)

For very large applications, organize by domain/feature instead of by technical layer:

```
app/
├── Domain/
│   ├── User/
│   │   ├── Actions/
│   │   ├── Models/
│   │   ├── Events/
│   │   ├── Listeners/
│   │   ├── Policies/
│   │   └── DataTransferObjects/
│   ├── Billing/
│   │   ├── Actions/
│   │   ├── Models/
│   │   ├── Jobs/
│   │   └── Services/
│   └── Notification/
│       ├── Mail/
│       ├── Notifications/
│       └── Listeners/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   └── V1/
│   │   └── Web/
│   └── Requests/
├── Models/     ← can remain here or move into Domain
└── Providers/
```

### 5. Scaled Default Structure (Recommended for Most Projects)

The most pragmatic approach — enhance the default Laravel structure without over-engineering:

```
app/
├── Actions/            ← business logic
├── Console/
│   └── Commands/
├── Enums/              ← PHP enums
├── Events/
├── Exceptions/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   └── V1/    ← API versioning
│   │   └── Web/
│   ├── Middleware/
│   ├── Requests/       ← Form Requests
│   └── Resources/      ← API Resources
├── Jobs/
├── Listeners/
├── Mail/
├── Models/
├── Notifications/
├── Policies/
├── Providers/
├── Rules/              ← custom validation rules
└── Services/           ← complex orchestration
```

---

## Naming Conventions

### Files & Classes

| Type              | Convention                    | Example                        |
|-------------------|-------------------------------|--------------------------------|
| Controller        | Singular + `Controller`       | `UserController.php`           |
| Model             | Singular, PascalCase          | `User.php`, `OrderItem.php`    |
| Migration         | Snake_case with timestamp     | `2024_01_15_create_users_table` |
| Factory           | Model name + `Factory`        | `UserFactory.php`              |
| Seeder            | Model name + `Seeder`         | `UserSeeder.php`               |
| Form Request      | Verb + Model + `Request`      | `StoreUserRequest.php`         |
| Policy            | Model name + `Policy`         | `UserPolicy.php`               |
| Event             | Past tense, descriptive       | `OrderPlaced.php`              |
| Listener          | Present tense, action         | `SendOrderConfirmation.php`    |
| Job               | Imperative, descriptive       | `ProcessPayment.php`           |
| Mail              | Descriptive noun              | `WelcomeEmail.php`             |
| Notification      | Descriptive noun              | `InvoicePaid.php`              |
| Middleware         | Descriptive adjective/noun   | `EnsureEmailIsVerified.php`    |
| Enum              | Singular, TitleCase keys      | `UserStatus.php` (`Active`, `Suspended`) |
| Action            | Verb + Noun + `Action`        | `CreateUserAction.php`         |
| API Resource       | Model name + `Resource`      | `UserResource.php`             |
| Rule              | Descriptive adjective         | `Uppercase.php`                |

### Routes

- Use kebab-case for URI segments: `/user-profiles`, not `/userProfiles`.
- Prefer named routes and `route()` helper for URL generation.
- Use resource routes when CRUD applies: `Route::resource('users', UserController::class)`.

### Database

- Table names: plural snake_case (`users`, `order_items`).
- Pivot tables: singular model names in alphabetical order (`order_user`).
- Column names: snake_case (`first_name`, `created_at`).

---

## Key Principles

### 1. Use Artisan Generators

Always use `php artisan make:*` commands to create files. This ensures correct namespace, location, and boilerplate.

```bash
php artisan make:model Post --migration --factory --seeder --no-interaction
php artisan make:controller PostController --resource --no-interaction
php artisan make:request StorePostRequest --no-interaction
php artisan make:policy PostPolicy --model=Post --no-interaction
```

### 2. Keep Controllers Thin

Controllers should only:
- Accept and validate the request (via Form Requests)
- Delegate to an action/service
- Return a response

```php
class UserController extends Controller
{
    public function store(StoreUserRequest $request, CreateUserAction $action): RedirectResponse
    {
        $action->execute($request->validated());

        return redirect()->route('users.index');
    }
}
```

### 3. One Model Per Table

Every database table should have a corresponding Eloquent model. Define relationships, casts, and scopes on the model.

### 4. Form Requests for Validation

Never validate inline in controllers. Create dedicated Form Request classes with `rules()` and `authorize()`.

### 5. Policies for Authorization

Use Laravel's policy auto-discovery. Place `UserPolicy` in `app/Policies/` and it auto-maps to the `User` model.

### 6. Eager Load Relationships

Prevent N+1 queries by always eager loading relationships:

```php
$users = User::with(['posts', 'roles'])->get();
```

### 7. Use Queued Jobs for Heavy Operations

Any operation that takes more than a few hundred milliseconds should be a queued job implementing `ShouldQueue`.

### 8. Environment Config Pattern

```php
// config/services.php — use env() ONLY in config files
'stripe' => [
    'key' => env('STRIPE_KEY'),
],

// Everywhere else — use config()
$key = config('services.stripe.key');
```

### 9. Test Organization

Mirror the app structure in tests:

```
tests/
├── Feature/
│   ├── Http/
│   │   └── Controllers/
│   │       └── UserControllerTest.php
│   ├── Actions/
│   │   └── CreateUserActionTest.php
│   └── ExampleTest.php
├── Unit/
│   ├── Models/
│   │   └── UserTest.php
│   └── ExampleTest.php
├── Pest.php
└── TestCase.php
```

### 10. Don't Over-Architect

- Start with the default structure
- Add directories (Actions, Services, DTOs) only when the need arises
- A simple CRUD app doesn't need domain-driven design
- Three similar lines of code is better than a premature abstraction
- Let the project complexity guide the architecture, not the other way around

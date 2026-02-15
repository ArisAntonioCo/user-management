# Section 2: User Management CRUD (API + UI)

## What This Section Is About

CRUD stands for **Create, Read, Update, Delete** — the four basic operations you can do with data. This section is about building an admin-style interface where authenticated users can manage other users. The UI pages talk to the API endpoints (they don't bypass them), so the API is the single source of truth.

---

## How It Works (The Big Picture)

1. An authenticated user visits `/users` in their browser
2. The Blade page loads, then JavaScript calls `GET /api/v1/users` to fetch the list
3. The API checks if the user is authenticated (via Sanctum token), runs the query, and returns paginated JSON data
4. JavaScript renders the data into an HTML table
5. Actions like Create, Edit, and Delete all work the same way — the UI sends requests to the API, and the API does the actual work

---

## API Endpoints

All user CRUD endpoints require authentication (`auth:sanctum` middleware). They're handled by `UserController`.

| Method | Endpoint | What It Does | Who Can Do It |
|--------|----------|-------------|--------------|
| GET | `/api/v1/users` | List all users (paginated, 15 per page) | Any authenticated user |
| GET | `/api/v1/users/{id}` | Get a single user's details | Any authenticated user |
| POST | `/api/v1/users` | Create a new user | Admin only |
| PUT | `/api/v1/users/{id}` | Update a user | Admin, or the user themselves |
| DELETE | `/api/v1/users/{id}` | Delete a user | Admin only (can't delete yourself) |

---

## Key Files and What They Do

### Controller: `app/Http/Controllers/Api/V1/UserController.php`

This controller is clean and simple. Each method is just a few lines because the heavy lifting (validation, authorization) happens in other files:

- **`index()`** — Returns a paginated list of users. Uses `User::paginate(15)` which automatically handles page numbers via query params like `?page=2`. The result is wrapped in `UserResource::collection()` so sensitive fields are hidden.

- **`store()`** — Creates a new user. The `StoreUserRequest` handles both validation AND authorization (only admins can do this). If everything passes, it creates the user and returns a `201 Created` response.

- **`show()`** — Uses Laravel's **route model binding** — the `{user}` in the URL is automatically converted into a `User` model. If the user doesn't exist, Laravel returns a `404` automatically.

- **`update()`** — Updates only the fields that were sent in the request (thanks to `sometimes` validation rules). The `UpdateUserRequest` checks that either you're an admin or you're editing your own profile.

- **`destroy()`** — Deletes a user. Uses `Gate::authorize('delete', $user)` to check the policy. Also deletes the user's tokens first (so any active sessions are killed before the account is removed).

### API Resource: `app/Http/Resources/UserResource.php`

This is like a filter for what data gets sent to the frontend. Instead of sending the raw database row (which includes `password`, `remember_token`, etc.), the UserResource only sends safe fields:

```php
return [
    'id' => $this->id,
    'name' => $this->name,
    'email' => $this->email,
    'role' => $this->role,
    'created_at' => $this->created_at,
    'updated_at' => $this->updated_at,
];
```

No `password`, no `remember_token` — those never leave the server.

### Form Requests (Validation + Authorization)

These files handle two jobs at once: **checking if the user is allowed** to do this action, and **validating the data** they sent.

**`app/Http/Requests/User/StoreUserRequest.php`**

```php
public function authorize(): bool
{
    return $this->user()->isAdmin(); // Only admins can create users
}

public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
        'password' => ['required', 'string', 'min:8', 'confirmed'],
        'role' => ['sometimes', 'string', new Enum(UserRole::class)],
    ];
}
```

- `authorize()` returns `true` only if the logged-in user is an admin. If it returns `false`, Laravel sends a `403 Forbidden` response automatically.
- `rules()` defines what data is required. The `confirmed` rule on password means the request must also include `password_confirmation` with the same value.
- `sometimes` on role means it's optional — if you don't send it, the user defaults to `UserRole::User`.

**`app/Http/Requests/User/UpdateUserRequest.php`**

Similar to Store, but:
- `authorize()` allows admins OR the user editing themselves
- All fields use `sometimes` (you only need to send what you want to change)
- The `email` unique check ignores the current user (so you don't get a "email already taken" error when you're not changing your email)

### Policy: `app/Policies/UserPolicy.php`

Policies are Laravel's way of defining "who can do what." The UserPolicy defines rules for each action:

```php
viewAny()  → true                           // Anyone logged in can see the user list
view()     → true                           // Anyone logged in can view a user profile
create()   → $user->isAdmin()              // Only admins can create users
update()   → admin OR self                  // Admins can edit anyone, users can edit themselves
delete()   → admin AND not self             // Admins can delete others, but not themselves
```

The "admin cannot delete themselves" rule prevents accidentally locking yourself out of the system.

### Routes (`routes/api.php`)

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
});
```

`apiResource` is a Laravel shortcut that creates all 5 RESTful routes (index, store, show, update, destroy) in one line. It's equivalent to writing:

```php
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{user}', [UserController::class, 'show']);
Route::put('/users/{user}', [UserController::class, 'update']);
Route::delete('/users/{user}', [UserController::class, 'destroy']);
```

---

## Frontend Pages

All pages are Blade templates that use JavaScript to communicate with the API.

### Users List Page (`resources/views/users/index.blade.php`)

- Fetches users from `GET /api/v1/users`
- Renders an HTML table with Name, Email, Role, and Actions columns
- Includes pagination (Next/Previous buttons)
- The "Create User" button is only visible to admins
- Edit and Delete buttons are shown based on the user's role
- Delete shows a confirmation dialog before actually deleting

### Create User Page (`resources/views/users/create.blade.php`)

- A form with fields: Name, Email, Password, Confirm Password, Role
- On submit, sends `POST /api/v1/users`
- Shows validation errors returned by the API
- Redirects to the users list on success

### Edit User Page (`resources/views/users/edit.blade.php`)

- First fetches the user's current data from `GET /api/v1/users/{id}` and pre-fills the form
- On submit, sends `PUT /api/v1/users/{id}` with only the changed fields
- Password field is optional (leave blank to keep the current password)

### Web Routes

```php
Route::get('/users', [UserViewController::class, 'index']);
Route::get('/users/create', [UserViewController::class, 'create']);
Route::get('/users/{user}/edit', [UserViewController::class, 'edit']);
```

The web controllers (`UserViewController`) only render the Blade views. They don't interact with the database at all — that's the API's job.

---

## Pagination

The `index()` method uses `User::paginate(15)`, which means:
- It fetches 15 users at a time
- The response includes a `meta` object with `current_page`, `last_page`, `per_page`, `total`
- The response includes a `links` object with `first`, `last`, `prev`, `next` URLs
- The frontend reads these to render pagination controls
- To get the next page, the frontend calls `GET /api/v1/users?page=2`

---

## The Flow: Creating a User (Step by Step)

1. Admin clicks "Create User" on the users list page
2. Browser navigates to `/users/create`
3. `UserViewController@create` returns the `users.create` Blade view
4. Admin fills in the form and clicks Submit
5. JavaScript collects the form data and sends `POST /api/v1/users` with the JSON body
6. Laravel routes the request to `UserController@store`
7. Before the controller runs, `StoreUserRequest` checks:
   - Is the user logged in? (Sanctum middleware)
   - Is the user an admin? (`authorize()` method)
   - Is the data valid? (`rules()` method)
8. If any check fails, an error response is returned automatically
9. If everything passes, the controller creates the user and returns `201` with the new user's data
10. JavaScript shows a success message and redirects to the users list

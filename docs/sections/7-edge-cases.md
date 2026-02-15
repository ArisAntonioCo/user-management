# Edge Cases & Security Fixes

This document explains the edge cases found in the application and how each was handled.

---

## Critical Fixes (Applied)

### 1. Privilege Escalation via Self-Update

**What was the problem?**
Any logged-in user could promote themselves to admin by sending a direct API request like:

```
PUT /api/v1/users/5
{ "role": "admin" }
```

The frontend hid the role dropdown from non-admins, but that's just a UI restriction. Anyone with a tool like Postman could bypass it because the backend accepted the `role` field from any user updating their own profile.

**How we fixed it:**
In `UpdateUserRequest.php`, the `role` validation rule is now only included when the requesting user is an admin:

```php
if ($this->user()->isAdmin()) {
    $rules['role'] = ['sometimes', 'string', new Enum(UserRole::class)];
}
```

If a non-admin sends `role` in the request body, it gets ignored because it's not in the validated rules. The server simply strips it out.

**File:** `app/Http/Requests/User/UpdateUserRequest.php`

---

### 2. XSS (Cross-Site Scripting) via innerHTML

**What was the problem?**
User-controlled data like `name`, `email`, and `role` was injected directly into HTML using template literals:

```js
// BEFORE (vulnerable)
html += `<td>${user.name}</td>`;
```

If someone set their name to `<img src=x onerror=alert('hacked')>`, that HTML would execute in every user's browser when they viewed the users list or dashboard. This could be used to steal auth tokens from localStorage.

**How we fixed it:**
We added an `escapeHtml()` function that converts special characters (`<`, `>`, `&`, `"`, `'`) into harmless text:

```js
export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;  // textContent auto-escapes
    return div.innerHTML;
}
```

Now all user data is escaped before being inserted into HTML:

```js
// AFTER (safe)
html += `<td>${escapeHtml(user.name)}</td>`;
```

The same fix was applied to `showErrors()` and `showSuccess()` which also used innerHTML with potentially unsafe content.

**Files:** `resources/js/utils/ui.js`, `resources/js/pages/dashboard.js`, `resources/js/pages/users/index.js`

---

### 3. XSS via Error/Success Messages

**What was the problem?**
The `showErrors()` and `showSuccess()` functions in `ui.js` injected messages directly into innerHTML without escaping. If a server error message ever contained user input (which validation messages sometimes do), it could execute as HTML.

**How we fixed it:**
Both functions now use `escapeHtml()` on all messages before injecting them:

```js
// BEFORE
container.innerHTML = `<div class="alert alert-danger">${errors}</div>`;

// AFTER
container.innerHTML = `<div class="alert alert-danger">${escapeHtml(errors)}</div>`;
```

**File:** `resources/js/utils/ui.js`

---

## High Priority Fixes (Applied)

### 4. Edit Page Stored Wrong User Data Structure

**What was the problem?**
When a user edited their own profile, the app updated the user data in localStorage. But it stored the wrong structure:

```js
// The API returns: { user: { data: { id: 1, name: "John", ... } } }
// But the code stored the wrapper, not the actual data:
setUser(result.user);  // Stored { data: { id: 1, name: "John" } }
```

After saving, `getUser().name` would return `undefined` because the data was nested one level deeper. This broke the sidebar (name, role, avatar all showed as blank/undefined).

**How we fixed it:**
Unwrap the response to get the actual user object:

```js
setUser(result.user.data || result.user);
```

**File:** `resources/js/pages/users/edit.js`

---

### 5. App Crashed on Corrupted localStorage

**What was the problem?**
The `getUser()` function called `JSON.parse()` on localStorage data without error handling:

```js
return user ? JSON.parse(user) : null;  // Crashes if data is corrupted
```

If localStorage contained invalid JSON (from a browser extension, manual editing, or incomplete write), `JSON.parse()` would throw a `SyntaxError` and crash every page in the app.

**How we fixed it:**
Wrapped it in a try-catch. If the data is corrupted, it cleans up and returns null instead of crashing:

```js
try {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
} catch {
    localStorage.removeItem('auth_user');
    return null;
}
```

**File:** `resources/js/services/auth.js`

---

### 6. API Client 401 Handling

**What was the problem?**
When the API returned a 401 (unauthenticated), the client needed to cleanly redirect to login without causing errors in calling code.

**How we fixed it:**
We use an **Axios response interceptor** that catches 401 responses globally. The interceptor clears the token and redirects to login, then rejects the promise so the caller's catch block handles it cleanly:

```js
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            removeToken();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

This is centralized — every API call gets 401 handling automatically without each page needing to check for it.

**File:** `resources/js/api/client.js`

---

## Medium Priority Fixes (Applied)

### 7. Forgot Password Leaked Email Existence

**What was the problem?**
The forgot-password endpoint told attackers whether an email was registered:

- Email exists: "We have emailed your password reset link!"
- Email doesn't exist: "We can't find a user with that email address."

An attacker could use this to build a list of registered emails (called "email enumeration").

**How we fixed it:**
Always return the same generic message regardless of whether the email exists:

```php
Password::sendResetLink($request->only('email'));

return response()->json([
    'message' => 'If an account exists with that email, we have sent a password reset link.',
]);
```

**File:** `app/Http/Controllers/Api/V1/AuthController.php`

---

### 8. Unbounded Token Accumulation

**What was the problem?**
Every time a user logged in, a new Sanctum token was created. But logout only deleted the current token. If a user:
- Logged in from multiple browsers
- Cleared their localStorage manually
- Simply logged in many times

Old tokens piled up in the `personal_access_tokens` database table forever, all still valid.

**How we fixed it:**
Delete all existing tokens before creating a new one on login:

```php
$user->tokens()->delete();
$token = $user->createToken('auth-token')->plainTextToken;
```

This means each user only has one valid token at a time. Logging in on a new device automatically invalidates the old session.

**File:** `app/Http/Controllers/Api/V1/AuthController.php`

---

## Known Limitations (Not Fixed)

These are lower-priority items that are acknowledged but not addressed in this version:

| Issue | Risk | Reason Not Fixed |
|-------|------|-----------------|
| Token stored in localStorage (not HttpOnly cookie) | If XSS exists, token can be stolen | Trade-off of SPA token-based auth. XSS is now mitigated by escaping. |
| No email verification on registration | Fake emails can register | Would require email service setup and verification flow |
| Rate limiting only by IP, not by email | Distributed brute-force possible | Current rate limiting (5 req/min) is sufficient for this scope |
| Create user page visible to non-admins before submit | User sees form, server rejects on submit | Low impact since server enforces authorization |
| No server-side auth guard on web routes | HTML served to anyone, JS redirects | API data is protected; HTML structure exposure is minimal risk |
| Pagination renders all page buttons | Poor UX with thousands of users | Current dataset is small; would need truncation for production scale |
| Case-sensitive email matching | Depends on database collation | PostgreSQL default collation handles this; normalizing would be a bonus |

---

## How to Think About Edge Cases

When building any web app, ask yourself:

1. **"What if the user bypasses the UI?"** - Never trust the frontend. Always validate and authorize on the backend (see fix #1).
2. **"What if the data contains HTML?"** - Always escape user data before putting it in the page (see fix #2).
3. **"What information am I leaking?"** - Error messages should be generic for security-sensitive operations (see fix #7).
4. **"What if something goes wrong?"** - Handle errors gracefully. Don't let one corrupted value crash the whole app (see fix #5).
5. **"What if this runs many times?"** - Clean up resources. Don't let data accumulate indefinitely (see fix #8).

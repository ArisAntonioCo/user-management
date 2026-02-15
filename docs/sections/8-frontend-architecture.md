# Frontend Architecture

How the Laravel frontend works compared to Next.js.

---

## Blade Components (No Imports Needed)

In Next.js:

```jsx
import { Card } from '@/components/ui/card';
<Card>...</Card>
```

In Laravel Blade, any file in `resources/views/components/` is **automatically available** as `<x-filename>`. No imports required.

```
resources/views/components/
├── button.blade.php       → <x-button>
├── card.blade.php         → <x-card>
├── modal.blade.php        → <x-modal>
├── page-header.blade.php  → <x-page-header>
├── form-input.blade.php   → <x-form-input>
├── form-select.blade.php  → <x-form-select>
├── auth-card.blade.php    → <x-auth-card>
└── sidebar-link.blade.php → <x-sidebar-link>
```

Laravel scans that folder at runtime. When it sees `<x-card>` in any Blade file, it renders `components/card.blade.php`.

Props work via `@props`:

```blade
{{-- components/card.blade.php --}}
@props(['title' => null])

<div class="border rounded bg-white">
    <div class="p-3">
        @if ($title)
            <h5>{{ $title }}</h5>
        @endif
        {{ $slot }}
    </div>
</div>
```

Usage:

```blade
<x-card title="My Card">
    <p>Content goes here.</p>
</x-card>
```

---

## How JS Pages Get Loaded

In Next.js, each file in `app/` is a route with its own component. Here, **Blade handles the HTML** and **JS handles the interactivity**.

### Step 1 — Page Identifier

Every Blade page sets a page name:

```blade
@section('page', 'users.index')
```

This renders into the `<body>` tag:

```html
<body data-page="users.index">
```

### Step 2 — JS Entry Point

`app.js` is the single entry point (like `_app.tsx` in Next.js). It maps page names to JS modules:

```js
import * as usersIndexPage from './pages/users/index';
import * as dashboardPage from './pages/dashboard';

const pages = {
    'auth.login': loginPage,
    'users.index': usersIndexPage,
    'dashboard': dashboardPage,
};
```

### Step 3 — Init on Page Load

On `DOMContentLoaded`, it reads `data-page` and calls the matching module's `init()`:

```js
const page = document.body.dataset.page;  // "users.index"
pages[page].init();                        // runs usersIndexPage.init()
```

Each page has one JS file with an `init()` function — the equivalent of a React component mounting.

---

## How API Requests Work

In Next.js you might use `fetch('/api/users')` or server actions. Here it works similarly.

`api/client.js` exports an **Axios instance** configured with:

- A base URL of `/api/v1`
- A **request interceptor** that attaches the auth token from `localStorage`
- A **response interceptor** that handles 401 responses (clears token, redirects to login)

```js
// Usage:
const { data } = await api.get('/users', { params: { page: 1, search: 'john' } });

// Axios automatically sends:
// GET http://localhost/api/v1/users?page=1&search=john
// Headers: { Authorization: 'Bearer <token>' }
```

Axios handles JSON parsing automatically — `data` is already a JavaScript object. The JS then builds HTML strings and inserts them with `innerHTML`.

---

## Full Request Lifecycle

### Next.js

```
Browser → Next.js route → React component → fetch('/api/...') → API route → DB
```

### This Laravel App

```
Browser → Laravel route → Blade template (static HTML shell)
       → JS init() runs → api.get('/users') → Laravel API controller → DB
       → JS builds HTML from response → inserts into DOM
```

Laravel renders the **static HTML shell** (layout, sidebar, page header), then **JS takes over** for all dynamic content (table data, forms, search).

---

## JS File Structure

```
resources/js/
├── app.js                  ← Entry point, page router, global event listeners
├── bootstrap.js            ← Bootstrap JS import
├── api/
│   └── client.js           ← Axios instance with auth interceptors
├── services/
│   └── auth.js             ← Token/user management in localStorage
├── utils/
│   └── ui.js               ← showLayout(), escapeHtml(), showErrors(), showSuccess()
└── pages/
    ├── dashboard.js         ← Dashboard init()
    ├── auth/
    │   ├── login.js         ← Login form handling
    │   ├── register.js      ← Registration form handling
    │   ├── forgot-password.js
    │   └── reset-password.js
    └── users/
        ├── index.js         ← Users table, search, pagination, delete
        ├── create.js        ← Create user form
        └── edit.js          ← Edit user form
```

---

## Concept Comparison

| Concept | Next.js | This Laravel App |
|---------|---------|------------------|
| Components | `import { Card }` | `<x-card>` (auto-discovered) |
| Routing | File-based (`app/users/page.tsx`) | `data-page` attribute + JS map |
| Data fetching | `fetch()` / server actions | Axios instance with interceptors |
| Rendering | React JSX (virtual DOM) | Blade (static) + JS `innerHTML` (dynamic) |
| State | `useState` / `useEffect` | Module-level variables (`let currentPage`) |
| Auth | NextAuth / middleware | Sanctum tokens in `localStorage` |
| Styling | Tailwind + CSS modules | Bootstrap + Tailwind + custom CSS classes |

---

## Key Differences from Next.js

1. **No virtual DOM** — JS directly manipulates the DOM with `innerHTML` and `addEventListener`
2. **No hydration** — Blade renders complete HTML, JS adds interactivity after page load
3. **No server components** — All data fetching happens client-side via API calls
4. **Single bundle** — One `app.js` file handles all pages (no code splitting)
5. **Manual state** — No React state management; uses plain variables and localStorage

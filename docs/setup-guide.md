# Setup & Quick Reference Guide

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Composer](https://getcomposer.org/) installed
- [Node.js](https://nodejs.org/) with pnpm (`npm install -g pnpm`)

## Fresh Setup (First Time)

```bash
# 1. Clone the repo
git clone <repo-url> user-management
cd user-management

# 2. Install PHP dependencies
composer install

# 3. Copy environment file
cp .env.example .env

# 4. Generate app key
php artisan key:generate

# 5. Install Sail (select: pgsql, redis, mailpit)
php artisan sail:install

# 6. Start Docker containers
./vendor/bin/sail up -d

# 7. Run migrations and seed
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan db:seed

# 8. Install frontend dependencies and build (inside container)
./vendor/bin/sail root-shell
npm install -g pnpm
exit
./vendor/bin/sail shell
pnpm install
pnpm run build
exit
```

## Environment Variables (.env)

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

## Shell Aliases (Optional)

Add to `~/.zshrc`:

```bash
alias sail='./vendor/bin/sail'
alias pa='php artisan'
```

Then run `source ~/.zshrc` or open a new terminal tab.

**Note:** `pa` only works on your local machine. Inside the Docker container, use `php artisan` directly.

## Common Commands

### Docker / Sail

| Command | Description |
|---|---|
| `sail up -d` | Start all containers in background |
| `sail down` | Stop all containers |
| `sail down --volumes` | Stop containers and delete all data (DB, Redis, etc.) |
| `sail shell` | Enter the app container as normal user |
| `sail root-shell` | Enter the app container as root |
| `sail artisan <cmd>` | Run artisan command inside container |
| `sail logs` | View container logs |

### Artisan (run inside container or via `sail artisan`)

| Command | Description |
|---|---|
| `php artisan migrate` | Run pending migrations |
| `php artisan migrate:fresh --seed` | Drop all tables, re-migrate, and seed |
| `php artisan db:seed` | Run database seeders |
| `php artisan config:clear` | Clear cached config (run after .env changes) |
| `php artisan queue:work` | Process queued jobs (emails, etc.) |
| `php artisan test --compact` | Run all tests |
| `php artisan test --filter=testName` | Run specific test |
| `php artisan route:list` | List all registered routes |

### Frontend (run inside `sail shell`)

| Command | Description |
|---|---|
| `pnpm install` | Install JS dependencies |
| `pnpm run build` | Build frontend for production |
| `pnpm run dev` | Start Vite dev server (hot reload) |

### Code Formatting

```bash
vendor/bin/pint --dirty --format agent
```

## URLs

| Service | URL |
|---|---|
| App | http://localhost |
| Mailpit (email viewer) | http://localhost:8025 |
| PgAdmin | http://localhost:5050 |

### PgAdmin Credentials

- **Login:** `admin@admin.com` / `admin`
- **Database connection:** Host `pgsql`, Port `5432`, Username from `.env`, Password from `.env`

## Default Login (After Seeding)

- **Email:** `admin@example.com`
- **Password:** `password`

## Testing the Email System

1. Make sure your `.env` has the correct mail config (Gmail or Mailpit)
2. Start the queue worker: `sail artisan queue:work`
3. Go to http://localhost/forgot-password
4. Enter an email address
5. Check your inbox (Gmail) or http://localhost:8025 (Mailpit)
6. Click the reset link in the email
7. Set a new password

**Important:** The queue worker must be running for emails to send. The `ResetPasswordNotification` is queued (`ShouldQueue`).

## Troubleshooting

### "Could not translate host name pgsql"
You're running a command on your local machine instead of inside Docker. Use `sail artisan` or `sail shell` first.

### "Nothing to migrate" + seed fails with duplicate
The database already has data. Run `php artisan migrate:fresh --seed` to reset everything.

### Frontend changes not showing
Rebuild the frontend:
```bash
sail shell
pnpm run build
exit
```
Or run `pnpm run dev` for hot reload during development.

### Config changes not taking effect
Clear the config cache after editing `.env`:
```bash
sail artisan config:clear
```

### Emails not sending
Make sure the queue worker is running:
```bash
sail artisan queue:work
```

### Port conflicts
If port 80 is already in use, add to `.env`:
```env
APP_PORT=8080
```
Then access the app at http://localhost:8080.

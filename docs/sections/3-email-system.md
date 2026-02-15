# Section 3: Email System

## What This Section Is About

The app needs to send emails — specifically, password reset emails. When a user forgets their password, they enter their email, and the system sends them a link to create a new one. We also use a **queue** so that sending emails doesn't slow down the user's experience.

---

## How It Works (The Big Picture)

1. User clicks "Forgot Password" and enters their email
2. The API creates a password reset token (a random string stored in the database)
3. Instead of sending the email right away (which could take a few seconds), the API pushes a "send this email" job onto the **queue**
4. The API immediately responds with "We've sent you an email" (even though it hasn't been sent yet — it's in the queue)
5. A **queue worker** (a background process) picks up the job and sends the email
6. The user receives the email with a link like `http://localhost/reset-password?token=abc123&email=user@example.com`
7. They click the link, set a new password, and they're good to go

---

## Why Use a Queue?

Sending an email involves connecting to an external mail server (like Gmail), which can take 1-5 seconds. Without a queue, the user would be staring at a loading spinner while the server talks to Gmail. With a queue:

- The API responds instantly ("We've sent your email")
- The actual sending happens in the background
- If the mail server is temporarily down, the queue can retry later

This is considered a senior-level practice in the assessment.

---

## Key Files

### Notification: `app/Notifications/ResetPasswordNotification.php`

This is the email itself. It defines what the email looks like and says:

```php
class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $token) {}

    public function toMail(object $notifiable): MailMessage
    {
        $url = url('/reset-password?token='.$this->token.'&email='.$notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Reset Password Notification')
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', $url)
            ->line('This password reset link will expire in '.config('auth.passwords.users.expire').' minutes.')
            ->line('If you did not request a password reset, no further action is required.');
    }
}
```

Key things to notice:

- **`implements ShouldQueue`** — This single line is what makes the email get queued instead of sent immediately. Without it, the email would be sent synchronously (blocking the request).
- **`use Queueable`** — This trait gives us queue features like retries and delays.
- **`$token`** — The password reset token, passed from the User model.
- **`toMail()`** — Builds the email using Laravel's `MailMessage` fluent API. You don't write raw HTML — Laravel generates a nice-looking email template for you.
- **`$url`** — The reset link points to our frontend page (`/reset-password`) with the token and email as query parameters.

### User Model Override: `app/Models/User.php`

```php
public function sendPasswordResetNotification($token): void
{
    $this->notify(new ResetPasswordNotification($token));
}
```

Laravel's built-in password reset system calls `sendPasswordResetNotification()` on the User model. By default, it sends a generic email. We override it to send our custom `ResetPasswordNotification` instead.

### AuthController Methods

**`forgotPassword()`** — Calls `Password::sendResetLink()`, which:
1. Looks up the user by email
2. Creates a reset token in the `password_reset_tokens` table
3. Calls `$user->sendPasswordResetNotification($token)` (our custom notification)

**`resetPassword()`** — Calls `Password::reset()`, which:
1. Looks up the token in the database
2. Checks if it's valid and not expired
3. Updates the user's password
4. Deletes all the user's Sanctum tokens (so they need to log in fresh)

---

## Mail Configuration

### For Local Development: Mailpit

Mailpit is a fake email server that catches all outgoing emails. It's included in our Docker setup. You don't need a real email account.

```env
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_FROM_ADDRESS="noreply@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

View caught emails at: **http://localhost:8025**

### For Production: Gmail SMTP

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

To get a Gmail app password:
1. Go to https://myaccount.google.com/apppasswords
2. You need 2FA (two-factor authentication) enabled on your Google account
3. Generate an app password — it'll be a 16-character string
4. Put it in quotes in `.env` since it may contain spaces

---

## Running the Queue Worker

Emails won't actually send until you start the queue worker:

```bash
./vendor/bin/sail artisan queue:work
```

This starts a background process that watches the queue and processes jobs (like sending emails) as they come in. Keep this running in a separate terminal tab while developing.

If you're wondering "why didn't my email arrive?" — it's almost always because the queue worker isn't running.

---

## Database Tables Involved

- **`password_reset_tokens`** — Stores the hashed reset token and the email. Created by Laravel's default migration. Tokens expire after 60 minutes (configured in `config/auth.php`).
- **`jobs`** — The queue table. When we push an email onto the queue, a row is created here. The queue worker picks it up and deletes the row after processing. Created by the migration at `database/migrations/0001_01_01_000002_create_jobs_table.php`.

---

## Testing the Email Flow

1. Make sure Docker is running: `./vendor/bin/sail up -d`
2. Start the queue worker: `./vendor/bin/sail artisan queue:work`
3. Visit http://localhost/forgot-password
4. Enter an email address (one that exists in the database)
5. Check Mailpit at http://localhost:8025 (or your Gmail inbox)
6. Click the reset link in the email
7. Set a new password
8. Log in with the new password

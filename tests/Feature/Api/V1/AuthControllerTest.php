<?php

use App\Models\User;
use Illuminate\Support\Facades\Password;

// Registration
test('user can register with valid data', function () {
    $response = $this->postJson('/api/v1/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'message',
            'user' => ['id', 'name', 'email', 'role'],
            'token',
        ]);

    $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
});

test('registration fails with invalid data', function () {
    $response = $this->postJson('/api/v1/register', [
        'name' => '',
        'email' => 'not-an-email',
        'password' => 'short',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'email', 'password']);
});

test('registration fails with duplicate email', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $response = $this->postJson('/api/v1/register', [
        'name' => 'Another User',
        'email' => 'taken@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

// Login
test('user can login with valid credentials', function () {
    User::factory()->create([
        'email' => 'jane@example.com',
        'password' => 'password123',
    ]);

    $response = $this->postJson('/api/v1/login', [
        'email' => 'jane@example.com',
        'password' => 'password123',
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'message',
            'user' => ['id', 'name', 'email', 'role'],
            'token',
        ]);
});

test('login fails with wrong password', function () {
    User::factory()->create([
        'email' => 'jane@example.com',
        'password' => 'password123',
    ]);

    $response = $this->postJson('/api/v1/login', [
        'email' => 'jane@example.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('login fails with non-existent email', function () {
    $response = $this->postJson('/api/v1/login', [
        'email' => 'nobody@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

// Logout
test('authenticated user can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/logout');

    $response->assertOk()
        ->assertJson(['message' => 'Logged out successfully.']);
});

test('unauthenticated user cannot logout', function () {
    $response = $this->postJson('/api/v1/logout');

    $response->assertStatus(401);
});

// Forgot Password
test('forgot password sends reset link for valid email', function () {
    User::factory()->create(['email' => 'user@example.com']);

    Password::shouldReceive('sendResetLink')
        ->once()
        ->andReturn(Password::RESET_LINK_SENT);

    $response = $this->postJson('/api/v1/forgot-password', [
        'email' => 'user@example.com',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['message']);
});

test('forgot password fails validation without email', function () {
    $response = $this->postJson('/api/v1/forgot-password', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

// Reset Password
test('password can be reset with valid token', function () {
    $user = User::factory()->create(['email' => 'user@example.com']);

    Password::shouldReceive('reset')
        ->once()
        ->andReturn(Password::PASSWORD_RESET);

    $response = $this->postJson('/api/v1/reset-password', [
        'token' => 'valid-token',
        'email' => 'user@example.com',
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['message']);
});

test('reset password fails with invalid data', function () {
    $response = $this->postJson('/api/v1/reset-password', [
        'token' => '',
        'email' => 'not-email',
        'password' => 'short',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['token', 'email', 'password']);
});

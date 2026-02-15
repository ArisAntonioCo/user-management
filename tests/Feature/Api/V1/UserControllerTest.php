<?php

use App\Models\User;

// Index
test('authenticated user can list users', function () {
    $user = User::factory()->create();
    User::factory(5)->create();

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/users');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [['id', 'name', 'email', 'role']],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
});

test('unauthenticated user cannot list users', function () {
    $response = $this->getJson('/api/v1/users');

    $response->assertStatus(401);
});

// Show
test('authenticated user can view a single user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->getJson("/api/v1/users/{$otherUser->id}");

    $response->assertOk()
        ->assertJsonStructure(['data' => ['id', 'name', 'email', 'role']]);
});

test('returns 404 for non-existent user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/users/99999');

    $response->assertStatus(404);
});

// Store
test('admin can create a user', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'user',
        ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['message', 'user' => ['id', 'name', 'email', 'role']]);

    $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
});

test('non-admin cannot create a user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

    $response->assertStatus(403);
});

test('create user fails with validation errors', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/users', [
            'name' => '',
            'email' => 'invalid',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'email', 'password']);
});

// Update
test('admin can update any user', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $response = $this->actingAs($admin, 'sanctum')
        ->putJson("/api/v1/users/{$user->id}", [
            'name' => 'Updated Name',
        ]);

    $response->assertOk()
        ->assertJsonPath('user.name', 'Updated Name');
});

test('user can update own profile', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/v1/users/{$user->id}", [
            'name' => 'My New Name',
        ]);

    $response->assertOk()
        ->assertJsonPath('user.name', 'My New Name');
});

test('non-admin cannot update other users', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/v1/users/{$otherUser->id}", [
            'name' => 'Hacked Name',
        ]);

    $response->assertStatus(403);
});

// Delete
test('admin can delete a user', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $response = $this->actingAs($admin, 'sanctum')
        ->deleteJson("/api/v1/users/{$user->id}");

    $response->assertStatus(204);
    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('admin cannot delete themselves', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin, 'sanctum')
        ->deleteJson("/api/v1/users/{$admin->id}");

    $response->assertStatus(403);
    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

test('non-admin cannot delete users', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->deleteJson("/api/v1/users/{$otherUser->id}");

    $response->assertStatus(403);
});

<?php

use App\Enums\UserRole;
use App\Models\User;

test('user has admin check method', function () {
    $admin = new User(['role' => UserRole::Admin]);
    $user = new User(['role' => UserRole::User]);

    expect($admin->isAdmin())->toBeTrue();
    expect($user->isAdmin())->toBeFalse();
});

test('user hides sensitive attributes', function () {
    $user = new User([
        'name' => 'Test',
        'email' => 'test@example.com',
    ]);

    $user->setRawAttributes([
        'name' => 'Test',
        'email' => 'test@example.com',
        'password' => 'hashed-value',
        'remember_token' => 'token',
    ]);

    $array = $user->toArray();

    expect($array)->not->toHaveKey('password');
    expect($array)->not->toHaveKey('remember_token');
});

test('user casts role to enum', function () {
    $user = new User(['role' => 'admin']);

    expect($user->role)->toBeInstanceOf(UserRole::class);
    expect($user->role)->toBe(UserRole::Admin);
});

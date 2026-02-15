<?php

use App\Enums\UserRole;

test('user role enum has expected values', function () {
    expect(UserRole::Admin->value)->toBe('admin');
    expect(UserRole::User->value)->toBe('user');
});

test('user role enum has exactly two cases', function () {
    expect(UserRole::cases())->toHaveCount(2);
});

<?php

use App\Http\Controllers\Web\AuthViewController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\UserViewController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

// Auth pages (guest only)
Route::get('/login', [AuthViewController::class, 'login'])->name('login');
Route::get('/register', [AuthViewController::class, 'register'])->name('register');
Route::get('/forgot-password', [AuthViewController::class, 'forgotPassword'])->name('password.request');
Route::get('/reset-password', [AuthViewController::class, 'resetPassword'])->name('password.reset');

// Protected pages (JS handles auth via token)
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/users', [UserViewController::class, 'index'])->name('users.index');
Route::get('/users/create', [UserViewController::class, 'create'])->name('users.create');
Route::get('/users/{user}/edit', [UserViewController::class, 'edit'])->name('users.edit');

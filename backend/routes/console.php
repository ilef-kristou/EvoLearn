<?php

use Illuminate\Support\Facades\Route;  // ← important pour utiliser Route

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Route::get('/test', function () {
    return 'Bonjour, Laravel fonctionne !';
});

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\FormationController;
use App\Http\Controllers\FormateurController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\PlanningController;
use App\Http\Controllers\PlanningJourController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminFormateurController;
use App\Http\Controllers\AdminChargeController;

use App\Http\Controllers\DemandeInscriptionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes d'authentification publiques
Route::post('/register', [RegisteredUserController::class, 'store'])
    ->middleware('guest')
    ->name('api.register');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest')
    ->name('api.login');

Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->middleware('guest')
    ->name('api.password.email');

Route::post('/reset-password', [NewPasswordController::class, 'store'])
    ->middleware('guest')
    ->name('api.password.store');

// Routes publiques accessibles sans authentification
Route::prefix('formations')->group(function () {
    Route::get('/', [FormationController::class, 'index']);
    Route::get('/{id}', [FormationController::class, 'show']);
    Route::post('/', [FormationController::class, 'store']);
    Route::put('/{id}', [FormationController::class, 'update']);
    Route::delete('/{id}', [FormationController::class, 'destroy']);
    Route::get('/available', [FormationController::class, 'available']);
    Route::patch('/{id}/reserve', [FormationController::class, 'incrementReservedPlaces']);
});

Route::prefix('salles')->group(function () {
    Route::get('/', [SalleController::class, 'index']);
    Route::get('/available', [SalleController::class, 'available']);
    Route::post('/', [SalleController::class, 'store']);
    Route::delete('/{id}', [SalleController::class, 'destroy']);
});

Route::prefix('formateurs')->group(function () {
    Route::get('/available', [FormateurController::class, 'availableFormateurs']);
    Route::get('/profile', [FormateurController::class, 'getProfile']);
    Route::put('/profile', [FormateurController::class, 'updateProfile']);
});



Route::prefix('plannings')->group(function () {
    Route::get('/', [PlanningController::class, 'index']);
    Route::get('/formation/{formation_id}', [PlanningController::class, 'getByFormation']);
    Route::post('/', [PlanningController::class, 'store']);
    Route::put('/{id}', [PlanningController::class, 'update']);
    Route::delete('/{id}', [PlanningController::class, 'destroy']);
    Route::patch('/{id}/accept', [PlanningController::class, 'acceptPlanning']);
    Route::patch('/{id}/refuse', [PlanningController::class, 'refusePlanning']);
});

Route::prefix('planning-jours')->group(function () {
    Route::get('/', [PlanningJourController::class, 'index']);
    Route::get('/planning/{planning_id}', [PlanningJourController::class, 'getByPlanning']);
    Route::post('/', [PlanningJourController::class, 'store']);
    Route::put('/{id}', [PlanningJourController::class, 'update']);
    Route::delete('/{id}', [PlanningJourController::class, 'destroy']);
});




Route::middleware(['jwt.auth'])->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json(auth()->user());
    });

    // Profil Participant
    Route::get('/participant/profile', [ParticipantController::class, 'getProfile']);
    Route::put('/participant/profile', [ParticipantController::class, 'updateProfile']);

    // Demandes inscription participant
    Route::post('/participant/demandes', [DemandeInscriptionController::class, 'store']);
});

// Routes protégées par JWT auth - exemple
Route::middleware(['auth:api'])->group(function () {
    Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('api.verification.send');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('api.logout');

    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });
});
// Routes admin accessibles sans authentification ni vérification admin
Route::apiResource('admin/formateurs', AdminFormateurController::class);
Route::apiResource('admin/charges', AdminChargeController::class);
Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
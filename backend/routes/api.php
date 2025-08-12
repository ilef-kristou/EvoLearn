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
use Tymon\JWTAuth\Facades\JWTAuth;

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
});

Route::middleware('jwt.auth')->prefix('plannings')->group(function () {
    Route::get('/', [PlanningController::class, 'index']);
    Route::get('/formation/{formationId}', [PlanningController::class, 'getByFormation']);
    Route::get('/formateur/{formateurId}', [PlanningController::class, 'getByFormateur']);
    Route::post('/', [PlanningController::class, 'store']);
    Route::get('/{id}', [PlanningController::class, 'show']);
    Route::put('/{id}', [PlanningController::class, 'update']);
    Route::delete('/{id}', [PlanningController::class, 'destroy']);
    Route::post('/{id}/accept', [PlanningController::class, 'acceptPlanning']);
    Route::post('/{id}/refuse', [PlanningController::class, 'refusePlanning']);
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
        try {
            $user = JWTAuth::parseToken()->authenticate();
            return response()->json($user);
        } catch (\Exception $e) {
            \Log::error('JWT authentication failed for /api/user', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }
    });

    Route::get('/participant/profile', [ParticipantController::class, 'getProfile']);
    Route::put('/participant/profile', [ParticipantController::class, 'updateProfile']);
    Route::get('/formateur/profile', [FormateurController::class, 'getProfile']);
    Route::put('/formateur/profile', [FormateurController::class, 'updateProfile']);
    Route::post('/participant/demandes', [DemandeInscriptionController::class, 'store']);
});

Route::middleware('jwt.auth')->group(function () {
    Route::get('/demandes-inscription', [DemandeInscriptionController::class, 'index']);
    Route::patch('/demandes-inscription/{id}/statut', [DemandeInscriptionController::class, 'updateStatus']);
    Route::delete('/demandes-inscription/{id}', [DemandeInscriptionController::class, 'destroy']);
});

Route::middleware(['jwt.auth'])->group(function () {
    Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('api.verification.send');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('api.logout');
});

Route::apiResource('admin/formateurs', AdminFormateurController::class);
Route::apiResource('admin/charges', AdminChargeController::class);
Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
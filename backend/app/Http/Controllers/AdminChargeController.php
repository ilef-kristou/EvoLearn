<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\ChargeAccountCreated;

class AdminChargeController extends Controller
{
    public function store(Request $request)
    {
        \Log::info('Admin - Début création chargé', ['data' => $request->all()]);
        try {
            $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'departement' => 'required|string|max:255',
                'telephone' => 'required|string|max:30',
            ]);
            \Log::info('Admin - Validation OK (chargé)');

            $password = Str::random(10);
            \Log::info('Admin - Mot de passe généré (chargé)', ['password' => $password]);

            $user = User::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'password' => Hash::make($password),
                'role' => 'charge',
                'departement' => $request->departement,
                'telephone' => $request->telephone,
            ]);
            \Log::info('Admin - Chargé créé', $user->toArray());

            Mail::to($user->email)->send(new ChargeAccountCreated($user, $password));
            \Log::info('Admin - Mail envoyé (chargé)', ['to' => $user->email]);

            return response()->json(['message' => 'Chargé créé et email envoyé !', 'user' => $user]);
        } catch (\Exception $e) {
            \Log::error('Admin - Exception création chargé', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
} 
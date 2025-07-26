<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\FormateurAccountCreated;

class AdminFormateurController extends Controller
{
    public function store(Request $request)
    {
        \Log::info('Admin - Début création formateur', ['data' => $request->all()]);
        try {
            $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'specialite' => 'required|string|max:255',
                'telephone' => 'required|string|max:30',
            ]);
            \Log::info('Admin - Validation OK');

            $password = \Illuminate\Support\Str::random(10);
            \Log::info('Admin - Mot de passe généré', ['password' => $password]);

            $user = User::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'password' => \Illuminate\Support\Facades\Hash::make($password),
                'role' => 'formateur',
                'specialite' => $request->specialite,
                'telephone' => $request->telephone,
                'image' => $request->image ?? 'images/pdp.webp',
            ]);
            \Log::info('Admin - Formateur créé', $user->toArray());

            \Mail::to($user->email)->send(new \App\Mail\FormateurAccountCreated($user, $password));
            \Log::info('Admin - Mail envoyé', ['to' => $user->email]);

            return response()->json(['message' => 'Formateur créé et email envoyé !', 'user' => $user]);
        } catch (\Exception $e) {
            \Log::error('Admin - Exception création formateur', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
} 
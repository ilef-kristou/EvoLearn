<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        \Log::info('Appel inscription', ['data' => $request->all()]);

        try {
            $request->validate([
                'nom' => ['required', 'string', 'max:255'],
                'prenom' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
                'role' => ['required', 'in:admin,formateur,charge,participant'],
                'telephone' => ['nullable', 'string', 'max:30'],
                'niveau' => ['nullable', 'string', 'max:255'],
                'date_naissance' => ['nullable', 'date'],
            ]);
            \Log::info('Validation OK');

            $user = User::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'telephone' => $request->telephone,
                'niveau' => $request->niveau,
                'date_naissance' => $request->date_naissance,
                'image' => $request->image ?? 'images/pdp.webp',
            ]);

            if ($user && $user->id) {
                \Log::info('Utilisateur créé avec succès', $user->toArray());
            } else {
                \Log::error('Échec de la création utilisateur', ['data' => $request->all()]);
            }

            event(new Registered($user));
            return response()->json($user, 201);

        } catch (\Exception $e) {
            \Log::error('Exception inscription', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Met à jour le profil du participant connecté.
     */
    public function update(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'nom' => ['sometimes', 'string', 'max:255'],
            'prenom' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'telephone' => ['nullable', 'string', 'max:30'],
            'image' => ['nullable', 'image', 'max:2048'], // max 2 Mo
        ]);

        // Gestion de l'upload d'image
        if ($request->hasFile('image')) {
            // Supprimer l'ancienne image si elle existe
            if ($user->image && \Storage::disk('public')->exists($user->image)) {
                \Storage::disk('public')->delete($user->image);
            }
            $path = $request->file('image')->store('images', 'public');
            $validated['image'] = $path;
        }

        $user->update($validated);

        return response()->json(['message' => 'Profil mis à jour avec succès', 'user' => $user]);
    }
}

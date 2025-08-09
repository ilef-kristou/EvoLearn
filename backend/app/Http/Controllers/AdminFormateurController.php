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
                'Image' => 'images/pdp.webp',
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


    public function index()
    {
        $formateurs = User::where('role', 'formateur')->get();
        return response()->json($formateurs);
    }

    public function update(Request $request, $id)
{
    try {
        $formateur = User::where('role', 'formateur')->findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $formateur->id,
            'specialite' => 'sometimes|string|max:255',
            'telephone' => 'sometimes|string|max:30',
            'image' => 'sometimes|string|max:255',
        ]);

        $formateur->update($validated);

        return response()->json(['message' => 'Formateur mis à jour avec succès', 'user' => $formateur]);
    } catch (\Exception $e) {
        \Log::error('Admin - Exception mise à jour formateur', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'Erreur lors de la mise à jour du formateur'], 500);
    }
}

    

    public function destroy($id)
    {
        try {
            $formateur = User::where('role', 'formateur')->findOrFail($id);
            
            // Supprimer l'image si ce n'est pas l'image par défaut
            if ($formateur->image && $formateur->image !== 'images/pdp.webp') {
                \Storage::disk('public')->delete($formateur->image);
            }
            
            $formateur->delete();
            
            return response()->json(['message' => 'Formateur supprimé avec succès']);
        } catch (\Exception $e) {
            \Log::error('Admin - Exception suppression formateur', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Erreur lors de la suppression du formateur'], 500);
        }
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ParticipantController extends Controller
{
    /**
     * Met à jour le profil du participant connecté.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'nom' => ['sometimes', 'string', 'max:255'],
            'prenom' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'telephone' => ['nullable', 'string', 'max:30'],
            'image' => ['nullable', 'string'], // Accepte base64 ou URL
        ]);

        // Gestion de l'image
        if ($request->has('image') && $request->image) {
            // Si c'est une image en base64
            if (strpos($request->image, 'data:image') === 0) {
                // Supprimer l'ancienne image si elle existe et n'est pas l'image par défaut
                if ($user->image && $user->image !== 'images/pdp.webp' && Storage::disk('public')->exists($user->image)) {
                    Storage::disk('public')->delete($user->image);
                }
                
                // Décoder et sauvegarder la nouvelle image
                $imageData = base64_decode(explode(',', $request->image)[1]);
                $imageName = 'images/' . time() . '_' . uniqid() . '.webp';
                Storage::disk('public')->put($imageName, $imageData);
                $validated['image'] = $imageName;
            } else {
                // Si c'est déjà un chemin, le garder tel quel
                $validated['image'] = $request->image;
            }
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour avec succès', 
            'user' => $user
        ]);
    }

    /**
     * Récupère le profil du participant connecté.
     */
    public function getProfile()
    {
        $user = Auth::user();
        return response()->json($user);
    }
} 
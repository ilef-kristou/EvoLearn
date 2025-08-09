<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class FormateurController extends Controller
{
    /**
     * Met à jour le profil du formateur connecté.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'nom' => ['sometimes', 'string', 'max:255'],
            'prenom' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'telephone' => ['nullable', 'string', 'max:30'],
            'specialite' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string'], // Accepte base64 ou URL
        ]);

        // Gestion de l'image
        if ($request->has('image') && $request->image) {
            if (strpos($request->image, 'data:image') === 0) {
                if ($user->image && $user->image !== 'images/pdp.webp' && Storage::disk('public')->exists($user->image)) {
                    Storage::disk('public')->delete($user->image);
                }
                
                $imageData = base64_decode(explode(',', $request->image)[1]);
                $imageName = 'images/' . time() . '_' . uniqid() . '.webp';
                Storage::disk('public')->put($imageName, $imageData);
                $validated['image'] = $imageName;
            } else {
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
     * Récupère le profil du formateur connecté.
     */
    public function getProfile()
    {
        $user = Auth::user();
        return response()->json($user);
    }

    /**
     * Récupère les formateurs disponibles
     */
    public function availableFormateurs()
    {
        try {
            $formateurs = User::where('role', 'formateur')
                ->select('id', 'nom', 'prenom', 'specialite')
                ->get();
            
            return response()->json($formateurs);
        } catch (\Exception $e) {
            \Log::error('Error fetching available formateurs: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération des formateurs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
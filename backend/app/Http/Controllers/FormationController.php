<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class FormationController extends Controller
{
    public function index()
    {
        try {
            $formations = Formation::all();
            return response()->json($formations);
        } catch (\Exception $e) {
            Log::error('Error fetching formations: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération des formations',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'titre' => 'required|string|max:255',
                'description' => 'required|string',
                'date_debut' => 'required|date|after_or_equal:today',
                'date_fin' => 'required|date|after:date_debut',
                'places_disponibles' => 'required|integer|min:1',
                'places_reservees' => 'sometimes|integer|min:0|lte:places_disponibles',
                'statut' => [
                    'required',
                    'string',
                    Rule::in(['Planifié', 'En Préparation', 'En Cours', 'Terminé', 'planifie', 'en_preparation', 'en_cours', 'termine']),
                ],
                'image' => 'nullable|string',
                'niveau_requis' => 'nullable|string|max:255',
            ]);

            // Normalize statut
            $validated['statut'] = strtolower(str_replace(' ', '_', $validated['statut']));

            $formation = Formation::create($validated);

            return response()->json([
                'message' => 'Formation créée avec succès',
                'data' => $formation,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error in store: ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating formation: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $formation = Formation::findOrFail($id);
            return response()->json($formation);
        } catch (\Exception $e) {
            Log::error('Error fetching formation: ' . $e->getMessage());
            return response()->json([
                'message' => 'Formation non trouvée',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $formation = Formation::findOrFail($id);

            $validated = $request->validate([
                'titre' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'date_debut' => 'sometimes|date|after_or_equal:today',
                'date_fin' => 'sometimes|date|after:date_debut',
                'places_disponibles' => 'sometimes|integer|min:1',
                'places_reservees' => 'sometimes|integer|min:0|lte:places_disponibles',
                'statut' => [
                    'sometimes',
                    'string',
                    Rule::in(['Planifié', 'En Préparation', 'En Cours', 'Terminé', 'planifie', 'en_preparation', 'en_cours', 'termine']),
                ],
                'image' => 'sometimes|nullable|string',
                'niveau_requis' => 'sometimes|nullable|string|max:255',
            ]);

            // Normalize statut if provided
            if (isset($validated['statut'])) {
                $validated['statut'] = strtolower(str_replace(' ', '_', $validated['statut']));
            }

            // Update only provided fields
            $formation->update(array_filter($validated, fn($value) => !is_null($value)));

            return response()->json([
                'message' => 'Formation mise à jour avec succès',
                'data' => $formation->fresh(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error in update: ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Formation not found: ' . $e->getMessage());
            return response()->json([
                'message' => 'Formation non trouvée',
                'error' => $e->getMessage(),
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error updating formation: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function incrementReservedPlaces($id)
    {
        try {
            $formation = Formation::findOrFail($id);

            if ($formation->places_reservees >= $formation->places_disponibles) {
                return response()->json([
                    'message' => 'Aucune place disponible',
                ], 400);
            }

            $formation->increment('places_reservees');

            return response()->json([
                'message' => 'Place réservée avec succès',
                'data' => $formation->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error incrementing reserved places: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la réservation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $formation = Formation::findOrFail($id);
            $formation->delete();

            return response()->json([
                'message' => 'Formation supprimée avec succès',
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting formation: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
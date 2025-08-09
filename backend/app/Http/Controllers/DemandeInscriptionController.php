<?php

namespace App\Http\Controllers;

use App\Models\DemandeInscription;
use App\Models\Formation;
use Illuminate\Http\Request;

class DemandeInscriptionController extends Controller
{
    public function index()
    {
        $demandes = DemandeInscription::with(['formation', 'user'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($demande) {
                return [
                    'id' => $demande->id,
                    'utilisateur' => [
                        'nom' => $demande->nom,
                        'prenom' => $demande->prenom,
                        'email' => $demande->email,
                        'telephone' => $demande->telephone,
                        'niveauEtude' => $demande->niveau,
                    ],
                    'formation' => $demande->formation ? [
                        'id' => $demande->formation->id,
                        'titre' => $demande->formation->titre,
                        'description' => $demande->formation->description,
                        'date_debut' => $demande->formation->date_debut,
                        'date_fin' => $demande->formation->date_fin,
                        'places_disponibles' => $demande->formation->places_disponibles,
                        'places_reservees' => $demande->formation->places_reservees,
                        'niveau_requis' => $demande->formation->niveau_requis,
                    ] : null,
                    'dateDemande' => $demande->created_at,
                    'statut' => $demande->statut ?? 'En attente',
                ];
            });

        return response()->json($demandes);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'formation_id' => 'required|exists:formations,id',
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'email' => 'required|email',
            'telephone' => 'required|string',
            'niveau' => 'required|string',
        ]);

        $demande = DemandeInscription::create([
            'user_id' => $user->id,
            'formation_id' => $validated['formation_id'],
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'telephone' => $validated['telephone'],
            'niveau' => $validated['niveau'],
            'statut' => 'En attente'
        ]);

        return response()->json([
            'message' => 'Demande enregistrée avec succès',
            'demande' => $demande
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:Acceptée,Refusée,En attente'
        ]);

        $demande = DemandeInscription::findOrFail($id);
        $oldStatus = $demande->statut;
        $demande->statut = $request->statut;
        $demande->save();

        // Si le statut passe à "Acceptée"
        if ($request->statut === 'Acceptée' && $oldStatus !== 'Acceptée') {
            $formation = Formation::find($demande->formation_id);
            
            // Vérifier qu'il reste des places disponibles
            if ($formation->places_reservees >= $formation->places_disponibles) {
                return response()->json([
                    'message' => 'Plus de places disponibles pour cette formation',
                    'demande' => $demande
                ], 400);
            }

            // Incrémenter les places réservées
            $formation->increment('places_reservees');
        }

        // Si le statut passe de "Acceptée" à autre chose
        if ($oldStatus === 'Acceptée' && $request->statut !== 'Acceptée') {
            $formation = Formation::find($demande->formation_id);
            $formation->decrement('places_reservees');
        }

        return response()->json([
            'message' => 'Statut mis à jour avec succès',
            'demande' => $demande
        ]);
    }

    public function destroy($id)
    {
        $demande = DemandeInscription::findOrFail($id);
        
        // Si la demande était acceptée, décrémenter les places réservées
        if ($demande->statut === 'Acceptée') {
            $formation = Formation::find($demande->formation_id);
            $formation->decrement('places_reservees');
        }

        $demande->delete();

        return response()->json([
            'message' => 'Demande supprimée avec succès'
        ]);
    }
}
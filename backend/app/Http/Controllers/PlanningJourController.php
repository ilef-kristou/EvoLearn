<?php

namespace App\Http\Controllers;

use App\Models\PlanningJour;
use Illuminate\Http\Request;

class PlanningJourController extends Controller
{
    public function index()
    {
        return response()->json(
            PlanningJour::with(['planning.formation', 'planning.formateur', 'salle'])->get()
        );
    }

    public function getByPlanning($planningId)
    {
        return response()->json(
            PlanningJour::where('planning_id', $planningId)
                ->with(['salle'])
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'planning_id' => 'required|exists:plannings,id',
            'jour'        => 'required|string|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi,Dimanche',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin'   => 'required|date_format:H:i|after:heure_debut',
            'salle_id'    => 'required|exists:salles,id'
        ]);

        // Vérification disponibilité salle
        $exists = PlanningJour::where('salle_id', $validated['salle_id'])
            ->where('jour', $validated['jour'])
            ->where(function ($query) use ($validated) {
                $query->whereBetween('heure_debut', [$validated['heure_debut'], $validated['heure_fin']])
                      ->orWhereBetween('heure_fin', [$validated['heure_debut'], $validated['heure_fin']])
                      ->orWhere(function ($q) use ($validated) {
                          $q->where('heure_debut', '<=', $validated['heure_debut'])
                            ->where('heure_fin', '>=', $validated['heure_fin']);
                      });
            })
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'La salle est déjà réservée pour ce jour et créneau'
            ], 409);
        }

        $planningJour = PlanningJour::create($validated);

        return response()->json($planningJour, 201);
    }

    public function update(Request $request, $id)
    {
        $planningJour = PlanningJour::findOrFail($id);

        $validated = $request->validate([
            'planning_id' => 'required|exists:plannings,id',
            'jour'        => 'required|string|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi,Dimanche',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin'   => 'required|date_format:H:i|after:heure_debut',
            'salle_id'    => 'required|exists:salles,id'
        ]);

        // Vérification disponibilité salle excluant l'entrée en cours
        $exists = PlanningJour::where('salle_id', $validated['salle_id'])
            ->where('jour', $validated['jour'])
            ->where('id', '!=', $planningJour->id)
            ->where(function ($query) use ($validated) {
                $query->whereBetween('heure_debut', [$validated['heure_debut'], $validated['heure_fin']])
                      ->orWhereBetween('heure_fin', [$validated['heure_debut'], $validated['heure_fin']])
                      ->orWhere(function ($q) use ($validated) {
                          $q->where('heure_debut', '<=', $validated['heure_debut'])
                            ->where('heure_fin', '>=', $validated['heure_fin']);
                      });
            })
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'La salle est déjà réservée pour ce jour et créneau'
            ], 409);
        }

        $planningJour->update($validated);

        return response()->json($planningJour);
    }

    public function destroy($id)
    {
        PlanningJour::findOrFail($id)->delete();
        return response()->json(['message' => 'Jour supprimé']);
    }
}
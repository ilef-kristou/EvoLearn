<?php
namespace App\Http\Controllers;

use App\Models\Planning;
use Illuminate\Http\Request;

class PlanningController extends Controller
{
    public function index(Request $request)
    {
        $formationId = $request->query('formation_id');
        $weekStart = $request->query('week_start');
        
        $query = Planning::with(['formation', 'formateur', 'jours.salle']);
        
        if ($formationId) {
            $query->where('formation_id', $formationId);
        }

        return response()->json($query->get());
    }

    public function getByFormation($formationId)
    {
        return response()->json(
            Planning::where('formation_id', $formationId)
                ->with(['formation', 'formateur', 'jours.salle'])
                ->get()
        );
    }

    public function getByFormateur($formateurId)
{
    $plannings = Planning::where('formateur_id', $formateurId)
        ->with(['formation', 'formateur', 'jours.salle'])
        ->get();

    // Format the data for frontend display
    $formattedPlannings = [];
    if ($plannings) {
        foreach ($plannings as $planning) {
            if ($planning->jours) {
                foreach ($planning->jours as $jour) {
                    $formattedPlannings[] = [
                        'id' => $jour->id,
                        'jour' => $jour->jour,
                        'heure_debut' => $jour->heure_debut,
                        'heure_fin' => $jour->heure_fin,
                        'heure' => $jour->heure_debut . ' - ' . $jour->heure_fin,
                        'formation' => $planning->formation,
                        'salle' => $jour->salle ? $jour->salle->nom : 'Non attribuée',
                        'salle_id' => $jour->salle_id,
                        'planning_id' => $planning->id,
                        'statut' => $planning->statut,
                        'couleur' => $planning->couleur
                    ];
                }
            }
        }
    }

    return response()->json(['plannings' => $formattedPlannings]);
}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'formation_id' => 'required|exists:formations,id',
            'formateur_id' => 'required|exists:users,id',
            'couleur' => 'nullable|string|max:7',
            'statut' => 'nullable|string|in:en_attente,accepte,refuse',
            'cause_refus' => 'nullable|string|max:255',
        ]);

        $validated['statut'] = $validated['statut'] ?? 'en_attente';
        $validated['cause_refus'] = $validated['cause_refus'] ?? null;

        $planning = Planning::create($validated);

        return response()->json($planning, 201);
    }

    public function show($id)
    {
        return response()->json(
            Planning::with(['formation', 'formateur', 'jours.salle'])
                ->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $planning = Planning::findOrFail($id);

        $validated = $request->validate([
            'formation_id' => 'required|exists:formations,id',
            'formateur_id' => 'required|exists:users,id',
            'couleur' => 'nullable|string|max:7',
            'statut' => 'nullable|string|in:en_attente,accepte,refuse',
            'cause_refus' => 'nullable|string|max:255',
        ]);

        $planning->update($validated);

        return response()->json($planning);
    }

    public function acceptPlanning($id)
    {
        $planning = Planning::findOrFail($id);
        $planning->statut = 'accepte';
        $planning->cause_refus = null;
        $planning->save();

        return response()->json(['message' => 'Planning accepté avec succès']);
    }

    public function refusePlanning(Request $request, $id)
    {
        $validated = $request->validate([
            'cause_refus' => 'required|string|max:255'
        ]);

        $planning = Planning::findOrFail($id);
        $planning->statut = 'refuse';
        $planning->cause_refus = $validated['cause_refus'];
        $planning->save();

        return response()->json(['message' => 'Planning refusé', 'cause' => $planning->cause_refus]);
    }

    public function destroy($id)
    {
        Planning::findOrFail($id)->delete();
        return response()->json(['message' => 'Planning supprimé']);
    }
}
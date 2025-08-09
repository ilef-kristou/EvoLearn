<?php
namespace App\Http\Controllers;

use App\Models\Planning;
use Illuminate\Http\Request;

class PlanningController extends Controller
{
    public function index()
    {
        return response()->json(
            Planning::with(['formation', 'formateur'])->get()
        );
    }

    public function getByFormation($formationId)
    {
        return response()->json(
            Planning::where('formation_id', $formationId)
                ->with(['formation', 'formateur'])
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'formation_id' => 'required|exists:formations,id',
            'formateur_id' => 'required|exists:users,id',
        ]);

        $validated['statut'] = 'en_attente';
        $validated['cause_refus'] = null;

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
            'statut'       => 'nullable|string|in:en_attente,accepte,refuse',
            'cause_refus'  => 'nullable|string|max:255'
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
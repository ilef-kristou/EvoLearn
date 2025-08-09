<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    public function index()
    {
        return response()->json(Salle::all());
    }

    public function available()
    {
        return response()->json(Salle::where('disponible', true)->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|unique:salles',
            'capacite' => 'nullable|integer',
            'disponible' => 'nullable|boolean'
        ]);

        $salle = Salle::create($validated);

        return response()->json($salle, 201);
    }

    public function show($id)
    {
        return response()->json(Salle::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $salle = Salle::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'required|string|unique:salles,nom,' . $salle->id,
            'capacite' => 'nullable|integer',
            'disponible' => 'nullable|boolean'
        ]);

        $salle->update($validated);

        return response()->json($salle);
    }

    public function destroy($id)
    {
        Salle::findOrFail($id)->delete();
        return response()->json(['message' => 'Salle supprimée']);
    }
}
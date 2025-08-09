<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\ChargeAccountCreated;
use Illuminate\Support\Str;

class AdminChargeController extends Controller
{
    // ✅ Affiche tous les utilisateurs avec le rôle 'charge'
    public function index()
    {
        $charges = User::where('role', 'charge')->get();
        return response()->json($charges);
    }

    // ✅ Crée un nouveau "charge" avec mot de passe aléatoire
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'departement' => 'required|string|max:255',
            'telephone' => 'required|string|max:30',
        ]);

        $password = Str::random(10);

        $charge = User::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'password' => Hash::make($password),
            'role' => 'charge',
            'departement' => $validated['departement'],
            'telephone' => $validated['telephone'],
        ]);

        Mail::to($charge->email)->send(new ChargeAccountCreated($charge, $password));

        return response()->json($charge, 201);
    }

    // ✅ Met à jour un utilisateur "charge"
    public function update(Request $request, $id)
    {
        $charge = User::where('role', 'charge')->findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $charge->id,
            'departement' => 'sometimes|string|max:255',
            'telephone' => 'sometimes|string|max:30',
        ]);

        $charge->update($validated);

        return response()->json($charge);
    }

    // ✅ Supprime un utilisateur "charge"
    public function destroy($id)
    {
        $charge = User::where('role', 'charge')->findOrFail($id);
        $charge->delete();

        return response()->json(null, 204);
    }
}

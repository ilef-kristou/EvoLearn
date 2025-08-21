<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminParticipantController extends Controller
{
    /**
     * Display a listing of participants with pagination and search.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            Log::info('Fetching participants', [
                'params' => $request->all(),
                'url' => $request->fullUrl()
            ]);

            $query = User::where('role', 'participant');

            // Apply search
            if (!empty($request->search)) {
                $query->where(function ($q) use ($request) {
                    $q->where('nom', 'like', "%{$request->search}%")
                      ->orWhere('prenom', 'like', "%{$request->search}%")
                      ->orWhere('email', 'like', "%{$request->search}%")
                      ->orWhere('telephone', 'like', "%{$request->search}%");
                });
            }

            $query->orderBy('created_at', 'desc');

            $perPage = $request->get('perPage', 4);
            $participants = $query->paginate($perPage);

            Log::info('Participants found: ' . $participants->total());

            return response()->json([
                'success' => true,
                'data' => $participants->items(),
                'pagination' => [
                    'current_page' => $participants->currentPage(),
                    'last_page' => $participants->lastPage(),
                    'per_page' => $participants->perPage(),
                    'total' => $participants->total(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching participants', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des participants',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created participant.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            Log::info('Creating participant', ['data' => $request->all()]);

            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'telephone' => 'required|string|max:20',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('profiles/participants', 'public');
                Log::info('Image uploaded: ' . $imagePath);
            }

            $password = Str::random(12);

            $participant = User::create([
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],
                'password' => Hash::make($password),
                'role' => 'participant',
                'telephone' => $validated['telephone'],
                'image' => $imagePath,
            ]);

            Log::info('Participant created: ' . $participant->id);

            return response()->json([
                'success' => true,
                'message' => 'Participant créé avec succès',
                'data' => $participant
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating participant', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du participant',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified participant.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $participant = User::where('role', 'participant')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $participant
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching participant', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Participant non trouvé'
            ], 404);
        }
    }

    /**
     * Update the specified participant.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $participant = User::where('role', 'participant')->findOrFail($id);

            $validated = $request->validate([
                'nom' => 'sometimes|string|max:255',
                'prenom' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $participant->id,
                'telephone' => 'sometimes|string|max:20',
                'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            if ($request->hasFile('image')) {
                if ($participant->image) {
                    Storage::disk('public')->delete($participant->image);
                }
                $validated['image'] = $request->file('image')->store('profiles/participants', 'public');
            }

            $participant->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Participant mis à jour avec succès',
                'data' => $participant
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating participant', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du participant'
            ], 500);
        }
    }

    /**
     * Remove the specified participant.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $participant = User::where('role', 'participant')->findOrFail($id);

            if ($participant->image) {
                Storage::disk('public')->delete($participant->image);
            }

            $participant->delete();

            return response()->json([
                'success' => true,
                'message' => 'Participant supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting participant', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du participant'
            ], 500);
        }
    }

    /**
     * Get participant statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function stats()
    {
        try {
            $total = User::where('role', 'participant')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching participant stats', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques'
            ], 500);
        }
    }
}
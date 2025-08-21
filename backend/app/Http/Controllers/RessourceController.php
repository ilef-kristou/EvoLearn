<?php

namespace App\Http\Controllers;

use App\Models\Ressource;
use App\Models\RessourceReservation;
use App\Models\PlanningJour;
use App\Models\Planning;
use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RessourceController extends Controller
{
    public function index()
    {
        try {
            $ressources = Ressource::all();
            Log::info('Fetched all ressources', ['count' => $ressources->count()]);
            return response()->json($ressources);
        } catch (\Exception $e) {
            Log::error('Error fetching ressources: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Erreur lors de la récupération des ressources'], 500);
        }
    }

    public function getReservations()
    {
        try {
            $reservations = RessourceReservation::with(['ressource', 'formation', 'planningJour'])
                ->get()
                ->map(function ($reservation) {
                    return [
                        'id' => $reservation->id,
                        'ressourceId' => $reservation->ressource_id,
                        'ressource_name' => $reservation->ressource->nom ?? null,
                        'formationId' => $reservation->formation_id,
                        'formationTitre' => $reservation->formation->titre ?? null,
                        'planning_jour_id' => $reservation->planning_jour_id,
                        'seances' => $reservation->planningJour ? [
                            [
                                'id' => $reservation->planningJour->id,
                                'jour' => $reservation->planningJour->jour,
                                'heureDebut' => $reservation->planningJour->heure_debut,
                                'heureFin' => $reservation->planningJour->heure_fin,
                                'date' => $this->getSessionDate($reservation->formation_id, $reservation->planningJour->jour),
                            ]
                        ] : [],
                        'quantite' => $reservation->quantite,
                        'statut' => $reservation->statut,
                        'created_at' => $reservation->created_at,
                    ];
                });

            Log::info('Fetched all reservations', ['count' => $reservations->count()]);
            return response()->json($reservations);
        } catch (\Exception $e) {
            Log::error('Error fetching reservations: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Erreur lors de la récupération des réservations'], 500);
        }
    }

    private function getSessionDate($formationId, $jour)
    {
        $daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        $dayIndex = array_search($jour, $daysOfWeek);
        if ($dayIndex === false) {
            Log::warning("Invalid jour: {$jour}");
            return null;
        }

        $formation = Formation::find($formationId);
        if (!$formation || !$formation->date_debut || is_null(new \DateTime($formation->date_debut))) {
            Log::warning("Invalid formation or date_debut: Formation ID {$formationId}");
            return null;
        }

        $startDate = new \DateTime($formation->date_debut);
        $startDay = (int) $startDate->format('w');
        $diff = ($dayIndex - $startDay + 7) % 7;
        $startDate->modify("+{$diff} days");
        return $startDate->format('Y-m-d');
    }

    public function checkAvailability(Request $request)
    {
        try {
            $request->validate([
                'ressource_id' => 'required|exists:ressources,id',
                'planning_jour_id' => 'required|exists:planning_jours,id',
            ]);

            $ressourceId = $request->input('ressource_id');
            $planningJourId = $request->input('planning_jour_id');

            $planningJour = PlanningJour::findOrFail($planningJourId);
            $planning = Planning::findOrFail($planningJour->planning_id);
            $formation = Formation::findOrFail($planning->formation_id);

            $daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
            $dayIndex = array_search($planningJour->jour, $daysOfWeek);
            if ($dayIndex === false || !$formation->date_debut) {
                Log::warning("Invalid jour or date_debut for planning_jour_id: {$planningJourId}");
                return response()->json([
                    'available' => 0,
                    'total' => 0,
                    'reserved' => 0,
                    'is_available' => false,
                ], 400);
            }

            $startDate = new \DateTime($formation->date_debut . ' 00:00:00', new \DateTimeZone('UTC'));
            $startDay = (int)$startDate->format('w');
            $diff = ($dayIndex - $startDay + 7) % 7;
            $startDate->modify("+{$diff} days");
            $sessionDate = $startDate->format('Y-m-d');

            $ressource = Ressource::findOrFail($ressourceId);
            $totalQuantity = $ressource->quantite;

            $sameDatePlanningJours = PlanningJour::where('jour', $planningJour->jour)
                ->whereHas('planning', function ($query) use ($sessionDate) {
                    $query->whereHas('formation', function ($subQuery) use ($sessionDate) {
                        $subQuery->where('date_debut', '<=', $sessionDate)
                                 ->whereRaw('DATE_ADD(date_debut, INTERVAL (WEEKDAY(?) - WEEKDAY(date_debut) + 7) % 7 DAY) = ?', [$sessionDate, $sessionDate]);
                    });
                })
                ->pluck('id');

            $reservedQuantity = RessourceReservation::where('ressource_id', $ressourceId)
                ->whereIn('planning_jour_id', $sameDatePlanningJours)
                ->sum('quantite');

            $availableQuantity = $totalQuantity - $reservedQuantity;

            Log::info("Availability check for ressource_id: {$ressourceId}, date: {$sessionDate}, planning_jour_id: {$planningJourId}", [
                'total' => $totalQuantity,
                'reserved' => $reservedQuantity,
                'available' => $availableQuantity,
                'planning_jour_ids' => $sameDatePlanningJours->toArray(),
            ]);

            return response()->json([
                'available' => max(0, $availableQuantity),
                'total' => $totalQuantity,
                'reserved' => $reservedQuantity,
                'is_available' => $availableQuantity > 0,
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking availability: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Erreur lors de la vérification de la disponibilité'], 500);
        }
    }

    public function reserver(Request $request)
    {
        try {
            $validated = $request->validate([
                'ressource_id' => 'required|exists:ressources,id',
                'planning_jour_id' => 'required|exists:planning_jours,id',
                'formation_id' => 'required|exists:formations,id',
                'quantite' => 'required|integer|min:1',
            ]);

            $ressource = Ressource::findOrFail($validated['ressource_id']);
            $planningJour = PlanningJour::findOrFail($validated['planning_jour_id']);
            $planning = Planning::findOrFail($planningJour->planning_id);
            $sessionDate = $this->getSessionDate($planning->formation_id, $planningJour->jour);

            if (!$sessionDate) {
                Log::warning('Invalid session date', ['planning_jour_id' => $validated['planning_jour_id']]);
                return response()->json([
                    'error' => 'Impossible de déterminer la date de la séance',
                ], 400);
            }

            $planningJoursOnDate = PlanningJour::whereIn('planning_id', function ($query) use ($sessionDate) {
                $query->select('id')
                    ->from('plannings')
                    ->whereIn('formation_id', function ($subQuery) use ($sessionDate) {
                        $subQuery->select('id')
                            ->from('formations')
                            ->whereRaw('DATE_ADD(date_debut, INTERVAL (WEEKDAY(?) - WEEKDAY(date_debut) + 7) % 7 DAY) = ?', [$sessionDate, $sessionDate]);
                    });
            })->where('jour', $planningJour->jour)->pluck('id');

            $reserved = RessourceReservation::where('ressource_id', $validated['ressource_id'])
                ->whereIn('planning_jour_id', $planningJoursOnDate)
                ->sum('quantite');

            if (($ressource->quantite - $reserved) < $validated['quantite']) {
                Log::warning('Insufficient quantity', [
                    'ressource_id' => $validated['ressource_id'],
                    'available' => $ressource->quantite - $reserved,
                    'requested' => $validated['quantite'],
                ]);
                return response()->json([
                    'error' => 'Quantité insuffisante disponible pour cette date.',
                    'available' => $ressource->quantite - $reserved,
                    'requested' => $validated['quantite'],
                ], 400);
            }

            $reservation = RessourceReservation::create($validated + ['statut' => 'confirmed']);
            Log::info('Reservation created', [
                'reservation_id' => $reservation->id,
                'ressource_id' => $validated['ressource_id'],
                'planning_jour_id' => $validated['planning_jour_id'],
                'session_date' => $sessionDate,
                'quantite' => $validated['quantite'],
            ]);
            return response()->json($reservation, 201);
        } catch (\Exception $e) {
            Log::error('Error creating reservation: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Erreur lors de la réservation', 'message' => $e->getMessage()], 500);
        }
    }

    public function updateReservation(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'ressource_id' => 'required|exists:ressources,id',
                'planning_jour_id' => 'required|exists:planning_jours,id',
                'formation_id' => 'required|exists:formations,id',
                'quantite' => 'required|integer|min:1',
            ]);

            $reservation = RessourceReservation::findOrFail($id);
            $ressource = Ressource::findOrFail($validated['ressource_id']);
            $planningJour = PlanningJour::findOrFail($validated['planning_jour_id']);
            $planning = Planning::findOrFail($planningJour->planning_id);
            $sessionDate = $this->getSessionDate($planning->formation_id, $planningJour->jour);

            if (!$sessionDate) {
                Log::warning('Invalid session date for update', ['planning_jour_id' => $validated['planning_jour_id']]);
                return response()->json([
                    'error' => 'Impossible de déterminer la date de la séance',
                ], 400);
            }

            if ($reservation->ressource_id != $validated['ressource_id'] ||
                $reservation->planning_jour_id != $validated['planning_jour_id'] ||
                $reservation->formation_id != $validated['formation_id']) {
                Log::warning('Reservation mismatch', [
                    'reservation_id' => $id,
                    'provided' => $validated,
                    'existing' => $reservation->toArray(),
                ]);
                return response()->json([
                    'error' => 'Les détails de la réservation ne correspondent pas à la réservation existante.',
                ], 400);
            }

            $planningJoursOnDate = PlanningJour::whereIn('planning_id', function ($query) use ($sessionDate) {
                $query->select('id')
                    ->from('plannings')
                    ->whereIn('formation_id', function ($subQuery) use ($sessionDate) {
                        $subQuery->select('id')
                            ->from('formations')
                            ->whereRaw('DATE_ADD(date_debut, INTERVAL (WEEKDAY(?) - WEEKDAY(date_debut) + 7) % 7 DAY) = ?', [$sessionDate, $sessionDate]);
                    });
            })->where('jour', $planningJour->jour)->pluck('id');

            $reserved = RessourceReservation::where('ressource_id', $validated['ressource_id'])
                ->whereIn('planning_jour_id', $planningJoursOnDate)
                ->where('id', '!=', $id)
                ->sum('quantite');

            if (($ressource->quantite - $reserved) < $validated['quantite']) {
                Log::warning('Insufficient quantity for update', [
                    'reservation_id' => $id,
                    'available' => $ressource->quantite - $reserved,
                    'requested' => $validated['quantite'],
                ]);
                return response()->json([
                    'error' => 'Quantité insuffisante disponible pour cette date.',
                    'available' => $ressource->quantite - $reserved,
                    'requested' => $validated['quantite'],
                ], 400);
            }

            $reservation->update(['quantite' => $validated['quantite']]);
            Log::info('Reservation updated', [
                'reservation_id' => $reservation->id,
                'ressource_id' => $validated['ressource_id'],
                'planning_jour_id' => $validated['planning_jour_id'],
                'session_date' => $sessionDate,
                'quantite' => $validated['quantite'],
            ]);
            return response()->json($reservation);
        } catch (\Exception $e) {
            Log::error('Error updating reservation: ' . $e->getMessage(), [
                'reservation_id' => $id,
                'request' => $request->all(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Erreur lors de la mise à jour de la réservation', 'message' => $e->getMessage()], 500);
        }
    }

    public function deleteReservation($id)
    {
        try {
            $reservation = RessourceReservation::find($id);
            if (!$reservation) {
                Log::warning('Reservation not found for deletion', ['reservation_id' => $id]);
                return response()->json(['error' => 'Réservation introuvable'], 404);
            }

            Log::info('Found reservation for deletion', ['reservation' => $reservation->toArray()]);
            $reservation->delete();
            Log::info('Reservation deleted successfully', ['reservation_id' => $id]);
            return response()->json(['message' => 'Réservation supprimée avec succès']);
        } catch (\Exception $e) {
            Log::error('Error deleting reservation: ' . $e->getMessage(), [
                'reservation_id' => $id,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Erreur lors de la suppression de la réservation', 'message' => $e->getMessage()], 500);
        }
    }

    public function checkAvailabilityByDate(Request $request)
    {
        return response()->json(['error' => 'This endpoint is deprecated. Use /ressources/check-availability instead.'], 410);
    }
}
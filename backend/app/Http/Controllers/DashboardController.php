<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Formation;
use App\Models\DemandeInscription;
use App\Models\RessourceReservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Récupère les statistiques générales pour le dashboard
     */
    public function getStats()
    {
        try {
            $stats = [
                'participants' => User::where('role', 'participant')->count(),
                'formateurs' => User::where('role', 'formateur')->count(),
                'formations' => Formation::count(),
                'reservations' => RessourceReservation::count(),
                'demandes_en_attente' => DemandeInscription::where('statut', 'En attente')->count(),
                'formations_en_cours' => Formation::where('statut', 'en_cours')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getStats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère les données pour le graphique des inscriptions par mois
     */
    public function getRegistrationData($year = null)
    {
        try {
            $year = $year ?? date('Y');
            
            $data = User::where('role', 'participant')
                ->select(
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('COUNT(*) as inscriptions')
                )
                ->whereYear('created_at', $year)
                ->groupBy(DB::raw('MONTH(created_at)'))
                ->orderBy(DB::raw('MONTH(created_at)'))
                ->get();

            // Formatage des données pour le graphique
            $months = [
                1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 
                5 => 'Mai', 6 => 'Juin', 7 => 'Juil', 8 => 'Août', 
                9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'
            ];

            $result = [];
            foreach ($months as $monthNum => $monthName) {
                $monthData = $data->firstWhere('month', $monthNum);
                $result[] = [
                    'month' => $monthName,
                    'inscriptions' => $monthData ? $monthData->inscriptions : 0
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $result,
                'year' => $year
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getRegistrationData: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données d\'inscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère les données pour le graphique des statuts de formation
     */
    public function getFormationStatusData()
    {
        try {
            $data = Formation::select('statut', DB::raw('COUNT(*) as count'))
                ->groupBy('statut')
                ->get();

            $statusMap = [
                'planifie' => 'Planifié',
                'en_preparation' => 'En Préparation',
                'en_cours' => 'En Cours',
                'termine' => 'Terminé'
            ];

            $result = [];
            foreach ($data as $item) {
                $result[] = [
                    'name' => $statusMap[$item->statut] ?? $item->statut,
                    'value' => $item->count
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getFormationStatusData: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statuts de formation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère les activités récentes
     */
    public function getRecentActivities()
    {
        try {
            // Dernières inscriptions
            $recentParticipants = User::where('role', 'participant')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function($user) {
                    return [
                        'type' => 'inscription',
                        'user' => $user->prenom . ' ' . $user->nom,
                        'action' => 'Nouvelle inscription',
                        'date' => $user->created_at->format('d M Y'),
                        'status' => 'Confirmé'
                    ];
                });

            // Dernières demandes d'inscription
            $recentDemandes = DemandeInscription::with(['formation', 'user'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function($demande) {
                    return [
                        'type' => 'demande',
                        'user' => $demande->prenom . ' ' . $demande->nom,
                        'action' => 'Demande pour ' . ($demande->formation->titre ?? 'Formation inconnue'),
                        'date' => $demande->created_at->format('d M Y'),
                        'status' => $demande->statut
                    ];
                });

            // Combiner et trier par date
            $activities = $recentParticipants->merge($recentDemandes)
                ->sortByDesc('date')
                ->take(5)
                ->values();

            return response()->json([
                'success' => true,
                'data' => $activities
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getRecentActivities: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des activités récentes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère les événements à venir
     */
    public function getUpcomingEvents()
    {
        try {
            $events = Formation::where('date_debut', '>=', now())
                ->orderBy('date_debut')
                ->take(10)
                ->get()
                ->map(function($formation) {
                    return [
                        'id' => $formation->id,
                        'titre' => $formation->titre,
                        'date_debut' => $formation->date_debut,
                        'date_fin' => $formation->date_fin,
                        'statut' => $formation->statut,
                        'places_disponibles' => $formation->places_disponibles - $formation->places_reservees
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $events
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getUpcomingEvents: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des événements à venir',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    

    /**
     * Récupère les données pour tous les widgets du dashboard
     */
    // Ajoutez cette méthode dans DashboardController.php

/**
 * Récupère les données pour le graphique des statuts des demandes d'inscription
 */
public function getDemandeStatusData()
{
    try {
        $data = DemandeInscription::select('statut', DB::raw('COUNT(*) as count'))
            ->groupBy('statut')
            ->get();

        $statusMap = [
            'En attente' => 'En attente',
            'Acceptée' => 'Acceptée',
            'Refusée' => 'Refusée'
        ];

        $result = [];
        foreach ($data as $item) {
            $result[] = [
                'name' => $statusMap[$item->statut] ?? $item->statut,
                'value' => $item->count
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    } catch (\Exception $e) {
        \Log::error('Error in getDemandeStatusData: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des statuts des demandes',
            'error' => $e->getMessage()
        ], 500);
    }
}

// Modifiez également la méthode getDashboardData pour inclure ces données :
public function getDashboardData()
{
    try {
        $stats = $this->getStats()->getData()->data;
        $registrationData = $this->getRegistrationData()->getData()->data;
        $formationStatusData = $this->getFormationStatusData()->getData()->data;
        $demandeStatusData = $this->getDemandeStatusData()->getData()->data; // Nouveau
        $recentActivities = $this->getRecentActivities()->getData()->data;
        $upcomingEvents = $this->getUpcomingEvents()->getData()->data;

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'registrationData' => $registrationData,
                'formationStatusData' => $formationStatusData,
                'demandeStatusData' => $demandeStatusData, // Nouveau
                'recentActivities' => $recentActivities,
                'upcomingEvents' => $upcomingEvents
            ]
        ]);
    } catch (\Exception $e) {
        \Log::error('Error in getDashboardData: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des données du dashboard',
            'error' => $e->getMessage()
        ], 500);
    }
}
    

    /**
     * Test de connexion à la base de données
     */
    public function testConnection()
    {
        try {
            // Test des comptages directs
            $participantsCount = User::where('role', 'participant')->count();
            $formateursCount = User::where('role', 'formateur')->count();
            $formationsCount = Formation::count();
            
            return response()->json([
                'success' => true,
                'database_connection' => 'OK',
                'counts' => [
                    'participants' => $participantsCount,
                    'formateurs' => $formateursCount,
                    'formations' => $formationsCount
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'database_connection' => 'ERROR',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RessourceReservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'ressource_id',
        'planning_jour_id',
        'formation_id',
        'quantite',
        'statut'
    ];

    public function ressource()
    {
        return $this->belongsTo(Ressource::class);
    }

    public function planningJour()
    {
        return $this->belongsTo(PlanningJour::class);
    }

    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }
}

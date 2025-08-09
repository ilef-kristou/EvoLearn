<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanningJour extends Model
{
    protected $fillable = [
        'planning_id',
        'jour',
        'heure_debut',
        'heure_fin',
        'salle_id'
    ];

    public function planning()
    {
        return $this->belongsTo(Planning::class);
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }
}

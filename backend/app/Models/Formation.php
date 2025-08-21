<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'places_disponibles',
        'places_reservees',
        'statut',
        'image',
        'niveau_requis',
        'categorie'
    ];

    public function planning()
    {
        return $this->hasOne(Planning::class);
    }

    public function demandes()
    {
        return $this->hasMany(DemandeInscription::class);
    }
}
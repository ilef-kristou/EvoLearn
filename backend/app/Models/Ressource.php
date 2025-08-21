<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ressource extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'description',
        'quantite',
        'categorie',
        'disponible'
    ];

    public function reservations()
    {
        return $this->hasMany(RessourceReservation::class);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeInscription extends Model
{
    use HasFactory;

    protected $table = 'demandes_inscription';

    protected $fillable = [
        'user_id',
        'formation_id',
        'nom',
        'prenom',
        'email',
        'telephone',
        'niveau',
        'statut' // Ajouté ici
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }
} 
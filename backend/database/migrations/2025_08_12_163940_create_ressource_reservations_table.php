<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRessourceReservationsTable extends Migration
{
    public function up()
    {
        Schema::create('ressource_reservations', function (Blueprint $table) {
            $table->id();

            // Relation vers la table ressources
            $table->foreignId('ressource_id')
                  ->constrained('ressources')
                  ->onDelete('cascade');

            // Relation vers planning_jours
            $table->foreignId('planning_jour_id')
                  ->constrained('planning_jours')
                  ->onDelete('cascade');

            // Relation vers formations
            $table->foreignId('formation_id')
                  ->constrained('formations')
                  ->onDelete('cascade');

            $table->integer('quantite')->default(1);
            $table->string('statut')->default('en_attente');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ressource_reservations');
    }
}

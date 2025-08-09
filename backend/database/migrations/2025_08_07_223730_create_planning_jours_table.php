<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('planning_jours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('planning_id')
                  ->constrained('plannings')
                  ->onDelete('cascade');
            $table->date('jour');
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->foreignId('salle_id')
                  ->constrained('salles')
                  ->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('planning_jours');
    }
};

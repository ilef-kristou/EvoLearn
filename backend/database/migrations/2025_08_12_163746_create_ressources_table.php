// database/migrations/2025_08_12_154834_create_ressources_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRessourcesTable extends Migration
{
    public function up()
    {
        Schema::create('ressources', function (Blueprint $table) {
            $table->id(); // BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
            $table->string('nom');
            $table->text('description')->nullable();
            $table->integer('quantite')->default(1);
            $table->string('categorie')->nullable();
            $table->boolean('disponible')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ressources');
    }
}
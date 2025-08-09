<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class FixFormateurRelationInPlanningsTable extends Migration
{
    public function up()
    {
        Schema::table('plannings', function (Blueprint $table) {
            // 1. Vérifier si la colonne 'formateur' existe (type string)
            if (Schema::hasColumn('plannings', 'formateur')) {
                
                // 2. Renommer temporairement l'ancienne colonne
                $table->renameColumn('formateur', 'old_formateur_name');
                
                // 3. Ajouter la nouvelle colonne user_id
                $table->unsignedBigInteger('user_id')->nullable()->after('old_formateur_name');
                
                // 4. Mettre à jour avec l'ID du user correspondant
                // Supposons que 'old_formateur_name' contient l'email
                DB::statement('
                    UPDATE plannings p
                    JOIN users u ON p.old_formateur_name = u.email
                    SET p.user_id = u.id
                    WHERE u.role = "formateur"
                ');
                
                // 5. Supprimer l'ancienne colonne
                $table->dropColumn('old_formateur_name');
                
                // 6. Ajouter la contrainte de clé étrangère
                $table->foreign('user_id')
                      ->references('id')
                      ->on('users')
                      ->where('role', 'formateur')
                      ->onDelete('restrict');
            }
        });
    }

    public function down()
    {
        Schema::table('plannings', function (Blueprint $table) {
            // Pour annuler la migration
            $table->string('formateur')->nullable();
            
            DB::statement('
                UPDATE plannings p
                JOIN users u ON p.user_id = u.id
                SET p.formateur = u.email
            ');
            
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
}
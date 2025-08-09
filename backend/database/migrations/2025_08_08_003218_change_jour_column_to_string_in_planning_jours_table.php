<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('planning_jours', function (Blueprint $table) {
        $table->string('jour', 10)->change(); // Change en string
    });
}

public function down()
{
    Schema::table('planning_jours', function (Blueprint $table) {
        $table->date('jour')->change(); // Pour rollback
    });
}

    /**
     * Reverse the migrations.
     */
    
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('formations', function (Blueprint $table) {
            // $table->string('niveau_requis')->nullable();
            $table->integer('places_reservees')->default(0);
        });
    }

    public function down()
    {
        Schema::table('formations', function (Blueprint $table) {
            // $table->dropColumn('niveau_requis');
            $table->dropColumn('places_reservees');
        });
    }
}; 
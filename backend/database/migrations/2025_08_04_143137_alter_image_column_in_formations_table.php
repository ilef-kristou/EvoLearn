<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('formations', function (Blueprint $table) {
            $table->longText('image')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('formations', function (Blueprint $table) {
            $table->string('image', 1024)->nullable()->change();
        });
    }
};

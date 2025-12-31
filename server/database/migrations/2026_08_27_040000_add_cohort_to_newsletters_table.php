<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('newsletters', function (Blueprint $table) {
            $table->string('cohort', 50)->default('General')->index();
        });
    }

    public function down(): void
    {
        Schema::table('newsletters', fn (Blueprint $table) => $table->dropColumn('cohort'));
    }
};

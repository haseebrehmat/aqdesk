<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('podcasts', function (Blueprint $table) {
            $table->string('media_url')->nullable()->change();
            $table->string('audio_path')->nullable()->after('media_url');
            $table->unsignedInteger('duration_in_seconds')->nullable()->after('duration_in_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('podcasts', function (Blueprint $table) {
            $table->dropColumn(['audio_path', 'duration_in_seconds']);
        });
    }
};

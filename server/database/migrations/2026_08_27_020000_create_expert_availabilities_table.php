<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expert_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->timestamps();
            $table->unique(['expert_id', 'starts_at', 'ends_at']);
            $table->index(['expert_id', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expert_availabilities');
    }
};

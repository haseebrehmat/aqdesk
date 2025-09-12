<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('posted_by')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('company_name');
            $table->string('location')->nullable();
            $table->string('job_type', 50)->default('Full-Time'); // Full-Time, Internship, Contract
            $table->text('description')->nullable();
            $table->string('status', 30)->default('Open');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opportunities');
    }
};

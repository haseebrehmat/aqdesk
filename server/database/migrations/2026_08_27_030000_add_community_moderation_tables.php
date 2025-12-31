<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->boolean('is_hidden')->default(false)->index();
        });
        Schema::table('answers', function (Blueprint $table) {
            $table->boolean('is_hidden')->default(false)->index();
        });
        Schema::create('content_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->string('reportable_type', 20);
            $table->unsignedBigInteger('reportable_id');
            $table->text('reason');
            $table->string('status', 20)->default('Pending')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->index(['reportable_type', 'reportable_id']);
            $table->unique(['reporter_id', 'reportable_type', 'reportable_id', 'status'], 'content_reports_unique_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_reports');
        Schema::table('answers', fn (Blueprint $table) => $table->dropColumn('is_hidden'));
        Schema::table('questions', fn (Blueprint $table) => $table->dropColumn('is_hidden'));
    }
};

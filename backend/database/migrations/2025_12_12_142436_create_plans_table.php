<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('server_id')->constrained()->onDelete('cascade');
            $table->integer('duration_value')->default(1);
            $table->enum('duration_unit', ['hours', 'days', 'months', 'years'])->default('months');
            $table->boolean('multi_server')->default(false);
            $table->text('template_header')->nullable();
            $table->text('template_footer')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->boolean('test_mode')->default(false);
            $table->boolean('show_in_dashboard')->default(false);
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('credits')->default(1);
            $table->integer('order')->default(0);
            $table->json('bouquets')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};

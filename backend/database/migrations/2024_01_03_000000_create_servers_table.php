<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->default('XUIONE');
            $table->string('url');
            $table->text('api_key');
            $table->string('api_version')->default('1');
            $table->boolean('use_proxy')->default(false);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->string('save_action')->nullable();
            $table->text('primary_dns')->nullable();
            $table->text('random_dns')->nullable();
            $table->string('reseller_group_id')->nullable();
            $table->integer('order')->default(0);
            $table->string('timezone')->nullable();
            $table->string('default_password')->nullable();
            $table->json('allowed_bouquets')->nullable();
            $table->integer('max_connections')->default(0);
            $table->integer('max_clients')->default(0);
            $table->text('template')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servers');
    }
};

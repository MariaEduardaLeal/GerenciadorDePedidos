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
        Schema::create('user_tipes', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['P', 'C', 'A'])->default('P')->comment('P - pedido; C - cozinha; A - administrador');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_tipes');
    }
};

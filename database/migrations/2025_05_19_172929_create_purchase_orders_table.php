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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('quotation_id')->constrained('quotations')->onDelete('cascade');
            $table->integer('amount');
            $table->string('file')->nullable();
            $table->enum('status', ['wip', 'ar', 'ibt', 'clsd'])->default('wip');
            $table->string('contract_number')->nullable();
            $table->string('job_number')->nullable();
            $table->date('date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};

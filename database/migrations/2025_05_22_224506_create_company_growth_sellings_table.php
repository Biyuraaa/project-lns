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
        Schema::create('company_growth_sellings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('month')->comment('Month of the year');
            $table->unsignedInteger('year')->comment('Year of the record');
            $table->unsignedBigInteger('target')->comment('Target sales for the month');
            $table->unsignedBigInteger('actual')->comment('Actual sales for the month')->default(0);
            $table->integer('difference')->comment('Difference between target and actual sales')->default(0);
            $table->decimal('percentage', 5, 2)->comment('Percentage of actual sales against target')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_growth_sellings');
    }
};

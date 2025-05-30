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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('inquiry_id')->constrained('inquiries')->onDelete('cascade');
            $table->enum('status', ['n/a', 'val', 'lost', 'wip'])->default('val');
            $table->string('file')->nullable();
            $table->date('due_date')->nullable();
            $table->integer('amount')->default(0)->comment('Total amount of the quotation');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};

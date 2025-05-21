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
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->text('description');
            $table->foreignId('business_unit_id')->nullable()->constrained('business_units')->onDelete('set null');
            $table->date('inquiry_date')->nullable();
            $table->string('end_user_name')->nullable();
            $table->string('end_user_email')->nullable();
            $table->string('end_user_phone')->nullable();
            $table->string('end_user_address')->nullable();
            $table->string('file')->nullable();
            $table->foreignId('pic_engineer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('sales_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['pending', 'resolved', 'closed', 'process'])->default('pending');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};

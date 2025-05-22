<?php

namespace Database\Seeders;

use App\Models\BusinessUnit;
use App\Models\Customer;
use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class InquirySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Make sure we have customers, users and business units first
        if (Customer::count() === 0) {
            $this->command->info('Seeding customers first...');
            $this->call(CustomerSeeder::class);
        }

        if (User::count() === 0) {
            $this->command->info('Seeding users first...');
            $this->call(UserSeeder::class);
        }

        if (BusinessUnit::count() === 0) {
            $this->command->info('Seeding business units first...');
            $this->call(BusinessUnitSeeder::class);
        }

        // Get IDs for relationships
        $customers = Customer::all();
        $engineerUsers = User::role('pic-engineer')->get();
        $salesUsers = User::role('sales')->get();
        $businessUnits = BusinessUnit::all();

        if ($customers->isEmpty()) {
            $this->command->error('No customers found. Please seed customers first.');
            return;
        }

        if ($engineerUsers->isEmpty() || $salesUsers->isEmpty()) {
            $this->command->warn('No engineers or sales users found. Some inquiries will have null user references.');
        }

        if ($businessUnits->isEmpty()) {
            $this->command->warn('No business units found. Some inquiries will have null business unit references.');
        }

        // Create inquiries for each month in the past 6 months
        $this->command->info('Creating inquiries for the past 6 months...');

        // Get current date and 6 months ago
        $now = Carbon::now();
        $sixMonthsAgo = Carbon::now()->subMonths(6);

        // Loop through each month
        $current = clone $sixMonthsAgo;
        while ($current <= $now) {
            $month = $current->format('F');
            $year = $current->format('Y');

            $this->command->info("Creating inquiries for {$month} {$year}...");

            // Create between 10-30 inquiries for this month
            $count = rand(10, 30);

            for ($i = 0; $i < $count; $i++) {
                $customer = $customers->random();
                $inquiryDate = Carbon::create(
                    $current->year,
                    $current->month,
                    rand(1, $current->daysInMonth),
                );

                // Don't create future dates
                if ($inquiryDate > $now) {
                    $inquiryDate = $now;
                }

                // Generate a status based on the date (older ones more likely to be closed)
                $daysDiff = $now->diffInDays($inquiryDate);
                $statusProbability = min(100, $daysDiff);

                if ($statusProbability > 60) {
                    $status = 'pending';
                } elseif ($statusProbability > 40) {
                    $status = 'process';
                } elseif ($statusProbability > 20) {
                    $status = 'resolved';
                } else {
                    $status = 'closed';
                }
                // Create the inquiry
                Inquiry::factory()->create([
                    'code' => 'INQ-' . $customer->id . '-' . $current->format('Ym') . '-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                    'customer_id' => $customer->id,
                    'description' => fake()->text(100),
                    'business_unit_id' => $businessUnits->isNotEmpty() ? $businessUnits->random()->id : null,
                    'inquiry_date' => $inquiryDate,
                    'end_user_name' => fake()->name(),
                    'end_user_email' => fake()->safeEmail(),
                    'end_user_phone' => fake()->phoneNumber(),
                    'end_user_address' => fake()->address(),
                    'pic_engineer_id' => $engineerUsers->isNotEmpty() ? $engineerUsers->random()->id : null,
                    'sales_id' => $salesUsers->isNotEmpty() ? $salesUsers->random()->id : null,
                    'status' => $status,
                ]);
            }

            // Move to the next month
            $current->addMonth();
        }

        $this->command->info('Inquiries seeded successfully!');
    }
}

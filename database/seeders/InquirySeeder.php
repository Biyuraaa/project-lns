<?php

namespace Database\Seeders;

use App\Models\BusinessUnit;
use App\Models\Customer;
use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Faker\Factory as Faker;

class InquirySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    protected $faker;
    public function run(): void
    {
        $this->faker = Faker::create();
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

                // Simple status distribution: 70% pending, 30% process
                // Note: The QuotationSeeder will later convert some 'pending' to 'process' when adding quotations
                $status = $this->faker->randomElement(['pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'canceled', 'process', 'process', 'process']);

                // Create the inquiry
                Inquiry::factory()->create([
                    'customer_id' => $customer->id,
                    'description' => fake()->text(100),
                    'business_unit_id' => $businessUnits->isNotEmpty() ? $businessUnits->random()->id : null,
                    'inquiry_date' => $inquiryDate,
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

<?php

namespace Database\Seeders;

use App\Models\PurchaseOrder;
use App\Models\Quotation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PurchaseOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Make sure we have quotations first
        if (Quotation::count() === 0) {
            $this->command->info('Seeding quotations first...');
            $this->call(QuotationSeeder::class);
        }

        $this->command->info('Creating purchase orders for validated quotations...');

        // Get all validated quotations
        $validatedQuotations = Quotation::where('status', 'val')->get();

        if ($validatedQuotations->isEmpty()) {
            $this->command->warn('No validated quotations found. No purchase orders will be created.');
            return;
        }

        $this->command->info("Found {$validatedQuotations->count()} validated quotations.");

        foreach ($validatedQuotations as $quotation) {
            // Each validated quotation gets a purchase order
            $this->command->info("Creating purchase order for quotation {$quotation->code}");

            // Calculate date based on quotation due date
            $quotationDueDate = $quotation->due_date ?? Carbon::now();

            // PO date is usually a bit after the quotation is validated
            $poDate = Carbon::parse($quotationDueDate)->subDays(rand(5, 30));

            // Ensure PO date isn't in the future
            if ($poDate->isFuture()) {
                $poDate = Carbon::now()->subDays(rand(1, 7));
            }

            // Determine status based on age of PO
            $daysSincePoDate = Carbon::now()->diffInDays($poDate);

            if ($daysSincePoDate < 14) {
                $status = 'wip'; // New POs are usually Work In Progress
            } else if ($daysSincePoDate < 45) {
                $status = fake()->randomElement(['wip', 'ar']); // Older ones are either WIP or Awaiting Review
            } else {
                $status = fake()->randomElement(['ar', 'ibt']); // The oldest are usually AR or IBT
            }

            // Create the purchase order
            PurchaseOrder::create([
                'code' => 'PO-' . substr($quotation->code, 4) . '-' . Carbon::parse($poDate)->format('Ymd'),
                'quotation_id' => $quotation->id,
                'amount' => fake()->numberBetween(10000000, 500000000), // 10M to 500M
                'status' => $status,
                'contract_number' => 'CTR-' . fake()->numerify('######'),
                'job_number' => 'JOB-' . fake()->numerify('######'),
                'date' => $poDate,
            ]);
        }

        $this->command->info('Purchase orders seeded successfully!');
    }
}

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
        $validatedQuotations = Quotation::where('status', 'wip')->get();

        if ($validatedQuotations->isEmpty()) {
            $this->command->warn('No validated quotations found. No purchase orders will be created.');
            return;
        }

        $this->command->info("Found {$validatedQuotations->count()} validated quotations.");

        // Track used codes to avoid duplicates
        $usedCodes = [];

        foreach ($validatedQuotations as $quotation) {
            $this->command->info("Creating purchase order for quotation {$quotation->code}");
            $quotationDueDate = $quotation->due_date ?? Carbon::now();
            $poDate = Carbon::parse($quotationDueDate)->subDays(rand(5, 30));
            if ($poDate->isFuture()) {
                $poDate = Carbon::now()->subDays(rand(1, 7));
            }
            $baseCode = 'PO-' . substr($quotation->code, 4) . '-' . Carbon::parse($poDate)->format('Ymd');
            $uniqueCode = $this->generateUniqueCode($baseCode, $usedCodes);
            $usedCodes[] = $uniqueCode;

            // Create the purchase order
            PurchaseOrder::factory()->create([
                'code' => $uniqueCode,
                'quotation_id' => $quotation->id,
                'amount' => fake()->numberBetween(10000000, 500000000), // 10M to 500M
                'contract_number' => 'CTR-' . fake()->numerify('######'),
                'job_number' => 'JOB-' . fake()->numerify('######'),
                'date' => $poDate,
            ]);
        }

        $this->command->info('Purchase orders seeded successfully!');
    }

    /**
     * Generate a unique code based on the base code
     * 
     * @param string $baseCode
     * @param array $usedCodes
     * @return string
     */
    private function generateUniqueCode(string $baseCode, array $usedCodes): string
    {
        if (!in_array($baseCode, $usedCodes)) {
            return $baseCode;
        }
        $attempt = 1;
        $maxAttempts = 10;

        while ($attempt <= $maxAttempts) {
            $randomSuffix = '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
            $candidateCode = $baseCode . $randomSuffix;

            if (!in_array($candidateCode, $usedCodes)) {
                return $candidateCode;
            }

            $attempt++;
        }
        return $baseCode . '-' . time() . rand(100, 999);
    }
}

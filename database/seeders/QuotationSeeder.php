<?php

namespace Database\Seeders;

use App\Models\Inquiry;
use App\Models\Negotiation;
use App\Models\Quotation;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Faker\Factory as Faker;

class QuotationSeeder extends Seeder
{
    protected $faker;

    /**
     * Convert month to Roman numerals
     * 
     * @param int $month
     * @return string
     */
    private function monthToRoman(int $month): string
    {
        $romans = [
            1 => 'I',
            2 => 'II',
            3 => 'III',
            4 => 'IV',
            5 => 'V',
            6 => 'VI',
            7 => 'VII',
            8 => 'VIII',
            9 => 'IX',
            10 => 'X',
            11 => 'XI',
            12 => 'XII'
        ];

        return $romans[$month];
    }

    /**
     * Generate quotation code
     * 
     * @param int $inquiryId
     * @param Carbon $date
     * @param int $negotiationCount
     * @return string
     */
    private function generateCode($inquiryId, $date, $negotiationCount = 0)
    {
        $month = $date->month;
        $year = $date->year;
        $romanMonth = $this->monthToRoman($month);

        $qPrefix = $negotiationCount > 0 ? "Q{$negotiationCount}" : "Q";
        return "{$inquiryId}/{$qPrefix}/LNS/{$romanMonth}/{$year}";
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->faker = Faker::create();

        // Make sure we have inquiries first
        if (Inquiry::count() === 0) {
            $this->command->info('Seeding inquiries first...');
            $this->call(InquirySeeder::class);
        }

        $this->command->info('Creating quotations...');

        // Get all inquiries that don't have a quotation yet
        $inquiries = Inquiry::whereDoesntHave('quotation')->get();

        $this->command->info("Found {$inquiries->count()} inquiries without quotations");

        // Create quotations for a random subset of inquiries
        $inquiriesToProcess = $inquiries->random(min(count($inquiries), 50));

        foreach ($inquiriesToProcess as $inquiry) {
            $this->command->info("Creating quotation for inquiry {$inquiry->code}");

            // Determine status based on inquiry age
            $createdDate = Carbon::parse($inquiry->created_at);
            $daysSinceCreation = Carbon::now()->diffInDays($createdDate);

            // Determine status probability based on age
            if ($daysSinceCreation < 30) {
                $status = $this->faker->randomElement(['n/a', 'n/a', 'wip', 'wip', 'val', 'lost']);
            } else if ($daysSinceCreation < 60) {
                $status = $this->faker->randomElement(['n/a', 'wip', 'val', 'val', 'lost', 'clsd']);
            } else {
                $status = $this->faker->randomElement(['wip', 'val', 'lost', 'lost', 'clsd', 'clsd']);
            }

            // Determine due date based on status
            $dueDate = null;
            switch ($status) {
                case 'n/a':
                    $dueDate = Carbon::now()->addDays(rand(7, 90));
                    break;
                case 'wip':
                    $dueDate = Carbon::now()->addDays(rand(7, 60));
                    break;
                case 'val':
                    $dueDate = Carbon::now()->addDays(rand(14, 120));
                    break;
                case 'lost':
                    $dueDate = Carbon::now()->subDays(rand(1, 60));
                    break;
                case 'clsd':
                    $dueDate = Carbon::now()->subDays(rand(1, 90));
                    break;
            }

            // Generate creation date
            $quotationCreatedAt = $createdDate->copy()->addDays(rand(1, 14));

            // Generate initial code
            $initialCode = $this->generateCode($inquiry->id, $quotationCreatedAt);

            // Create the quotation with the initial code
            $quotation = new Quotation([
                'inquiry_id' => $inquiry->id,
                'status' => $status,
                'file' => null,
                'due_date' => $dueDate,
                'code' => $initialCode, // Set the initial code
            ]);

            $quotation->created_at = $quotationCreatedAt;
            $quotation->updated_at = Carbon::now();
            $quotation->save();

            // Randomly add negotiations based on status
            $negotiationCount = 0;
            if ($status === 'val') {
                $negotiationCount = rand(1, 3); // Validated quotations likely have some negotiations
            } else if ($status === 'lost') {
                $negotiationCount = rand(0, 4); // Lost quotations might have multiple negotiation attempts
            } else if ($status === 'clsd') {
                $negotiationCount = rand(0, 2); // Closed might have a few
            } else if ($status === 'wip') {
                $negotiationCount = rand(1, 2); // Work in progress has some negotiations
            } else {
                $negotiationCount = rand(0, 1); // Pending (n/a) likely has few or none
            }

            $this->command->info("Adding {$negotiationCount} negotiations to quotation {$quotation->code}");

            // Create negotiations and update quotation code accordingly
            for ($i = 0; $i < $negotiationCount; $i++) {
                Negotiation::create([
                    'quotation_id' => $quotation->id,
                ]);
            }

            // Update the code one final time if negotiations were added
            if ($negotiationCount > 0) {
                $finalCode = $this->generateCode($inquiry->id, $quotationCreatedAt, $negotiationCount);
                $quotation->code = $finalCode;
                $quotation->saveQuietly(); // Use saveQuietly to avoid triggering additional code updates
            }
        }

        $this->command->info('Quotations seeded successfully!');
    }
}

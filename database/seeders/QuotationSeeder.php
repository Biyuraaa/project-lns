<?php

namespace Database\Seeders;

use App\Models\Inquiry;
use App\Models\Negotiation;
use App\Models\Quotation;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

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

        // Approach: We'll select inquiries with 'pending' status that we want to convert to 'process'
        // by adding a quotation to them
        $pendingInquiries = Inquiry::where('status', 'pending')->get();

        if ($pendingInquiries->isEmpty()) {
            $this->command->warn('No pending inquiries found. No quotations will be created.');
            return;
        }

        $this->command->info("Found {$pendingInquiries->count()} pending inquiries");

        // Process a random subset (approximately 70%) of the pending inquiries
        $inquiriesToProcess = $pendingInquiries->random(max(1, (int)($pendingInquiries->count() * 0.7)));

        $this->command->info("Selected {$inquiriesToProcess->count()} inquiries to process with quotations");

        // Begin a transaction to ensure all related changes are done atomically
        DB::beginTransaction();

        try {
            foreach ($inquiriesToProcess as $inquiry) {
                $this->command->info("Creating quotation for inquiry {$inquiry->code}");

                // Determine status based on inquiry age
                $createdDate = Carbon::parse($inquiry->created_at);
                $daysSinceCreation = Carbon::now()->diffInDays($createdDate);

                // Determine status probability based on age
                if ($daysSinceCreation < 30) {
                    $status = $this->faker->randomElement(['n/a', 'n/a', 'wip', 'val', 'lost']);
                } else if ($daysSinceCreation < 60) {
                    $status = $this->faker->randomElement(['wip', 'val', 'val', 'lost', 'n/a']);
                } else {
                    $status = $this->faker->randomElement(['val', 'val', 'lost', 'lost', 'wip']);
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
                }

                // Generate creation date 
                $quotationCreatedAt = $createdDate->copy()->addDays(rand(1, 14));

                // Initial code generation
                $initialCode = $this->generateCode($inquiry->id, $quotationCreatedAt);

                // Generate a realistic quotation amount (between 10 million and 500 million)
                $initialAmount = $this->faker->numberBetween(10000000, 500000000);

                // Create the quotation with the initial code and amount
                $quotation = new Quotation([
                    'inquiry_id' => $inquiry->id,
                    'status' => $status,
                    'file' => null,
                    'due_date' => $dueDate,
                    'code' => $initialCode,
                    'amount' => $initialAmount, // Set initial amount
                ]);

                $quotation->created_at = $quotationCreatedAt;
                $quotation->updated_at = Carbon::now();
                $quotation->save();

                // Update the inquiry status to 'process' since it now has a quotation
                $inquiry->status = 'process';
                $inquiry->save();

                // Randomly add negotiations based on status
                $negotiationCount = 0;
                if ($status === 'val') {
                    $negotiationCount = rand(1, 3); // Validated quotations likely have some negotiations
                } else if ($status === 'lost') {
                    $negotiationCount = rand(0, 4); // Lost quotations might have multiple negotiation attempts
                } else if ($status === 'wip') {
                    $negotiationCount = rand(1, 2); // Work in progress has some negotiations
                } else {
                    $negotiationCount = rand(0, 1); // Pending (n/a) likely has few or none
                }

                $this->command->info("Adding {$negotiationCount} negotiations to quotation {$quotation->code}");

                // Track the current amount for progressive negotiations
                $currentAmount = $initialAmount;

                // Create negotiations and update quotation code and amount accordingly
                for ($i = 0; $i < $negotiationCount; $i++) {
                    // For each negotiation, adjust the amount by a random percentage
                    // Most negotiations will reduce the price, but some might increase it
                    $adjustmentPercent = $this->faker->randomElement([
                        -15,
                        -10,
                        -7,
                        -5,
                        -3,
                        -2,
                        -1,
                        0,
                        1,
                        2,
                        3,
                        5
                    ]);

                    $negotiationAmount = (int)round($currentAmount * (1 + ($adjustmentPercent / 100)));
                    $currentAmount = $negotiationAmount; // Update for next negotiation

                    // Create the negotiation with amount
                    $negotiation = Negotiation::create([
                        'quotation_id' => $quotation->id,
                        'amount' => $negotiationAmount,
                        'created_at' => $quotation->created_at->copy()->addDays(rand(1, 7) * ($i + 1)),
                    ]);
                }

                // Update the quotation code one final time if negotiations were added
                if ($negotiationCount > 0) {
                    $finalCode = $this->generateCode($inquiry->id, $quotationCreatedAt, $negotiationCount);

                    // Update both the code and amount to match the latest negotiation
                    $quotation->code = $finalCode;
                    $quotation->amount = $currentAmount; // Set to the final negotiated amount
                    $quotation->saveQuietly(); // Use saveQuietly to avoid triggering additional code updates
                }
            }

            DB::commit();
            $this->command->info('Quotations and negotiations seeded successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Error seeding quotations: ' . $e->getMessage());
            throw $e;
        }
    }
}

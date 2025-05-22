<?php

namespace Database\Seeders;

use App\Models\Inquiry;
use App\Models\Quotation;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Faker\Factory as Faker;

class QuotationSeeder extends Seeder
{
    protected $faker;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->faker = Faker::create(); {
            // Make sure we have inquiries first
            if (Inquiry::count() === 0) {
                $this->command->info('Seeding inquiries first...');
                $this->call(InquirySeeder::class);
            }

            $this->command->info('Creating quotations...');

            // Get all inquiries
            $inquiries = Inquiry::all();

            foreach ($inquiries as $inquiry) {
                // Each inquiry gets 1-5 quotations
                $quotationCount = rand(1, 5);

                $this->command->info("Creating {$quotationCount} quotations for inquiry {$inquiry->code}");

                // Determine if one will be validated (50% chance)
                $hasValidated = rand(0, 1) === 1;
                $validatedIndex = $hasValidated ? rand(0, $quotationCount - 1) : -1;

                for ($i = 0; $i < $quotationCount; $i++) {
                    // Determine the status based on the inquiry age and whether this quotation is the validated one
                    if ($i === $validatedIndex) {
                        $status = 'val';
                    } else {
                        // Calculate probabilities based on inquiry age
                        $createdDate = Carbon::parse($inquiry->created_at);
                        $daysSinceCreation = Carbon::now()->diffInDays($createdDate);

                        // Newer inquiries more likely to have pending quotations
                        if ($daysSinceCreation < 30) {
                            $status = $this->faker->randomElement(['n/a', 'n/a', 'n/a', 'lost']);
                        } else if ($daysSinceCreation < 60) {
                            $status = $this->faker->randomElement(['n/a', 'lost', 'lost', 'clsd']);
                        } else {
                            $status = $this->faker->randomElement(['lost', 'clsd', 'clsd', 'clsd']);
                        }
                    }

                    // Determine due date based on status
                    $dueDate = null;
                    switch ($status) {
                        case 'n/a':
                            $dueDate = Carbon::now()->addDays(rand(7, 90));
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

                    // Create the quotation
                    Quotation::factory()->create([
                        'code' => 'QUO-' . $this->faker->unique()->numerify('######'),
                        'inquiry_id' => $inquiry->id,
                        'status' => $status,
                        'file' => null, // No files as requested
                        'due_date' => $dueDate,
                    ]);
                }
            }

            $this->command->info('Quotations seeded successfully!');
        }
    }
}

<?php

namespace Database\Factories;

use App\Models\Quotation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Negotiation>
 */
class NegotiationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quotation_id' => Quotation::factory(),
            'file' => null,
            'amount' => function (array $attributes) {
                // Get the quotation
                $quotation = Quotation::find($attributes['quotation_id']);

                if (!$quotation) {
                    // Generate a random amount if we can't find the quotation
                    return $this->faker->numberBetween(10000000, 500000000);
                }

                // Calculate negotiation amount based on quotation amount
                // Most negotiations adjust price within -15% to +5% of the quotation price
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

                $negotiatedAmount = (int)round($quotation->amount * (1 + ($adjustmentPercent / 100)));
                return $negotiatedAmount;
            },
            'created_at' => function (array $attributes) {
                // Get the quotation's creation date
                $quotation = Quotation::find($attributes['quotation_id']);

                if (!$quotation || !$quotation->created_at) {
                    return now();
                }

                // Create the negotiation 1-7 days after the quotation
                return $quotation->created_at->copy()->addDays(rand(1, 7));
            },
        ];
    }

    /**
     * Configure the model factory.
     *
     * @return $this
     */
    public function configure()
    {
        return $this->afterCreating(function ($negotiation) {
            // Update the parent quotation's amount to match this negotiation
            $quotation = $negotiation->quotation;

            // If found, update the quotation amount
            if ($quotation) {
                $quotation->amount = $negotiation->amount;

                // Update the quotation code to include the negotiation count
                $inquiryId = $quotation->inquiry_id;
                $date = $quotation->created_at ?: now();
                $negotiationCount = $quotation->negotiations()->count();

                // Generate the new code with the negotiation count
                $month = $date->month;
                $year = $date->year;
                $romanMonth = $this->monthToRoman($month);
                $qPrefix = "Q{$negotiationCount}";
                $quotation->code = "{$inquiryId}/{$qPrefix}/LNS/{$romanMonth}/{$year}";

                // Save without triggering events
                $quotation->saveQuietly();
            }
        });
    }

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
}

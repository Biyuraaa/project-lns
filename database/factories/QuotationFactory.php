<?php

namespace Database\Factories;

use App\Models\Inquiry;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quotation>
 */
class QuotationFactory extends Factory
{
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
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate a due date between now and 3 months in the future
        $dueDate = Carbon::now()->addDays(rand(7, 90));

        // Default status
        return [
            'inquiry_id' => Inquiry::factory(),
            'file' => null, // No files as requested
            'due_date' => $dueDate,
            'created_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
        ];
    }

    /**
     * Configure the model factory.
     *
     * @return $this
     */
    public function configure()
    {
        return $this->afterMaking(function ($quotation) {
            // Logic that should happen after making but before creating
        })->afterCreating(function ($quotation) {
            // Generate code with the format id/Q/LNS/month/year
            $inquiry = $quotation->inquiry;
            $date = Carbon::parse($quotation->created_at ?: now());
            $romanMonth = $this->monthToRoman($date->month);
            $year = $date->year;

            // Count existing negotiations
            $negotiationCount = $quotation->negotiations()->count();
            $qPrefix = $negotiationCount > 0 ? "Q{$negotiationCount}" : "Q";

            // Update the code
            $quotation->code = "{$inquiry->id}/{$qPrefix}/LNS/{$romanMonth}/{$year}";
            $quotation->save();
        });
    }

    /**
     * Set the quotation as not applicable (n/a)
     */
    public function na()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'n/a',
            ];
        });
    }

    /**
     * Set the quotation as validated (val)
     */
    public function validated()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'val',
            ];
        });
    }

    /**
     * Set the quotation as lost
     */
    public function lost()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'lost',
            ];
        });
    }

    /**
     * Set the quotation as closed (clsd)
     */
    public function closed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'clsd',
            ];
        });
    }

    public function workInProgress()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'wip',
            ];
        });
    }

    /**
     * Create an expired quotation
     */
    public function expired()
    {
        return $this->state(function (array $attributes) {
            return [
                'due_date' => Carbon::now()->subDays(rand(1, 30)),
            ];
        });
    }

    /**
     * Create a quotation with a due date coming soon
     */
    public function comingSoon()
    {
        return $this->state(function (array $attributes) {
            return [
                'due_date' => Carbon::now()->addDays(rand(1, 7)),
            ];
        });
    }
}

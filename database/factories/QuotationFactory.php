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
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate a due date between now and 3 months in the future
        $dueDate = Carbon::now()->addDays(rand(7, 90));

        return [
            'code' => 'QUO-' . $this->faker->unique()->numerify('######'),
            'inquiry_id' => Inquiry::inRandomOrder()->first()->id ?? Inquiry::factory(),
            'status' => 'n/a', // Default status
            'file' => null, // No files as requested
            'due_date' => $dueDate,
            'created_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
        ];
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

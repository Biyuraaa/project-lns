<?php

namespace Database\Factories;

use App\Models\Quotation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => 'PO-' . $this->faker->unique()->numerify('######'),
            'quotation_id' => function () {
                // We'll override this in the seeder to ensure we only use validated quotations
                return Quotation::where('status', 'val')->inRandomOrder()->first()->id;
            },
            'amount' => $this->faker->numberBetween(10000000, 500000000),
            'file' => null, // No file as requested
            'status' => $this->faker->randomElement(['wip', 'ar', 'ibt']),
            'contract_number' => 'CTR-' . $this->faker->numerify('######'),
            'job_number' => 'JOB-' . $this->faker->numerify('######'),
            'date' => $this->faker->dateTimeBetween('-6 months', 'now'),
        ];
    }

    /**
     * Set the purchase order as work in progress.
     */
    public function workInProgress()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'wip',
            ];
        });
    }

    /**
     * Set the purchase order as awaiting review.
     */
    public function awaitingReview()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'ar',
            ];
        });
    }

    /**
     * Set the purchase order as issued by third party.
     */
    public function issuedByThirdParty()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'ibt',
            ];
        });
    }

    /**
     * Set the purchase order as recently issued.
     */
    public function recent()
    {
        return $this->state(function (array $attributes) {
            return [
                'date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            ];
        });
    }
}

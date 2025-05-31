<?php

namespace Database\Factories;

use App\Models\BusinessUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CompanyGrowthSelling>
 */
class CompanyGrowthSellingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $target = $this->faker->numberBetween(500000, 1000000);
        $actual = $this->faker->numberBetween(400000, 1200000);
        $difference = $actual - $target;
        $percentage = round(($actual / $target) * 100, 2);

        // Get a random business unit ID from the database
        // If none exists, BusinessUnit::factory will be used in the seeder
        $businessUnitId = BusinessUnit::inRandomOrder()->first()?->id;

        return [
            'month' => $this->faker->numberBetween(1, 12),
            'year' => $this->faker->numberBetween(2023, 2025),
            'target' => $target,
            'actual' => $actual,
            'difference' => $difference,
            'percentage' => $percentage,
            'business_unit_id' => $businessUnitId ?? null,
        ];
    }

    /**
     * Configure the model factory to create a record for a specific month and year.
     *
     * @param int $month
     * @param int $year
     * @return $this
     */
    public function forMonthAndYear(int $month, int $year)
    {
        return $this->state(function (array $attributes) use ($month, $year) {
            // Create slightly increasing targets as time progresses
            $baseTarget = 500000;
            $monthsFromStart = (($year - 2023) * 12) + $month;
            $growthFactor = 1 + ($monthsFromStart * 0.015); // 1.5% monthly growth
            $target = round($baseTarget * $growthFactor);

            // Create seasonal variation in actual performance
            $seasonalFactor = 1;
            if ($month >= 10 || $month <= 2) { // Q4-Q1 (high season)
                $seasonalFactor = 1.2;
            } else if ($month >= 6 && $month <= 8) { // Summer (low season)
                $seasonalFactor = 0.9;
            }

            // Add some fluctuation to make it more realistic
            $fluctuation = $this->faker->randomFloat(2, 0.85, 1.15);

            $actual = round($target * $seasonalFactor * $fluctuation);
            $difference = $actual - $target;
            $percentage = round(($actual / $target) * 100, 2);

            return [
                'month' => $month,
                'year' => $year,
                'target' => $target,
                'actual' => $actual,
                'difference' => $difference,
                'percentage' => $percentage,
                // We don't set business_unit_id here as it will be handled in the seeder
            ];
        });
    }

    /**
     * Set the business unit for the growth selling record
     * 
     * @param int $businessUnitId
     * @return $this
     */
    public function forBusinessUnit(int $businessUnitId)
    {
        return $this->state([
            'business_unit_id' => $businessUnitId,
        ]);
    }
}

<?php

namespace Database\Factories;

use App\Models\BusinessUnit;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Inquiry>
 */
class InquiryFactory extends Factory
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
        $inquiryDate = $this->faker->dateTimeBetween('-6 months', 'now');
        return [
            'customer_id' => Customer::inRandomOrder()->first()->id ?? Customer::factory(),
            'description' => $this->faker->paragraph(3),
            'business_unit_id' => BusinessUnit::inRandomOrder()->first()->id ?? null,
            'inquiry_date' => $inquiryDate,
            'end_user_name' => $this->faker->name(),
            'end_user_email' => $this->faker->safeEmail(),
            'end_user_phone' => $this->faker->phoneNumber(),
            'end_user_address' => $this->faker->address(),
            'file' => null, // Leave file as null since we're not generating actual files
            'pic_engineer_id' => User::role('pic-engineer')->inRandomOrder()->first()->id ?? null,
            'sales_id' => User::role('sales')->inRandomOrder()->first()->id ?? null,
            'status' => $this->faker->randomElement(['pending', 'process']),
            'created_at' => $inquiryDate,
        ];
    }

    /**
     * Indicate that the inquiry is pending.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
            ];
        });
    }

    /**
     * Indicate that the inquiry is in process.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function process()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'process',
            ];
        });
    }

    /**
     * Create an inquiry with recent date (last month).
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function recent()
    {
        return $this->state(function (array $attributes) {
            $recentDate = $this->faker->dateTimeBetween('-1 month', 'now');
            $date = Carbon::parse($recentDate);
            $month = $date->month;
            $year = $date->year;
            $romanMonth = $this->monthToRoman($month);
            $placeholderId = $this->faker->unique()->numberBetween(1, 9999);

            return [
                'inquiry_date' => $recentDate,
                'code' => "{$placeholderId}/I/LNS/{$romanMonth}/{$year}",
                'created_at' => $recentDate,
            ];
        });
    }
}

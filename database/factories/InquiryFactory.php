<?php

namespace Database\Factories;

use App\Models\BusinessUnit;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Inquiry>
 */
class InquiryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => 'INQ-' . $this->faker->unique()->numerify('######'),
            'customer_id' => Customer::inRandomOrder()->first()->id ?? Customer::factory(),
            'description' => $this->faker->paragraph(3),
            'business_unit_id' => BusinessUnit::inRandomOrder()->first()->id ?? null,
            'inquiry_date' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'end_user_name' => $this->faker->name(),
            'end_user_email' => $this->faker->safeEmail(),
            'end_user_phone' => $this->faker->phoneNumber(),
            'end_user_address' => $this->faker->address(),
            'file' => null, // Leave file as null since we're not generating actual files
            'pic_engineer_id' => User::role('pic-engineer')->inRandomOrder()->first()->id ?? null,
            'sales_id' => User::role('sales')->inRandomOrder()->first()->id ?? null,
            'status' => $this->faker->randomElement(['pending', 'resolved', 'closed', 'process']),
            'created_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
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
     * Indicate that the inquiry is resolved.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function resolved()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'resolved',
            ];
        });
    }

    /**
     * Indicate that the inquiry is closed.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function closed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'closed',
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
            return [
                'inquiry_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            ];
        });
    }
}

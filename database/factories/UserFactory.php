<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use Spatie\Permission\Models\Role;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Configure the model to have the sales role.
     */
    public function sales(): static
    {
        return $this->afterCreating(function (User $user) {
            // Make sure the 'sales' role exists
            $salesRole = Role::firstOrCreate(['name' => 'sales']);

            // Assign the role to the user
            $user->assignRole($salesRole);
        });
    }

    /**
     * Configure the model to have the pic-engineer role.
     */
    public function picEngineer(): static
    {
        return $this->afterCreating(function (User $user) {
            // Make sure the 'pic-engineer' role exists
            $picEngineerRole = Role::firstOrCreate(['name' => 'pic-engineer']);

            // Assign the role to the user
            $user->assignRole($picEngineerRole);
        });
    }

    /**
     * Configure the model to have the admin role.
     */
    public function admin(): static
    {
        return $this->afterCreating(function (User $user) {
            // Make sure the 'admin' role exists
            $adminRole = Role::firstOrCreate(['name' => 'admin']);

            // Assign the role to the user
            $user->assignRole($adminRole);
        });
    }
}

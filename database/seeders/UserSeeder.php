<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        User::factory()
            ->count(10)
            ->sales()
            ->create();

        User::factory()
            ->count(10)
            ->picEngineer()
            ->create();

        User::factory(
            [
                'name' => 'Admin',
                'email' => 'admin@admin.com',
                'password' => bcrypt('admin'),
            ]
        )
            ->admin()
            ->create();
    }
}

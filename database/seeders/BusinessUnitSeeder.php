<?php

namespace Database\Seeders;

use App\Models\BusinessUnit;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BusinessUnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $businessUnits = [
            [
                'name' => 'Bisnis Unit 1',
                'description' => 'Penjualan produk electrical dan Alfalaval',
            ],
            [
                'name' => 'Bisnis Unit 2',
                'description' => 'Jasa mechanical, service, dan konstruksi',
            ],
            [
                'name' => 'Bisnis Unit 3',
                'description' => 'Olincash',
            ],
        ];

        foreach ($businessUnits as $unit) {
            BusinessUnit::create($unit);
        }

        $this->command->info('Business units seeded successfully!');
    }
}

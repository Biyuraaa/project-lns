<?php

namespace Database\Seeders;

use App\Models\CompanyGrowthSelling;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompanyGrowthSellingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing records
        DB::table('company_growth_sellings')->truncate();

        $startDate = [
            'month' => 1,
            'year' => 2023,
        ];

        $endDate = [
            'month' => 5,
            'year' => 2025,
        ];

        $currentYear = $startDate['year'];
        $currentMonth = $startDate['month'];

        $records = [];

        while (
            $currentYear < $endDate['year'] ||
            ($currentYear == $endDate['year'] && $currentMonth <= $endDate['month'])
        ) {
            // Generate a record for the current month and year
            $record = CompanyGrowthSelling::factory()
                ->forMonthAndYear($currentMonth, $currentYear)
                ->makeOne()
                ->toArray();

            $records[] = $record;

            // Move to the next month
            $currentMonth++;
            if ($currentMonth > 12) {
                $currentMonth = 1;
                $currentYear++;
            }
        }

        // Use chunk insert for better performance
        $chunks = array_chunk($records, 10);
        foreach ($chunks as $chunk) {
            CompanyGrowthSelling::insert($chunk);
        }

        $this->command->info('Created ' . count($records) . ' company growth selling records from ' .
            $startDate['month'] . '/' . $startDate['year'] . ' to ' .
            $endDate['month'] . '/' . $endDate['year']);
    }
}

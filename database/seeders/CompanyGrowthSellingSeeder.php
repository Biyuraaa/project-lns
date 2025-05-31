<?php

namespace Database\Seeders;

use App\Models\BusinessUnit;
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

        // Get all business units or create some if none exist
        $businessUnits = BusinessUnit::all();
        if ($businessUnits->isEmpty()) {
            $businessUnits = BusinessUnit::factory(3)->create();
        }

        $startDate = [
            'month' => 1,
            'year' => 2023,
        ];

        $endDate = [
            'month' => 5,
            'year' => 2025,
        ];

        $totalRecords = 0;

        // Create records for each business unit
        foreach ($businessUnits as $businessUnit) {
            $currentYear = $startDate['year'];
            $currentMonth = $startDate['month'];
            $records = [];

            while (
                $currentYear < $endDate['year'] ||
                ($currentYear == $endDate['year'] && $currentMonth <= $endDate['month'])
            ) {
                $record = CompanyGrowthSelling::factory()
                    ->forMonthAndYear($currentMonth, $currentYear)
                    ->forBusinessUnit($businessUnit->id)
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

            $chunks = array_chunk($records, 10);
            foreach ($chunks as $chunk) {
                CompanyGrowthSelling::insert($chunk);
            }

            $totalRecords += count($records);
        }

        $this->command->info('Created ' . $totalRecords . ' company growth selling records from ' .
            $startDate['month'] . '/' . $startDate['year'] . ' to ' .
            $endDate['month'] . '/' . $endDate['year'] .
            ' across ' . $businessUnits->count() . ' business units.');
    }
}

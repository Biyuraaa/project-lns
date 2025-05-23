<?php

namespace App\Http\Controllers;

use App\Models\CompanyGrowthSelling;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCompanyGrowthSellingRequest;
use App\Http\Requests\UpdateCompanyGrowthSellingRequest;
use Inertia\Inertia;

class CompanyGrowthSellingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Fetch all records from the CompanyGrowthSelling model
        $companyGrowthSellings = CompanyGrowthSelling::all();

        return Inertia::render('Dashboard/CompanyGrowthSelling/Index', [
            'companyGrowthSellings' => $companyGrowthSellings,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get all existing month-year combinations
        $existingRecords = CompanyGrowthSelling::select('month', 'year')->get();

        // Create an array of available months for each year (2023-2025)
        $availableMonths = $this->getAvailableMonths($existingRecords);

        // Render the form for creating a new Dashboard/CompanyGrowthSelling record
        return Inertia::render('Dashboard/CompanyGrowthSelling/Create', [
            'availableMonths' => $availableMonths,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCompanyGrowthSellingRequest $request)
    {
        try {
            $validatedData = $request->validated();

            // Check if a record with the same month and year already exists
            $exists = CompanyGrowthSelling::where('month', $validatedData['month'])
                ->where('year', $validatedData['year'])
                ->exists();

            if ($exists) {
                return redirect()->back()->withErrors([
                    'month' => 'A record for this month and year already exists.',
                ])->withInput();
            }

            // Calculate difference and percentage if actual is provided
            if (isset($validatedData['actual'])) {
                $validatedData['difference'] = $validatedData['actual'] - $validatedData['target'];
                $validatedData['percentage'] = $validatedData['target'] > 0
                    ? round(($validatedData['actual'] / $validatedData['target']) * 100)
                    : 0;
            } else {
                // Default values if actual is not provided
                $validatedData['actual'] = 0;
                $validatedData['difference'] = -$validatedData['target'];
                $validatedData['percentage'] = 0;
            }

            CompanyGrowthSelling::create($validatedData);

            return redirect()->route('targetSales.index')->with('success', 'Company Growth Selling record created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create Company Growth Selling record: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(CompanyGrowthSelling $companyGrowthSelling)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CompanyGrowthSelling $targetSale)
    {
        // Get all existing month-year combinations except the current one
        $existingRecords = CompanyGrowthSelling::where('id', '!=', $targetSale->id)
            ->select('month', 'year')
            ->get();

        // Create an array of available months for each year (2023-2025)
        $availableMonths = $this->getAvailableMonths($existingRecords, $targetSale->month, $targetSale->year);

        return Inertia::render('Dashboard/CompanyGrowthSelling/Edit', [
            'companyGrowthSelling' => $targetSale,
            'availableMonths' => $availableMonths,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCompanyGrowthSellingRequest $request, CompanyGrowthSelling $targetSale)
    {
        try {
            $validatedData = $request->validated();

            // Check if trying to update to a month-year that already exists (and is not the current record)
            if ($targetSale->month != $validatedData['month'] || $targetSale->year != $validatedData['year']) {
                $exists = CompanyGrowthSelling::where('month', $validatedData['month'])
                    ->where('year', $validatedData['year'])
                    ->where('id', '!=', $targetSale->id)
                    ->exists();

                if ($exists) {
                    return redirect()->back()->withErrors([
                        'month' => 'A record for this month and year already exists.',
                    ])->withInput();
                }
            }

            // Calculate difference and percentage
            if (isset($validatedData['target']) && isset($validatedData['actual'])) {
                $validatedData['difference'] = $validatedData['actual'] - $validatedData['target'];
                $validatedData['percentage'] = $validatedData['target'] > 0
                    ? round(($validatedData['actual'] / $validatedData['target']) * 100)
                    : 0;
            }

            $targetSale->update($validatedData);

            return redirect()->route('targetSales.index')->with('success', 'Company Growth Selling record updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update Company Growth Selling record: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CompanyGrowthSelling $companyGrowthSelling)
    {
        try {
            $companyGrowthSelling->delete();
            return redirect()->route('targetSales.index')->with('success', 'Company Growth Selling record deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete Company Growth Selling record: ' . $e->getMessage());
        }
    }

    /**
     * Helper method to get available months for each year
     */
    private function getAvailableMonths($existingRecords, $currentMonth = null, $currentYear = null)
    {
        // Initialize available months for years 2023-2025
        $years = [2023, 2024, 2025, 2026, 2027];
        $availableMonths = [];

        foreach ($years as $year) {
            $availableMonths[$year] = range(1, 12);
        }

        // Remove months that already have records
        foreach ($existingRecords as $record) {
            $month = $record->month;
            $year = $record->year;

            if (isset($availableMonths[$year])) {
                $index = array_search($month, $availableMonths[$year]);
                if ($index !== false) {
                    unset($availableMonths[$year][$index]);
                }
            }
        }

        // Add back the current month for the edit case
        if ($currentMonth && $currentYear) {
            if (!in_array($currentMonth, $availableMonths[$currentYear])) {
                $availableMonths[$currentYear][] = $currentMonth;
                sort($availableMonths[$currentYear]);
            }
        }

        // Convert to associative array with month names
        $monthNames = [
            1 => 'January',
            2 => 'February',
            3 => 'March',
            4 => 'April',
            5 => 'May',
            6 => 'June',
            7 => 'July',
            8 => 'August',
            9 => 'September',
            10 => 'October',
            11 => 'November',
            12 => 'December'
        ];

        $result = [];
        foreach ($years as $year) {
            $result[$year] = [];
            foreach ($availableMonths[$year] as $month) {
                $result[$year][] = [
                    'value' => $month,
                    'label' => $monthNames[$month]
                ];
            }
        }

        return $result;
    }
}

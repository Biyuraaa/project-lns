<?php

namespace App\Http\Controllers;

use App\Models\CompanyGrowthSelling;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCompanyGrowthSellingRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\BusinessUnit;
use Inertia\Inertia;

class CompanyGrowthSellingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get all unique month and year combinations
        $uniquePeriods = CompanyGrowthSelling::select('month', 'year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        // Create summary data structure
        $summaryData = [];

        foreach ($uniquePeriods as $period) {
            // Get all records for this month/year
            $records = CompanyGrowthSelling::where('month', $period->month)
                ->where('year', $period->year)
                ->with('businessUnit:id,name')
                ->get();

            // Calculate totals
            $totalTarget = $records->sum('target');
            $totalActual = $records->sum('actual');
            $totalDifference = $totalActual - $totalTarget;
            $totalPercentage = $totalTarget > 0 ? round(($totalActual / $totalTarget) * 100, 2) : 0;

            // Create summary record
            $summary = [
                'id' => "{$period->year}-{$period->month}", // Create a unique ID for the summary
                'month' => $period->month,
                'year' => $period->year,
                'target' => $totalTarget,
                'actual' => $totalActual,
                'difference' => $totalDifference,
                'percentage' => $totalPercentage,
                'is_summary' => true,
                'business_units' => $records->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'business_unit_id' => $record->business_unit_id,
                        'business_unit_name' => $record->businessUnit->name,
                        'month' => $record->month,
                        'year' => $record->year,
                        'target' => $record->target,
                        'actual' => $record->actual,
                        'difference' => $record->difference,
                        'percentage' => $record->percentage,
                    ];
                })
            ];

            $summaryData[] = $summary;
        }

        // Get all business units for filtering
        $businessUnits = BusinessUnit::select('id', 'name')->get();

        return Inertia::render('Dashboard/CompanyGrowthSelling/Index', [
            'companyGrowthSellings' => $summaryData,
            'businessUnits' => $businessUnits,
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

        $businessUnits = BusinessUnit::select('id', 'name')->get();

        // Render the form for creating a new Dashboard/CompanyGrowthSelling record
        return Inertia::render('Dashboard/CompanyGrowthSelling/Create', [
            'availableMonths' => $availableMonths,
            'businessUnits' => $businessUnits,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $validatedData = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000|max:2050',
            'uniformTarget' => 'required_if:useUniformTargets,true|nullable|numeric|min:0',
            'businessUnitTargets' => 'required_if:useUniformTargets,false|array',
            'businessUnitTargets.*' => 'required_if:useUniformTargets,false|numeric|min:0',
            'useUniformTargets' => 'required|boolean',
        ]);

        // Get all business units
        $businessUnits = BusinessUnit::all();

        // Start a transaction to ensure all operations complete successfully
        DB::beginTransaction();

        try {
            // Process based on whether uniform targets are used
            if ($validatedData['useUniformTargets']) {
                // When using uniform targets, ignore businessUnitTargets and apply the uniform value
                $targetValue = $validatedData['uniformTarget'];

                // Create records for all business units with the same target
                foreach ($businessUnits as $businessUnit) {
                    // Check if a record already exists for this month/year/business unit
                    $existingRecord = CompanyGrowthSelling::where('month', $validatedData['month'])
                        ->where('year', $validatedData['year'])
                        ->where('business_unit_id', $businessUnit->id)
                        ->exists();

                    if (!$existingRecord) {
                        CompanyGrowthSelling::create([
                            'month' => $validatedData['month'],
                            'year' => $validatedData['year'],
                            'target' => $targetValue,
                            'actual' => 0, // Default value, will be updated later
                            'difference' => 0 - $targetValue, // Initial difference (0 - target)
                            'percentage' => 0, // Initial percentage
                            'business_unit_id' => $businessUnit->id,
                        ]);
                    }
                }
            } else {
                // When using custom targets, ignore uniformTarget and use individual values
                foreach ($validatedData['businessUnitTargets'] as $businessUnitId => $targetValue) {
                    // Check if the business unit exists
                    if ($businessUnits->contains('id', $businessUnitId)) {
                        // Check if a record already exists for this month/year/business unit
                        $existingRecord = CompanyGrowthSelling::where('month', $validatedData['month'])
                            ->where('year', $validatedData['year'])
                            ->where('business_unit_id', $businessUnitId)
                            ->exists();

                        if (!$existingRecord) {
                            CompanyGrowthSelling::create([
                                'month' => $validatedData['month'],
                                'year' => $validatedData['year'],
                                'target' => $targetValue,
                                'actual' => 0, // Default value, will be updated later
                                'difference' => 0 - $targetValue, // Initial difference (0 - target)
                                'percentage' => 0, // Initial percentage
                                'business_unit_id' => $businessUnitId,
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            return redirect()->route('targetSales.index')
                ->with('success', 'Sales targets created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to create sales targets. ' . $e->getMessage());
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

<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCompanyGrowthSellingRequest;
use App\Models\CompanyGrowthSelling;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCompanyGrowthSellingRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\BusinessUnit;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CompanyGrowthSellingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('view-any-company-growth-selling')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to view company growth selling records.');
        }
        $uniquePeriods = CompanyGrowthSelling::select('month', 'year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        $summaryData = [];

        foreach ($uniquePeriods as $period) {
            $records = CompanyGrowthSelling::where('month', $period->month)
                ->where('year', $period->year)
                ->with('businessUnit:id,name')
                ->get();
            $totalTarget = $records->sum('target');
            $totalActual = $records->sum('actual');
            $totalDifference = $totalActual - $totalTarget;
            $totalPercentage = $totalTarget > 0 ? round(($totalActual / $totalTarget) * 100, 2) : 0;
            $summary = [
                'id' => "{$period->year}-{$period->month}",
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
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('create-company-growth-selling')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to create company growth selling records.');
        }

        $existingRecords = CompanyGrowthSelling::select('month', 'year')->get();
        $availableMonths = $this->getAvailableMonths($existingRecords);
        $businessUnits = BusinessUnit::select('id', 'name')->get();

        return Inertia::render('Dashboard/CompanyGrowthSelling/Create', [
            'availableMonths' => $availableMonths,
            'businessUnits' => $businessUnits,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCompanyGrowthSellingRequest $request)
    {
        $validatedData = $request->validated();
        $businessUnits = BusinessUnit::all();

        DB::beginTransaction();

        try {
            if ($validatedData['useUniformTargets']) {
                // Convert to the appropriate scale (assuming we're storing in millions)
                $targetValue = (float)$validatedData['uniformTarget'];

                foreach ($businessUnits as $businessUnit) {
                    $existingRecord = CompanyGrowthSelling::where('month', $validatedData['month'])
                        ->where('year', $validatedData['year'])
                        ->where('business_unit_id', $businessUnit->id)
                        ->exists();

                    if (!$existingRecord) {
                        CompanyGrowthSelling::create([
                            'month' => $validatedData['month'],
                            'year' => $validatedData['year'],
                            'target' => $targetValue,
                            'actual' => 0,
                            'difference' => 0 - $targetValue,
                            'percentage' => 0,
                            'business_unit_id' => $businessUnit->id,
                        ]);
                    }
                }
            } else {
                foreach ($validatedData['businessUnitTargets'] as $businessUnitId => $targetValue) {
                    if ($businessUnits->contains('id', $businessUnitId)) {
                        // Convert to the appropriate scale
                        $targetValue = (float)$targetValue;

                        $existingRecord = CompanyGrowthSelling::where('month', $validatedData['month'])
                            ->where('year', $validatedData['year'])
                            ->where('business_unit_id', $businessUnitId)
                            ->exists();

                        if (!$existingRecord) {
                            CompanyGrowthSelling::create([
                                'month' => $validatedData['month'],
                                'year' => $validatedData['year'],
                                'target' => $targetValue,
                                'actual' => 0,
                                'difference' => 0 - $targetValue,
                                'percentage' => 0,
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
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('update-company-growth-selling')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to edit company growth selling records.');
        }
        $existingRecords = CompanyGrowthSelling::where('id', '!=', $targetSale->id)
            ->select('month', 'year')
            ->get();
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
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('delete-company-growth-selling')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to delete company growth selling records.');
        }
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
        $years = [2023, 2024, 2025, 2026, 2027];
        $availableMonths = [];

        foreach ($years as $year) {
            $availableMonths[$year] = range(1, 12);
        }
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
        if ($currentMonth && $currentYear) {
            if (!in_array($currentMonth, $availableMonths[$currentYear])) {
                $availableMonths[$currentYear][] = $currentMonth;
                sort($availableMonths[$currentYear]);
            }
        }
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

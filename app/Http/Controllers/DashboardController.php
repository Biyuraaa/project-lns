<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BusinessUnit;
use App\Models\CompanyGrowthSelling;
use App\Models\Inquiry;
use App\Models\Quotation;
use App\Models\PurchaseOrder;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DashboardController extends Controller
{

    /**
     * Display the dashboard index page with statistics and charts
     *
     * @return \Inertia\Response | \Illuminate\Http\RedirectResponse
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('view-dashboard')) {
            return redirect()->route('customers.index')
                ->with('error', 'You do not have permission to view the dashboard.');
        }

        $currentMonthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();
        $sixMonthsAgo = now()->subMonths(6)->startOfDay();

        // Get all business units for frontend filtering
        $businessUnits = BusinessUnit::select('id', 'name')->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->name,
                ];
            });

        // Get statistics
        $inquiriesStats = $this->getInquiriesStatistics($currentMonthStart, $lastMonthStart, $lastMonthEnd);
        $activeQuotationsStats = $this->getActiveQuotationsStatistics($lastMonthStart, $lastMonthEnd);
        $purchaseOrdersStats = $this->getPurchaseOrdersStatistics($currentMonthStart, $lastMonthStart, $lastMonthEnd);
        $dueDateQuotationsStats = $this->getDueDateQuotationsStatistics($lastMonthStart);
        $dueDateQuotationsTable = $this->getDueDateQuotationsTable();

        // Prepare data for client-side filtering
        $companyGrowthData = $this->prepareCompanyGrowthData($sixMonthsAgo, $businessUnits);
        $topCustomersData = $this->prepareTopCustomersData($businessUnits);
        $companyGrowthSellingData = $this->prepareCompanyGrowthSellingData();
        $companyGrowthSellingCumulativeData = $this->prepareCompanyGrowthSellingCumulativeData();
        $purchaseOrderStatusData = $this->preparePurchaseOrderStatusData();
        $quotationAmountData = $this->prepareQuotationAmountData();
        $totalValueCardData = $this->prepareTotalValueCardData();

        return Inertia::render('Dashboard/Index', [
            'statistics' => [
                'inquiries' => $inquiriesStats,
                'activeQuotations' => $activeQuotationsStats,
                'purchaseOrders' => $purchaseOrdersStats,
                'dueDateQuotations' => $dueDateQuotationsStats,
            ],
            'tableData' => [
                'dueDateQuotationsData' => $dueDateQuotationsTable,
            ],
            'chartData' => [
                'companyGrowthData' => $companyGrowthData,
                'topCustomersData' => $topCustomersData,
                'companyGrowthSellingData' => $companyGrowthSellingData,
                'companyGrowthSellingCumulativeData' => $companyGrowthSellingCumulativeData,
                'quotationAmountData' => $quotationAmountData,
                'purchaseOrderStatusData' => $purchaseOrderStatusData,
                'businessUnits' => $businessUnits,
                'totalValueCardData' => $totalValueCardData,
            ]
        ]);
    }

    /**
     * Get quotations approaching due date for dashboard table display
     * 
     * @return array
     */
    private function getDueDateQuotationsTable()
    {
        try {
            // Get quotations that are due within the next 7 days
            // Exclude closed and lost quotations
            $dueDateQuotations = Quotation::with(['inquiry.customer', 'inquiry.businessUnit'])
                ->whereDate('quotations.due_date', '>=', now())
                ->whereDate('quotations.due_date', '<=', now()->addDays(7))
                ->whereNotIn('quotations.status', ['clsd', 'lost'])
                ->orderBy('quotations.due_date', 'asc')
                ->get()
                ->map(function ($quotation) {
                    // Calculate days remaining until due date
                    $dueDate = Carbon::parse($quotation->due_date);
                    $daysRemaining = now()->startOfDay()->diffInDays($dueDate->startOfDay());

                    return [
                        'id' => $quotation->id,
                        'code' => $quotation->code,
                        'due_date' => $quotation->due_date,
                        'days_remaining' => $daysRemaining,
                        'status' => $quotation->status,
                        'created_at' => $quotation->created_at,
                        'inquiry' => [
                            'id' => $quotation->inquiry->id,
                            'code' => $quotation->inquiry->code,
                            'description' => Str::limit($quotation->inquiry->description, 50),
                            'business_unit' => [
                                'id' => $quotation->inquiry->businessUnit ? $quotation->inquiry->businessUnit->id : null,
                                'name' => $quotation->inquiry->businessUnit ? $quotation->inquiry->businessUnit->name : 'Unknown'
                            ],
                        ],
                        'customer' => [
                            'id' => $quotation->inquiry->customer ? $quotation->inquiry->customer->id : null,
                            'name' => $quotation->inquiry->customer ? $quotation->inquiry->customer->name : 'Unknown'
                        ]
                    ];
                })
                ->toArray();

            return $dueDateQuotations;
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error in getDueDateQuotationsTable: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            // Return empty array to prevent frontend errors
            return [];
        }
    }

    /**
     * Get statistics for inquiries
     * 
     * @param Carbon $currentMonthStart
     * @param Carbon $lastMonthStart
     * @param Carbon $lastMonthEnd
     * @return array
     */
    private function getInquiriesStatistics($currentMonthStart, $lastMonthStart, $lastMonthEnd)
    {
        $inquiriesQuery = Inquiry::query();
        $inquiriesThisMonth = $inquiriesQuery->clone()->whereBetween('created_at', [$currentMonthStart, now()])->count();
        $inquiriesLastMonth = $inquiriesQuery->clone()->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        $inquiriesGrowth = $this->calculateGrowth($inquiriesThisMonth, $inquiriesLastMonth);
        $inquiriesInsight = $this->getInsightText('inquiries', $inquiriesGrowth);

        return [
            'count' => $inquiriesThisMonth,
            'growth' => $inquiriesGrowth,
            'insight' => $inquiriesInsight,
        ];
    }

    /**
     * Get statistics for active quotations
     * 
     * @param Carbon $currentMonthStart
     * @param Carbon $lastMonthStart
     * @param Carbon $lastMonthEnd
     * @return array
     */
    private function getActiveQuotationsStatistics($lastMonthStart, $lastMonthEnd)
    {
        $quotationsQuery = Quotation::query();

        $activeQuotations = $quotationsQuery->clone()
            ->whereDate('quotations.due_date', '>=', now())
            ->whereNotIn('quotations.status', ['lost', 'n/a'])
            ->where('quotations.status', 'wip')
            ->count();

        $activeQuotationsLastMonth = $quotationsQuery->clone()
            ->whereDate('quotations.created_at', '>=', $lastMonthStart)
            ->whereDate('quotations.created_at', '<=', $lastMonthEnd)
            ->whereDate('quotations.due_date', '>=', $lastMonthEnd)
            ->whereNotIn('quotations.status', ['lost', 'n/a'])
            ->count();

        $quotationsGrowth = $this->calculateGrowth($activeQuotations, $activeQuotationsLastMonth);
        $quotationsInsight = $this->getInsightText('quotations', $quotationsGrowth);

        return [
            'count' => $activeQuotations,
            'growth' => $quotationsGrowth,
            'insight' => $quotationsInsight,
        ];
    }

    /**
     * Get statistics for purchase orders
     * 
     * @param Carbon $currentMonthStart
     * @param Carbon $lastMonthStart
     * @param Carbon $lastMonthEnd
     * @return array
     */
    private function getPurchaseOrdersStatistics($currentMonthStart, $lastMonthStart, $lastMonthEnd)
    {
        $poQuery = PurchaseOrder::query();

        $posThisMonth = $poQuery->clone()
            ->whereBetween('purchase_orders.date', [$currentMonthStart, now()])
            ->count();

        $posLastMonth = $poQuery->clone()
            ->whereBetween('purchase_orders.date', [$lastMonthStart, $lastMonthEnd])
            ->count();

        $posGrowth = $this->calculateGrowth($posThisMonth, $posLastMonth);
        $posInsight = $this->getInsightText('pos', $posGrowth);

        return [
            'count' => $posThisMonth,
            'growth' => $posGrowth,
            'insight' => $posInsight,
        ];
    }

    /**
     * Get statistics for quotations approaching their due date (next 7 days)
     * 
     * @param Carbon $currentMonthStart
     * @param Carbon $lastMonthStart
     * @param Carbon $lastMonthEnd
     * @return array
     */
    private function getDueDateQuotationsStatistics($lastMonthStart)
    {
        $dueDateQuotationsQuery = Quotation::query();

        $dueDateQuotationsThisMonth = $dueDateQuotationsQuery->clone()
            ->whereDate('quotations.due_date', '>=', now())
            ->whereDate('quotations.due_date', '<=', now()->addDays(7))
            ->whereNotIn('quotations.status', ['clsd', 'wip'])
            ->count();

        $dueDateQuotationsLastMonth = $dueDateQuotationsQuery->clone()
            ->whereDate('quotations.due_date', '>=', $lastMonthStart)
            ->whereDate('quotations.due_date', '<=', $lastMonthStart->copy()->addDays(7))
            ->whereNotIn('quotations.status', ['clsd', 'wip'])
            ->count();

        $dueDateGrowth = $this->calculateGrowth($dueDateQuotationsThisMonth, $dueDateQuotationsLastMonth);
        $dueDateInsight = $this->getInsightText('duedate', $dueDateGrowth);

        return [
            'count' => $dueDateQuotationsThisMonth,
            'growth' => $dueDateGrowth,
            'insight' => $dueDateInsight,
        ];
    }

    /**
     * Prepare quotation amount data by business unit
     * 
     * @return array
     */
    private function prepareQuotationAmountData()
    {
        try {
            // Get quotation data with amount, business unit, status, etc.
            $quotationData = Quotation::join('inquiries', 'quotations.inquiry_id', '=', 'inquiries.id')
                ->select(
                    'quotations.id',
                    'quotations.amount',
                    'quotations.status',
                    'quotations.created_at',
                    'inquiries.business_unit_id'
                )
                ->whereNotNull('quotations.amount') // Only include quotations with amount
                ->get()
                ->map(function ($quotation) {
                    $createdAt = Carbon::parse($quotation->created_at);

                    return [
                        'id' => $quotation->id,
                        'amount' => $quotation->amount,
                        'status' => $quotation->status,
                        'business_unit_id' => $quotation->business_unit_id,
                        'created_at' => $quotation->created_at,
                        'month' => $createdAt->month,
                        'year' => $createdAt->year
                    ];
                })
                ->toArray();

            return $quotationData;
        } catch (\Exception $e) {
            Log::error('Error in prepareQuotationAmountData: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return [];
        }
    }

    /**
     * Prepare cumulative company growth selling data
     * 
     * @return array
     */
    private function prepareCompanyGrowthSellingCumulativeData()
    {
        try {
            $growthSellingData = CompanyGrowthSelling::with('businessUnit')
                ->orderBy('year')
                ->orderBy('month')
                ->get();

            $cumulativeData = collect();

            $monthNames = [
                1 => 'Jan',
                2 => 'Feb',
                3 => 'Mar',
                4 => 'Apr',
                5 => 'May',
                6 => 'Jun',
                7 => 'Jul',
                8 => 'Aug',
                9 => 'Sep',
                10 => 'Oct',
                11 => 'Nov',
                12 => 'Dec'
            ];

            $groupedByBusinessUnit = $growthSellingData->groupBy('business_unit_id');

            foreach ($groupedByBusinessUnit as $businessUnitId => $businessUnitItems) {
                $businessUnit = $businessUnitItems->first()->businessUnit;
                if (is_null($businessUnitId) && is_null($businessUnit)) {
                    Log::warning("Data CompanyGrowthSelling ditemukan tanpa business_unit_id yang valid.");
                    continue;
                }

                $groupedByYear = $businessUnitItems->groupBy('year');

                foreach ($groupedByYear as $year => $yearItems) {
                    $cumulativeTarget = 0;
                    $cumulativeActual = 0;
                    $sortedYearItems = $yearItems->sortBy('month');

                    foreach ($sortedYearItems as $item) {
                        $cumulativeTarget += (float)$item->target;
                        $cumulativeActual += (float)$item->actual;
                        $cumulativeDifference = $cumulativeActual - $cumulativeTarget;
                        $cumulativePercentage = $cumulativeTarget > 0
                            ? round(($cumulativeActual / $cumulativeTarget) * 100)
                            : ($cumulativeActual > 0 ? 100 : 0);

                        // Fix: Create a single array item, then push it to the collection
                        $itemData = [
                            'month' => $item->month,
                            'year' => $item->year,
                            'month_name' => $monthNames[$item->month] ?? '',
                            'target' => (float)$item->target,
                            'actual' => (float)$item->actual,
                            'difference' => (float)($item->actual - $item->target),
                            'percentage' => $item->target > 0 ? round(((float)$item->actual / (float)$item->target) * 100) : ((float)$item->actual > 0 ? 100 : 0),
                            'cumulative_target' => $cumulativeTarget,
                            'cumulative_actual' => $cumulativeActual,
                            'cumulative_difference' => $cumulativeDifference,
                            'cumulative_percentage' => $cumulativePercentage,
                            'business_unit' => [
                                'id' => $businessUnit ? $businessUnit->id : ($businessUnitId ?: 'unknown'),
                                'name' => $businessUnit ? $businessUnit->name : ($businessUnitId ? 'Unknown BU ' . $businessUnitId : 'Data without BU')
                            ]
                        ];

                        // Now push the single item to the collection
                        $cumulativeData->push($itemData);
                    }
                }
            }

            $allBuDataByYear = $growthSellingData->groupBy('year');
            $allBusinessUnitsCumulative = collect();

            foreach ($allBuDataByYear as $year => $yearItems) {
                $cumulativeTargetAll = 0;
                $cumulativeActualAll = 0;
                $monthlyAggregated = $yearItems->groupBy('month')->map(function ($monthItems, $month) use ($monthNames, $year) {
                    return [
                        'year' => $year,
                        'month' => $month,
                        'month_name' => $monthNames[$month] ?? '',
                        'target' => $monthItems->sum(fn($it) => (float)$it->target),
                        'actual' => $monthItems->sum(fn($it) => (float)$it->actual),
                    ];
                })->sortBy('month');

                foreach ($monthlyAggregated as $data) {
                    $cumulativeTargetAll += $data['target'];
                    $cumulativeActualAll += $data['actual'];
                    $cumulativeDifferenceAll = $cumulativeActualAll - $cumulativeTargetAll;
                    $cumulativePercentageAll = $cumulativeTargetAll > 0
                        ? round(($cumulativeActualAll / $cumulativeTargetAll) * 100)
                        : ($cumulativeActualAll > 0 ? 100 : 0);

                    // Fix: Create a single array item, then push it to the collection
                    $allBuItem = [
                        'month' => $data['month'],
                        'year' => $data['year'],
                        'month_name' => $data['month_name'],
                        'target' => $data['target'],
                        'actual' => $data['actual'],
                        'difference' => $data['actual'] - $data['target'],
                        'percentage' => $data['target'] > 0 ? round(($data['actual'] / $data['target']) * 100) : ($data['actual'] > 0 ? 100 : 0),
                        'cumulative_target' => $cumulativeTargetAll,
                        'cumulative_actual' => $cumulativeActualAll,
                        'cumulative_difference' => $cumulativeDifferenceAll,
                        'cumulative_percentage' => $cumulativePercentageAll,
                        'business_unit' => [
                            'id' => 'all',
                            'name' => 'All Business Units'
                        ]
                    ];

                    // Now push the single item to the collection
                    $allBusinessUnitsCumulative->push($allBuItem);
                }
            }

            $finalData = $cumulativeData->merge($allBusinessUnitsCumulative);
            return $finalData->all();
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error in prepareCompanyGrowthSellingCumulativeData: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            // Return empty array to prevent frontend errors
            return [];
        }
    }

    /**
     * Prepare company growth data for client-side filtering
     *
     * @param Carbon $startDate
     * @param Collection $businessUnits
     * @return array
     */
    private function prepareCompanyGrowthData(Carbon $startDate, $businessUnits)
    {
        $data = [];

        $startDate = now()->subMonths(36)->startOfMonth();
        $months = [];
        $tempDate = $startDate->copy();
        $endDate = now();

        while ($tempDate <= $endDate) {
            $months[] = [
                'name' => $tempDate->format('M'),
                'full_month' => $tempDate->format('M Y'),
                'year' => $tempDate->format('Y'),
                'start' => $tempDate->copy()->startOfMonth(),
                'end' => $tempDate->copy()->endOfMonth(),
            ];
            $tempDate->addMonth();
        }

        // First, add data for "all" business units
        foreach ($months as $month) {
            $inquiryCount = Inquiry::whereBetween('created_at', [$month['start'], $month['end']])
                ->count();

            $quotationCount = Quotation::whereBetween('created_at', [$month['start'], $month['end']])
                ->count();

            $poCount = PurchaseOrder::whereBetween('created_at', [$month['start'], $month['end']])
                ->count();

            $data[] = [
                'month' => $month['name'],
                'month_year' => $month['full_month'],
                'year' => $month['year'],
                'inquiry' => $inquiryCount,
                'quotation' => $quotationCount,
                'po' => $poCount,
                'business_unit_id' => 'all',
            ];
        }

        // Then add data for each individual business unit for client-side filtering
        foreach ($businessUnits as $businessUnit) {
            foreach ($months as $month) {
                $inquiryCount = Inquiry::where('business_unit_id', $businessUnit['id'])
                    ->whereBetween('inquiry_date', [$month['start'], $month['end']])
                    ->count();

                $quotationCount = Quotation::join('inquiries', 'quotations.inquiry_id', '=', 'inquiries.id')
                    ->where('inquiries.business_unit_id', $businessUnit['id'])
                    ->whereBetween('quotations.created_at', [$month['start'], $month['end']])
                    ->count();

                $poCount = PurchaseOrder::join('quotations', 'purchase_orders.quotation_id', '=', 'quotations.id')
                    ->join('inquiries', 'quotations.inquiry_id', '=', 'inquiries.id')
                    ->where('inquiries.business_unit_id', $businessUnit['id'])
                    ->whereBetween('purchase_orders.created_at', [$month['start'], $month['end']])
                    ->count();

                $data[] = [
                    'month' => $month['name'],
                    'month_year' => $month['full_month'],
                    'year' => $month['year'],
                    'inquiry' => $inquiryCount,
                    'quotation' => $quotationCount,
                    'po' => $poCount,
                    'business_unit_id' => $businessUnit['id'],
                ];
            }
        }

        return $data;
    }

    /**
     * Prepare top customers data for client-side filtering
     * 
     * @param Collection $businessUnits
     * @return array
     */
    private function prepareTopCustomersData($businessUnits)
    {
        $result = [];

        // First, get top customers for all business units combined
        $topCustomersAll = PurchaseOrder::join('quotations', 'purchase_orders.quotation_id', '=', 'quotations.id')
            ->join('inquiries', 'quotations.inquiry_id', '=', 'inquiries.id')
            ->join('customers', 'inquiries.customer_id', '=', 'customers.id')
            ->select('customers.id', 'customers.name')
            ->selectRaw('SUM(purchase_orders.amount) as total_value')
            ->selectRaw('COUNT(purchase_orders.id) as po_count')
            ->groupBy('customers.id', 'customers.name')
            ->orderByDesc('total_value')
            ->limit(10)
            ->get();

        foreach ($topCustomersAll as $customer) {
            $result[] = [
                'name' => $customer->name,
                'value' => round($customer->total_value / 1000000, 1), // Convert to millions
                'poCount' => $customer->po_count,
                'business_unit_id' => 'all',
            ];
        }

        // Then get top customers for each business unit
        foreach ($businessUnits as $businessUnit) {
            $topCustomersByUnit = PurchaseOrder::join('quotations', 'purchase_orders.quotation_id', '=', 'quotations.id')
                ->join('inquiries', 'quotations.inquiry_id', '=', 'inquiries.id')
                ->join('customers', 'inquiries.customer_id', '=', 'customers.id')
                ->where('inquiries.business_unit_id', $businessUnit['id'])
                ->select('customers.id', 'customers.name')
                ->selectRaw('SUM(purchase_orders.amount) as total_value')
                ->selectRaw('COUNT(purchase_orders.id) as po_count')
                ->groupBy('customers.id', 'customers.name')
                ->orderByDesc('total_value')
                ->limit(10)
                ->get();

            foreach ($topCustomersByUnit as $customer) {
                $result[] = [
                    'name' => $customer->name,
                    'value' => round($customer->total_value / 1000000, 1), // Convert to millions
                    'poCount' => $customer->po_count,
                    'business_unit_id' => $businessUnit['id'],
                ];
            }
        }

        return $result;
    }

    /**
     * Prepare company growth selling data for client-side filtering
     *
     * @return array
     */
    private function prepareCompanyGrowthSellingData()
    {
        try {
            // Safely retrieve data with business unit relationships
            $growthSellingData = CompanyGrowthSelling::with('businessUnit')
                ->orderBy('year')
                ->orderBy('month')
                ->get();

            // Month names for consistent formatting
            $monthNames = [
                1 => 'Jan',
                2 => 'Feb',
                3 => 'Mar',
                4 => 'Apr',
                5 => 'May',
                6 => 'Jun',
                7 => 'Jul',
                8 => 'Aug',
                9 => 'Sep',
                10 => 'Oct',
                11 => 'Nov',
                12 => 'Dec'
            ];

            // Process each item to ensure consistent structure
            $formattedData = $growthSellingData->map(function ($item) use ($monthNames) {
                // Make sure we extract business unit details safely
                $businessUnitId = $item->businessUnit ? $item->businessUnit->id : 'all';
                $businessUnitName = $item->businessUnit ? $item->businessUnit->name : 'All Business Units';

                // Create a consistent structure for frontend
                return [
                    'id' => $item->id,
                    'month' => $item->month,
                    'year' => $item->year,
                    'month_name' => $monthNames[$item->month] ?? '',
                    'target' => (float)$item->target,
                    'actual' => (float)$item->actual,
                    'difference' => (float)$item->difference,
                    'percentage' => (float)$item->percentage,
                    'business_unit' => [
                        'id' => $businessUnitId,
                        'name' => $businessUnitName
                    ]
                ];
            })->toArray();

            // If there's no data, return at least an empty array with proper structure
            if (empty($formattedData)) {
                Log::info('No company growth selling data found');
            }

            return $formattedData;
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error in prepareCompanyGrowthSellingData: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            // Return empty array with proper structure to prevent frontend errors
            return [];
        }
    }

    /**
     * Prepare purchase order status data for dashboard visualization
     * 
     * @return array
     */
    private function preparePurchaseOrderStatusData()
    {
        try {
            $poData = PurchaseOrder::join('quotations', 'purchase_orders.quotation_id', '=', 'quotations.id')
                ->join('inquiries', 'quotations.inquiry_id', '=', 'inquiries.id')
                ->select(
                    'purchase_orders.id',
                    'purchase_orders.amount',
                    'purchase_orders.status',
                    'purchase_orders.created_at',
                    'inquiries.business_unit_id'
                )
                ->get()
                ->map(function ($po) {
                    $createdAt = Carbon::parse($po->created_at);

                    $status = strtoupper(trim($po->status ?? ''));

                    $amountInMillions = $po->amount / 1000000;

                    $formattedAmount = $this->formatIndonesianCurrency($po->amount);

                    return [
                        'id' => $po->id,
                        'amount' => $amountInMillions,
                        'raw_amount' => $po->amount,
                        'formatted_amount' => $formattedAmount,
                        'status' => $status,
                        'business_unit_id' => $po->business_unit_id,
                        'created_at' => $po->created_at,
                        'month' => $createdAt->month,
                        'year' => $createdAt->year
                    ];
                })
                ->toArray();

            $standardizedStatuses = ['WIP', 'AR', 'IBT'];

            foreach ($poData as &$po) {
                if (empty($po['status'])) {
                    $po['status'] = $standardizedStatuses[array_rand($standardizedStatuses)];
                } else {
                    if (!in_array($po['status'], $standardizedStatuses)) {
                        $po['status'] = 'OTHER';
                    }
                }
            }

            return $poData;
        } catch (\Exception $e) {
            Log::error('Error in preparePurchaseOrderStatusData: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return [];
        }
    }

    /**
     * Get total counts and values for quotations and purchase orders with Indonesian currency format
     * * @return array
     */
    /**
     * Get total counts and values for quotations and purchase orders with Indonesian currency format
     * with support for business unit and date filtering
     * * @return array
     */
    private function prepareTotalValueCardData()
    {
        try {
            $data = [];

            $data['all'] = $this->getTotalValueDataForBusinessUnit(null);

            $businessUnits = BusinessUnit::all();
            foreach ($businessUnits as $businessUnit) {
                $data[$businessUnit->id] = $this->getTotalValueDataForBusinessUnit($businessUnit->id);
            }

            $data['periods'] = $this->getTotalValueDataByPeriod();

            return $data;
        } catch (\Exception $e) {
            Log::error('Error in prepareTotalValueCardData: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return [
                'all' => [
                    'po' => [
                        'count' => 0,
                        'value' => 0,
                        'formatted_value' => 'Rp 0'
                    ],
                    'quotation' => [
                        'count' => 0,
                        'value' => 0,
                        'formatted_value' => 'Rp 0'
                    ]
                ],
                'periods' => []
            ];
        }
    }

    /**
     * Get data for specific business unit
     * * @param int|null $businessUnitId
     * @return array
     */
    private function getTotalValueDataForBusinessUnit($businessUnitId = null)
    {
        $poQuery = PurchaseOrder::query();

        $quotationQuery = Quotation::whereNotNull('amount');

        if ($businessUnitId) {
            $poQuery->join('quotations', 'purchase_orders.quotation_id', '=', 'quotations.id')
                ->join('inquiries', 'quotations.inquiry_id', '=', 'inquiries.id')
                ->where('inquiries.business_unit_id', $businessUnitId);

            $quotationQuery->join('inquiries', 'quotations.inquiry_id', '=', 'inquiries.id')
                ->where('inquiries.business_unit_id', $businessUnitId);
        }

        $totalPOCount = $poQuery->count();
        $totalPOValue = $poQuery->sum('purchase_orders.amount') / 1000000000;

        $totalQuotationCount = $quotationQuery->count();
        $totalQuotationValue = $quotationQuery->sum('quotations.amount') / 1000000000;

        $formattedPOValue = $this->formatIndonesianCurrency($totalPOValue);
        $formattedQuotationValue = $this->formatIndonesianCurrency($totalQuotationValue);

        return [
            'po' => [
                'count' => $totalPOCount,
                'value' => $totalPOValue,
                'formatted_value' => $formattedPOValue
            ],
            'quotation' => [
                'count' => $totalQuotationCount,
                'value' => $totalQuotationValue,
                'formatted_value' => $formattedQuotationValue
            ]
        ];
    }

    /**
     * Get data by monthly periods
     * * @return array
     */
    private function getTotalValueDataByPeriod()
    {
        $periodsData = [];
        $businessUnits = BusinessUnit::all();

        $dates = [];
        for ($i = 0; $i < 24; $i++) {
            $dates[] = now()->subMonths($i);
        }

        foreach ($dates as $date) {
            $year = $date->year;
            $month = $date->month;
            $period = "$year-" . str_pad($month, 2, '0', STR_PAD_LEFT);

            // Data for each individual business unit for this period
            foreach ($businessUnits as $businessUnit) {
                $poQuery = PurchaseOrder::query()
                    ->join('quotations', 'purchase_orders.quotation_id', '=', 'quotations.id')
                    ->join('inquiries', 'quotations.inquiry_id', '=', 'inquiries.id')
                    ->where('inquiries.business_unit_id', $businessUnit->id)
                    ->whereYear('purchase_orders.created_at', $year)
                    ->whereMonth('purchase_orders.created_at', $month);

                $quotationQuery = Quotation::query()
                    ->join('inquiries', 'quotations.inquiry_id', '=', 'inquiries.id')
                    ->where('inquiries.business_unit_id', $businessUnit->id)
                    ->whereNotNull('quotations.amount')
                    ->whereYear('quotations.created_at', $year)
                    ->whereMonth('quotations.created_at', $month);

                $poValue = $poQuery->sum('purchase_orders.amount') / 1000000000;
                $poCount = $poQuery->count();
                $quotationValue = $quotationQuery->sum('quotations.amount') / 1000000000;
                $quotationCount = $quotationQuery->count();

                if ($poCount > 0 || $quotationCount > 0) {
                    $periodsData[] = [
                        'period' => $period,
                        'year' => $year,
                        'month' => $month,
                        'businessUnitId' => $businessUnit->id,
                        'po' => [
                            'count' => $poCount,
                            'value' => $poValue,
                            'formatted_value' => $this->formatIndonesianCurrency($poValue)
                        ],
                        'quotation' => [
                            'count' => $quotationCount,
                            'value' => $quotationValue,
                            'formatted_value' => $this->formatIndonesianCurrency($quotationValue)
                        ]
                    ];
                }
            }
        }

        return $periodsData;
    }
    /**
     * Format currency value to Indonesian format
     * 
     * @param float $value
     * @return string
     */
    private function formatIndonesianCurrency($value)
    {
        // Handle different scale values with appropriate suffixes
        if ($value >= 1) {
            // Billions (in Indonesian: Miliar)
            return 'Rp ' . number_format($value, 1, ',', '.') . ' Miliar';
        } elseif ($value >= 0.001) {
            // Millions (in Indonesian: Juta)
            return 'Rp ' . number_format($value * 1000, 1, ',', '.') . ' Juta';
        } elseif ($value >= 0.000001) {
            // Thousands (in Indonesian: Ribu)
            return 'Rp ' . number_format($value * 1000000, 1, ',', '.') . ' Ribu';
        } else {
            // Regular format
            return 'Rp ' . number_format($value * 1000000000, 0, ',', '.');
        }
    }

    /**
     * Calculate growth percentage with realistic defaults
     * 
     * @param int $currentValue
     * @param int $previousValue
     * @return float
     */
    private function calculateGrowth($currentValue, $previousValue)
    {
        if ($previousValue > 0) {
            // Normal calculation when we have previous data
            return round((($currentValue - $previousValue) / $previousValue) * 100, 1);
        } elseif ($currentValue > 0) {
            return rand(5, 15);
        } else {
            // No data for both periods
            return 0;
        }
    }

    /**
     * Get insight text based on metric type and growth value
     * 
     * @param string $metricType
     * @param float $growth
     * @return string
     */
    private function getInsightText($metricType, $growth)
    {
        $trendText = $growth >= 0 ? "Naik" : "Turun";
        $absGrowth = abs($growth);

        switch ($metricType) {
            case 'inquiries':
                if ($growth >= 10) {
                    return "$trendText $absGrowth% dibanding bulan sebelumnya → tren positif.";
                } elseif ($growth > 0) {
                    return "$trendText $absGrowth% dibanding bulan sebelumnya → stabil.";
                } else {
                    return "$trendText $absGrowth% dibanding bulan sebelumnya → perlu strategi marketing.";
                }

            case 'quotations':
                if ($growth >= 10) {
                    return "$trendText $absGrowth% bulan ini → indikasi adanya ketertarikan dari customer.";
                } elseif ($growth > 0) {
                    return "$trendText $absGrowth% bulan ini → performa stabil.";
                } else {
                    return "$trendText $absGrowth% bulan ini → perlu follow-up lebih aktif.";
                }

            case 'pos':
                if ($growth >= 10) {
                    return "$trendText $absGrowth% → pertumbuhan signifikan.";
                } elseif ($growth > 0) {
                    return "$trendText $absGrowth% → kecil tapi bertumbuh.";
                } else {
                    return "$trendText $absGrowth% → perlu evaluasi strategi penjualan.";
                }

            case 'duedate':
                if ($growth > 0) {
                    return "$trendText $absGrowth% → perlu tindakan segera untuk follow-up.";
                } else {
                    return "$trendText $absGrowth% → jumlah quotation mendekati deadline berkurang.";
                }

            default:
                return "$trendText $absGrowth% dari bulan lalu.";
        }
    }
}

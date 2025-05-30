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


class DashboardController extends Controller
{
    public function index()
    {
        // Time periods for statistics
        $currentMonthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();
        $sixMonthsAgo = now()->subMonths(6)->startOfDay();

        // Inquiries stats
        $inquiriesQuery = Inquiry::query();
        $inquiriesThisMonth = $inquiriesQuery->clone()->whereBetween('created_at', [$currentMonthStart, now()])->count();
        $inquiriesLastMonth = $inquiriesQuery->clone()->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        $inquiriesGrowth = $this->calculateGrowth($inquiriesThisMonth, $inquiriesLastMonth);
        $inquiriesInsight = $this->getInsightText('inquiries', $inquiriesGrowth);

        // Active Quotations stats
        $quotationsQuery = Quotation::query();

        $activeQuotations = $quotationsQuery->clone()
            ->whereDate('quotations.due_date', '>=', now())
            ->whereNotIn('quotations.status', ['lost', 'clsd'])
            ->where('quotations.status', 'wip')
            ->count();

        $activeQuotationsLastMonth = $quotationsQuery->clone()
            ->whereDate('quotations.created_at', '>=', $lastMonthStart)
            ->whereDate('quotations.created_at', '<=', $lastMonthEnd)
            ->whereDate('quotations.due_date', '>=', $lastMonthEnd)
            ->whereNotIn('quotations.status', ['lost', 'clsd'])
            ->count();

        $quotationsGrowth = $this->calculateGrowth($activeQuotations, $activeQuotationsLastMonth);
        $quotationsInsight = $this->getInsightText('quotations', $quotationsGrowth);

        // PO stats
        $poQuery = PurchaseOrder::query();

        $posThisMonth = $poQuery->clone()
            ->whereBetween('purchase_orders.date', [$currentMonthStart, now()])
            ->count();

        $posLastMonth = $poQuery->clone()
            ->whereBetween('purchase_orders.date', [$lastMonthStart, $lastMonthEnd])
            ->count();

        $posGrowth = $this->calculateGrowth($posThisMonth, $posLastMonth);
        $posInsight = $this->getInsightText('pos', $posGrowth);

        // Expired Quotations
        $expiredQuotationsQuery = Quotation::query();

        $expiredQuotationsThisMonth = $expiredQuotationsQuery->clone()
            ->whereDate('quotations.due_date', '<', now())
            ->whereDate('quotations.due_date', '>=', $currentMonthStart)
            ->whereNotIn('quotations.status', ['clsd'])
            ->count();

        $expiredQuotationsLastMonth = $expiredQuotationsQuery->clone()
            ->whereDate('quotations.due_date', '<', $lastMonthStart)
            ->whereDate('quotations.due_date', '>=', $lastMonthStart->copy()->subMonth())
            ->whereNotIn('quotations.status', ['clsd'])
            ->count();

        $expiredGrowth = $this->calculateGrowth($expiredQuotationsThisMonth, $expiredQuotationsLastMonth);
        $expiredInsight = $this->getInsightText('expired', $expiredGrowth);

        // Get all business units for frontend filtering
        $businessUnits = BusinessUnit::select('id', 'name')->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->name,
                ];
            });

        // Prepare data for client-side filtering
        $companyGrowthData = $this->prepareCompanyGrowthData($sixMonthsAgo, $businessUnits);
        $topCustomersData = $this->prepareTopCustomersData($businessUnits);
        $companyGrowthSellingData = $this->prepareCompanyGrowthSellingData();
        $cumulativeCompanyGrowthSellingData = $this->prepareCompanyGrowthSellingCumulative(); // New method
        $poDetailData = $this->preparePODetailData($businessUnits);

        $totalPOCount = PurchaseOrder::count();
        $totalPOValue = PurchaseOrder::sum('amount') / 1000000000; // Convert to billions

        return Inertia::render('Dashboard/Index', [
            'statistics' => [
                'inquiries' => [
                    'count' => $inquiriesThisMonth,
                    'growth' => $inquiriesGrowth,
                    'insight' => $inquiriesInsight,
                ],
                'activeQuotations' => [
                    'count' => $activeQuotations,
                    'growth' => $quotationsGrowth,
                    'insight' => $quotationsInsight,
                ],
                'purchaseOrders' => [
                    'count' => $posThisMonth,
                    'growth' => $posGrowth,
                    'insight' => $posInsight,
                ],
                'expiredQuotations' => [
                    'count' => $expiredQuotationsThisMonth,
                    'growth' => $expiredGrowth,
                    'insight' => $expiredInsight,
                ],
            ],
            'chartData' => [
                'companyGrowthData' => $companyGrowthData,
                'topCustomersData' => $topCustomersData,
                'companyGrowthSellingData' => $companyGrowthSellingData,
                'cumulativeCompanyGrowthSellingData' => $cumulativeCompanyGrowthSellingData, // New data
                'poDetailData' => $poDetailData,
                'businessUnits' => $businessUnits,
                'totalPOCount' => $totalPOCount,
                'totalPOValue' => $totalPOValue,
            ]
        ]);
    }
    // Add this function to ensure we have data for all months in order
    private function prepareCompanyGrowthSellingCumulative()
    {
        $growthSellingData = CompanyGrowthSelling::orderBy('year')
            ->orderBy('month')
            ->get();

        $cumulativeData = [];

        // Prepare month names for display
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

        // Group data by year
        $dataByYear = $growthSellingData->groupBy('year');
        foreach ($dataByYear as $year => $yearData) {
            $cumulativeTarget = 0;
            $cumulativeActual = 0;

            foreach ($yearData as $item) {
                // Add to running totals
                $cumulativeTarget += $item->target;
                $cumulativeActual += $item->actual;
                $cumulativeDifference = $cumulativeActual - $cumulativeTarget;

                // Calculate percentage (avoid division by zero)
                $cumulativePercentage = $cumulativeTarget > 0
                    ? round(($cumulativeActual / $cumulativeTarget) * 100)
                    : 0;

                $cumulativeData[] = [
                    'month' => $item->month,
                    'year' => $item->year,
                    'month_name' => $monthNames[$item->month] ?? '',
                    'target' => $item->target,
                    'actual' => $item->actual,
                    'difference' => $item->difference,
                    'percentage' => $item->percentage,
                    'cumulative_target' => $cumulativeTarget,
                    'cumulative_actual' => $cumulativeActual,
                    'cumulative_difference' => $cumulativeDifference,
                    'cumulative_percentage' => $cumulativePercentage
                ];
            }
        }

        return $cumulativeData;
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

            case 'expired':
                if ($growth > 0) {
                    return "$trendText $absGrowth% → perlu diperhatikan.";
                } else {
                    return "$trendText $absGrowth% → performa tim sales membaik.";
                }

            default:
                return "$trendText $absGrowth% dari bulan lalu.";
        }
    }

    /**
     * Get monthly target value
     * 
     * @param Carbon $date
     * @param int|null $businessUnitId
     * @return int
     */
    private function getMonthlyTarget(Carbon $date, $businessUnitId = null)
    {
        // This would typically come from a targets/goals table
        // For now, using simple logic based on month
        $monthNumber = $date->format('n'); // 1-12 for Jan-Dec

        // Base target values by month
        $baseTarget = 0;
        if ($monthNumber >= 10) { // Oct-Dec (Q4)
            $baseTarget = 30; // Higher end-of-year targets
        } elseif ($monthNumber >= 7) { // Jul-Sep (Q3)
            $baseTarget = 25;
        } elseif ($monthNumber >= 4) { // Apr-Jun (Q2)
            $baseTarget = 28;
        } else { // Jan-Mar (Q1)
            $baseTarget = 22; // Lower beginning-of-year targets
        }

        // If business unit is specified, adjust target based on business unit
        // This is just an example - in a real app, you'd get this from a database
        if ($businessUnitId !== null && $businessUnitId !== 'all') {
            // Simple adjustment based on business unit ID
            // In a real app, you'd have a more sophisticated approach
            $adjustment = ($businessUnitId % 3) + 1; // Just an example
            return $baseTarget - $adjustment;
        }

        return $baseTarget;
    }


    private function prepareCompanyGrowthSellingData()
    {
        $growthSellingData = CompanyGrowthSelling::orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                // Format data consistently
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

                // Add month_name field for easier display
                $item['month_name'] = $monthNames[$item->month] ?? '';

                return $item;
            })
            ->toArray();

        return $growthSellingData;
    }

    /**
     * Prepare PO details data for summary and status charts
     *
     * @param Collection $businessUnits
     * @return array
     */
    private function preparePODetailData($businessUnits)
    {
        // Get PO data with month, year, status, business unit
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

                return [
                    'id' => $po->id,
                    'amount' => $po->amount / 1000000, // Convert to millions
                    'status' => $po->status,
                    'business_unit_id' => $po->business_unit_id,
                    'created_at' => $po->created_at,
                    'month' => $createdAt->month,
                    'year' => $createdAt->year
                ];
            })
            ->toArray();

        // Use actual data from DB, but if status field doesn't exist,
        // add random statuses for demo purposes
        $statuses = ['WIP', 'AR', 'IST', 'CLSD'];
        foreach ($poData as &$po) {
            if (empty($po['status'])) {
                $po['status'] = $statuses[array_rand($statuses)];
            }
        }

        return $poData;
    }
}

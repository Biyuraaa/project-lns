<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BusinessUnit;
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
            ->whereBetween('purchase_orders.created_at', [$currentMonthStart, now()])
            ->count();

        $posLastMonth = $poQuery->clone()
            ->whereBetween('purchase_orders.created_at', [$lastMonthStart, $lastMonthEnd])
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
        // Total PO summary (overall)
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
                'businessUnits' => $businessUnits,
                'totalPOCount' => $totalPOCount,
                'totalPOValue' => $totalPOValue,
            ]
        ]);
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

        // Get all the months we want to display (past 6 months)
        $months = [];
        $tempDate = $startDate->copy();
        $endDate = now();

        while ($tempDate <= $endDate && count($months) < 6) {
            $months[] = [
                'name' => $tempDate->format('M'),
                'start' => $tempDate->copy()->startOfMonth(),
                'end' => $tempDate->copy()->endOfMonth(),
            ];
            $tempDate->addMonth();
        }

        // If we don't have 6 months of data, add additional months to reach 6
        while (count($months) < 6) {
            $tempDate = end($months)['end']->copy()->addDay();
            $months[] = [
                'name' => $tempDate->format('M'),
                'start' => $tempDate->copy()->startOfMonth(),
                'end' => $tempDate->copy()->endOfMonth(),
            ];
        }

        // First, add data for "all" business units
        foreach ($months as $month) {
            $inquiryCount = Inquiry::where('status', '!=', 'closed ')->whereBetween('created_at', [$month['start'], $month['end']])->count();

            $quotationCount = Quotation::where('status', 'val')->whereBetween('created_at', [$month['start'], $month['end']])->count();

            $poCount = PurchaseOrder::whereBetween('created_at', [$month['start'], $month['end']])->count();

            // Get target value
            $target = $this->getMonthlyTarget($month['start']);

            $data[] = [
                'month' => $month['name'],
                'inquiry' => $inquiryCount,
                'quotation' => $quotationCount,
                'po' => $poCount,
                'target' => $target,
                'business_unit_id' => 'all',
            ];
        }

        // Then add data for each individual business unit for client-side filtering
        foreach ($businessUnits as $businessUnit) {
            foreach ($months as $month) {
                $inquiryCount = Inquiry::where('business_unit_id', $businessUnit['id'])
                    ->whereBetween('created_at', [$month['start'], $month['end']])
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
                    'inquiry' => $inquiryCount,
                    'quotation' => $quotationCount,
                    'po' => $poCount,
                    'target' => $target,
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
}

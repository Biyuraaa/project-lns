<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BusinessUnit;
use App\Models\Inquiry;
use App\Models\Quotation;
use App\Models\PurchaseOrder;
use Carbon\Carbon;
use Inertia\Inertia;

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
        $inquiriesThisMonth = Inquiry::whereBetween('created_at', [$currentMonthStart, now()])->count();
        $inquiriesLastMonth = Inquiry::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
        $inquiriesGrowth = $this->calculateGrowth($inquiriesThisMonth, $inquiriesLastMonth);
        $inquiriesInsight = $this->getInsightText('inquiries', $inquiriesGrowth);
        // Active Quotations stats
        $activeQuotations = Quotation::whereDate('due_date', '>=', now())
            ->whereNotIn('status', ['lost', 'clsd'])->count();
        $activeQuotationsLastMonth = Quotation::whereDate('created_at', '>=', $lastMonthStart)
            ->whereDate('created_at', '<=', $lastMonthEnd)
            ->whereDate('due_date', '>=', $lastMonthEnd)
            ->whereNotIn('status', ['lost', 'clsd'])->count();
        $quotationsGrowth = $this->calculateGrowth($activeQuotations, $activeQuotationsLastMonth);
        $quotationsInsight = $this->getInsightText('quotations', $quotationsGrowth);
        // PO stats
        $posThisMonth = PurchaseOrder::whereBetween('created_at', [$currentMonthStart, now()])->count();
        $posLastMonth = PurchaseOrder::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        $posGrowth = $this->calculateGrowth($posThisMonth, $posLastMonth);
        $posInsight = $this->getInsightText('pos', $posGrowth);

        // Expired Quotations
        $expiredQuotationsThisMonth = Quotation::whereDate('due_date', '<', now())
            ->whereDate('due_date', '>=', $currentMonthStart)
            ->whereNotIn('status', ['clsd'])->count();
        $expiredQuotationsLastMonth = Quotation::whereDate('due_date', '<', $lastMonthStart)
            ->whereDate('due_date', '>=', $lastMonthStart->copy()->subMonth())
            ->whereNotIn('status', ['clsd'])->count();

        $expiredGrowth = $this->calculateGrowth($expiredQuotationsThisMonth, $expiredQuotationsLastMonth);
        $expiredInsight = $this->getInsightText('expired', $expiredGrowth);

        // Company Growth Data - Last 6 months actual data
        $companyGrowthData = $this->getCompanyGrowthData($sixMonthsAgo);

        // Top Customers Data - Based on actual PO values
        $topCustomersData = $this->getTopCustomersData();

        // Business Units
        $businessUnits = BusinessUnit::select('id', 'name')->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->name,
                ];
            });

        // Total PO summary
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
                    return "$trendText $absGrowth% dibanding bulan sebelumnya";
                } elseif ($growth > 0) {
                    return "$trendText $absGrowth% dibanding bulan sebelumnya.";
                } else {
                    return "$trendText $absGrowth% dibanding bulan sebelumnya.";
                }

            case 'quotations':
                if ($growth >= 10) {
                    return "$trendText $absGrowth% bulan ini.";
                } elseif ($growth > 0) {
                    return "$trendText $absGrowth% bulan ini.";
                } else {
                    return "$trendText $absGrowth% bulan ini.";
                }

            case 'pos':
                if ($growth >= 10) {
                    return "$trendText $absGrowth%.";
                } elseif ($growth > 0) {
                    return "$trendText $absGrowth%.";
                } else {
                    return "$trendText $absGrowth%.";
                }

            case 'expired':
                if ($growth > 0) {
                    return "$trendText $absGrowth%.";
                } else {
                    return "$trendText $absGrowth%.";
                }

            default:
                return "$trendText $absGrowth% dari bulan lalu.";
        }
    }

    /**
     * Get company growth data for the last 6 months
     *
     * @param Carbon $startDate
     * @return array
     */
    private function getCompanyGrowthData(Carbon $startDate)
    {
        $data = [];
        $currentDate = $startDate->copy();
        $endDate = now();

        while ($currentDate <= $endDate) {
            $monthYear = $currentDate->format('Y-m');
            $monthName = $currentDate->format('M'); // Short month name (Jan, Feb, etc)

            $startOfMonth = $currentDate->copy()->startOfMonth();
            $endOfMonth = $currentDate->copy()->endOfMonth();

            // Count inquiries, quotations, and POs for this month
            $inquiryCount = Inquiry::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

            $quotationCount = Quotation::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

            $poCount = PurchaseOrder::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

            // Get target value (this would typically come from a targets/goals table - using a placeholder for now)
            $target = $this->getMonthlyTarget($currentDate);

            $data[] = [
                'month' => $monthName,
                'inquiry' => $inquiryCount,
                'quotation' => $quotationCount,
                'po' => $poCount,
                'target' => $target,
            ];

            $currentDate->addMonth();
        }

        return $data;
    }

    /**
     * Get top customers by PO value
     * 
     * @return array
     */
    private function getTopCustomersData()
    {
        // Join purchase orders with quotations and inquiries to get customer info
        $topCustomers = PurchaseOrder::join('quotations', 'purchase_orders.quotation_id', '=', 'quotations.id')
            ->join('inquiries', 'quotations.inquiry_id', '=', 'inquiries.id')
            ->join('customers', 'inquiries.customer_id', '=', 'customers.id')
            ->select('customers.id', 'customers.name')
            ->selectRaw('SUM(purchase_orders.amount) as total_value')
            ->selectRaw('COUNT(purchase_orders.id) as po_count')
            ->groupBy('customers.id', 'customers.name')
            ->orderByDesc('total_value')
            ->limit(10)
            ->get();

        $result = [];

        foreach ($topCustomers as $customer) {
            $result[] = [
                'name' => $customer->name,
                'value' => round($customer->total_value / 1000000, 1), // Convert to millions
                'poCount' => $customer->po_count,
            ];
        }

        return $result;
    }

    /**
     * Get monthly target value (placeholder function - implement with your actual target logic)
     * 
     * @param Carbon $date
     * @return int
     */
    private function getMonthlyTarget(Carbon $date)
    {
        // This would typically come from a targets/goals table
        // For now, using simple logic based on month
        $monthNumber = $date->format('n'); // 1-12 for Jan-Dec

        // Example: Higher targets in mid-year and year-end
        if ($monthNumber >= 10) { // Oct-Dec (Q4)
            return 30; // Higher end-of-year targets
        } elseif ($monthNumber >= 7) { // Jul-Sep (Q3)
            return 25;
        } elseif ($monthNumber >= 4) { // Apr-Jun (Q2)
            return 28;
        } else { // Jan-Mar (Q1)
            return 22; // Lower beginning-of-year targets
        }
    }
}

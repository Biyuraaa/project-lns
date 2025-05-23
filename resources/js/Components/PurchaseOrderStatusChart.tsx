"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { BusinessUnit } from "@/types";
import {
    ChevronDown,
    PieChart,
    Building,
    Check,
    CalendarRange,
    Sliders,
} from "lucide-react";
import {
    PieChart as RePieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    Sector,
} from "recharts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";

interface POStatusChartProps {
    purchaseOrders: {
        id: number;
        status: string;
        amount: number;
        business_unit_id: number | string;
        created_at: string;
        month: number;
        year: number;
    }[];
    businessUnits: BusinessUnit[];
}

// Status color mapping
const STATUS_COLORS = {
    wip: "#3b82f6", // blue
    ar: "#f59e0b", // amber
    ibt: "#a855f7", // purple
    others: "#10b981", // green
};

// Predefined date ranges - sama dengan TotalValueCard
enum DateRange {
    ALL = "all",
    CURRENT_MONTH = "current-month",
    LAST_3_MONTHS = "last-3-months",
    LAST_6_MONTHS = "last-6-months",
    LAST_YEAR = "last-year",
    CUSTOM = "custom",
}

export const PurchaseOrderStatusChart = ({
    purchaseOrders,
    businessUnits,
}: POStatusChartProps) => {
    const allPeriods = Array.from(
        new Set(
            purchaseOrders.map(
                (po) => `${po.year}-${String(po.month).padStart(2, "0")}`
            )
        )
    ).sort();

    // Current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // State for filters - menyesuaikan dengan TotalValueCard
    const [selectedBusinessUnit, setSelectedBusinessUnit] =
        useState<string>("all");
    const [dateRangeType, setDateRangeType] = useState<DateRange>(
        DateRange.ALL
    );
    const [selectedMonth, setSelectedMonth] = useState<string>(
        allPeriods.length > 0 ? allPeriods[allPeriods.length - 1] : ""
    );

    // States for custom date range
    const [startPeriod, setStartPeriod] = useState<string>(allPeriods[0] || "");
    const [endPeriod, setEndPeriod] = useState<string>(
        allPeriods[allPeriods.length - 1] || ""
    );
    const [customYear, setCustomYear] = useState<number>(currentYear);
    const [customMonth, setCustomMonth] = useState<number>(currentMonth);

    // States for popover control
    const [datePopoverOpen, setDatePopoverOpen] = useState<boolean>(false);
    const [customTab, setCustomTab] = useState<"range" | "specific">("range");

    // State for active sector in pie chart
    const [activeIndex, setActiveIndex] = useState<number | undefined>(
        undefined
    );

    // Chart data
    const [chartData, setChartData] = useState<any[]>([]);
    const [totalPOCount, setTotalPOCount] = useState<number>(0);
    const [totalPOValue, setTotalPOValue] = useState<number>(0);
    const [filterDescription, setFilterDescription] =
        useState<string>("All time");

    // Get unique years from data
    const uniqueYears = Array.from(
        new Set(purchaseOrders.map((po) => po.year))
    ).sort();

    // Format month display
    const getMonthName = (periodString: string) => {
        const [year, month] = periodString.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleString("default", {
            month: "long",
            year: "numeric",
        });
    };

    // Get selected business unit name
    const getSelectedBusinessUnitName = () => {
        if (selectedBusinessUnit === "all") return "All Business Units";
        const unit = businessUnits.find(
            (u) => u.id.toString() === selectedBusinessUnit
        );
        return unit ? unit.name : "All Business Units";
    };

    // Helper to get periods looking back N months from current
    const getLookbackPeriods = (months: number) => {
        const result = [];
        let year = currentYear;
        let month = currentMonth;

        for (let i = 0; i < months; i++) {
            const periodStr = `${year}-${String(month).padStart(2, "0")}`;
            if (allPeriods.includes(periodStr)) {
                result.push(periodStr);
            }

            // Move one month back
            month--;
            if (month === 0) {
                month = 12;
                year--;
            }
        }

        return result;
    };

    useEffect(() => {
        // Determine date range based on selected type
        let periodFilter: string[] = [];

        switch (dateRangeType) {
            case DateRange.ALL:
                // Use all periods
                periodFilter = allPeriods;
                setFilterDescription("All time");
                break;

            case DateRange.CURRENT_MONTH:
                // Current month only
                const currentPeriod = `${currentYear}-${String(
                    currentMonth
                ).padStart(2, "0")}`;
                periodFilter = allPeriods.filter(
                    (period) => period === currentPeriod
                );
                setFilterDescription(
                    `Current month (${getMonthName(currentPeriod)})`
                );
                setSelectedMonth(currentPeriod);
                break;

            case DateRange.LAST_3_MONTHS:
                // Last 3 months
                periodFilter = getLookbackPeriods(3);
                setFilterDescription("Last 3 months");
                setSelectedMonth(periodFilter[0] || "");
                break;

            case DateRange.LAST_6_MONTHS:
                // Last 6 months
                periodFilter = getLookbackPeriods(6);
                setFilterDescription("Last 6 months");
                setSelectedMonth(periodFilter[0] || "");
                break;

            case DateRange.LAST_YEAR:
                // Last 12 months
                periodFilter = getLookbackPeriods(12);
                setFilterDescription("Last 12 months");
                setSelectedMonth(periodFilter[0] || "");
                break;

            case DateRange.CUSTOM:
                // Custom date range between start and end
                if (customTab === "range" && startPeriod && endPeriod) {
                    const start = new Date(startPeriod);
                    const end = new Date(endPeriod);

                    periodFilter = allPeriods.filter((period) => {
                        const date = new Date(period);
                        return date >= start && date <= end;
                    });

                    const startDisplay = getMonthName(startPeriod);
                    const endDisplay = getMonthName(endPeriod);
                    setFilterDescription(`${startDisplay} to ${endDisplay}`);
                    setSelectedMonth(periodFilter[0] || "");
                } else if (customTab === "specific") {
                    // Specific month-year
                    const specificPeriod = `${customYear}-${String(
                        customMonth
                    ).padStart(2, "0")}`;
                    periodFilter = allPeriods.filter(
                        (period) => period === specificPeriod
                    );
                    setFilterDescription(getMonthName(specificPeriod));
                    setSelectedMonth(specificPeriod);
                }
                break;
        }

        // Filter POs based on selected filters
        let filteredPOs: typeof purchaseOrders = [];

        if (dateRangeType === DateRange.ALL) {
            // Untuk "All time", ambil semua PO berdasarkan business unit saja
            filteredPOs = purchaseOrders.filter((po) => {
                return (
                    selectedBusinessUnit === "all" ||
                    po.business_unit_id.toString() === selectedBusinessUnit
                );
            });
        } else if (selectedMonth) {
            // Untuk filter bulan tertentu
            const [year, month] = selectedMonth.split("-");

            filteredPOs = purchaseOrders.filter((po) => {
                const matchesBusinessUnit =
                    selectedBusinessUnit === "all" ||
                    po.business_unit_id.toString() === selectedBusinessUnit;

                const matchesMonth =
                    po.year === parseInt(year) && po.month === parseInt(month);

                return matchesBusinessUnit && matchesMonth;
            });
        }

        // Aggregate by status
        const statusCounts: Record<string, { count: number; value: number }> =
            {};

        filteredPOs.forEach((po) => {
            // Normalize status
            let status = po.status.toLowerCase();
            if (!["wip", "ar", "ibt"].includes(status)) {
                status = "others";
            }

            if (!statusCounts[status]) {
                statusCounts[status] = { count: 0, value: 0 };
            }

            statusCounts[status].count += 1;
            statusCounts[status].value += po.amount;
        });

        // Format for chart
        const data = Object.entries(statusCounts).map(
            ([status, { count, value }]) => ({
                name: status.toUpperCase(),
                value: count,
                amount: value,
                color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
                formattedLabel: getStatusLabel(status),
            })
        );

        // Calculate totals
        const totalCount = filteredPOs.length;
        const totalValue = filteredPOs.reduce((sum, po) => sum + po.amount, 0);

        setChartData(data);
        setTotalPOCount(totalCount);
        setTotalPOValue(totalValue);
    }, [
        selectedBusinessUnit,
        dateRangeType,
        selectedMonth,
        startPeriod,
        endPeriod,
        customYear,
        customMonth,
        customTab,
        purchaseOrders,
    ]);

    // Get full status label
    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            wip: "Work in Progress",
            ar: "Account Receivable",
            ist: "Installation",
            others: "Other Status",
        };

        return labels[status.toLowerCase()] || status.toUpperCase();
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const { name, value, amount, color, formattedLabel } =
                payload[0].payload;
            const percentage = ((value / totalPOCount) * 100).toFixed(0);
            const formattedAmount =
                amount >= 1000
                    ? `${(amount / 1000).toFixed(1)}B`
                    : `${amount.toFixed(1)}M`;

            return (
                <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-800 mb-1 text-sm">
                        {formattedLabel}
                    </p>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                        ></span>
                        <span className="text-xs text-gray-500">{name}</span>
                    </div>
                    <div className="space-y-1 mt-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Count</span>
                            <span className="font-medium">{value} POs</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">
                                Percentage
                            </span>
                            <span className="font-medium">{percentage}%</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                            <span className="text-xs text-gray-600">Value</span>
                            <span className="font-medium" style={{ color }}>
                                {formattedAmount}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    // Custom legend
    const renderCustomLegend = (props: any) => {
        const { payload } = props;

        return (
            <ul className="flex flex-wrap gap-3 justify-center mt-4">
                {payload.map((entry: any, index: number) => (
                    <li
                        key={`item-${index}`}
                        className={cn(
                            "flex items-center px-2 py-1 rounded-md bg-gray-50 border border-gray-100 transition-all",
                            activeIndex === index &&
                                "ring-2 ring-offset-1 ring-blue-300"
                        )}
                        onClick={() =>
                            setActiveIndex(
                                activeIndex === index ? undefined : index
                            )
                        }
                    >
                        <span
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs font-medium text-gray-800 mr-1">
                            {entry.value}
                        </span>
                        <span className="text-xs text-gray-500">
                            (
                            {(
                                (entry.payload.value / totalPOCount) *
                                100
                            ).toFixed(0)}
                            %)
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    // Custom label
    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index,
        name,
    }: any) => {
        // Only render labels for segments with enough space (more than 10%)
        if (percent < 0.1) return null;

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <g>
                <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={14}
                    fontWeight="bold"
                >
                    {`${name} (${(percent * 100).toFixed(0)}%)`}
                </text>
            </g>
        );
    };

    // Active shape when hovering on pie slices
    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
            props;

        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 6}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    opacity={0.8}
                />
            </g>
        );
    };

    // Handle pie section hover
    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    // Handle pie section leave
    const onPieLeave = () => {
        setActiveIndex(undefined);
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)} Billion`;
        }
        return `${amount.toFixed(1)} Million`;
    };

    // Get date range filter label - sama dengan TotalValueCard
    const getDateRangeLabel = () => {
        switch (dateRangeType) {
            case DateRange.ALL:
                return "All Time";
            case DateRange.CURRENT_MONTH:
                return "Current Month";
            case DateRange.LAST_3_MONTHS:
                return "Last 3 Months";
            case DateRange.LAST_6_MONTHS:
                return "Last 6 Months";
            case DateRange.LAST_YEAR:
                return "Last 12 Months";
            case DateRange.CUSTOM:
                return "Custom Range";
            default:
                return "Select Period";
        }
    };

    // Apply date range selection and close popover
    const applyDateRange = (range: DateRange) => {
        setDateRangeType(range);
        setDatePopoverOpen(false);
    };

    // Apply custom range
    const applyCustomRange = () => {
        setDateRangeType(DateRange.CUSTOM);
        setDatePopoverOpen(false);
    };

    return (
        <Card className="overflow-hidden bg-gradient-to-b from-indigo-50/80 to-blue-50/50">
            <CardHeader className="bg-gradient-to-r from-indigo-100/80 to-blue-50 border-b border-indigo-100 pb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-indigo-900">
                            <PieChart className="text-indigo-600 h-5 w-5" />
                            PO with Status
                        </CardTitle>
                        <CardDescription className="text-indigo-800/70 mt-1 flex items-center gap-1.5 flex-wrap">
                            <Badge
                                variant="outline"
                                className="bg-indigo-100/50 text-indigo-800 border-indigo-200 rounded-md"
                            >
                                {getSelectedBusinessUnitName()}
                            </Badge>
                            <span className="mx-0.5">•</span>
                            <Badge
                                variant="outline"
                                className="bg-indigo-100/50 text-indigo-800 border-indigo-200 rounded-md"
                            >
                                {filterDescription}
                            </Badge>
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Business Unit Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex gap-1.5 items-center"
                                    size="sm"
                                >
                                    <Building className="h-3.5 w-3.5 text-indigo-600" />
                                    <span className="text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[140px]">
                                        {getSelectedBusinessUnitName()}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem
                                    onClick={() =>
                                        setSelectedBusinessUnit("all")
                                    }
                                    className="flex items-center gap-2"
                                >
                                    {selectedBusinessUnit === "all" && (
                                        <Check className="h-4 w-4 text-indigo-600" />
                                    )}
                                    <span
                                        className={
                                            selectedBusinessUnit === "all"
                                                ? "font-medium text-indigo-800"
                                                : ""
                                        }
                                    >
                                        All Business Units
                                    </span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {businessUnits.map((unit) => (
                                    <DropdownMenuItem
                                        key={unit.id}
                                        onClick={() =>
                                            setSelectedBusinessUnit(
                                                unit.id.toString()
                                            )
                                        }
                                        className="flex items-center gap-2"
                                    >
                                        {selectedBusinessUnit ===
                                            unit.id.toString() && (
                                            <Check className="h-4 w-4 text-indigo-600" />
                                        )}
                                        <span
                                            className={
                                                selectedBusinessUnit ===
                                                unit.id.toString()
                                                    ? "font-medium text-indigo-800"
                                                    : ""
                                            }
                                        >
                                            {unit.name}
                                        </span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Date Range Filter - sama dengan TotalValueCard */}
                        <Popover
                            open={datePopoverOpen}
                            onOpenChange={setDatePopoverOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex gap-1.5 items-center"
                                    size="sm"
                                >
                                    <CalendarRange className="h-3.5 w-3.5 text-indigo-600" />
                                    <span className="text-xs sm:text-sm font-medium">
                                        {getDateRangeLabel()}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-80 p-0 overflow-hidden"
                                align="end"
                            >
                                <div className="bg-indigo-50/50 border-b border-indigo-100 py-2 px-3">
                                    <h4 className="font-medium text-indigo-900">
                                        Select Time Period
                                    </h4>
                                    <p className="text-xs text-indigo-700/70">
                                        Filter data by specific time range
                                    </p>
                                </div>

                                <div className="p-3 space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant={
                                                dateRangeType ===
                                                DateRange.CURRENT_MONTH
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                applyDateRange(
                                                    DateRange.CURRENT_MONTH
                                                )
                                            }
                                            className={cn(
                                                "text-xs h-8",
                                                dateRangeType ===
                                                    DateRange.CURRENT_MONTH
                                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                                    : ""
                                            )}
                                        >
                                            Current Month
                                        </Button>
                                        <Button
                                            variant={
                                                dateRangeType ===
                                                DateRange.LAST_3_MONTHS
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                applyDateRange(
                                                    DateRange.LAST_3_MONTHS
                                                )
                                            }
                                            className={cn(
                                                "text-xs h-8",
                                                dateRangeType ===
                                                    DateRange.LAST_3_MONTHS
                                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                                    : ""
                                            )}
                                        >
                                            Last 3 Months
                                        </Button>
                                        <Button
                                            variant={
                                                dateRangeType ===
                                                DateRange.LAST_6_MONTHS
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                applyDateRange(
                                                    DateRange.LAST_6_MONTHS
                                                )
                                            }
                                            className={cn(
                                                "text-xs h-8",
                                                dateRangeType ===
                                                    DateRange.LAST_6_MONTHS
                                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                                    : ""
                                            )}
                                        >
                                            Last 6 Months
                                        </Button>
                                        <Button
                                            variant={
                                                dateRangeType ===
                                                DateRange.LAST_YEAR
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                applyDateRange(
                                                    DateRange.LAST_YEAR
                                                )
                                            }
                                            className={cn(
                                                "text-xs h-8",
                                                dateRangeType ===
                                                    DateRange.LAST_YEAR
                                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                                    : ""
                                            )}
                                        >
                                            Last 12 Months
                                        </Button>
                                        <Button
                                            variant={
                                                dateRangeType === DateRange.ALL
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                applyDateRange(DateRange.ALL)
                                            }
                                            className={cn(
                                                "text-xs h-8 col-span-2",
                                                dateRangeType === DateRange.ALL
                                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                                    : ""
                                            )}
                                        >
                                            All Time
                                        </Button>
                                    </div>

                                    <div className="pt-2 border-t border-indigo-100">
                                        <div className="mb-2">
                                            <h5 className="font-medium text-sm flex items-center gap-1.5 text-indigo-800">
                                                <Sliders className="h-3.5 w-3.5" />
                                                Custom Period
                                            </h5>
                                        </div>

                                        <Tabs
                                            value={customTab}
                                            onValueChange={(v) =>
                                                setCustomTab(
                                                    v as "range" | "specific"
                                                )
                                            }
                                            className="w-full"
                                        >
                                            <TabsList className="w-full mb-3 bg-indigo-100/50">
                                                <TabsTrigger
                                                    value="range"
                                                    className="flex-1 text-xs"
                                                >
                                                    Date Range
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="specific"
                                                    className="flex-1 text-xs"
                                                >
                                                    Specific Month
                                                </TabsTrigger>
                                            </TabsList>
                                            <TabsContent
                                                value="range"
                                                className="mt-0"
                                            >
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-xs font-medium text-indigo-800 block mb-1">
                                                            From
                                                        </label>
                                                        <select
                                                            value={startPeriod}
                                                            onChange={(e) =>
                                                                setStartPeriod(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full border border-gray-200 rounded-md text-sm p-1.5 bg-white"
                                                        >
                                                            {allPeriods.map(
                                                                (period) => (
                                                                    <option
                                                                        key={
                                                                            period
                                                                        }
                                                                        value={
                                                                            period
                                                                        }
                                                                    >
                                                                        {getMonthName(
                                                                            period
                                                                        )}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-indigo-800 block mb-1">
                                                            To
                                                        </label>
                                                        <select
                                                            value={endPeriod}
                                                            onChange={(e) =>
                                                                setEndPeriod(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full border border-gray-200 rounded-md text-sm p-1.5 bg-white"
                                                        >
                                                            {allPeriods.map(
                                                                (period) => (
                                                                    <option
                                                                        key={
                                                                            period
                                                                        }
                                                                        value={
                                                                            period
                                                                        }
                                                                    >
                                                                        {getMonthName(
                                                                            period
                                                                        )}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                            <TabsContent
                                                value="specific"
                                                className="mt-0"
                                            >
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-xs font-medium text-indigo-800 block mb-1">
                                                            Year
                                                        </label>
                                                        <select
                                                            value={customYear}
                                                            onChange={(e) =>
                                                                setCustomYear(
                                                                    parseInt(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            className="w-full border border-gray-200 rounded-md text-sm p-1.5 bg-white"
                                                        >
                                                            {uniqueYears.map(
                                                                (year) => (
                                                                    <option
                                                                        key={
                                                                            year
                                                                        }
                                                                        value={
                                                                            year
                                                                        }
                                                                    >
                                                                        {year}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-indigo-800 block mb-1">
                                                            Month
                                                        </label>
                                                        <select
                                                            value={customMonth}
                                                            onChange={(e) =>
                                                                setCustomMonth(
                                                                    parseInt(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            className="w-full border border-gray-200 rounded-md text-sm p-1.5 bg-white"
                                                        >
                                                            {Array.from(
                                                                { length: 12 },
                                                                (_, i) => i + 1
                                                            ).map((month) => (
                                                                <option
                                                                    key={month}
                                                                    value={
                                                                        month
                                                                    }
                                                                >
                                                                    {new Date(
                                                                        2000,
                                                                        month -
                                                                            1,
                                                                        1
                                                                    ).toLocaleString(
                                                                        "default",
                                                                        {
                                                                            month: "long",
                                                                        }
                                                                    )}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </Tabs>

                                        <div className="mt-3 flex justify-end">
                                            <Button
                                                size="sm"
                                                onClick={applyCustomRange}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                                            >
                                                Apply
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="mb-4 flex flex-wrap gap-4 justify-center sm:justify-start">
                    <div className="flex-1 bg-white p-3 rounded-lg shadow-sm border border-indigo-100/80 min-w-[120px] text-center">
                        <div className="text-sm font-medium text-indigo-600 mb-1">
                            Total POs
                        </div>
                        <div className="text-3xl font-bold text-indigo-900">
                            {totalPOCount}
                        </div>
                    </div>
                    <div className="flex-1 bg-white p-3 rounded-lg shadow-sm border border-indigo-100/80 min-w-[120px] text-center">
                        <div className="text-sm font-medium text-indigo-600 mb-1">
                            Total Value
                        </div>
                        <div className="text-3xl font-bold text-indigo-900">
                            {formatCurrency(totalPOValue)}
                        </div>
                    </div>
                </div>

                <div className="h-[300px] sm:h-[320px] flex items-center justify-center">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                    onMouseLeave={onPieLeave}
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            stroke="#fff"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    content={renderCustomLegend}
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                />
                            </RePieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center bg-white/50 p-6 rounded-lg border border-indigo-100">
                            <PieChart className="h-12 w-12 text-indigo-200 mx-auto mb-3" />
                            <p className="text-indigo-800 font-medium">
                                No data available for the selected period
                            </p>
                            <p className="text-indigo-500 text-sm mt-1">
                                Try selecting a different period or business
                                unit
                            </p>
                        </div>
                    )}
                </div>

                {chartData.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-indigo-100 text-xs text-center text-indigo-500">
                        Click on legend items to highlight sections
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

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
    Filter,
    DollarSign,
    CalendarRange,
    Calendar,
    Settings,
    Check,
    Sliders,
    Building,
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
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

interface TotalValueCardProps {
    purchaseOrders: {
        id: number;
        amount: number;
        business_unit_id: number | string;
        created_at: string;
        month: number;
        year: number;
    }[];
    businessUnits: BusinessUnit[];
}

// Predefined date ranges
enum DateRange {
    ALL = "all",
    CURRENT_MONTH = "current-month",
    LAST_3_MONTHS = "last-3-months",
    LAST_6_MONTHS = "last-6-months",
    LAST_YEAR = "last-year",
    CUSTOM = "custom",
}

export const TotalValueCard = ({
    purchaseOrders,
    businessUnits,
}: TotalValueCardProps) => {
    // Get all unique year-month combinations from data
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

    // State for filters
    const [selectedBusinessUnit, setSelectedBusinessUnit] =
        useState<string>("all");
    const [dateRangeType, setDateRangeType] = useState<DateRange>(
        DateRange.ALL
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

    // States for displaying results
    const [poCount, setPOCount] = useState<number>(0);
    const [totalValue, setTotalValue] = useState<number>(0);
    const [filterDescription, setFilterDescription] =
        useState<string>("All time");

    // Get unique years from data
    const uniqueYears = Array.from(
        new Set(purchaseOrders.map((po) => po.year))
    ).sort();

    // Find selected business unit name
    const getSelectedBusinessUnitName = () => {
        if (selectedBusinessUnit === "all") return "All Business Units";
        const unit = businessUnits.find(
            (u) => u.id.toString() === selectedBusinessUnit
        );
        return unit ? unit.name : "All Business Units";
    };

    // Apply filters and update data
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
                break;

            case DateRange.LAST_3_MONTHS:
                // Last 3 months
                periodFilter = getLookbackPeriods(3);
                setFilterDescription("Last 3 months");
                break;

            case DateRange.LAST_6_MONTHS:
                // Last 6 months
                periodFilter = getLookbackPeriods(6);
                setFilterDescription("Last 6 months");
                break;

            case DateRange.LAST_YEAR:
                // Last 12 months
                periodFilter = getLookbackPeriods(12);
                setFilterDescription("Last 12 months");
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
                } else if (customTab === "specific") {
                    // Specific month-year
                    const specificPeriod = `${customYear}-${String(
                        customMonth
                    ).padStart(2, "0")}`;
                    periodFilter = allPeriods.filter(
                        (period) => period === specificPeriod
                    );
                    setFilterDescription(getMonthName(specificPeriod));
                }
                break;
        }

        // Filter POs by business unit and date period
        const filteredPOs = purchaseOrders.filter((po) => {
            const poPeriod = `${po.year}-${String(po.month).padStart(2, "0")}`;
            const matchesBusinessUnit =
                selectedBusinessUnit === "all" ||
                po.business_unit_id.toString() === selectedBusinessUnit;

            const matchesPeriod = periodFilter.includes(poPeriod);

            return matchesBusinessUnit && matchesPeriod;
        });

        // Calculate stats
        setPOCount(filteredPOs.length);

        // Sum total and convert if needed
        const total = filteredPOs.reduce((sum, po) => sum + po.amount, 0);
        setTotalValue(total);
    }, [
        selectedBusinessUnit,
        dateRangeType,
        startPeriod,
        endPeriod,
        customYear,
        customMonth,
        customTab,
        purchaseOrders,
    ]);

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

    // Format month for display
    const getMonthName = (periodString: string) => {
        const [year, month] = periodString.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleString("default", {
            month: "long",
            year: "numeric",
        });
    };

    // Format value display
    const formatValue = (value: number) => {
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}`;
        }
        return `${value.toFixed(1)}`;
    };

    // Get value unit (Million or Billion)
    const getValueUnit = (value: number) => {
        return value >= 1000 ? "Miliar" : "Million";
    };

    // Split formatted value into main and decimal parts
    const getFormattedValueParts = (value: number) => {
        const formatted = formatValue(value);
        const [main, decimal = "0"] = formatted.split(".");
        return { main, decimal };
    };

    // Get date range filter label
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
        <Card className="overflow-hidden bg-gradient-to-b from-amber-50/80 to-amber-50">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-amber-50/70 border-b border-amber-200 pb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-amber-900">
                            <DollarSign className="text-amber-600 h-5 w-5" />
                            Total Value (Million)
                        </CardTitle>
                        <CardDescription className="text-amber-800/70 mt-1 flex items-center gap-1.5">
                            <Badge
                                variant="outline"
                                className="bg-amber-100/50 text-amber-800 border-amber-200 rounded-md"
                            >
                                {getSelectedBusinessUnitName()}
                            </Badge>
                            <span className="mx-0.5">•</span>
                            <Badge
                                variant="outline"
                                className="bg-amber-100/50 text-amber-800 border-amber-200 rounded-md"
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
                                    <Building className="h-3.5 w-3.5 text-amber-600" />
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
                                        <Check className="h-4 w-4 text-amber-600" />
                                    )}
                                    <span
                                        className={
                                            selectedBusinessUnit === "all"
                                                ? "font-medium text-amber-800"
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
                                            <Check className="h-4 w-4 text-amber-600" />
                                        )}
                                        <span
                                            className={
                                                selectedBusinessUnit ===
                                                unit.id.toString()
                                                    ? "font-medium text-amber-800"
                                                    : ""
                                            }
                                        >
                                            {unit.name}
                                        </span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Date Range Filter */}
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
                                    <CalendarRange className="h-3.5 w-3.5 text-amber-600" />
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
                                <div className="bg-amber-50/50 border-b border-amber-100 py-2 px-3">
                                    <h4 className="font-medium text-amber-900">
                                        Select Time Period
                                    </h4>
                                    <p className="text-xs text-amber-700/70">
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
                                                    ? "bg-amber-600 hover:bg-amber-700"
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
                                                    ? "bg-amber-600 hover:bg-amber-700"
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
                                                    ? "bg-amber-600 hover:bg-amber-700"
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
                                                    ? "bg-amber-600 hover:bg-amber-700"
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
                                                    ? "bg-amber-600 hover:bg-amber-700"
                                                    : ""
                                            )}
                                        >
                                            All Time
                                        </Button>
                                    </div>

                                    <div className="pt-2 border-t border-amber-100">
                                        <div className="mb-2">
                                            <h5 className="font-medium text-sm flex items-center gap-1.5 text-amber-800">
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
                                            <TabsList className="w-full mb-3 bg-amber-100/50">
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
                                                        <label className="text-xs font-medium text-amber-800 block mb-1">
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
                                                        <label className="text-xs font-medium text-amber-800 block mb-1">
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
                                                        <label className="text-xs font-medium text-amber-800 block mb-1">
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
                                                        <label className="text-xs font-medium text-amber-800 block mb-1">
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
                                                className="bg-amber-600 hover:bg-amber-700 text-xs"
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
            <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center gap-1 mb-4">
                        <div className="text-2xl font-medium text-amber-800/60">
                            Total POs
                        </div>
                        <div className="text-7xl sm:text-8xl font-black text-amber-950/90 leading-none">
                            {poCount}
                        </div>
                    </div>

                    <div className="h-px w-24 bg-amber-200 my-4"></div>

                    <div className="flex flex-col items-center gap-1">
                        <div className="text-2xl font-medium text-amber-800/60">
                            Total Value
                        </div>
                        <div className="text-5xl sm:text-6xl font-black text-amber-950/90 leading-none">
                            {getFormattedValueParts(totalValue).main}
                            <span className="text-2xl sm:text-3xl">
                                ,{getFormattedValueParts(totalValue).decimal}
                            </span>
                        </div>
                        <div className="text-xl font-medium text-amber-700 mt-1">
                            {getValueUnit(totalValue)}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

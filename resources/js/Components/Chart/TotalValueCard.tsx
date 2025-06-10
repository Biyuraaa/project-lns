"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { BusinessUnit, TotalValueCardData } from "@/types";
import {
    ChevronDown,
    DollarSign,
    CalendarRange,
    Check,
    Sliders,
    Building,
    FileCheck,
    ClipboardList,
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
    data: TotalValueCardData;
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

enum ValueType {
    PO = "po",
    QUOTATION = "quotation",
}

export const TotalValueCard = ({
    data,
    businessUnits,
}: TotalValueCardProps) => {
    // Current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Get all unique periods from data
    const allPeriods = useMemo(() => {
        return data.periods?.map((period) => period.period) || [];
    }, [data]);

    // State for filters
    const [selectedBusinessUnit, setSelectedBusinessUnit] =
        useState<string>("all");
    const [dateRangeType, setDateRangeType] = useState<DateRange>(
        DateRange.ALL
    );
    const [selectedValueType, setSelectedValueType] = useState<ValueType>(
        ValueType.PO
    );

    // States for custom date range
    const [startPeriod, setStartPeriod] = useState<string>(
        allPeriods[allPeriods.length - 1] || ""
    );
    const [endPeriod, setEndPeriod] = useState<string>(allPeriods[0] || "");
    const [customYear, setCustomYear] = useState<number>(currentYear);
    const [customMonth, setCustomMonth] = useState<number>(currentMonth);

    // States for popover control
    const [datePopoverOpen, setDatePopoverOpen] = useState<boolean>(false);
    const [customTab, setCustomTab] = useState<"range" | "specific">("range");

    // States for displaying results
    const [filterDescription, setFilterDescription] =
        useState<string>("Semua waktu");

    // State for filtered data
    const [filteredData, setFilteredData] = useState<{
        count: number;
        value: number;
        formatted_value: string;
    }>({
        count: 0,
        value: 0,
        formatted_value: "Rp 0",
    });

    // Get unique years from periods
    const uniqueYears = Array.from(
        new Set(data.periods?.map((period) => period.year) || [])
    ).sort();

    // Find selected business unit name
    const getSelectedBusinessUnitName = () => {
        if (selectedBusinessUnit === "all") return "Semua Business Unit";
        const unit = businessUnits.find(
            (u) => u.id.toString() === selectedBusinessUnit
        );
        return unit ? unit.name : "Semua Business Unit";
    };

    // Helper to get periods looking back N months from current
    const getLookbackPeriods = (months: number) => {
        let result: string[] = [];
        let date = new Date(now);

        for (let i = 0; i < months; i++) {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const periodStr = `${year}-${String(month).padStart(2, "0")}`;

            if (allPeriods.includes(periodStr)) {
                result.push(periodStr);
            }

            // Move one month back
            date.setMonth(date.getMonth() - 1);
        }

        return result;
    };

    // Format month for display in Indonesian
    const getMonthName = (periodString: string) => {
        const [year, month] = periodString.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleString("id-ID", {
            month: "long",
            year: "numeric",
        });
    };

    // Get date range filter label
    const getDateRangeLabel = () => {
        switch (dateRangeType) {
            case DateRange.ALL:
                return "Semua Waktu";
            case DateRange.CURRENT_MONTH:
                return "Bulan Ini";
            case DateRange.LAST_3_MONTHS:
                return "3 Bulan Terakhir";
            case DateRange.LAST_6_MONTHS:
                return "6 Bulan Terakhir";
            case DateRange.LAST_YEAR:
                return "12 Bulan Terakhir";
            case DateRange.CUSTOM:
                return "Rentang Kustom";
            default:
                return "Pilih Periode";
        }
    };

    // Apply date range selection and close popover
    const applyDateRange = (range: DateRange) => {
        setDateRangeType(range);
        setDatePopoverOpen(false);

        switch (range) {
            case DateRange.ALL:
                setFilterDescription("Semua waktu");
                break;
            case DateRange.CURRENT_MONTH:
                setFilterDescription("Bulan ini");
                break;
            case DateRange.LAST_3_MONTHS:
                setFilterDescription("3 Bulan Terakhir");
                break;
            case DateRange.LAST_6_MONTHS:
                setFilterDescription("6 Bulan Terakhir");
                break;
            case DateRange.LAST_YEAR:
                setFilterDescription("12 Bulan Terakhir");
                break;
        }
    };

    // Apply custom range
    const applyCustomRange = () => {
        setDateRangeType(DateRange.CUSTOM);
        setDatePopoverOpen(false);

        if (customTab === "range" && startPeriod && endPeriod) {
            const startDisplay = getMonthName(startPeriod);
            const endDisplay = getMonthName(endPeriod);
            setFilterDescription(`${startDisplay} ke ${endDisplay}`);
        } else if (customTab === "specific") {
            const specificPeriod = `${customYear}-${String(
                customMonth
            ).padStart(2, "0")}`;
            setFilterDescription(getMonthName(specificPeriod));
        }
    };

    // Helper function to get appropriate icon for value type
    const getValueTypeIcon = () => {
        return selectedValueType === ValueType.PO ? (
            <ClipboardList className="h-5 w-5 text-amber-600" />
        ) : (
            <FileCheck className="h-5 w-5 text-amber-600" />
        );
    };

    // Helper function to get value type label
    const getValueTypeLabel = () => {
        return selectedValueType === ValueType.PO
            ? "Purchase Order"
            : "Quotation";
    };

    useEffect(() => {
        let result = {
            count: 0,
            value: 0,
            formatted_value: "Rp 0",
        };

        if (dateRangeType === DateRange.ALL) {
            const businessUnitData = data[selectedBusinessUnit] || data.all;
            if (businessUnitData) {
                result = { ...businessUnitData[selectedValueType] };
            }
        } else {
            let periodFilter: string[] = [];

            switch (dateRangeType) {
                case DateRange.CURRENT_MONTH:
                    const currentPeriod = `${currentYear}-${String(
                        currentMonth
                    ).padStart(2, "0")}`;
                    periodFilter = [currentPeriod];
                    break;
                case DateRange.LAST_3_MONTHS:
                    periodFilter = getLookbackPeriods(3);
                    break;
                case DateRange.LAST_6_MONTHS:
                    periodFilter = getLookbackPeriods(6);
                    break;
                case DateRange.LAST_YEAR:
                    periodFilter = getLookbackPeriods(12);
                    break;
                case DateRange.CUSTOM:
                    if (customTab === "range" && startPeriod && endPeriod) {
                        const startDate = new Date(
                            parseInt(startPeriod.split("-")[0]),
                            parseInt(startPeriod.split("-")[1]) - 1
                        );
                        const endDate = new Date(
                            parseInt(endPeriod.split("-")[0]),
                            parseInt(endPeriod.split("-")[1]) - 1
                        );

                        periodFilter = allPeriods.filter((period) => {
                            const [year, month] = period.split("-");
                            const date = new Date(
                                parseInt(year),
                                parseInt(month) - 1
                            );
                            return date >= startDate && date <= endDate;
                        });
                    } else if (customTab === "specific") {
                        const specificPeriod = `${customYear}-${String(
                            customMonth
                        ).padStart(2, "0")}`;
                        periodFilter = [specificPeriod];
                    }
                    break;
            }

            const filteredByDate =
                data.periods?.filter((period) =>
                    periodFilter.includes(period.period)
                ) || [];

            let finalFilteredData = filteredByDate;
            if (selectedBusinessUnit !== "all") {
                finalFilteredData = filteredByDate.filter(
                    (p) => p.businessUnitId?.toString() === selectedBusinessUnit
                );
            }

            if (finalFilteredData.length > 0) {
                let totalCount = 0;
                let totalValue = 0;

                finalFilteredData.forEach((period) => {
                    totalCount += period[selectedValueType].count;
                    totalValue += period[selectedValueType].value;
                });

                const formattedValue = `Rp ${totalValue
                    .toFixed(1)
                    .replace(".", ",")}`;

                result = {
                    count: totalCount,
                    value: totalValue,
                    formatted_value: formattedValue,
                };
            }
        }

        setFilteredData(result);
    }, [
        data,
        selectedBusinessUnit,
        selectedValueType,
        dateRangeType,
        startPeriod,
        endPeriod,
        customYear,
        customMonth,
        customTab,
        allPeriods,
    ]);

    return (
        <Card className="overflow-hidden bg-gradient-to-b from-amber-50/80 to-amber-50">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-amber-50/70 border-b border-amber-200 pb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-amber-900">
                            <DollarSign className="text-amber-600 h-5 w-5" />
                            Nilai Total
                        </CardTitle>
                        <CardDescription className="text-amber-800/70 mt-1 flex items-center gap-1.5 flex-wrap">
                            <Badge
                                variant="outline"
                                className="bg-amber-100/50 text-amber-800 border-amber-200 rounded-md"
                            >
                                {getValueTypeLabel()}
                            </Badge>
                            <span className="mx-0.5">•</span>
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
                        {/* Value Type Selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex gap-1.5 items-center"
                                    size="sm"
                                >
                                    {getValueTypeIcon()}
                                    <span className="text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[140px]">
                                        {getValueTypeLabel()}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem
                                    onClick={() =>
                                        setSelectedValueType(ValueType.PO)
                                    }
                                    className="flex items-center gap-2"
                                >
                                    {selectedValueType === ValueType.PO && (
                                        <Check className="h-4 w-4 text-amber-600" />
                                    )}
                                    <span
                                        className={
                                            selectedValueType === ValueType.PO
                                                ? "font-medium text-amber-800"
                                                : ""
                                        }
                                    >
                                        Purchase Order
                                    </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        setSelectedValueType(
                                            ValueType.QUOTATION
                                        )
                                    }
                                    className="flex items-center gap-2"
                                >
                                    {selectedValueType ===
                                        ValueType.QUOTATION && (
                                        <Check className="h-4 w-4 text-amber-600" />
                                    )}
                                    <span
                                        className={
                                            selectedValueType ===
                                            ValueType.QUOTATION
                                                ? "font-medium text-amber-800"
                                                : ""
                                        }
                                    >
                                        Quotation
                                    </span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Business Unit Selector */}
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
                                        Semua Business Unit
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
                                        Pilih Periode Waktu
                                    </h4>
                                    <p className="text-xs text-amber-700/70">
                                        Filter data berdasarkan rentang waktu
                                        spesifik
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
                                            Bulan Ini
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
                                            3 Bulan Terakhir
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
                                            6 Bulan Terakhir
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
                                            12 Bulan Terakhir
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
                                            Semua Waktu
                                        </Button>
                                    </div>

                                    <div className="pt-2 border-t border-amber-100">
                                        <div className="mb-2">
                                            <h5 className="font-medium text-sm flex items-center gap-1.5 text-amber-800">
                                                <Sliders className="h-3.5 w-3.5" />
                                                Periode Kustom
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
                                                    Rentang Tanggal
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="specific"
                                                    className="flex-1 text-xs"
                                                >
                                                    Bulan Tertentu
                                                </TabsTrigger>
                                            </TabsList>
                                            <TabsContent
                                                value="range"
                                                className="mt-0"
                                            >
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-xs font-medium text-amber-800 block mb-1">
                                                            Dari
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
                                                            Hingga
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
                                                            Tahun
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
                                                            Bulan
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
                                                                        "id-ID",
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
                                                Terapkan
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
                            Total{" "}
                            {selectedValueType === ValueType.PO
                                ? "PO"
                                : "Quotation"}
                        </div>
                        <div className="text-7xl sm:text-8xl font-black text-amber-950/90 leading-none">
                            {filteredData.count}
                        </div>
                    </div>

                    <div className="h-px w-24 bg-amber-200 my-4"></div>

                    <div className="flex flex-col items-center gap-1">
                        <div className="text-2xl font-medium text-amber-800/60">
                            Nilai Total
                        </div>
                        <div className="text-5xl sm:text-6xl font-black text-amber-950/90 leading-none">
                            {filteredData.formatted_value}
                        </div>
                        <div className="text-xl font-medium text-amber-700 mt-1">
                            Miliar
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

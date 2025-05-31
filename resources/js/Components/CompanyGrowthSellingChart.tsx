"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Line,
    ComposedChart,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import {
    CompanyGrowthSelling,
    BusinessUnit,
    CompanyGrowthSellingData,
} from "@/types";
import {
    ChevronDown,
    TrendingUp,
    Info,
    BarChart3,
    Filter,
    CheckIcon,
    ChevronsUpDown,
    TrendingDown,
    Minus,
} from "lucide-react";
import { Badge } from "@/Components/ui/badge";
import {
    Tooltip as TooltipUI,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { Button } from "@/Components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CompanyGrowthSellingChartProps {
    data: CompanyGrowthSellingData[];
    businessUnits: BusinessUnit[];
}

export const CompanyGrowthSellingChart = ({
    data,
    businessUnits,
}: CompanyGrowthSellingChartProps) => {
    // Get list of unique years from data
    const availableYears = [...new Set(data.map((item) => item.year))].sort(
        (a, b) => b - a
    ); // Sort descending

    const ALL_YEARS = "all";
    const ALL_BUSINESS_UNITS = "all";

    // State for selected year filter, default to latest year if available
    const [selectedYear, setSelectedYear] = useState<string>(
        availableYears.length > 0 ? availableYears[0].toString() : ALL_YEARS
    );
    const [selectedBusinessUnit, setSelectedBusinessUnit] =
        useState<string>(ALL_BUSINESS_UNITS);

    const [chartData, setChartData] = useState<any[]>([]);
    const [performanceMetric, setPerformanceMetric] = useState<number>(0);
    const [trendDirection, setTrendDirection] = useState<
        "up" | "down" | "flat"
    >("flat");
    const [highestValue, setHighestValue] = useState<number>(0);
    const [averageAchievement, setAverageAchievement] = useState<number>(0);

    // Add month names to the data for better readability
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    // Handle year change
    const handleYearChange = (yearValue: string) => {
        setSelectedYear(yearValue);
    };

    // Handle business unit change
    const handleBusinessUnitChange = (businessUnitId: string) => {
        setSelectedBusinessUnit(businessUnitId);
    };

    // Get the selected business unit name
    const getSelectedBusinessUnitName = () => {
        if (selectedBusinessUnit === ALL_BUSINESS_UNITS) {
            return "All Business Units";
        }

        const unit = businessUnits.find(
            (unit) => unit.id.toString() === selectedBusinessUnit
        );
        return unit ? unit.name : "All Business Units";
    };

    // Format date for display in chart
    const formatPeriod = (month: number, year: number) => {
        return `${monthNames[month - 1]} ${year}`;
    };

    useEffect(() => {
        // Filter data by selected year and business unit
        let filteredData = data;

        // Filter by year if not showing all
        if (selectedYear !== ALL_YEARS) {
            filteredData = filteredData.filter(
                (item) => item.year === parseInt(selectedYear)
            );
        }

        // Filter by business unit if not showing all
        if (selectedBusinessUnit !== ALL_BUSINESS_UNITS) {
            filteredData = filteredData.filter(
                (item) =>
                    item.business_unit.id.toString() === selectedBusinessUnit
            );
        } else if (selectedBusinessUnit === ALL_BUSINESS_UNITS) {
            // If all business units, aggregate the data by month and year
            const aggregatedData = new Map();

            filteredData.forEach((item) => {
                const key = `${item.year}-${item.month}`;
                if (!aggregatedData.has(key)) {
                    aggregatedData.set(key, {
                        year: item.year,
                        month: item.month,
                        target: 0,
                        actual: 0,
                        difference: 0,
                        percentage: 0,
                    });
                }

                const entry = aggregatedData.get(key);
                entry.target += item.target;
                entry.actual += item.actual;
                entry.difference = entry.actual - entry.target;
                entry.percentage =
                    entry.target > 0
                        ? Number(
                              ((entry.actual / entry.target) * 100).toFixed(2)
                          )
                        : 0;
            });

            filteredData = Array.from(aggregatedData.values());
        }

        // If we have data, process it for the chart
        if (filteredData && filteredData.length > 0) {
            // Sort data by year and month
            const sortedData = [...filteredData].sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month - b.month;
            });

            const formattedData = sortedData.map((item) => {
                // Add safe access to business_unit.id
                const businessUnitId = item.business_unit
                    ? item.business_unit.id
                    : "all";

                return {
                    period: formatPeriod(item.month, item.year),
                    month: monthNames[item.month - 1],
                    year: item.year,
                    monthNumber: item.month,
                    target: item.target,
                    actual: item.actual,
                    difference: item.difference,
                    business_unit_id: businessUnitId,
                    sortKey: item.year * 100 + item.month,
                };
            });

            // Find highest value for better chart scaling
            const maxTarget = Math.max(
                ...formattedData.map((item) => item.target)
            );
            const maxActual = Math.max(
                ...formattedData.map((item) => item.actual)
            );
            setHighestValue(Math.max(maxTarget, maxActual));

            setChartData(formattedData);
        } else {
            // No data
            setChartData([]);
            setPerformanceMetric(0);
            setTrendDirection("flat");
            setAverageAchievement(0);
        }
    }, [data, selectedYear, selectedBusinessUnit]);

    // Custom tooltip to show more details
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const targetValue = payload[0].value;
            const actualValue = payload[1].value;
            const difference = actualValue - targetValue;
            const percentage = Math.round((actualValue / targetValue) * 100);

            return (
                <div className="custom-tooltip bg-white p-4 shadow-lg border border-gray-200 rounded-md">
                    <p className="font-medium text-gray-900 mb-2 border-b pb-1">{`${label}`}</p>
                    <div className="grid gap-1.5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-sm bg-blue-500"></div>
                                <span className="text-sm text-gray-600">
                                    Target:
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-800">
                                {targetValue.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-sm bg-red-500"></div>
                                <span className="text-sm text-gray-600">
                                    Actual:
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-800">
                                {actualValue.toLocaleString()}
                            </span>
                        </div>

                        <div className="mt-1.5 pt-1.5 border-t">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-gray-600">
                                    Difference:
                                </span>
                                <span
                                    className={`text-sm font-medium ${
                                        difference >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {`${
                                        difference >= 0 ? "+" : ""
                                    }${difference.toLocaleString()}`}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4 mt-1">
                                <span className="text-sm text-gray-600">
                                    Achievement:
                                </span>
                                <span
                                    className={`text-sm font-medium px-1.5 py-0.5 rounded ${
                                        percentage >= 100
                                            ? "bg-green-100 text-green-700"
                                            : percentage >= 80
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {`${percentage}%`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const getPerformanceClass = () => {
        if (performanceMetric >= 100) return "text-emerald-600";
        if (performanceMetric >= 80) return "text-amber-600";
        return "text-red-600";
    };

    // Get the title description based on selected year and business unit
    const getChartDescription = () => {
        const yearText =
            selectedYear === ALL_YEARS ? "all years" : `year ${selectedYear}`;

        const businessUnitText =
            selectedBusinessUnit === ALL_BUSINESS_UNITS
                ? "all business units"
                : `${getSelectedBusinessUnitName()}`;

        if (chartData.length > 0) {
            const firstPeriod = chartData[0].period;
            const lastPeriod = chartData[chartData.length - 1].period;
            return `Monthly target vs. actual sales performance (${firstPeriod} - ${lastPeriod}) for ${businessUnitText}`;
        }

        return `Target vs. actual sales performance for ${businessUnitText} - ${yearText}`;
    };

    const getTrendIcon = () => {
        if (trendDirection === "up") {
            return (
                <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
            );
        } else if (trendDirection === "down") {
            return <TrendingDown className="h-3.5 w-3.5 mr-1.5 text-red-500" />;
        } else {
            return <Minus className="h-3.5 w-3.5 mr-1.5 text-gray-500" />;
        }
    };

    const formatYAxisTick = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
    };

    return (
        <TooltipProvider>
            <Card className="shadow-md border-gray-200">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b pb-4 rounded-t-lg">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <BarChart3 className="text-white/90 h-5 w-5" />
                                Company Growth Selling
                            </CardTitle>
                            <CardDescription className="text-blue-100/90 mt-1">
                                {getChartDescription()}
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Year Filter - Styled as a dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 hover:bg-white/20 focus:ring-offset-blue-700"
                                    >
                                        <Filter className="h-4 w-4 mr-2 opacity-70" />
                                        <span>
                                            {selectedYear === ALL_YEARS
                                                ? "All Years"
                                                : `Year ${selectedYear}`}
                                        </span>
                                        <ChevronsUpDown className="h-4 w-4 ml-2 opacity-70" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center">
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleYearChange(ALL_YEARS)
                                        }
                                        className={cn(
                                            selectedYear === ALL_YEARS &&
                                                "bg-accent"
                                        )}
                                    >
                                        All Years
                                        {selectedYear === ALL_YEARS && (
                                            <CheckIcon className="ml-auto h-4 w-4" />
                                        )}
                                    </DropdownMenuItem>
                                    {availableYears.map((year) => (
                                        <DropdownMenuItem
                                            key={year}
                                            onClick={() =>
                                                handleYearChange(
                                                    year.toString()
                                                )
                                            }
                                            className={cn(
                                                selectedYear ===
                                                    year.toString() &&
                                                    "bg-accent"
                                            )}
                                        >
                                            {year}
                                            {selectedYear ===
                                                year.toString() && (
                                                <CheckIcon className="ml-auto h-4 w-4" />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Business Unit Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 hover:bg-white/20 focus:ring-offset-blue-700"
                                    >
                                        <Filter className="h-4 w-4 mr-2 opacity-70" />
                                        <span className="truncate max-w-[150px]">
                                            {getSelectedBusinessUnitName()}
                                        </span>
                                        <ChevronsUpDown className="h-4 w-4 ml-2 opacity-70" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-[220px]"
                                >
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleBusinessUnitChange(
                                                ALL_BUSINESS_UNITS
                                            )
                                        }
                                        className={cn(
                                            selectedBusinessUnit ===
                                                ALL_BUSINESS_UNITS &&
                                                "bg-accent"
                                        )}
                                    >
                                        All Business Units
                                        {selectedBusinessUnit ===
                                            ALL_BUSINESS_UNITS && (
                                            <CheckIcon className="ml-auto h-4 w-4" />
                                        )}
                                    </DropdownMenuItem>
                                    {businessUnits.map((unit) => (
                                        <DropdownMenuItem
                                            key={unit.id}
                                            onClick={() =>
                                                handleBusinessUnitChange(
                                                    unit.id.toString()
                                                )
                                            }
                                            className={cn(
                                                selectedBusinessUnit ===
                                                    unit.id.toString() &&
                                                    "bg-accent"
                                            )}
                                        >
                                            {unit.name}
                                            {selectedBusinessUnit ===
                                                unit.id.toString() && (
                                                <CheckIcon className="ml-auto h-4 w-4" />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <TooltipUI>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="bg-white/10 text-white border-white/20 hover:bg-white/20 focus:ring-offset-blue-700 h-9 w-9"
                                    >
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white text-gray-800">
                                    <p>
                                        Shows monthly target sales (blue bars)
                                        vs actual sales (red line). Performance
                                        is measured as average achievement
                                        percentage.
                                    </p>
                                </TooltipContent>
                            </TooltipUI>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                        <Badge
                            variant="outline"
                            className="bg-blue-100/30 text-blue-50 border-blue-400/30"
                        >
                            <span className="h-2.5 w-2.5 rounded-sm bg-blue-400 mr-1.5"></span>
                            Target Sales
                        </Badge>
                        <Badge
                            variant="outline"
                            className="bg-red-100/30 text-red-50 border-red-400/30"
                        >
                            <span className="h-2.5 w-2.5 rounded-sm bg-red-400 mr-1.5"></span>
                            Actual PO Values
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="h-[350px] sm:h-[380px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={chartData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 30,
                                    }}
                                    barCategoryGap="20%"
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f0f0f0"
                                    />
                                    <XAxis
                                        dataKey="period"
                                        axisLine={{ stroke: "#d1d5db" }}
                                        tickLine={false}
                                        tickMargin={10}
                                        tick={{ fontSize: 12, fill: "#4b5563" }}
                                        angle={chartData.length > 8 ? -45 : 0}
                                        textAnchor={
                                            chartData.length > 8
                                                ? "end"
                                                : "middle"
                                        }
                                        height={chartData.length > 8 ? 60 : 30}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={10}
                                        tick={{ fontSize: 12, fill: "#4b5563" }}
                                        tickFormatter={formatYAxisTick}
                                        domain={[0, "dataMax + 10%"]}
                                    />
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={{
                                            fill: "rgba(224, 231, 255, 0.2)",
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        height={36}
                                        iconType="circle"
                                        iconSize={10}
                                        wrapperStyle={{
                                            paddingTop: 20,
                                            paddingLeft: 25,
                                        }}
                                    />
                                    <Bar
                                        name="Target"
                                        dataKey="target"
                                        fill="#3b82f6"
                                        fillOpacity={0.8}
                                        barSize={chartData.length > 8 ? 18 : 30}
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Line
                                        name="Actual"
                                        type="monotone"
                                        dataKey="actual"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        dot={{
                                            r: 4,
                                            fill: "#ef4444",
                                            strokeWidth: 1,
                                            stroke: "#ffffff",
                                        }}
                                        activeDot={{
                                            r: 6,
                                            fill: "#ef4444",
                                            stroke: "#fee2e2",
                                            strokeWidth: 2,
                                        }}
                                    />

                                    {/* 100% Achievement reference line */}
                                    <ReferenceLine
                                        y={0}
                                        stroke="#e5e7eb"
                                        strokeWidth={1}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-gray-50/50">
                                <div className="text-center p-8">
                                    <BarChart3 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">
                                        No data available{" "}
                                        {selectedYear !== ALL_YEARS &&
                                            `for ${selectedYear}`}
                                        {selectedBusinessUnit !==
                                            ALL_BUSINESS_UNITS &&
                                            ` in ${getSelectedBusinessUnitName()}`}
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Try changing the filter settings
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
};

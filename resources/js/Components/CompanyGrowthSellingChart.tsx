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
} from "recharts";
import { CompanyGrowthSelling } from "@/types";
import { ChevronDown, TrendingUp, Info, BarChart3, Filter } from "lucide-react";
import { Badge } from "@/Components/ui/badge";
import {
    Tooltip as TooltipUI,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { Button } from "@/Components/ui/button";

interface CompanyGrowthSellingChartProps {
    data: CompanyGrowthSelling[];
}

export const CompanyGrowthSellingChart = ({
    data,
}: CompanyGrowthSellingChartProps) => {
    // Get list of unique years from data
    const availableYears = [...new Set(data.map((item) => item.year))].sort();

    // Special "all" option for showing all data
    const ALL_YEARS = "all";

    // State for selected year filter, default to "all"
    const [selectedYear, setSelectedYear] = useState<string>(ALL_YEARS);

    const [chartData, setChartData] = useState<any[]>([]);
    const [performanceMetric, setPerformanceMetric] = useState<number>(0);
    const [trendDirection, setTrendDirection] = useState<
        "up" | "down" | "flat"
    >("flat");

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

    // Format date for display in chart
    const formatPeriod = (month: number, year: number) => {
        return `${monthNames[month - 1]} ${year}`;
    };

    useEffect(() => {
        // Filter data by selected year or show all
        const filteredData =
            selectedYear === ALL_YEARS
                ? data
                : data.filter((item) => item.year === parseInt(selectedYear));

        // If we have data, process it for the chart
        if (filteredData && filteredData.length > 0) {
            // Sort data by year and month
            const sortedData = [...filteredData].sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month - b.month;
            });

            // Format the data for the chart
            const formattedData = sortedData.map((item) => ({
                period: formatPeriod(item.month, item.year),
                month: monthNames[item.month - 1],
                year: item.year,
                monthNumber: item.month,
                target: item.target,
                actual: item.actual,
                percentage: item.percentage,
                difference: item.difference,
                sortKey: item.year * 100 + item.month,
            }));

            const dataToShow = formattedData;
            setChartData(dataToShow);
            // Calculate average performance metrics for the period
            if (dataToShow.length > 0) {
                const avgPerformance =
                    dataToShow.reduce((sum, item) => sum + item.percentage, 0) /
                    dataToShow.length;
                setPerformanceMetric(Math.round(avgPerformance));

                // Determine trend direction based on last two periods
                if (dataToShow.length >= 2) {
                    // Get the two most recent periods
                    const sortedByPeriod = [...dataToShow].sort(
                        (a, b) => b.sortKey - a.sortKey
                    );
                    const lastMonth = sortedByPeriod[0];
                    const previousMonth = sortedByPeriod[1];

                    if (lastMonth.percentage > previousMonth.percentage) {
                        setTrendDirection("up");
                    } else if (
                        lastMonth.percentage < previousMonth.percentage
                    ) {
                        setTrendDirection("down");
                    } else {
                        setTrendDirection("flat");
                    }
                }
            }
        } else {
            // No data
            setChartData([]);
            setPerformanceMetric(0);
            setTrendDirection("flat");
        }
    }, [data, selectedYear]);

    // Custom tooltip to show more details
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const targetValue = payload[0].value;
            const actualValue = payload[1].value;
            const difference = actualValue - targetValue;
            const percentage = Math.round((actualValue / targetValue) * 100);

            return (
                <div className="custom-tooltip bg-white p-4 shadow-lg border border-gray-100 rounded-md">
                    <p className="font-medium text-gray-800">{`${label}`}</p>
                    <p className="text-sm text-blue-600">{`Target: ${targetValue.toLocaleString()}`}</p>
                    <p className="text-sm text-red-600">{`Actual: ${actualValue.toLocaleString()}`}</p>
                    <p
                        className={`text-sm font-medium ${
                            difference >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {`Difference: ${
                            difference >= 0 ? "+" : ""
                        }${difference.toLocaleString()}`}
                    </p>
                    <p
                        className={`text-sm font-medium ${
                            percentage >= 100
                                ? "text-green-600"
                                : percentage >= 80
                                ? "text-amber-600"
                                : "text-red-600"
                        }`}
                    >
                        {`Achievement: ${percentage}%`}
                    </p>
                </div>
            );
        }
        return null;
    };

    const getPerformanceClass = () => {
        if (performanceMetric >= 100) return "text-green-600";
        if (performanceMetric >= 80) return "text-amber-600";
        return "text-red-600";
    };

    // Get the title description based on selected year
    const getChartDescription = () => {
        if (selectedYear === ALL_YEARS) {
            if (chartData.length > 0) {
                const firstPeriod = chartData[0].period;
                const lastPeriod = chartData[chartData.length - 1].period;
                return `Target vs. actual sales performance (${firstPeriod} - ${lastPeriod})`;
            }
            return "Target vs. actual sales performance (all periods)";
        }
        return `Target vs. actual sales performance for ${selectedYear}`;
    };

    return (
        <TooltipProvider>
            <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <BarChart3 className="text-blue-600 h-5 w-5" />
                                Company Growth Selling
                            </CardTitle>
                            <CardDescription className="text-gray-600 mt-1">
                                {getChartDescription()}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center">
                                <div className="rounded-md border border-gray-300 shadow-sm bg-white flex items-center px-3 py-1.5">
                                    <Filter className="h-4 w-4 text-gray-500 mr-2" />
                                    <select
                                        value={selectedYear}
                                        onChange={(e) =>
                                            handleYearChange(e.target.value)
                                        }
                                        className="bg-transparent border-none focus:outline-none text-sm"
                                    >
                                        <option value={ALL_YEARS}>
                                            All Years
                                        </option>
                                        {availableYears.map((year) => (
                                            <option
                                                key={year}
                                                value={year.toString()}
                                            >
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                </div>
                            </div>
                            <TooltipUI>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 border-gray-300"
                                    >
                                        <Info className="h-4 w-4 text-gray-500" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Shows target sales (blue bars) vs actual
                                        sales (red line)
                                    </p>
                                </TooltipContent>
                            </TooltipUI>
                        </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                        <Badge
                            variant="outline"
                            className="bg-blue-100/50 text-blue-700 border-blue-200"
                        >
                            <span className="h-2 w-2 rounded-full bg-blue-500 mr-1"></span>
                            Target Sales
                        </Badge>
                        <Badge
                            variant="outline"
                            className="bg-red-100/50 text-red-700 border-red-200"
                        >
                            <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span>
                            Actual PO Values
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`ml-auto ${
                                trendDirection === "up"
                                    ? "bg-green-100/50 text-green-700 border-green-200"
                                    : trendDirection === "down"
                                    ? "bg-red-100/50 text-red-700 border-red-200"
                                    : "bg-gray-100/50 text-gray-700 border-gray-200"
                            }`}
                        >
                            <TrendingUp
                                className={`h-3 w-3 mr-1 ${
                                    trendDirection === "up"
                                        ? "text-green-600"
                                        : trendDirection === "down"
                                        ? "text-red-600"
                                        : "text-gray-600"
                                }`}
                            />
                            Avg. Achievement:{" "}
                            <span className={getPerformanceClass()}>
                                {performanceMetric}%
                            </span>
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pb-0 pt-4">
                    <div className="h-[320px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={chartData}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 30,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f0f0f0"
                                    />
                                    <XAxis
                                        dataKey="period"
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={10}
                                        tick={{ fontSize: 12 }}
                                        angle={
                                            selectedYear === ALL_YEARS ? -45 : 0
                                        }
                                        textAnchor={
                                            selectedYear === ALL_YEARS
                                                ? "end"
                                                : "middle"
                                        }
                                        height={
                                            selectedYear === ALL_YEARS ? 60 : 30
                                        }
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={8}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="top"
                                        height={36}
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{
                                            paddingTop: 10,
                                            paddingBottom: 0,
                                        }}
                                    />
                                    <Bar
                                        name="Target"
                                        dataKey="target"
                                        fill="#3b82f6"
                                        barSize={
                                            selectedYear === ALL_YEARS ? 16 : 24
                                        }
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Line
                                        name="Actual"
                                        type="monotone"
                                        dataKey="actual"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500">
                                    No data available{" "}
                                    {selectedYear !== ALL_YEARS &&
                                        `for ${selectedYear}`}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
};

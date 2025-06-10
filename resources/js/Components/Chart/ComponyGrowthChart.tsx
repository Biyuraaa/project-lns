"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import { BusinessUnit, CompanyGrowthData } from "@/types";
import { TimeRangeFilter } from "../TimeRangeFilter";

interface CompanyGrowthChartProps {
    data: CompanyGrowthData[];
    businessUnits: BusinessUnit[];
    className?: string;
    selectedBusinessUnit?: string;
    onBusinessUnitChange?: (businessUnitId: string) => void;
}

export function CompanyGrowthChart({
    data,
    businessUnits,
    className,
    selectedBusinessUnit = "all",
    onBusinessUnitChange,
}: CompanyGrowthChartProps) {
    // Add time range filter state
    const [timeRange, setTimeRange] = useState<string>("6m");
    // Sort months in chronological order
    const monthOrder = [
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

    const handleBusinessUnitChange = (value: string) => {
        if (onBusinessUnitChange) {
            onBusinessUnitChange(value);
        }
    };

    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value);
    };

    // Filter data based on selected business unit and time range
    const filteredData = useMemo(() => {
        // First filter by business unit
        const buFiltered = data.filter(
            (item) =>
                selectedBusinessUnit === "all" ||
                item.business_unit_id.toString() ===
                    selectedBusinessUnit.toString()
        );

        // Then filter by time range
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let monthsToShow = 6;
        switch (timeRange) {
            case "1m":
                monthsToShow = 1;
                break;
            case "3m":
                monthsToShow = 3;
                break;
            case "6m":
                monthsToShow = 6;
                break;
            case "12m":
                monthsToShow = 12;
                break;
            case "24m":
                monthsToShow = 24;
                break;
            default:
                monthsToShow = 6;
        }

        // Calculate date range for filtering
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - monthsToShow);

        // Convert date strings to Date objects for comparison
        return buFiltered.filter((item) => {
            // Use the month and year data to filter
            const itemYear = parseInt(item.year);
            const itemMonth = monthOrder.indexOf(item.month);

            if (itemYear > currentYear) return false;
            if (itemYear === currentYear && itemMonth > currentMonth)
                return false;

            // Check if item's date is after the cutoff date
            if (itemYear < cutoffDate.getFullYear()) return false;
            if (
                itemYear === cutoffDate.getFullYear() &&
                itemMonth < cutoffDate.getMonth()
            )
                return false;

            return true;
        });
    }, [data, selectedBusinessUnit, timeRange]);

    // Group data by month for display
    const groupedChartData = useMemo(() => {
        return filteredData.reduce((acc: any[], item) => {
            // Create a unique key combining month and year
            const monthYearKey = `${item.month} ${item.year}`;

            // Find if this month already exists in the accumulator
            const existingMonth = acc.find(
                (m) => m.monthYearKey === monthYearKey
            );

            if (!existingMonth) {
                // If month doesn't exist, add it
                acc.push({
                    month: item.month,
                    year: item.year,
                    monthYearKey,
                    monthYear: item.month_year || `${item.month} ${item.year}`,
                    inquiry: item.inquiry,
                    quotation: item.quotation,
                    po: item.po,
                });
            }

            return acc;
        }, []);
    }, [filteredData]);

    const sortedChartData = useMemo(() => {
        return [...groupedChartData].sort((a, b) => {
            // Sort by year first
            if (parseInt(a.year) !== parseInt(b.year)) {
                return parseInt(a.year) - parseInt(b.year);
            }
            // If same year, sort by month
            return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
        });
    }, [groupedChartData]);

    // Format X-axis labels based on time range
    const formatXAxis = (value: string) => {
        const item = groupedChartData.find((item) => item.month === value);
        if (!item) return value;

        // For shorter ranges (1m, 3m), just show the month
        if (timeRange === "1m" || timeRange === "3m") {
            return value;
        }

        // For longer ranges, show month with year
        return `${value}'${item.year.toString().slice(2)}`;
    };

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            // Find the full month-year data for this data point
            const dataPoint = groupedChartData.find(
                (item) => item.month === label
            );
            const monthYearLabel = dataPoint ? dataPoint.monthYear : label;

            return (
                <div className="bg-white p-3 shadow-lg rounded-md border border-gray-100 max-w-[200px]">
                    <p className="font-medium text-gray-700 mb-2">
                        {monthYearLabel}
                    </p>
                    <div className="space-y-1.5">
                        {payload.map((entry: any, index: number) => (
                            <div
                                key={`item-${index}`}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-xs font-medium text-gray-600">
                                        {entry.name}:
                                    </span>
                                </div>
                                <span className="text-xs font-semibold">
                                    {entry.value}
                                </span>
                            </div>
                        ))}
                        {payload.length > 1 && (
                            <div className="pt-1.5 mt-1.5 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-600">
                                        Total:
                                    </span>
                                    <span className="text-xs font-semibold">
                                        {payload.reduce(
                                            (sum: number, entry: any) =>
                                                sum + entry.value,
                                            0
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className={cn("shadow-md border-0", className)}>
            <CardHeader className="flex flex-col gap-2 pb-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold">
                            Company Growth Selling
                        </CardTitle>
                        <CardDescription className="text-blue-100">
                            Total Inquiries until PO
                        </CardDescription>
                    </div>
                    <Select
                        value={selectedBusinessUnit}
                        onValueChange={handleBusinessUnitChange}
                    >
                        <SelectTrigger className="w-[180px] h-8 text-xs bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select Business Unit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All Business Units
                            </SelectItem>
                            {businessUnits.map((unit) => (
                                <SelectItem
                                    key={unit.id}
                                    value={unit.id.toString()}
                                >
                                    {unit.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Add the TimeRangeFilter component */}
                <TimeRangeFilter
                    selectedRange={timeRange}
                    onRangeChange={handleTimeRangeChange}
                    className="pt-1 pb-2"
                />
            </CardHeader>
            <CardContent className="pt-6">
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={sortedChartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#eaeaea"
                            />
                            <XAxis
                                dataKey="month"
                                axisLine={{ stroke: "#e5e7eb" }}
                                tickLine={false}
                                tickFormatter={formatXAxis}
                            />
                            <YAxis
                                axisLine={{ stroke: "#e5e7eb" }}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ paddingTop: 15 }}
                            />
                            {/* Bar chart for inquiries */}
                            <Bar
                                dataKey="inquiry"
                                fill="#3B82F6"
                                name="Inquiry"
                                barSize={24}
                                radius={[4, 4, 0, 0]}
                            />
                            {/* Line chart for quotations */}
                            <Line
                                dataKey="quotation"
                                stroke="#A855F7"
                                name="Quotation"
                                strokeWidth={3}
                                dot={{ r: 4, fill: "#A855F7" }}
                                activeDot={{ r: 6 }}
                                type="monotone"
                            />
                            {/* Line chart for POs */}
                            <Line
                                dataKey="po"
                                stroke="#F59E0B"
                                name="PO"
                                strokeWidth={3}
                                dot={{ r: 4, fill: "#F59E0B" }}
                                activeDot={{ r: 6 }}
                                type="monotone"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-600 space-y-1">
                            <p className="leading-relaxed">
                                <span className="font-medium">Insight:</span>{" "}
                                Menampilkan perjalanan proses penjualan dari
                                Inquiry (biru) → Quotation (ungu) → PO (kuning).
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

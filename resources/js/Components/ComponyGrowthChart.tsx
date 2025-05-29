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
import { useMemo } from "react";
import { BusinessUnit, CompanyGrowthData } from "@/types";

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
    const handleBusinessUnitChange = (value: string) => {
        if (onBusinessUnitChange) {
            onBusinessUnitChange(value);
        }
    };

    // Filter data based on selected business unit
    const filteredData = useMemo(() => {
        return data.filter(
            (item) =>
                selectedBusinessUnit === "all" ||
                item.business_unit_id.toString() ===
                    selectedBusinessUnit.toString()
        );
    }, [data, selectedBusinessUnit]);

    // Group data by month for display
    const groupedChartData = useMemo(() => {
        return filteredData.reduce((acc: any[], item) => {
            // Find if this month already exists in the accumulator
            const existingMonth = acc.find((m) => m.month === item.month);

            if (!existingMonth) {
                // If month doesn't exist, add it
                acc.push({
                    month: item.month,
                    inquiry: item.inquiry,
                    quotation: item.quotation,
                    po: item.po,
                });
            }

            return acc;
        }, []);
    }, [filteredData]);

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

    const sortedChartData = useMemo(() => {
        return [...groupedChartData].sort((a, b) => {
            return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
        });
    }, [groupedChartData]);

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-lg rounded-md border border-gray-100 max-w-[200px]">
                    <p className="font-medium text-gray-700 mb-2">{label}</p>
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
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
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
                        <SelectItem value="all">All Business Units</SelectItem>
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

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
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts";
import { cn, formatCurrency } from "@/lib/utils";
import { useMemo } from "react";
import { TopCustomerData, BusinessUnit } from "@/types";

interface TopCustomerChartProps {
    data: TopCustomerData[];
    businessUnits: BusinessUnit[];
    className?: string;
    selectedBusinessUnit?: string;
    onBusinessUnitChange?: (businessUnitId: string) => void;
}

export function TopCustomerChart({
    data,
    businessUnits,
    className,
    selectedBusinessUnit = "all",
    onBusinessUnitChange,
}: TopCustomerChartProps) {
    const handleBusinessUnitChange = (value: string) => {
        if (onBusinessUnitChange) {
            onBusinessUnitChange(value);
        }
    };

    // Filter data based on selected business unit
    const filteredData = useMemo(() => {
        if (!data || data.length === 0) return [];

        if (selectedBusinessUnit === "all") {
            // Return data that has business_unit_id = "all"
            return data.filter((item) => item.business_unit_id === "all");
        }

        // Otherwise, filter by the selected business unit
        return data.filter(
            (item) =>
                item.business_unit_id?.toString() ===
                selectedBusinessUnit.toString()
        );
    }, [data, selectedBusinessUnit]);

    // Sort by value (descending) and limit to top 10
    const chartData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];

        return [...filteredData]
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
            .map((item) => ({
                ...item,
                // Ensure value is a number
                value:
                    typeof item.value === "number"
                        ? item.value
                        : Number.parseFloat(item.value as any),
                // Already in millions from the backend
                valueInMillions:
                    typeof item.value === "number"
                        ? item.value
                        : Number.parseFloat(item.value as any),
            }));
    }, [filteredData]);

    // Calculate totals
    const totals = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return { poCount: 0, poValue: 0 };
        }

        const totalCount = filteredData.reduce(
            (sum, item) => sum + (item.poCount || 0),
            0
        );

        // Values are already in millions
        const totalValue = filteredData.reduce(
            (sum, item) => sum + (item.value || 0),
            0
        );

        // Return value in billions for display
        return {
            poCount: totalCount,
            poValue: totalValue / 1000,
        };
    }, [filteredData]);

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const customer = payload[0].payload;
            return (
                <div className="bg-white p-3 shadow-lg rounded-md border border-gray-100 max-w-[200px]">
                    <p className="font-medium text-gray-700 mb-2">
                        {customer.name}
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">
                                Total Nilai PO:
                            </span>
                            <span className="text-xs font-semibold">
                                {customer.valueInMillions.toFixed(1)} Juta
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">
                                Jumlah PO:
                            </span>
                            <span className="text-xs font-semibold">
                                {customer.poCount}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Selected business unit name
    const selectedBusinessUnitName = useMemo(() => {
        if (selectedBusinessUnit === "all") return "Semua Business Unit";
        const unit = businessUnits.find(
            (unit) => unit.id?.toString() === selectedBusinessUnit?.toString()
        );
        return unit ? unit.name : "Semua Business Unit";
    }, [selectedBusinessUnit, businessUnits]);

    // Check if we have data to display
    const hasData = chartData && chartData.length > 0;

    return (
        <Card className={cn("shadow-md border-0", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div>
                    <CardTitle className="text-base font-semibold">
                        Top 10 Pelanggan
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                        Berdasarkan total nilai Purchase Order
                    </CardDescription>
                </div>
                <Select
                    value={selectedBusinessUnit}
                    onValueChange={handleBusinessUnitChange}
                >
                    <SelectTrigger className="w-[180px] h-8 text-xs bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Pilih Business Unit">
                            {selectedBusinessUnitName}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Business Unit</SelectItem>
                        {businessUnits.map((unit) => (
                            <SelectItem
                                key={unit.id}
                                value={unit.id?.toString() || ""}
                            >
                                {unit.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="pt-6">
                {hasData ? (
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{
                                    top: 5,
                                    right: 40, // Increased for label space
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={true}
                                    vertical={false}
                                    stroke="#eaeaea"
                                />
                                <XAxis
                                    type="number"
                                    axisLine={{ stroke: "#e5e7eb" }}
                                    tickLine={false}
                                    tickFormatter={(value) =>
                                        `${value.toFixed(1)} Juta`
                                    }
                                    domain={[0, "dataMax"]}
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={{ stroke: "#e5e7eb" }}
                                    tickLine={false}
                                    width={115}
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) =>
                                        value.length > 15
                                            ? value.substring(0, 13) + "..."
                                            : value
                                    }
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="valueInMillions"
                                    name="Nilai PO"
                                    fill="#2563EB"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                >
                                    <LabelList
                                        dataKey="valueInMillions"
                                        position="right"
                                        formatter={(value: number) =>
                                            `${value.toFixed(1)} Juta`
                                        }
                                        style={{
                                            fontSize: "11px",
                                            fill: "#6B7280",
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-gray-500">
                            Tidak ada data untuk business unit yang dipilih
                        </p>
                    </div>
                )}
                {hasData && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <div className="text-xs text-gray-500 mb-1">
                                    Total Nilai PO
                                </div>
                                <div className="text-lg font-semibold text-blue-700">
                                    {totals.poValue.toFixed(1)}{" "}
                                    <span className="text-xs text-gray-500">
                                        Miliar
                                    </span>
                                </div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <div className="text-xs text-gray-500 mb-1">
                                    Total Jumlah PO
                                </div>
                                <div className="text-lg font-semibold text-purple-700">
                                    {totals.poCount}{" "}
                                    <span className="text-xs text-gray-500">
                                        Order
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

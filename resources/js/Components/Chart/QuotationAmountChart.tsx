"use client";

import React, { useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { BadgePercent, BarChart3, PieChart } from "lucide-react";
import { BusinessUnit, QuotationAmountData } from "@/types";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    TooltipProps,
    Cell,
    LabelList,
} from "recharts";

interface QuotationAmountByBusinessUnitChartProps {
    quotations: QuotationAmountData[];
    businessUnits: BusinessUnit[];
}

export function QuotationAmountChart({
    quotations,
    businessUnits,
}: QuotationAmountByBusinessUnitChartProps) {
    // Format data for the chart - simple business unit comparison
    const chartData = useMemo(() => {
        if (
            !quotations ||
            quotations.length === 0 ||
            !businessUnits ||
            businessUnits.length === 0
        ) {
            return [];
        }

        // Group quotations by business unit
        const businessUnitTotals = businessUnits.map((unit) => {
            // Get all quotations for this business unit
            const unitQuotations = quotations.filter(
                (quotation) =>
                    quotation.business_unit_id.toString() === unit.id.toString()
            );

            // Calculate total amount
            const totalAmount = unitQuotations.reduce(
                (sum, quotation) => sum + (quotation.amount || 0),
                0
            );

            return {
                name: unit.name,
                value: totalAmount,
                // Store the original business unit for reference
                businessUnit: unit,
                // Count of quotations
                count: unitQuotations.length,
                // Success rate based on status (you can adapt this if you have status in your data)
                successRate:
                    unitQuotations.length > 0
                        ? (
                              (unitQuotations.filter(
                                  (q) => q.status === "accepted"
                              ).length /
                                  unitQuotations.length) *
                              100
                          ).toFixed(1)
                        : "0.0",
            };
        });

        // Calculate total amount across all business units
        const totalAmount = businessUnitTotals.reduce(
            (sum, unit) => sum + unit.value,
            0
        );

        // Sort by amount (highest first)
        return businessUnitTotals.sort((a, b) => b.value - a.value);
    }, [quotations, businessUnits]);

    // Generate gradient colors for the bars
    const gradients = [
        ["#3182CE", "#63B3ED"], // blue gradient
        ["#805AD5", "#B794F4"], // purple gradient
        ["#38A169", "#68D391"], // green gradient
        ["#DD6B20", "#F6AD55"], // orange gradient
        ["#E53E3E", "#FC8181"], // red gradient
    ];

    // Format large numbers with Indonesian currency format
    const formatValueIDR = (value: number) => {
        // Convert to billions with "Miliar" suffix for Indonesian format
        if (value >= 1000000000) {
            return `Rp ${(value / 1000000000).toFixed(1)} Miliar`;
        }
        // Convert to millions with "Juta" suffix for Indonesian format
        if (value >= 1000000) {
            return `Rp ${(value / 1000000).toFixed(1)} Juta`;
        }
        // Convert to thousands with "Ribu" suffix for Indonesian format
        if (value >= 1000) {
            return `Rp ${(value / 1000).toFixed(1)} Ribu`;
        }
        // Format regular number with Indonesian comma/period format
        return `Rp ${value.toLocaleString("id-ID")}`;
    };

    // Format for axis tick labels (shorter)
    const formatAxisTick = (value: number) => {
        if (value >= 1000000000) {
            return `${(value / 1000000000).toFixed(1)} M`;
        }
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)} Jt`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)} Rb`;
        }
        return value.toString();
    };

    // Custom tooltip component
    const CustomTooltip = ({
        active,
        payload,
    }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 border rounded-md shadow-lg text-sm">
                    <div className="flex items-center mb-2">
                        <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: payload[0].color }}
                        ></div>
                        <p className="font-bold text-lg">{data.name}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-gray-700">
                            {data.count} quotation{data.count !== 1 ? "s" : ""}
                        </p>
                        <div className="flex items-center font-medium">
                            <span className="text-gray-700 mr-2">Total:</span>
                            <span className="text-blue-600 font-bold">
                                {formatValueIDR(data.value)}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Get total amount and quotation count
    const totalAmount = useMemo(
        () => chartData.reduce((sum, unit) => sum + unit.value, 0),
        [chartData]
    );

    const totalQuotations = useMemo(
        () => chartData.reduce((sum, unit) => sum + unit.count, 0),
        [chartData]
    );

    return (
        <Card className="w-full shadow-lg border-slate-200 overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl flex items-center text-blue-800">
                            <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                            Quotation Amount by Business Unit
                        </CardTitle>
                        <CardDescription className="mt-1 text-slate-600">
                            Total quotation amounts across different business
                            units
                        </CardDescription>
                    </div>

                    {chartData.length > 0 && (
                        <div className="flex flex-col md:flex-row gap-3 text-sm">
                            <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md flex items-center">
                                <span className="font-semibold mr-1.5">
                                    Total:
                                </span>
                                <span>{formatValueIDR(totalAmount)}</span>
                            </div>
                            <div className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-md flex items-center">
                                <span className="font-semibold mr-1.5">
                                    Quotations:
                                </span>
                                <span>{totalQuotations}</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="h-[400px]">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{
                                    top: 20,
                                    right: 40,
                                    left: 140, // More space for unit names
                                    bottom: 20,
                                }}
                            >
                                <defs>
                                    {gradients.map((colors, index) => (
                                        <linearGradient
                                            key={`gradient-${index}`}
                                            id={`gradient-${index}`}
                                            x1="0"
                                            y1="0"
                                            x2="1"
                                            y2="0"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor={colors[0]}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor={colors[1]}
                                            />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={true}
                                    vertical={false}
                                    stroke="#e5e7eb"
                                />
                                <XAxis
                                    type="number"
                                    tickFormatter={formatAxisTick}
                                    tickMargin={10}
                                    tick={{ fontSize: 12, fill: "#6b7280" }}
                                    axisLine={{ stroke: "#e5e7eb" }}
                                    tickLine={{ stroke: "#e5e7eb" }}
                                    label={{
                                        position: "insideBottom",
                                        offset: -10,
                                        style: {
                                            fill: "#4b5563",
                                            fontSize: 13,
                                            fontWeight: 500,
                                        },
                                    }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tickMargin={10}
                                    width={130}
                                    tick={{
                                        fontSize: 13,
                                        fill: "#374151",
                                        fontWeight: 500,
                                    }}
                                    axisLine={{ stroke: "#e5e7eb" }}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                                    wrapperStyle={{ outline: "none" }}
                                />
                                <Legend
                                    payload={[
                                        {
                                            value: "Nilai Quotation",
                                            type: "rect",
                                            color: "#3182CE",
                                        },
                                    ]}
                                />
                                <Bar
                                    dataKey="value"
                                    name="Nilai Quotation"
                                    radius={[0, 6, 6, 0]}
                                    barSize={35}
                                    animationDuration={2000}
                                    animationEasing="ease-out"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`url(#gradient-${
                                                index % gradients.length
                                            })`}
                                            stroke="#fff"
                                            strokeWidth={1}
                                        />
                                    ))}
                                    <LabelList
                                        dataKey="percentage"
                                        position="right"
                                        formatter={(value: any) => `${value}%`}
                                        style={{
                                            fontSize: 12,
                                            fill: "#4b5563",
                                            fontWeight: "bold",
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center flex-col bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <PieChart className="h-12 w-12 text-slate-300 mb-3" />
                            <p className="text-slate-500 text-lg font-medium">
                                Tidak ada data tersedia
                            </p>
                            <p className="text-slate-400 text-sm mt-1">
                                Belum ada quotation untuk ditampilkan
                            </p>
                        </div>
                    )}
                </div>

                {/* Summary statistics cards */}
                {chartData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {chartData.map((data, index) => (
                            <div
                                key={data.name}
                                className="bg-white rounded-lg border shadow-sm p-4 flex flex-col items-center text-center transition-all hover:shadow-md"
                                style={{
                                    borderColor:
                                        gradients[index % gradients.length][0],
                                    borderLeftWidth: "4px",
                                }}
                            >
                                <div className="w-full flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-800">
                                        {data.name}
                                    </span>
                                </div>
                                <p
                                    className="text-2xl font-bold my-1"
                                    style={{
                                        color: gradients[
                                            index % gradients.length
                                        ][0],
                                    }}
                                >
                                    {formatValueIDR(data.value)}
                                </p>
                                <div className="flex justify-between w-full text-sm mt-2 text-gray-500">
                                    <span className="flex items-center">
                                        <BadgePercent className="h-3.5 w-3.5 mr-1" />
                                        <span>
                                            {data.count} quotation
                                            {data.count !== 1 ? "s" : ""}
                                        </span>
                                    </span>
                                    <span className="text-gray-600 font-medium">
                                        Rata-rata:{" "}
                                        {data.count > 0
                                            ? formatValueIDR(
                                                  data.value / data.count
                                              ).replace("Rp ", "")
                                            : "-"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default QuotationAmountChart;

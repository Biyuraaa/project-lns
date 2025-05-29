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
    ReferenceLine,
    Area,
} from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

interface CumulativeGrowthItem {
    month: number;
    year: number;
    month_name: string;
    target: number;
    actual: number;
    difference: number;
    percentage: number;
    cumulative_target: number;
    cumulative_actual: number;
    cumulative_difference: number;
    cumulative_percentage: number;
}

interface CumulativeCompanyGrowthChartProps {
    data: CumulativeGrowthItem[];
    className?: string;
}

export function CumulativeCompanyGrowthSellingChart({
    data,
    className,
}: CumulativeCompanyGrowthChartProps) {
    // Get unique years from the data for filtering
    const years = useMemo(() => {
        const uniqueYears = [...new Set(data.map((item) => item.year))];
        return uniqueYears.sort((a, b) => b - a); // Sort in descending order to show newest first
    }, [data]);

    // Set initial state to current year if it exists in the data, otherwise "all"
    const currentYear = new Date().getFullYear().toString();
    const [selectedYear, setSelectedYear] = useState<string>(
        years.includes(parseInt(currentYear))
            ? currentYear
            : years[0]?.toString() || "all"
    );

    // Initialize selected year on component mount
    useEffect(() => {
        if (years.includes(parseInt(currentYear))) {
            setSelectedYear(currentYear);
        } else if (years.length > 0) {
            setSelectedYear(years[0].toString());
        }
    }, [years, currentYear]);

    // Filter data based only on year
    const filteredData = useMemo(() => {
        let filtered = [...data];

        // Filter by year if specified
        if (selectedYear !== "all") {
            filtered = filtered.filter(
                (item) => item.year.toString() === selectedYear
            );
        }

        // Sort by month name
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
        return filtered.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return (
                monthOrder.indexOf(a.month_name) -
                monthOrder.indexOf(b.month_name)
            );
        });
    }, [data, selectedYear]);

    // Get latest achievement percentage
    const latestAchievement = useMemo(() => {
        if (filteredData.length === 0) return 0;
        const latest = filteredData[filteredData.length - 1];
        return latest.cumulative_percentage;
    }, [filteredData]);

    // Format numbers with thousand separators
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("id-ID").format(num);
    };

    // Custom tooltip component with improved styling
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 shadow-lg rounded-md border border-gray-100 max-w-[300px]">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <span className="text-base font-semibold text-gray-800">
                            {label}
                        </span>
                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                            {payload[0]?.payload.year}
                        </span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: "#10B981" }}
                                />
                                <span className="text-xs font-medium text-gray-600">
                                    Target Kumulatif:
                                </span>
                            </div>
                            <span className="text-xs font-semibold">
                                {formatNumber(
                                    payload.find(
                                        (p: any) =>
                                            p.dataKey === "cumulative_target"
                                    )?.value || 0
                                )}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: "#F59E0B" }}
                                />
                                <span className="text-xs font-medium text-gray-600">
                                    Realisasi Kumulatif:
                                </span>
                            </div>
                            <span className="text-xs font-semibold">
                                {formatNumber(
                                    payload.find(
                                        (p: any) =>
                                            p.dataKey === "cumulative_actual"
                                    )?.value || 0
                                )}
                            </span>
                        </div>

                        {/* Monthly values */}
                        <div className="pt-2 mt-1 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className="h-3 w-3 rounded-sm"
                                        style={{ backgroundColor: "#D1FAE5" }}
                                    />
                                    <span className="text-xs font-medium text-gray-600">
                                        Target Bulanan:
                                    </span>
                                </div>
                                <span className="text-xs font-semibold">
                                    {formatNumber(
                                        payload.find(
                                            (p: any) => p.dataKey === "target"
                                        )?.value || 0
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-1.5">
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className="h-3 w-3 rounded-sm"
                                        style={{ backgroundColor: "#FEF3C7" }}
                                    />
                                    <span className="text-xs font-medium text-gray-600">
                                        Realisasi Bulanan:
                                    </span>
                                </div>
                                <span className="text-xs font-semibold">
                                    {formatNumber(
                                        payload.find(
                                            (p: any) => p.dataKey === "actual"
                                        )?.value || 0
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-600">
                                Tingkat Pencapaian:
                            </span>
                            <span
                                className={`font-semibold px-1.5 py-0.5 rounded ${
                                    payload[0]?.payload.cumulative_percentage >=
                                    100
                                        ? "bg-green-100 text-green-700"
                                        : payload[0]?.payload
                                              .cumulative_percentage >= 80
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-50 text-red-600"
                                }`}
                            >
                                {payload[0]?.payload.cumulative_percentage}%
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs mt-2">
                            <span className="font-medium text-gray-600">
                                Selisih:
                            </span>
                            <span
                                className={`font-semibold ${
                                    payload[0]?.payload.cumulative_difference >=
                                    0
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {payload[0]?.payload.cumulative_difference >= 0
                                    ? "+"
                                    : ""}
                                {formatNumber(
                                    payload[0]?.payload.cumulative_difference ||
                                        0
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Get achievement percentage color based on value
    const getAchievementColor = (percentage: number) => {
        if (percentage >= 100) return "text-emerald-500";
        if (percentage >= 80) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <Card className={cn("shadow-md border border-gray-100", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-teal-600 to-emerald-700 text-white">
                <div>
                    <CardTitle className="text-base font-semibold">
                        Target vs Realisasi Kumulatif
                    </CardTitle>
                    <CardDescription className="text-emerald-100">
                        Pencapaian progresif{" "}
                        {latestAchievement > 0 && (
                            <span
                                className={`font-medium ${getAchievementColor(
                                    latestAchievement
                                )}`}
                            >
                                ({latestAchievement}% dari target)
                            </span>
                        )}
                    </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                    <Select
                        value={selectedYear}
                        onValueChange={setSelectedYear}
                    >
                        <SelectTrigger className="w-[120px] h-8 text-xs bg-white/20 border-white/30 text-white backdrop-blur-sm">
                            <SelectValue placeholder="Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tahun</SelectItem>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={filteredData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 10,
                            }}
                        >
                            <defs>
                                <linearGradient
                                    id="targetGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#10B981"
                                        stopOpacity={0.1}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#D1FAE5"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id="actualGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#F59E0B"
                                        stopOpacity={0.2}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#FEF3C7"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#eaeaea"
                            />
                            <XAxis
                                dataKey="month_name"
                                axisLine={{ stroke: "#e5e7eb" }}
                                tickLine={false}
                                tick={{ fontSize: 12 }}
                                padding={{ left: 10, right: 10 }}
                            />
                            <YAxis
                                axisLine={{ stroke: "#e5e7eb" }}
                                tickLine={false}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => {
                                    if (value >= 1000000) {
                                        return `${(value / 1000000).toFixed(
                                            1
                                        )}M`;
                                    } else if (value >= 1000) {
                                        return `${(value / 1000).toFixed(0)}K`;
                                    }
                                    return value;
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ paddingTop: 15 }}
                                formatter={(value) => (
                                    <span className="text-xs font-medium">
                                        {value}
                                    </span>
                                )}
                            />

                            {/* Target area background */}
                            <Area
                                type="monotone"
                                dataKey="cumulative_target"
                                fill="url(#targetGradient)"
                                stroke="none"
                                activeDot={false}
                                legendType="none"
                            />

                            {/* Actual area background */}
                            <Area
                                type="monotone"
                                dataKey="cumulative_actual"
                                fill="url(#actualGradient)"
                                stroke="none"
                                activeDot={false}
                                legendType="none"
                            />

                            <Bar
                                dataKey="cumulative_target"
                                fill="#D1FAE5"
                                stroke="#10B981"
                                strokeWidth={1}
                                name="Target Kumulatif"
                                barSize={26}
                                radius={[4, 4, 0, 0]}
                            />

                            <Line
                                dataKey="cumulative_actual"
                                name="Realisasi Kumulatif"
                                stroke="#F59E0B"
                                strokeWidth={3}
                                dot={{
                                    r: 4,
                                    fill: "#F59E0B",
                                    strokeWidth: 1,
                                    stroke: "#FFFFFF",
                                }}
                                activeDot={{
                                    r: 6,
                                    fill: "#F59E0B",
                                    stroke: "#FEF3C7",
                                    strokeWidth: 2,
                                }}
                                type="monotone"
                            />

                            <Bar
                                dataKey="target"
                                fill="rgba(209, 250, 229, 0.4)"
                                name="Target Bulanan"
                                barSize={6}
                                radius={[1, 1, 0, 0]}
                            />

                            <Bar
                                dataKey="actual"
                                fill="rgba(254, 243, 199, 0.5)"
                                name="Realisasi Bulanan"
                                barSize={6}
                                radius={[1, 1, 0, 0]}
                            />

                            {filteredData.length > 0 && (
                                <ReferenceLine
                                    y={
                                        filteredData[filteredData.length - 1]
                                            .cumulative_target
                                    }
                                    stroke="#10B981"
                                    strokeDasharray="3 3"
                                    label={{
                                        value: "Target Akhir",
                                        position: "insideTopRight",
                                        fill: "#10B981",
                                        fontSize: 12,
                                        fontWeight: "500",
                                    }}
                                />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-600 space-y-1.5">
                            <p className="leading-relaxed">
                                <span className="font-medium text-gray-700">
                                    Grafik Kumulatif:
                                </span>{" "}
                                Menampilkan akumulasi target (bar hijau) dan
                                realisasi (garis kuning) penjualan. Nilai setiap
                                bulan merupakan total kumulatif dari bulan
                                Januari hingga bulan yang ditampilkan.
                            </p>
                            <p className="leading-relaxed">
                                <span className="font-medium text-gray-700">
                                    Pencapaian:
                                </span>{" "}
                                Perbandingan antara realisasi kumulatif (garis
                                kuning) dengan target kumulatif (bar hijau)
                                menunjukkan tingkat pencapaian target bisnis
                                hingga periode tertentu.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

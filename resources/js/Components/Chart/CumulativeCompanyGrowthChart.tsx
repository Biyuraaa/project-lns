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
} from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp, Filter, ChevronsUpDown, CheckIcon } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { BusinessUnit } from "@/types";

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
    business_unit: {
        id: number | string;
        name: string;
    };
}

interface CumulativeCompanyGrowthChartProps {
    data: CumulativeGrowthItem[];
    className?: string;
    businessUnits?: BusinessUnit[];
}

export function CumulativeCompanyGrowthSellingChart({
    data,
    className,
    businessUnits = [],
}: CumulativeCompanyGrowthChartProps) {
    const ALL_YEARS = "all";
    const ALL_BUSINESS_UNITS = "all";
    const years = useMemo(() => {
        if (!data || data.length === 0) return [];
        const uniqueYears = [...new Set(data.map((item) => item.year))].sort(
            (a, b) => b - a
        );
        return uniqueYears;
    }, [data]);

    const [selectedYear, setSelectedYear] = useState<string>(() => {
        const currentActualYear = new Date().getFullYear();
        if (data && data.length > 0) {
            const initialAvailableYearsFromData = [
                ...new Set(data.map((item) => item.year)),
            ].sort((a, b) => b - a);

            if (initialAvailableYearsFromData.includes(currentActualYear)) {
                return currentActualYear.toString();
            }
            if (initialAvailableYearsFromData.length > 0) {
                return initialAvailableYearsFromData[0].toString();
            }
        }
        return ALL_YEARS;
    });

    const [selectedBusinessUnit, setSelectedBusinessUnit] =
        useState<string>(ALL_BUSINESS_UNITS);
    useEffect(() => {
        const currentActualYear = new Date().getFullYear();
        if (years.length === 0) {
            if (selectedYear !== ALL_YEARS) {
                setSelectedYear(ALL_YEARS);
            }
            return;
        }
        const isSelectedYearStillPresentInGlobalYears = years
            .map((y) => y.toString())
            .includes(selectedYear);

        if (
            selectedYear !== ALL_YEARS &&
            !isSelectedYearStillPresentInGlobalYears
        ) {
            if (years.includes(currentActualYear)) {
                setSelectedYear(currentActualYear.toString());
            } else {
                setSelectedYear(years[0].toString());
            }
        } else if (selectedYear === ALL_YEARS && years.length > 0) {
            if (years.includes(currentActualYear)) {
                setSelectedYear(currentActualYear.toString());
            } else {
                setSelectedYear(years[0].toString());
            }
        }
    }, [years]);
    const filteredData = useMemo(() => {
        if (!data || data.length === 0) {
            return [];
        }
        let intermediateData = [...data];
        intermediateData = intermediateData.filter(
            (item) =>
                String(item.business_unit.id) === String(selectedBusinessUnit)
        );
        if (selectedYear !== ALL_YEARS && years.length > 0) {
            // Pastikan ada tahun yang dipilih dan tersedia
            intermediateData = intermediateData.filter(
                (item) => item.year.toString() === selectedYear
            );
        }

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
        return intermediateData.sort((a, b) => {
            if (a.year !== b.year) {
                return a.year - b.year;
            }
            return (
                monthOrder.indexOf(a.month_name) -
                monthOrder.indexOf(b.month_name)
            );
        });
    }, [data, selectedYear, selectedBusinessUnit, years]);

    const latestAchievement = useMemo(() => {
        if (filteredData.length === 0) return 0;
        const latest = filteredData[filteredData.length - 1];
        return latest.cumulative_percentage;
    }, [filteredData]);

    const formatNumber = (num: number | undefined | null) => {
        if (num === undefined || num === null || isNaN(num)) return "0";
        return new Intl.NumberFormat("id-ID").format(num);
    };

    const getSelectedBusinessUnitName = () => {
        if (selectedBusinessUnit === ALL_BUSINESS_UNITS)
            return "All Business Units";
        const unit = businessUnits.find(
            (u) => u.id.toString() === selectedBusinessUnit
        );
        return unit ? unit.name : "Unknown BU";
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const currentItem = payload[0]?.payload as
                | CumulativeGrowthItem
                | undefined;
            if (!currentItem) return null;
            return (
                <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200 text-xs">
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b">
                        <span className="text-sm font-semibold text-gray-800">
                            {label}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {currentItem.year}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                            "rgba(74, 222, 128, 0.7)" /* Warna Bar Target Kumulatif */,
                                    }}
                                />
                                <span className="font-medium text-gray-600">
                                    Target Kumulatif:
                                </span>
                            </div>
                            <span className="font-semibold">
                                {formatNumber(currentItem.cumulative_target)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                            "#F59E0B" /* Warna Garis Realisasi Kumulatif */,
                                    }}
                                />
                                <span className="font-medium text-gray-600">
                                    Realisasi Kumulatif:
                                </span>
                            </div>
                            <span className="font-semibold">
                                {formatNumber(currentItem.cumulative_actual)}
                            </span>
                        </div>
                        <div className="pt-1 mt-1 border-t">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className="h-2.5 w-2.5 rounded-sm"
                                        style={{
                                            backgroundColor:
                                                "#22C55E" /* Warna Bar Target Bulanan */,
                                        }}
                                    />
                                    <span className="font-medium text-gray-600">
                                        Target Bulanan:
                                    </span>
                                </div>
                                <span className="font-semibold">
                                    {formatNumber(currentItem.target)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                            <div className="flex items-center gap-1.5">
                                <div
                                    className="h-2.5 w-2.5 rounded-sm"
                                    style={{
                                        backgroundColor: "#FBBF24",
                                    }}
                                />
                                <span className="font-medium text-gray-600">
                                    Realisasi Bulanan:
                                </span>
                            </div>
                            <span className="font-semibold">
                                {formatNumber(currentItem.actual)}
                            </span>
                        </div>
                        <div className="mt-1.5 pt-1 border-t space-y-0.5">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-600">
                                    Pencapaian Kum.:
                                </span>
                                <span
                                    className={`font-semibold px-1 py-0.5 rounded text-xs ${
                                        currentItem.cumulative_percentage >= 100
                                            ? "bg-green-100 text-green-700"
                                            : currentItem.cumulative_percentage >=
                                              80
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {currentItem.cumulative_percentage}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-600">
                                    Selisih Kum.:
                                </span>
                                <span
                                    className={`font-semibold ${
                                        currentItem.cumulative_difference >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {currentItem.cumulative_difference >= 0
                                        ? "+"
                                        : ""}
                                    {formatNumber(
                                        currentItem.cumulative_difference
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const getAchievementColor = (percentage: number | undefined | null) => {
        if (
            percentage === undefined ||
            percentage === null ||
            isNaN(percentage)
        )
            return "text-gray-500";
        if (percentage >= 100) return "text-emerald-400";
        if (percentage >= 80) return "text-yellow-400";
        return "text-red-400";
    };

    const getChartDescription = () => {
        const yearText =
            selectedYear === ALL_YEARS || years.length === 0
                ? "semua tahun yang tersedia"
                : `${selectedYear}`;
        const businessUnitText = getSelectedBusinessUnitName();
        return `Performa penjualan kumulatif untuk ${businessUnitText} - ${yearText}`;
    };

    const barSizeCumulative = filteredData.length > 6 ? 25 : 35;

    return (
        <Card className={cn("shadow-lg border-gray-200/80", className)}>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-t-lg">
                <div className="mb-2 sm:mb-0">
                    <CardTitle className="text-lg font-semibold">
                        Target vs Realisasi Kumulatif
                    </CardTitle>
                    <CardDescription className="text-emerald-100/90 text-xs mt-1">
                        {getChartDescription()}{" "}
                        {filteredData.length > 0 && latestAchievement > 0 && (
                            <span
                                className={`font-semibold ${getAchievementColor(
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
                        value={
                            selectedYear === ALL_YEARS && years.length > 0
                                ? years[0].toString()
                                : selectedYear
                        }
                        onValueChange={setSelectedYear}
                        disabled={years.length === 0}
                    >
                        <SelectTrigger className="w-[110px] h-9 text-xs bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm focus:ring-emerald-300">
                            <SelectValue placeholder="Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                            {years.length === 0 && (
                                <SelectItem value={ALL_YEARS} disabled>
                                    Tidak ada data
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-auto min-w-[150px] max-w-[200px] h-9 text-xs bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm focus:ring-emerald-300"
                            >
                                <Filter className="h-3.5 w-3.5 text-white/80 mr-1.5" />
                                <span className="truncate">
                                    {getSelectedBusinessUnitName()}
                                </span>
                                <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-white/80 opacity-70" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[220px]">
                            <DropdownMenuItem
                                onClick={() =>
                                    setSelectedBusinessUnit(ALL_BUSINESS_UNITS)
                                }
                                className={cn(
                                    "text-xs",
                                    selectedBusinessUnit ===
                                        ALL_BUSINESS_UNITS &&
                                        "bg-accent font-medium"
                                )}
                            >
                                All Business Units
                                {selectedBusinessUnit ===
                                    ALL_BUSINESS_UNITS && (
                                    <CheckIcon className="ml-auto h-4 w-4" />
                                )}
                            </DropdownMenuItem>
                            {businessUnits?.map((unit) => (
                                <DropdownMenuItem
                                    key={unit.id}
                                    onClick={() =>
                                        setSelectedBusinessUnit(
                                            unit.id.toString()
                                        )
                                    }
                                    className={cn(
                                        "text-xs",
                                        selectedBusinessUnit ===
                                            unit.id.toString() &&
                                            "bg-accent font-medium"
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
                </div>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
                <div className="h-[350px] sm:h-[380px]">
                    {filteredData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={filteredData}
                                margin={{
                                    top: 5,
                                    right: 10,
                                    left: -10,
                                    bottom: 25,
                                }}
                                barCategoryGap="30%"
                                barGap={4}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e5e7eb"
                                />
                                <XAxis
                                    dataKey="month_name"
                                    axisLine={{ stroke: "#d1d5db" }}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: "#4b5563" }}
                                    padding={{ left: 10, right: 10 }}
                                    interval={0}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: "#4b5563" }}
                                    tickFormatter={(value) => {
                                        if (value >= 1000000000)
                                            return `${(
                                                value / 1000000000
                                            ).toFixed(1)}Mrd`;
                                        if (value >= 1000000)
                                            return `${(value / 1000000).toFixed(
                                                1
                                            )}Jt`;
                                        if (value >= 1000)
                                            return `${(value / 1000).toFixed(
                                                0
                                            )}Rb`;
                                        return value.toString();
                                    }}
                                    width={70}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{
                                        fill: "rgba(230, 230, 230, 0.3)",
                                    }}
                                />
                                <Legend
                                    iconType="circle"
                                    wrapperStyle={{
                                        paddingTop: 20,
                                        paddingBottom: 0,
                                        fontSize: "12px",
                                    }}
                                    formatter={(value, entry) => {
                                        const { color } = entry;
                                        return (
                                            <span
                                                style={{
                                                    color: color,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {value}
                                            </span>
                                        );
                                    }}
                                />
                                <Bar
                                    dataKey="cumulative_target"
                                    name="Target Kumulatif"
                                    fill="rgba(74, 222, 128, 0.4)"
                                    barSize={barSizeCumulative}
                                    radius={[4, 4, 0, 0]}
                                    legendType="circle"
                                />
                                <Line
                                    dataKey="cumulative_actual"
                                    name="Realisasi Kumulatif"
                                    stroke="#F59E0B"
                                    strokeWidth={2.5}
                                    dot={{
                                        r: 4,
                                        fill: "#F59E0B",
                                        strokeWidth: 1,
                                        stroke: "#ffffff",
                                    }}
                                    activeDot={{
                                        r: 6,
                                        fill: "#F59E0B",
                                        stroke: "#FEF3C7",
                                        strokeWidth: 2,
                                    }}
                                    type="monotone"
                                    legendType="line"
                                />
                                {filteredData.length > 0 &&
                                    filteredData[filteredData.length - 1]
                                        .cumulative_target > 0 && (
                                        <ReferenceLine
                                            y={
                                                filteredData[
                                                    filteredData.length - 1
                                                ].cumulative_target
                                            }
                                            stroke="#059669"
                                            strokeDasharray="4 4"
                                            label={{
                                                value: "Target Akhir",
                                                position: "insideTopRight",
                                                fill: "#059669",
                                                fontSize: 10,
                                                fontWeight: "600",
                                                dy: -5,
                                                dx: -5,
                                            }}
                                        />
                                    )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <Filter className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium text-base">
                                Tidak ada data untuk ditampilkan
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                                Silakan sesuaikan filter tahun atau unit bisnis,
                                atau periksa kembali sumber data Anda.
                            </p>
                        </div>
                    )}
                </div>
                {filteredData.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200/80">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-gray-600 space-y-1">
                                <p className="leading-normal">
                                    <span className="font-semibold text-gray-700">
                                        Insight:
                                    </span>{" "}
                                    Grafik ini memvisualisasikan perbandingan
                                    antara target penjualan kumulatif (bar hijau
                                    muda) dan realisasi penjualan kumulatif
                                    (garis kuning).
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ChevronLeft,
    Save,
    Calendar,
    AlertCircle,
    BarChart4,
    Target,
    CalendarDays,
    TrendingUp,
    Clock,
    Info,
    DollarSign,
    PercentIcon,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Badge } from "@/Components/ui/badge";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { CompanyGrowthSelling, PageProps } from "@/types";

interface MonthOption {
    value: number;
    label: string;
}

interface AvailableMonths {
    [key: number]: MonthOption[];
}

interface EditProps extends PageProps {
    companyGrowthSelling: CompanyGrowthSelling;
    availableMonths: AvailableMonths;
}

const CompanyGrowthSellingEdit = () => {
    const { companyGrowthSelling, availableMonths } =
        usePage<EditProps>().props;
    const currentYear = new Date().getFullYear();

    const { data, setData, put, processing, errors } = useForm({
        month: companyGrowthSelling.month,
        year: companyGrowthSelling.year,
        target: companyGrowthSelling.target.toString(),
        actual: companyGrowthSelling.actual.toString(),
        difference: companyGrowthSelling.difference,
        percentage: companyGrowthSelling.percentage,
    });

    // Find years with available months
    const availableYears = Object.keys(availableMonths)
        .filter(
            (year) =>
                availableMonths[Number(year)] &&
                availableMonths[Number(year)].length > 0
        )
        .map((year) => Number(year))
        .sort();

    // Always include the current record's year
    if (!availableYears.includes(companyGrowthSelling.year)) {
        availableYears.push(companyGrowthSelling.year);
        availableYears.sort();
    }

    // State to track available months for the selected year
    const [monthOptions, setMonthOptions] = useState<MonthOption[]>([]);

    // Update month options when year changes
    useEffect(() => {
        if (data.year === companyGrowthSelling.year) {
            // For the original year, include the original month
            let options = availableMonths[data.year] || [];
            const currentMonthExists = options.some(
                (option) => option.value === companyGrowthSelling.month
            );

            if (!currentMonthExists) {
                // Add the original month to the options
                options = [
                    ...options,
                    {
                        value: companyGrowthSelling.month,
                        label: getMonthName(companyGrowthSelling.month),
                    },
                ].sort((a, b) => a.value - b.value);
            }

            setMonthOptions(options);
        } else if (availableMonths[data.year]) {
            // For other years, just use available months
            setMonthOptions(availableMonths[data.year]);

            // If current month is not available in the new year, pick the first available month
            if (
                !availableMonths[data.year].some(
                    (option) => option.value === data.month
                )
            ) {
                if (availableMonths[data.year].length > 0) {
                    setData("month", availableMonths[data.year][0].value);
                }
            }
        } else {
            setMonthOptions([]);
        }
    }, [data.year, availableMonths, companyGrowthSelling]);

    // Calculate difference and percentage whenever target or actual change
    useEffect(() => {
        const targetValue = Number(data.target);
        const actualValue = Number(data.actual);

        if (targetValue > 0 && actualValue >= 0) {
            const newDifference = actualValue - targetValue;
            const newPercentage = Math.round((actualValue / targetValue) * 100);

            setData((prev) => ({
                ...prev,
                difference: newDifference,
                percentage: newPercentage,
            }));
        }
    }, [data.target, data.actual]);

    // Get month name
    const getMonthName = (monthNumber: number) => {
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        return months[monthNumber - 1] || "Unknown";
    };

    // Generate year options from available years
    const yearOptions = availableYears.map((year) => ({
        value: year,
        label: year.toString(),
    }));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route("targetSales.update", companyGrowthSelling.id));
    };

    const validateForm = () => {
        return (
            data.month >= 1 &&
            data.month <= 12 &&
            data.year >= 2000 &&
            data.year <= 2025 &&
            data.target !== "" &&
            Number(data.target) >= 0 &&
            data.actual !== "" &&
            Number(data.actual) >= 0
        );
    };

    // Format currency
    const formatCurrency = (value: string | number) => {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        if (isNaN(numValue)) return "0";
        return new Intl.NumberFormat().format(numValue);
    };

    // Calculate achievement class
    const getAchievementClass = () => {
        if (data.percentage >= 100) return "text-green-700";
        if (data.percentage >= 80) return "text-amber-700";
        return "text-red-700";
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Sales Target" />
            <Breadcrumb
                items={[
                    {
                        label: "Company Growth Selling",
                        href: route("targetSales.index"),
                    },
                    { label: "Edit Target" },
                ]}
            />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-indigo-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-purple-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <Target className="mr-3 h-8 w-8" />
                                    Edit Sales Target
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-indigo-100 text-lg">
                                    Update target and actual sales values for{" "}
                                    {getMonthName(data.month)} {data.year}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <BarChart4 className="h-3.5 w-3.5" />
                                        <span>Sales Target</span>
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        <span>
                                            {getMonthName(data.month)}{" "}
                                            {data.year}
                                        </span>
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-shrink-0 items-center space-x-3">
                                <Link href={route("targetSales.index")}>
                                    <Button className="shadow-lg shadow-indigo-900/30 bg-white text-indigo-700 hover:bg-indigo-50 gap-1.5 font-medium transition-all duration-200">
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>Back to Targets</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 divide-y divide-gray-200">
                                {/* Target Information Section */}
                                <div className="pb-8">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <BarChart4 className="w-5 h-5 mr-2 text-indigo-600" />
                                        Sales Performance Data
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Year Field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="year"
                                                className="text-sm font-medium"
                                            >
                                                Year{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <select
                                                    id="year"
                                                    value={data.year}
                                                    onChange={(e) =>
                                                        setData(
                                                            "year",
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className={`pl-10 w-full rounded-md border ${
                                                        errors.year
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                                    } shadow-sm py-2 text-gray-900`}
                                                >
                                                    {yearOptions.map(
                                                        (option) => (
                                                            <option
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                            {errors.year && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.year}
                                                </p>
                                            )}
                                        </div>

                                        {/* Month Field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="month"
                                                className="text-sm font-medium"
                                            >
                                                Month{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <select
                                                    id="month"
                                                    value={data.month}
                                                    onChange={(e) =>
                                                        setData(
                                                            "month",
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className={`pl-10 w-full rounded-md border ${
                                                        errors.month
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                                    } shadow-sm py-2 text-gray-900`}
                                                    disabled={
                                                        monthOptions.length ===
                                                        0
                                                    }
                                                >
                                                    {monthOptions.map(
                                                        (option) => (
                                                            <option
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                            {errors.month && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.month}
                                                </p>
                                            )}
                                            {monthOptions.length === 0 && (
                                                <p className="text-amber-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    No available months for this
                                                    year
                                                </p>
                                            )}
                                        </div>

                                        {/* Target Field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="target"
                                                className="text-sm font-medium"
                                            >
                                                Target Sales Amount{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Target className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="target"
                                                    type="number"
                                                    value={data.target}
                                                    onChange={(e) =>
                                                        setData(
                                                            "target",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`pl-10 ${
                                                        errors.target
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                                    }`}
                                                    placeholder="500000"
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                            {errors.target && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.target}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                The sales target for this period
                                            </p>
                                        </div>

                                        {/* Actual Field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="actual"
                                                className="text-sm font-medium"
                                            >
                                                Actual Sales Amount{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <DollarSign className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="actual"
                                                    type="number"
                                                    value={data.actual}
                                                    onChange={(e) =>
                                                        setData(
                                                            "actual",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`pl-10 ${
                                                        errors.actual
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                                    }`}
                                                    placeholder="0"
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                            {errors.actual && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.actual}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                The actual realized sales for
                                                this period
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <Info className="h-5 w-5 text-indigo-500" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-indigo-800">
                                                    About Month and Year
                                                    Selection
                                                </h3>
                                                <div className="mt-2 text-sm text-indigo-700">
                                                    <p>
                                                        If you select a
                                                        different month/year
                                                        combination, only
                                                        available months that
                                                        don't already have
                                                        records will be shown.
                                                        To keep the same
                                                        month/year, you can just
                                                        update the target and
                                                        actual values.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                                <Link href={route("targetSales.index")}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-gray-300 text-gray-700"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !validateForm() ||
                                        monthOptions.length === 0
                                    }
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? "Saving..." : "Update Target"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Help Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="mt-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4"
                    >
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-indigo-800">
                                    Information
                                </h3>
                                <div className="mt-2 text-sm text-indigo-700">
                                    <p>
                                        Fields marked with an asterisk (*) are
                                        mandatory. You can either update the
                                        values for the current period or change
                                        to a different available period.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default CompanyGrowthSellingEdit;

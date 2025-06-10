"use client";

import { type FormEvent, useState, useEffect } from "react";
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
    Clock,
    Info,
    Building2,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Badge } from "@/Components/ui/badge";
import { motion } from "framer-motion";
import { BusinessUnit, PageProps } from "@/types";
import { Switch } from "@/Components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { cn, formatCurrency } from "@/lib/utils";

interface MonthOption {
    value: number;
    label: string;
}

interface AvailableMonths {
    [key: number]: MonthOption[];
}

interface CreateProps extends PageProps {
    availableMonths: AvailableMonths;
    businessUnits: BusinessUnit[];
}

const CompanyGrowthSellingCreate = () => {
    const { availableMonths, businessUnits } = usePage<CreateProps>().props;
    const currentYear = new Date().getFullYear();
    const availableYears = Object.keys(availableMonths)
        .filter(
            (year) =>
                availableMonths[Number(year)] &&
                availableMonths[Number(year)].length > 0
        )
        .map((year) => Number(year))
        .sort();
    const defaultYear = availableYears.includes(currentYear)
        ? currentYear
        : availableYears.length > 0
        ? availableYears[0]
        : currentYear;
    const defaultMonth =
        availableMonths[defaultYear] && availableMonths[defaultYear].length > 0
            ? availableMonths[defaultYear][0].value
            : 1;
    const [useUniformTargets, setUseUniformTargets] = useState(true);
    const [activeTab, setActiveTab] = useState<string>(
        businessUnits.length > 0 ? businessUnits[0].id.toString() : "0"
    );
    const initialBusinessUnitTargets = businessUnits.reduce((acc, unit) => {
        acc[unit.id] = "";
        return acc;
    }, {} as Record<number, string>);

    const { data, setData, post, processing, errors } = useForm({
        month: defaultMonth,
        year: defaultYear,
        uniformTarget: null as number | null,
        businessUnitTargets: initialBusinessUnitTargets,
        useUniformTargets: true as boolean,
    });

    const [monthOptions, setMonthOptions] = useState<MonthOption[]>([]);

    useEffect(() => {
        if (availableMonths[data.year]) {
            setMonthOptions(availableMonths[data.year]);
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
    }, [data.year, availableMonths]);
    useEffect(() => {
        setData("useUniformTargets", useUniformTargets);
        if (useUniformTargets) {
            setData("uniformTarget", data.uniformTarget || 0);
        } else {
            setData("uniformTarget", 0);
        }
    }, [useUniformTargets]);
    const yearOptions = availableYears.map((year) => ({
        value: year,
        label: year.toString(),
    }));
    const handleUniformTargetChange = (value: string) => {
        setData("uniformTarget", Number(value));
        const updatedTargets = { ...data.businessUnitTargets };
        Object.keys(updatedTargets).forEach((id) => {
            updatedTargets[Number(id)] = value;
        });

        setData("businessUnitTargets", updatedTargets);
    };
    const handleBusinessUnitTargetChange = (unitId: number, value: string) => {
        const updatedTargets = { ...data.businessUnitTargets };
        updatedTargets[unitId] = value;
        setData("businessUnitTargets", updatedTargets);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const formData = {
            ...data,
            businessUnitTargets: useUniformTargets
                ? {}
                : data.businessUnitTargets,
            uniformTarget: useUniformTargets ? data.uniformTarget : "",
        };

        post(route("targetSales.store"), formData as any);
    };

    const validateForm = () => {
        if (useUniformTargets) {
            return (
                data.month >= 1 &&
                data.month <= 12 &&
                data.year >= 2000 &&
                data.year <= 2050 &&
                data.uniformTarget !== 0 &&
                Number(data.uniformTarget) >= 0
            );
        } else {
            return (
                data.month >= 1 &&
                data.month <= 12 &&
                data.year >= 2000 &&
                data.year <= 2050 &&
                Object.values(data.businessUnitTargets).every(
                    (target) => target !== "" && Number(target) >= 0
                )
            );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create New Sales Target" />
            <Breadcrumb
                items={[
                    {
                        label: "Company Growth Selling",
                        href: route("targetSales.index"),
                    },
                    { label: "Create New Target" },
                ]}
            />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-blue-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-indigo-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <Target className="mr-3 h-8 w-8" />
                                    Create New Sales Target
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                                    Set monthly targets for company growth
                                    tracking
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
                                            Today:{" "}
                                            {new Date().toLocaleDateString()}
                                        </span>
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <Building2 className="h-3.5 w-3.5" />
                                        <span>
                                            {businessUnits.length} Business
                                            Units
                                        </span>
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-shrink-0 items-center space-x-3">
                                <Link href={route("targetSales.index")}>
                                    <Button className="shadow-lg shadow-blue-900/30 bg-white text-blue-700 hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200">
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
                                {/* Date Selection Section */}
                                <div className="pb-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                                        Time Period
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
                                                            : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                    } shadow-sm py-2 text-gray-900`}
                                                >
                                                    {yearOptions.length > 0 ? (
                                                        yearOptions.map(
                                                            (option) => (
                                                                <option
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </option>
                                                            )
                                                        )
                                                    ) : (
                                                        <option value="">
                                                            No available years
                                                        </option>
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
                                                            : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                    } shadow-sm py-2 text-gray-900`}
                                                    disabled={
                                                        monthOptions.length ===
                                                        0
                                                    }
                                                >
                                                    {monthOptions.length > 0 ? (
                                                        monthOptions.map(
                                                            (option) => (
                                                                <option
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </option>
                                                            )
                                                        )
                                                    ) : (
                                                        <option value="">
                                                            No available months
                                                        </option>
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
                                    </div>
                                </div>

                                {/* Target Information Section */}
                                <div className="py-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                            <Target className="w-5 h-5 mr-2 text-blue-600" />
                                            Target Information
                                        </h2>

                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">
                                                {useUniformTargets
                                                    ? "Same target for all units"
                                                    : "Custom targets per unit"}
                                            </span>
                                            <Switch
                                                checked={useUniformTargets}
                                                onCheckedChange={(checked) => {
                                                    setUseUniformTargets(
                                                        checked
                                                    );
                                                }}
                                                className="data-[state=checked]:bg-blue-600"
                                            />
                                        </div>
                                    </div>

                                    {useUniformTargets ? (
                                        <div className="space-y-4">
                                            {/* Uniform Target Input */}
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="uniformTarget"
                                                    className="text-sm font-medium"
                                                >
                                                    Target Sales Amount (All
                                                    Business Units){" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Target className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <Input
                                                        id="uniformTarget"
                                                        type="number"
                                                        value={
                                                            data.uniformTarget ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleUniformTargetChange(
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 ${
                                                            errors.uniformTarget
                                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                        }`}
                                                        placeholder="500000"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                                {errors.uniformTarget && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        {errors.uniformTarget}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Enter the full amount in
                                                    Indonesian Rupiah (IDR).
                                                </p>
                                            </div>

                                            {/* Business Unit Preview */}
                                            <div className="mt-4 border border-gray-200 rounded-md p-4 bg-gray-50">
                                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                                    Business Units Preview
                                                </h3>
                                                <div className="space-y-2">
                                                    {businessUnits.map(
                                                        (unit) => (
                                                            <div
                                                                key={unit.id}
                                                                className="flex justify-between items-center p-2 bg-white rounded border border-gray-200"
                                                            >
                                                                <span className="text-sm font-medium">
                                                                    {unit.name}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-blue-700 bg-blue-50 border-blue-200"
                                                                >
                                                                    Target:{" "}
                                                                    {formatCurrency(
                                                                        data.uniformTarget ||
                                                                            0
                                                                    )}
                                                                </Badge>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Per Business Unit Targets */}
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <Tabs
                                                    defaultValue={activeTab}
                                                    value={activeTab}
                                                    onValueChange={setActiveTab}
                                                    className="w-full"
                                                >
                                                    <div className="bg-gray-50 border-b border-gray-200 px-2">
                                                        <TabsList className="h-auto bg-transparent flex flex-wrap">
                                                            {businessUnits.map(
                                                                (unit) => (
                                                                    <TabsTrigger
                                                                        key={
                                                                            unit.id
                                                                        }
                                                                        value={unit.id.toString()}
                                                                        className={cn(
                                                                            "py-2 px-4 text-sm rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent",
                                                                            activeTab ===
                                                                                unit.id.toString()
                                                                                ? "text-blue-700 font-medium"
                                                                                : "text-gray-600"
                                                                        )}
                                                                    >
                                                                        {
                                                                            unit.name
                                                                        }
                                                                    </TabsTrigger>
                                                                )
                                                            )}
                                                        </TabsList>
                                                    </div>

                                                    {businessUnits.map(
                                                        (unit) => (
                                                            <TabsContent
                                                                key={unit.id}
                                                                value={unit.id.toString()}
                                                                className="p-4 bg-white focus-visible:outline-none focus-visible:ring-0"
                                                            >
                                                                <div className="space-y-4">
                                                                    <h3 className="font-medium">
                                                                        {
                                                                            unit.name
                                                                        }{" "}
                                                                        - Target
                                                                        Setting
                                                                    </h3>

                                                                    <div className="space-y-2">
                                                                        <Label
                                                                            htmlFor={`target-${unit.id}`}
                                                                            className="text-sm font-medium"
                                                                        >
                                                                            Target
                                                                            Sales
                                                                            Amount{" "}
                                                                            <span className="text-red-500">
                                                                                *
                                                                            </span>
                                                                        </Label>
                                                                        <div className="relative">
                                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                                <Target className="h-4 w-4 text-gray-400" />
                                                                            </div>
                                                                            <Input
                                                                                id={`target-${unit.id}`}
                                                                                type="number"
                                                                                value={
                                                                                    data
                                                                                        .businessUnitTargets[
                                                                                        unit
                                                                                            .id
                                                                                    ] ||
                                                                                    ""
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    handleBusinessUnitTargetChange(
                                                                                        unit.id,
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                className="pl-10"
                                                                                placeholder="500000"
                                                                                min="0"
                                                                                required
                                                                            />
                                                                        </div>
                                                                        {errors
                                                                            .businessUnitTargets?.[
                                                                            unit
                                                                                .id
                                                                        ] && (
                                                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                                                {
                                                                                    errors
                                                                                        .businessUnitTargets[
                                                                                        unit
                                                                                            .id
                                                                                    ]
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TabsContent>
                                                        )
                                                    )}
                                                </Tabs>
                                            </div>

                                            {/* Summary of All Targets */}
                                            <div className="mt-4 border border-gray-200 rounded-md p-4 bg-gray-50">
                                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                                    Summary of Custom Targets
                                                </h3>
                                                <div className="space-y-2">
                                                    {businessUnits.map(
                                                        (unit) => (
                                                            <div
                                                                key={unit.id}
                                                                className="flex justify-between items-center p-2 bg-white rounded border border-gray-200"
                                                            >
                                                                <span className="text-sm font-medium">
                                                                    {unit.name}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        data
                                                                            .businessUnitTargets[
                                                                            unit
                                                                                .id
                                                                        ]
                                                                            ? "text-blue-700 bg-blue-50 border-blue-200"
                                                                            : "text-amber-700 bg-amber-50 border-amber-200"
                                                                    }
                                                                >
                                                                    {data
                                                                        .businessUnitTargets[
                                                                        unit.id
                                                                    ]
                                                                        ? `Target: ${formatCurrency(
                                                                              Number(
                                                                                  data
                                                                                      .businessUnitTargets[
                                                                                      unit
                                                                                          .id
                                                                                  ]
                                                                              )
                                                                          )}`
                                                                        : "Not set"}
                                                                </Badge>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <Info className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-blue-800">
                                                    Target Setting Options
                                                </h3>
                                                <div className="mt-2 text-sm text-blue-700">
                                                    <p>
                                                        You can set either the
                                                        same target for all
                                                        business units, or
                                                        customize targets for
                                                        each unit individually.
                                                        Toggle the switch above
                                                        to change between these
                                                        options.
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
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? "Saving..." : "Save Target"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Help Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4"
                    >
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Information
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        Fields marked with an asterisk (*) are
                                        mandatory. You can only create records
                                        for months that don't already exist in
                                        the database.
                                    </p>
                                    <p className="mt-1">
                                        Actual sales data can be updated later
                                        when the information becomes available.
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

export default CompanyGrowthSellingCreate;

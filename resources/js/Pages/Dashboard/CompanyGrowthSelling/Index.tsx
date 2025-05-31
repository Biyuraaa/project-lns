"use client";

import type { BusinessUnit, PageProps } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
import { usePagination } from "@/hooks/use-pagination";
import { Pagination } from "@/Components/Pagination";
import { Input } from "@/Components/ui/input";
import {
    Search,
    Filter,
    ChevronDown,
    Edit,
    Trash2,
    Plus,
    CalendarDays,
    ArrowUp,
    ArrowDown,
    BarChart4,
    Target,
    MoreHorizontal,
    ChevronRight,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { useForm } from "@inertiajs/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import React from "react";

// Extended interface for business unit details
interface BusinessUnitDetail {
    id: number;
    business_unit_id: number;
    business_unit_name: string;
    month: number;
    year: number;
    target: number;
    actual: number;
    difference: number;
    percentage: number;
}

// Updated CompanyGrowthSelling type to include business units and summary flag
interface CompanyGrowthSelling {
    id: string | number;
    month: number;
    year: number;
    target: number;
    actual: number;
    difference: number;
    percentage: number;
    is_summary: boolean;
    business_units?: BusinessUnitDetail[];
}

interface CompanyGrowthSellingIndexProps extends PageProps {
    companyGrowthSellings: CompanyGrowthSelling[];
    businessUnits: BusinessUnit[];
}

const CompanyGrowthSellingIndex = () => {
    const { companyGrowthSellings, businessUnits } =
        usePage<CompanyGrowthSellingIndexProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<string>("year");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [showFilters, setShowFilters] = useState(false);
    const [yearFilter, setYearFilter] = useState<number | string>("all");
    const [businessUnitFilter, setBusinessUnitFilter] = useState<
        number | string
    >("all");

    // State to track expanded rows for business unit details
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Toggle row expansion
    const toggleRowExpansion = (rowId: string) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(rowId)) {
            newExpandedRows.delete(rowId);
        } else {
            newExpandedRows.add(rowId);
        }
        setExpandedRows(newExpandedRows);
    };

    // Format month number to name
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

    // Get available years from data
    const availableYears = useMemo(() => {
        const years = [
            ...new Set(companyGrowthSellings.map((item) => item.year)),
        ];
        return years.sort((a, b) => b - a); // Sort years in descending order
    }, [companyGrowthSellings]);

    // Filter data based on search term, year, and business unit
    const filteredData = useMemo(() => {
        return companyGrowthSellings.filter((item) => {
            // Search term matching
            const matchesSearch =
                getMonthName(item.month)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                item.year.toString().includes(searchTerm.toLowerCase()) ||
                item.target.toString().includes(searchTerm.toLowerCase()) ||
                item.actual.toString().includes(searchTerm.toLowerCase());

            // Year filter matching
            const matchesYear =
                yearFilter === "all" || item.year === Number(yearFilter);

            // Business unit filter (only applies to detailed view)
            let matchesBusinessUnit = true;
            if (businessUnitFilter !== "all" && item.business_units) {
                // For summary rows, check if they have the filtered business unit
                matchesBusinessUnit = item.business_units.some(
                    (unit) =>
                        unit.business_unit_id === Number(businessUnitFilter)
                );
            }

            return matchesSearch && matchesYear && matchesBusinessUnit;
        });
    }, [companyGrowthSellings, searchTerm, yearFilter, businessUnitFilter]);

    // Sort data
    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            let aValue, bValue;

            // Handle different fields for sorting
            if (sortField === "month") {
                // For month field, sort by year first, then month
                if (a.year !== b.year) {
                    aValue = a.year;
                    bValue = b.year;
                } else {
                    aValue = a.month;
                    bValue = b.month;
                }
            } else {
                aValue = a[sortField as keyof CompanyGrowthSelling];
                bValue = b[sortField as keyof CompanyGrowthSelling];
            }

            // Handle numeric sorting
            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortDirection === "asc"
                    ? aValue - bValue
                    : bValue - aValue;
            }

            // Convert to string for other types
            aValue = String(aValue).toLowerCase();
            bValue = String(bValue).toLowerCase();

            return sortDirection === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });
    }, [filteredData, sortField, sortDirection]);

    // Initialize pagination
    const pagination = usePagination({
        totalItems: sortedData.length,
        itemsPerPage,
    });

    // Get current page data
    const currentData = pagination.paginateData(sortedData);

    // Handle sort
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Reset to first page when search term, year filter, or business unit filter changes
    useEffect(() => {
        pagination.goToFirstPage();
    }, [searchTerm, yearFilter, businessUnitFilter]);

    // Delete handler
    const { delete: destroy } = useForm({});

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this record?")) {
            destroy(route("targetSales.destroy", id), {
                onSuccess: () => {
                    console.log("Record deleted successfully.");
                },
                onError: (errors) => {
                    console.error("Error deleting record:", errors);
                },
            });
        }
    };

    // Format numbers with commas
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat().format(num);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Company Growth Selling" />
            <Breadcrumb items={[{ label: "Company Growth Selling" }]} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-blue-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-indigo-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <BarChart4 className="mr-3 h-8 w-8" />
                                    Company Growth Selling
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                                    Track sales targets and actual performance
                                    over time
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <Target className="h-3.5 w-3.5" />
                                        <span>
                                            {companyGrowthSellings.length}{" "}
                                            Records
                                        </span>
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        <span>Last updated: Today</span>
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-shrink-0 items-center space-x-3">
                                <Link href={route("targetSales.create")}>
                                    <Button className="shadow-lg shadow-blue-900/30 bg-white text-blue-700 hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200">
                                        <Plus className="h-4 w-4" />
                                        <span>Add New Target</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="Search by month, year or values..."
                                        className="pl-10 w-full bg-gray-50 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 items-center">
                                <Button
                                    variant="outline"
                                    className="border-gray-200 text-gray-600 h-9"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                    <ChevronDown
                                        className={`ml-2 h-4 w-4 transition-transform ${
                                            showFilters ? "rotate-180" : ""
                                        }`}
                                    />
                                </Button>

                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">
                                        Year:
                                    </span>
                                    <select
                                        className="h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={yearFilter}
                                        onChange={(e) =>
                                            setYearFilter(e.target.value)
                                        }
                                    >
                                        <option value="all">All Years</option>
                                        {availableYears.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">
                                        Show:
                                    </span>
                                    <select
                                        className="h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(
                                                Number(e.target.value)
                                            );
                                            pagination.goToFirstPage();
                                        }}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Extended filters */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sort By
                                            </label>
                                            <select
                                                className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={sortField}
                                                onChange={(e) =>
                                                    setSortField(e.target.value)
                                                }
                                            >
                                                <option value="month">
                                                    Month
                                                </option>
                                                <option value="year">
                                                    Year
                                                </option>
                                                <option value="target">
                                                    Target
                                                </option>
                                                <option value="actual">
                                                    Actual
                                                </option>
                                                <option value="percentage">
                                                    Achievement
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sort Direction
                                            </label>
                                            <select
                                                className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={sortDirection}
                                                onChange={(e) =>
                                                    setSortDirection(
                                                        e.target.value as
                                                            | "asc"
                                                            | "desc"
                                                    )
                                                }
                                            >
                                                <option value="asc">
                                                    Ascending
                                                </option>
                                                <option value="desc">
                                                    Descending
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSearchTerm("");
                                                setSortField("year");
                                                setSortDirection("desc");
                                                setYearFilter("all");
                                                setBusinessUnitFilter("all");
                                                setExpandedRows(new Set());
                                            }}
                                        >
                                            Reset Filters
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Results Summary */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-500">
                            Showing {currentData.length} of{" "}
                            {filteredData.length} records
                            {searchTerm && (
                                <span>
                                    {" "}
                                    for "<strong>{searchTerm}</strong>"
                                </span>
                            )}
                            {yearFilter !== "all" && (
                                <span>
                                    {" "}
                                    in year <strong>{yearFilter}</strong>
                                </span>
                            )}
                            {businessUnitFilter !== "all" && (
                                <span>
                                    {" "}
                                    for{" "}
                                    <strong>
                                        {
                                            businessUnits.find(
                                                (bu) =>
                                                    bu.id.toString() ===
                                                    businessUnitFilter.toString()
                                            )?.name
                                        }
                                    </strong>
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="pl-6 py-3 w-12"></th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("month")}
                                        >
                                            <div className="flex items-center">
                                                Month / Year
                                                {sortField === "month" && (
                                                    <span className="ml-1">
                                                        {sortDirection ===
                                                        "asc" ? (
                                                            <ArrowUp className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowDown className="h-3 w-3" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>

                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("target")}
                                        >
                                            <div className="flex items-center">
                                                Target
                                                {sortField === "target" && (
                                                    <span className="ml-1">
                                                        {sortDirection ===
                                                        "asc" ? (
                                                            <ArrowUp className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowDown className="h-3 w-3" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>

                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("actual")}
                                        >
                                            <div className="flex items-center">
                                                Actual
                                                {sortField === "actual" && (
                                                    <span className="ml-1">
                                                        {sortDirection ===
                                                        "asc" ? (
                                                            <ArrowUp className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowDown className="h-3 w-3" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>

                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() =>
                                                handleSort("difference")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Difference
                                                {sortField === "difference" && (
                                                    <span className="ml-1">
                                                        {sortDirection ===
                                                        "asc" ? (
                                                            <ArrowUp className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowDown className="h-3 w-3" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>

                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() =>
                                                handleSort("percentage")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Achievement
                                                {sortField === "percentage" && (
                                                    <span className="ml-1">
                                                        {sortDirection ===
                                                        "asc" ? (
                                                            <ArrowUp className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowDown className="h-3 w-3" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentData.length > 0 ? (
                                        // Render all main rows and their child rows if expanded
                                        currentData.map((item, index) => (
                                            <React.Fragment key={item.id}>
                                                <motion.tr
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{
                                                        delay: index * 0.05,
                                                        duration: 0.2,
                                                    }}
                                                    className={`hover:bg-gray-50 transition-colors ${
                                                        expandedRows.has(
                                                            item.id.toString()
                                                        )
                                                            ? "bg-blue-50"
                                                            : ""
                                                    }`}
                                                >
                                                    <td className="pl-6 py-4">
                                                        {item.business_units &&
                                                            item.business_units
                                                                .length > 0 && (
                                                                <button
                                                                    onClick={() =>
                                                                        toggleRowExpansion(
                                                                            item.id.toString()
                                                                        )
                                                                    }
                                                                    className="p-1 rounded-full hover:bg-blue-100 transition-colors"
                                                                >
                                                                    <ChevronRight
                                                                        className={`h-4 w-4 text-blue-600 transform transition-transform duration-200 ${
                                                                            expandedRows.has(
                                                                                item.id.toString()
                                                                            )
                                                                                ? "rotate-90"
                                                                                : ""
                                                                        }`}
                                                                    />
                                                                </button>
                                                            )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <div className="text-sm font-medium text-blue-600">
                                                                {getMonthName(
                                                                    item.month
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {item.year}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-1 bg-blue-500 rounded-sm mr-3"></div>
                                                            <span className="text-sm text-gray-900 font-medium">
                                                                {formatNumber(
                                                                    item.target
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-1 bg-red-500 rounded-sm mr-3"></div>
                                                            <span className="text-sm text-gray-900 font-medium">
                                                                {formatNumber(
                                                                    item.actual
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div
                                                            className={`text-sm font-medium ${
                                                                item.difference >=
                                                                0
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }`}
                                                        >
                                                            {item.difference >=
                                                            0
                                                                ? "+"
                                                                : ""}
                                                            {formatNumber(
                                                                item.difference
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                item.percentage >=
                                                                100
                                                                    ? "bg-green-100 text-green-800"
                                                                    : item.percentage >=
                                                                      80
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            {item.percentage}%
                                                        </div>
                                                    </td>
                                                </motion.tr>

                                                {/* Expandable detail rows for business units */}
                                                {expandedRows.has(
                                                    item.id.toString()
                                                ) &&
                                                    item.business_units && (
                                                        <AnimatePresence>
                                                            <motion.tr
                                                                initial={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    height: "auto",
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                }}
                                                                transition={{
                                                                    duration: 0.2,
                                                                }}
                                                                className="bg-gray-50"
                                                            >
                                                                <td
                                                                    colSpan={7}
                                                                    className="px-4 py-4"
                                                                >
                                                                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                                                                        <table className="min-w-full divide-y divide-gray-200">
                                                                            <thead className="bg-gray-100">
                                                                                <tr>
                                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                        Business
                                                                                        Unit
                                                                                    </th>
                                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                        Target
                                                                                    </th>
                                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                        Actual
                                                                                    </th>
                                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                        Difference
                                                                                    </th>
                                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                        Achievement
                                                                                    </th>
                                                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                        Actions
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                                {item.business_units.map(
                                                                                    (
                                                                                        unit
                                                                                    ) => (
                                                                                        <tr
                                                                                            key={
                                                                                                unit.id
                                                                                            }
                                                                                            className="hover:bg-gray-50"
                                                                                        >
                                                                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">
                                                                                                {
                                                                                                    unit.business_unit_name
                                                                                                }
                                                                                            </td>
                                                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                                                                {formatNumber(
                                                                                                    unit.target
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                                                                {formatNumber(
                                                                                                    unit.actual
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                                                                <span
                                                                                                    className={`font-medium ${
                                                                                                        unit.difference >=
                                                                                                        0
                                                                                                            ? "text-green-600"
                                                                                                            : "text-red-600"
                                                                                                    }`}
                                                                                                >
                                                                                                    {unit.difference >=
                                                                                                    0
                                                                                                        ? "+"
                                                                                                        : ""}
                                                                                                    {formatNumber(
                                                                                                        unit.difference
                                                                                                    )}
                                                                                                </span>
                                                                                            </td>
                                                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                                                <div
                                                                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                                                        unit.percentage >=
                                                                                                        100
                                                                                                            ? "bg-green-100 text-green-800"
                                                                                                            : unit.percentage >=
                                                                                                              80
                                                                                                            ? "bg-yellow-100 text-yellow-800"
                                                                                                            : "bg-red-100 text-red-800"
                                                                                                    }`}
                                                                                                >
                                                                                                    {
                                                                                                        unit.percentage
                                                                                                    }

                                                                                                    %
                                                                                                </div>
                                                                                            </td>
                                                                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                                                                                <DropdownMenu>
                                                                                                    <DropdownMenuTrigger
                                                                                                        asChild
                                                                                                    >
                                                                                                        <Button
                                                                                                            variant="outline"
                                                                                                            size="sm"
                                                                                                            className="h-7 w-7 p-0 border-gray-200"
                                                                                                        >
                                                                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                                                                            <span className="sr-only">
                                                                                                                Open
                                                                                                                menu
                                                                                                            </span>
                                                                                                        </Button>
                                                                                                    </DropdownMenuTrigger>
                                                                                                    <DropdownMenuContent
                                                                                                        align="end"
                                                                                                        className="w-[160px]"
                                                                                                    >
                                                                                                        <DropdownMenuLabel>
                                                                                                            Actions
                                                                                                        </DropdownMenuLabel>
                                                                                                        <DropdownMenuSeparator />
                                                                                                        <DropdownMenuItem
                                                                                                            asChild
                                                                                                        >
                                                                                                            <Link
                                                                                                                href={route(
                                                                                                                    "targetSales.edit",
                                                                                                                    unit.id
                                                                                                                )}
                                                                                                                className="cursor-pointer flex items-center w-full"
                                                                                                            >
                                                                                                                <Edit className="h-4 w-4 mr-2" />
                                                                                                                Edit
                                                                                                            </Link>
                                                                                                        </DropdownMenuItem>
                                                                                                        <DropdownMenuSeparator />
                                                                                                        <DropdownMenuItem
                                                                                                            className="text-red-600 focus:text-red-700 cursor-pointer"
                                                                                                            onClick={() =>
                                                                                                                handleDelete(
                                                                                                                    unit.id
                                                                                                                )
                                                                                                            }
                                                                                                        >
                                                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                                                            Delete
                                                                                                        </DropdownMenuItem>
                                                                                                    </DropdownMenuContent>
                                                                                                </DropdownMenu>
                                                                                            </td>
                                                                                        </tr>
                                                                                    )
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        </AnimatePresence>
                                                    )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <BarChart4 className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        {searchTerm ||
                                                        yearFilter !== "all" ||
                                                        businessUnitFilter !==
                                                            "all"
                                                            ? "No records found matching your filters"
                                                            : "No records available yet"}
                                                    </h3>
                                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                                        {searchTerm ||
                                                        yearFilter !== "all" ||
                                                        businessUnitFilter !==
                                                            "all"
                                                            ? "Try adjusting your search criteria or clear filters to see all records"
                                                            : "Create your first record to start tracking company growth"}
                                                    </p>

                                                    {!searchTerm &&
                                                    yearFilter === "all" &&
                                                    businessUnitFilter ===
                                                        "all" ? (
                                                        <Link
                                                            href={route(
                                                                "targetSales.create"
                                                            )}
                                                        >
                                                            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                                                                <Plus className="h-4 w-4" />
                                                                Add New Target
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSearchTerm(
                                                                    ""
                                                                );
                                                                setYearFilter(
                                                                    "all"
                                                                );
                                                                setBusinessUnitFilter(
                                                                    "all"
                                                                );
                                                            }}
                                                            className="border-gray-200"
                                                        >
                                                            Clear Filters
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {filteredData.length > 0 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={pagination.goToPage}
                                totalItems={filteredData.length}
                                startIndex={pagination.startIndex}
                                endIndex={Math.min(
                                    pagination.endIndex,
                                    filteredData.length - 1
                                )}
                                getPageNumbers={pagination.getPageNumbers}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default CompanyGrowthSellingIndex;

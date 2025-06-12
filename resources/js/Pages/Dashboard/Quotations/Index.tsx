"use client";

import type { PageProps, Quotation } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { usePagination } from "@/hooks/use-pagination";
import { Pagination } from "@/Components/Pagination";
import { Input } from "@/Components/ui/input";
import {
    Search,
    Filter,
    ChevronDown,
    Edit,
    Trash2,
    Eye,
    CalendarDays,
    FileText,
    ArrowUp,
    ArrowDown,
    FileCheck,
    FileSpreadsheet,
    Download,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    Calendar,
    MoreVertical,
    DollarSign,
    Building,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { useForm } from "@inertiajs/react";
import {
    format,
    startOfDay,
    endOfDay,
    isWithinInterval,
    subMonths,
    subYears,
    isAfter,
    isBefore,
    isEqual,
    parseISO,
    isValid,
} from "date-fns";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

interface QuotationsIndexPageProps extends PageProps {
    quotations: Quotation[];
}

const QuotationsIndex = () => {
    const { quotations } = usePage<QuotationsIndexPageProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<keyof Quotation>("code");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [businessUnitFilter, setBusinessUnitFilter] = useState("");

    // Date filter states
    const [dateFilterType, setDateFilterType] = useState<string>("all"); // all, 1month, 3months, 6months, 1year, custom
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");

    // Format date for summary display safely
    const formatDateSafe = (dateString: string) => {
        if (!dateString) return null;
        try {
            const date = parseISO(dateString);
            if (!isValid(date)) return null;
            return format(date, "MMM dd, yyyy");
        } catch (error) {
            return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "n/a":
                return (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>N/A</span>
                    </Badge>
                );
            case "val":
                return (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Validated</span>
                    </Badge>
                );
            case "lost":
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        <span>Lost</span>
                    </Badge>
                );
            case "wip":
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Work in Progress</span>
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-slate-100 text-slate-800 border-slate-200">
                        {status}
                    </Badge>
                );
        }
    };

    // Get unique business units from quotations
    const getBusinessUnits = () => {
        const businessUnits = new Set();
        quotations.forEach((quotation) => {
            if (quotation.inquiry?.business_unit?.name) {
                businessUnits.add(quotation.inquiry.business_unit.name);
            }
        });
        return Array.from(businessUnits) as string[];
    };

    // Filter quotations based on search term, status, business unit and date
    const filteredQuotations = quotations.filter((quotation) => {
        const matchesSearch =
            quotation.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quotation.inquiry?.code
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            quotation.inquiry?.customer?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "" || quotation.status === statusFilter;

        const matchesBusinessUnit =
            businessUnitFilter === "" ||
            quotation.inquiry?.business_unit?.name === businessUnitFilter;

        // Date filtering logic based on dateFilterType
        let matchesDate = true;

        if (quotation.due_date) {
            try {
                const quotationDate = new Date(quotation.due_date);
                if (!isValid(quotationDate)) return false;

                const today = new Date();

                switch (dateFilterType) {
                    case "1month":
                        matchesDate = isWithinInterval(quotationDate, {
                            start: startOfDay(subMonths(today, 1)),
                            end: endOfDay(today),
                        });
                        break;
                    case "3months":
                        matchesDate = isWithinInterval(quotationDate, {
                            start: startOfDay(subMonths(today, 3)),
                            end: endOfDay(today),
                        });
                        break;
                    case "6months":
                        matchesDate = isWithinInterval(quotationDate, {
                            start: startOfDay(subMonths(today, 6)),
                            end: endOfDay(today),
                        });
                        break;
                    case "1year":
                        matchesDate = isWithinInterval(quotationDate, {
                            start: startOfDay(subYears(today, 1)),
                            end: endOfDay(today),
                        });
                        break;
                    case "custom":
                        if (customStartDate && customEndDate) {
                            const startDate = startOfDay(
                                parseISO(customStartDate)
                            );
                            const endDate = endOfDay(parseISO(customEndDate));

                            if (isValid(startDate) && isValid(endDate)) {
                                matchesDate = isWithinInterval(quotationDate, {
                                    start: startDate,
                                    end: endDate,
                                });
                            }
                        } else if (customStartDate) {
                            const startDate = startOfDay(
                                parseISO(customStartDate)
                            );
                            if (isValid(startDate)) {
                                matchesDate =
                                    isAfter(quotationDate, startDate) ||
                                    isEqual(quotationDate, startDate);
                            }
                        } else if (customEndDate) {
                            const endDate = endOfDay(parseISO(customEndDate));
                            if (isValid(endDate)) {
                                matchesDate =
                                    isBefore(quotationDate, endDate) ||
                                    isEqual(quotationDate, endDate);
                            }
                        }
                        break;
                    default: // 'all'
                        matchesDate = true;
                }
            } catch (error) {
                console.error("Date filtering error:", error);
                matchesDate = true;
            }
        }

        return (
            matchesSearch && matchesStatus && matchesBusinessUnit && matchesDate
        );
    });

    // Sort quotations
    const sortedQuotations = [...filteredQuotations].sort((a, b) => {
        if (sortField === "due_date") {
            const dateA = new Date(a.due_date || "");
            const dateB = new Date(b.due_date || "");

            if (!isValid(dateA) || !isValid(dateB)) return 0;

            return sortDirection === "asc"
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
        }

        if (sortField === "created_at") {
            const dateA = new Date(a.created_at || "");
            const dateB = new Date(b.created_at || "");

            if (!isValid(dateA) || !isValid(dateB)) return 0;

            return sortDirection === "asc"
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
        }

        if (sortField === "amount") {
            const amountA = a.amount || 0;
            const amountB = b.amount || 0;

            return sortDirection === "asc"
                ? amountA - amountB
                : amountB - amountA;
        }

        if (a[sortField] === undefined || b[sortField] === undefined) return 0;

        const aValue = a[sortField]?.toString().toLowerCase() || "";
        const bValue = b[sortField]?.toString().toLowerCase() || "";

        if (sortDirection === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Initialize pagination
    const pagination = usePagination({
        totalItems: sortedQuotations.length,
        itemsPerPage,
    });

    // Get current page data
    const currentQuotations = pagination.paginateData(sortedQuotations);

    // Handle sort
    const handleSort = (field: keyof Quotation) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Reset to first page when search term or status filter changes
    useEffect(() => {
        pagination.goToFirstPage();
    }, [
        searchTerm,
        statusFilter,
        businessUnitFilter,
        dateFilterType,
        customStartDate,
        customEndDate,
    ]);

    // Handle file icon based on extension
    const getFileIcon = (filename: string) => {
        if (!filename) return <FileText className="h-4 w-4 text-gray-500" />;

        const extension = filename.split(".").pop()?.toLowerCase();

        switch (extension) {
            case "pdf":
                return <FileText className="h-4 w-4 text-red-500" />;
            case "doc":
            case "docx":
                return <FileText className="h-4 w-4 text-blue-500" />;
            case "xls":
            case "xlsx":
                return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const { delete: destroy } = useForm({});

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this quotation?")) {
            destroy(route("quotations.destroy", id), {
                onSuccess: () => {
                    console.log("Quotation deleted successfully.");
                },
                onError: (errors) => {
                    console.error("Error deleting quotation:", errors);
                },
            });
        }
    };

    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("");
        setBusinessUnitFilter("");
        setSortField("code");
        setSortDirection("desc");
        setDateFilterType("all");
        setCustomStartDate("");
        setCustomEndDate("");
    };

    return (
        <AuthenticatedLayout>
            <Breadcrumb items={[{ label: "Quotation Management" }]} />
            <Head title="Quotation Management" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-amber-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-orange-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <FileCheck className="mr-3 h-8 w-8" />
                                    Quotation Management
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-amber-100 text-lg">
                                    Monitor and manage all quotations in the
                                    system
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>
                                            {quotations.length} Total Quotations
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
                            <div className="flex-shrink-0">
                                <Link href={route("quotations.create")}>
                                    <Button className="shadow-lg shadow-amber-900/30 bg-white text-amber-700 hover:bg-amber-50 gap-1.5 font-medium transition-all duration-200">
                                        <Plus className="h-4 w-4" />
                                        <span>Create New Quotation</span>
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
                                        placeholder="Search quotations by code or customer..."
                                        className="pl-10 w-full bg-gray-50 border-gray-200 focus:ring-amber-500 focus:border-amber-500"
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
                                        Show:
                                    </span>
                                    <select
                                        className="h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                                                Status
                                            </label>
                                            <select
                                                className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                value={statusFilter}
                                                onChange={(e) =>
                                                    setStatusFilter(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    All Statuses
                                                </option>
                                                <option value="n/a">N/A</option>
                                                <option value="val">
                                                    Validated
                                                </option>
                                                <option value="lost">
                                                    Lost
                                                </option>
                                                <option value="wip">
                                                    Work in Progress
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Business Unit
                                            </label>
                                            <select
                                                className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                value={businessUnitFilter}
                                                onChange={(e) =>
                                                    setBusinessUnitFilter(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    All Business Units
                                                </option>
                                                {getBusinessUnits().map(
                                                    (unit, index) => (
                                                        <option
                                                            key={index}
                                                            value={unit}
                                                        >
                                                            {unit}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sort By
                                            </label>
                                            <select
                                                className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                value={sortField}
                                                onChange={(e) =>
                                                    setSortField(
                                                        e.target
                                                            .value as keyof Quotation
                                                    )
                                                }
                                            >
                                                <option value="code">
                                                    Code
                                                </option>
                                                <option value="due_date">
                                                    Due Date
                                                </option>
                                                <option value="status">
                                                    Status
                                                </option>
                                                <option value="amount">
                                                    Amount
                                                </option>
                                                <option value="created_at">
                                                    Created Date
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sort Direction
                                            </label>
                                            <select
                                                className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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

                                        {/* Date Filter (in the filters section) */}
                                        <div className="md:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date Filter
                                            </label>
                                            <div className="p-4 rounded-md border border-gray-200 bg-gray-50">
                                                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-3">
                                                    <Button
                                                        type="button"
                                                        variant={
                                                            dateFilterType ===
                                                            "all"
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        className={`h-9 text-xs px-3 ${
                                                            dateFilterType ===
                                                            "all"
                                                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            setDateFilterType(
                                                                "all"
                                                            );
                                                            setCustomStartDate(
                                                                ""
                                                            );
                                                            setCustomEndDate(
                                                                ""
                                                            );
                                                        }}
                                                    >
                                                        All Time
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={
                                                            dateFilterType ===
                                                            "1month"
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        className={`h-9 text-xs px-3 ${
                                                            dateFilterType ===
                                                            "1month"
                                                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            setDateFilterType(
                                                                "1month"
                                                            );
                                                            setCustomStartDate(
                                                                ""
                                                            );
                                                            setCustomEndDate(
                                                                ""
                                                            );
                                                        }}
                                                    >
                                                        Last Month
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={
                                                            dateFilterType ===
                                                            "3months"
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        className={`h-9 text-xs px-3 ${
                                                            dateFilterType ===
                                                            "3months"
                                                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            setDateFilterType(
                                                                "3months"
                                                            );
                                                            setCustomStartDate(
                                                                ""
                                                            );
                                                            setCustomEndDate(
                                                                ""
                                                            );
                                                        }}
                                                    >
                                                        Last 3 Months
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={
                                                            dateFilterType ===
                                                            "6months"
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        className={`h-9 text-xs px-3 ${
                                                            dateFilterType ===
                                                            "6months"
                                                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            setDateFilterType(
                                                                "6months"
                                                            );
                                                            setCustomStartDate(
                                                                ""
                                                            );
                                                            setCustomEndDate(
                                                                ""
                                                            );
                                                        }}
                                                    >
                                                        Last 6 Months
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={
                                                            dateFilterType ===
                                                            "1year"
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        className={`h-9 text-xs px-3 ${
                                                            dateFilterType ===
                                                            "1year"
                                                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            setDateFilterType(
                                                                "1year"
                                                            );
                                                            setCustomStartDate(
                                                                ""
                                                            );
                                                            setCustomEndDate(
                                                                ""
                                                            );
                                                        }}
                                                    >
                                                        Last Year
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={
                                                            dateFilterType ===
                                                            "custom"
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        className={`h-9 text-xs px-3 ${
                                                            dateFilterType ===
                                                            "custom"
                                                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            setDateFilterType(
                                                                "custom"
                                                            );
                                                        }}
                                                    >
                                                        Custom Range
                                                    </Button>
                                                </div>

                                                {dateFilterType ===
                                                    "custom" && (
                                                    <div className="flex items-center space-x-2 mt-3">
                                                        <div className="relative w-full">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                            </div>
                                                            <Input
                                                                type="date"
                                                                className="pl-8 h-9 bg-white border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                                                value={
                                                                    customStartDate
                                                                }
                                                                onChange={(e) =>
                                                                    setCustomStartDate(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Start date"
                                                            />
                                                        </div>
                                                        <span className="text-gray-500">
                                                            to
                                                        </span>
                                                        <div className="relative w-full">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                            </div>
                                                            <Input
                                                                type="date"
                                                                className="pl-8 h-9 bg-white border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                                                value={
                                                                    customEndDate
                                                                }
                                                                onChange={(e) =>
                                                                    setCustomEndDate(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="End date"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={resetFilters}
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
                            Showing {currentQuotations.length} of{" "}
                            {filteredQuotations.length} quotations
                            {searchTerm && (
                                <span>
                                    {" "}
                                    for "<strong>{searchTerm}</strong>"
                                </span>
                            )}
                            {statusFilter && (
                                <span>
                                    {" "}
                                    with status "<strong>{statusFilter}</strong>
                                    "
                                </span>
                            )}
                            {businessUnitFilter && (
                                <span>
                                    {" "}
                                    in business unit "
                                    <strong>{businessUnitFilter}</strong>"
                                </span>
                            )}
                            {dateFilterType !== "all" && (
                                <span>
                                    {" "}
                                    {dateFilterType === "custom" ? (
                                        customStartDate && customEndDate ? (
                                            <>
                                                from{" "}
                                                <strong>
                                                    {formatDateSafe(
                                                        customStartDate
                                                    ) || "invalid date"}
                                                </strong>{" "}
                                                to{" "}
                                                <strong>
                                                    {formatDateSafe(
                                                        customEndDate
                                                    ) || "invalid date"}
                                                </strong>
                                            </>
                                        ) : customStartDate ? (
                                            <>
                                                from{" "}
                                                <strong>
                                                    {formatDateSafe(
                                                        customStartDate
                                                    ) || "invalid date"}
                                                </strong>
                                            </>
                                        ) : customEndDate ? (
                                            <>
                                                until{" "}
                                                <strong>
                                                    {formatDateSafe(
                                                        customEndDate
                                                    ) || "invalid date"}
                                                </strong>
                                            </>
                                        ) : (
                                            <></>
                                        )
                                    ) : (
                                        <>
                                            from{" "}
                                            <strong>
                                                the last{" "}
                                                {dateFilterType === "1month"
                                                    ? "month"
                                                    : dateFilterType ===
                                                      "3months"
                                                    ? "3 months"
                                                    : dateFilterType ===
                                                      "6months"
                                                    ? "6 months"
                                                    : "year"}
                                            </strong>
                                        </>
                                    )}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Quotations Table */}
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("code")}
                                        >
                                            <div className="flex items-center">
                                                Quotation
                                                {sortField === "code" && (
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
                                            onClick={() => handleSort("amount")}
                                        >
                                            <div className="flex items-center">
                                                Amount
                                                {sortField === "amount" && (
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
                                                handleSort("due_date")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Due Date
                                                {sortField === "due_date" && (
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
                                            onClick={() => handleSort("status")}
                                        >
                                            <div className="flex items-center">
                                                Status
                                                {sortField === "status" && (
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
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Business Unit
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentQuotations.length > 0 ? (
                                        currentQuotations.map(
                                            (quotation, index) => (
                                                <motion.tr
                                                    key={quotation.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{
                                                        delay: index * 0.05,
                                                        duration: 0.2,
                                                    }}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-start">
                                                            <div className="bg-amber-100 p-2 rounded-md mr-3">
                                                                <FileText className="h-5 w-5 text-amber-600" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        quotation.code
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {quotation
                                                                        .inquiry
                                                                        ?.customer
                                                                        ?.name ||
                                                                        "N/A"}
                                                                </div>
                                                                {quotation.file && (
                                                                    <div className="flex items-center mt-2">
                                                                        {getFileIcon(
                                                                            quotation.file
                                                                        )}
                                                                        <span className="text-xs text-gray-500 ml-1 flex items-center">
                                                                            <a
                                                                                href={`/storage/files/quotations/${quotation.file}`}
                                                                                download
                                                                                className="text-blue-600 hover:underline ml-1 flex items-center"
                                                                            >
                                                                                Download
                                                                                <Download className="h-3 w-3 ml-1" />
                                                                            </a>
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <DollarSign className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                                            <span className="font-medium">
                                                                {formatCurrency(
                                                                    quotation.amount
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <CalendarDays className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                                            <span>
                                                                {formatDate(
                                                                    quotation.due_date ||
                                                                        ""
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(
                                                            quotation.status ||
                                                                ""
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Building className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                                            <span>
                                                                {quotation
                                                                    .inquiry
                                                                    ?.business_unit
                                                                    ?.name ||
                                                                    "N/A"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={route(
                                                                                "quotations.show",
                                                                                quotation.id
                                                                            )}
                                                                            className="cursor-pointer flex items-center"
                                                                        >
                                                                            <Eye className="h-4 w-4 mr-2" />
                                                                            View
                                                                            Details
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={route(
                                                                                "quotations.edit",
                                                                                quotation.id
                                                                            )}
                                                                            className="cursor-pointer flex items-center"
                                                                        >
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                Number(
                                                                                    quotation.id
                                                                                )
                                                                            )
                                                                        }
                                                                        className="cursor-pointer text-red-600 focus:text-red-600 flex items-center"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <Search className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        {searchTerm ||
                                                        statusFilter ||
                                                        businessUnitFilter ||
                                                        dateFilterType !== "all"
                                                            ? "No quotations found matching your criteria"
                                                            : "No quotations available"}
                                                    </h3>
                                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                                        {searchTerm ||
                                                        statusFilter ||
                                                        businessUnitFilter ||
                                                        dateFilterType !== "all"
                                                            ? "Try adjusting your search filters to see more results"
                                                            : "There are no quotations in the system yet"}
                                                    </p>

                                                    {(searchTerm ||
                                                        statusFilter ||
                                                        businessUnitFilter ||
                                                        dateFilterType !==
                                                            "all") && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={
                                                                resetFilters
                                                            }
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
                    {filteredQuotations.length > 0 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={pagination.goToPage}
                                totalItems={filteredQuotations.length}
                                startIndex={pagination.startIndex}
                                endIndex={Math.min(
                                    pagination.endIndex,
                                    filteredQuotations.length - 1
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

export default QuotationsIndex;

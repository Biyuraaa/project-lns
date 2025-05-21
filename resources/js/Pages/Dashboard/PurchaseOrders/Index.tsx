"use client";

import type { PageProps, PurchaseOrder } from "@/types";
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
    Building2,
    ShoppingCart,
    Briefcase,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { useForm } from "@inertiajs/react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PurchaseOrdersIndexProps extends PageProps {
    purchaseOrders: PurchaseOrder[];
}

const PurchaseOrdersIndex = () => {
    const { purchaseOrders } = usePage<PurchaseOrdersIndexProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<keyof PurchaseOrder>("code");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "wip":
                return (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>WIP</span>
                    </Badge>
                );
            case "ar":
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>AR</span>
                    </Badge>
                );
            case "ibt":
                return (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
                        <FileCheck className="h-3 w-3" />
                        <span>IBT</span>
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

    // Filter purchase orders based on search term and status
    const filteredPurchaseOrders = purchaseOrders.filter((po) => {
        const matchesSearch =
            po.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.contract_number
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            po.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.quotation?.code
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            po.quotation?.inquiry?.customer?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "" || po.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Sort purchase orders
    const sortedPurchaseOrders = [...filteredPurchaseOrders].sort((a, b) => {
        if (sortField === "date") {
            const dateA = new Date(a.date || "");
            const dateB = new Date(b.date || "");

            return sortDirection === "asc"
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
        }

        if (sortField === "created_at") {
            const dateA = new Date(a.created_at || "");
            const dateB = new Date(b.created_at || "");

            return sortDirection === "asc"
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
        }

        if (sortField === "amount") {
            return sortDirection === "asc"
                ? a.amount - b.amount
                : b.amount - a.amount;
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
        totalItems: sortedPurchaseOrders.length,
        itemsPerPage,
    });

    // Get current page data
    const currentPurchaseOrders = pagination.paginateData(sortedPurchaseOrders);

    // Handle sort
    const handleSort = (field: keyof PurchaseOrder) => {
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
    }, [searchTerm, statusFilter]);

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
        if (confirm("Are you sure you want to delete this purchase order?")) {
            destroy(route("purchaseOrders.destroy", id), {
                onSuccess: () => {
                    console.log("Purchase Order deleted successfully.");
                },
                onError: (errors) => {
                    console.error("Error deleting purchase order:", errors);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Breadcrumb items={[{ label: "Purchase Order Management" }]} />
            <Head title="Purchase Order Management" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-teal-700 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-green-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-teal-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <ShoppingCart className="mr-3 h-8 w-8" />
                                    Purchase Order Management
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-green-100 text-lg">
                                    Monitor and manage all purchase orders in
                                    the system
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <Briefcase className="h-3.5 w-3.5" />
                                        <span>
                                            {purchaseOrders.length} Total
                                            Purchase Orders
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
                                <Link href={route("purchaseOrders.create")}>
                                    <Button className="shadow-lg shadow-green-900/30 bg-white text-green-700 hover:bg-green-50 gap-1.5 font-medium transition-all duration-200">
                                        <ShoppingCart className="h-4 w-4" />
                                        <span>Create New PO</span>
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
                                        placeholder="Search POs by code, contract number, job number or customer..."
                                        className="pl-10 w-full bg-gray-50 border-gray-200 focus:ring-green-500 focus:border-green-500"
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
                                        className="h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                                className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                                <option value="wip">
                                                    WIP (Work In Progress)
                                                </option>
                                                <option value="ar">
                                                    AR (Accounts Receivable)
                                                </option>
                                                <option value="ibt">
                                                    IBT (Inter-Branch Transfer)
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sort By
                                            </label>
                                            <select
                                                className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                                value={sortField}
                                                onChange={(e) =>
                                                    setSortField(
                                                        e.target
                                                            .value as keyof PurchaseOrder
                                                    )
                                                }
                                            >
                                                <option value="code">
                                                    PO Code
                                                </option>
                                                <option value="date">
                                                    PO Date
                                                </option>
                                                <option value="amount">
                                                    Amount
                                                </option>
                                                <option value="status">
                                                    Status
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
                                                className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                                setStatusFilter("");
                                                setSortField("code");
                                                setSortDirection("desc");
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
                            Showing {currentPurchaseOrders.length} of{" "}
                            {filteredPurchaseOrders.length} purchase orders
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
                        </p>
                    </div>

                    {/* Purchase Orders Table */}
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
                                                PO Details
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
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            <div className="flex items-center">
                                                Quotation Details
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("date")}
                                        >
                                            <div className="flex items-center">
                                                Date
                                                {sortField === "date" && (
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
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentPurchaseOrders.length > 0 ? (
                                        currentPurchaseOrders.map(
                                            (po, index) => (
                                                <motion.tr
                                                    key={po.id}
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
                                                            <div className="bg-green-100 p-2 rounded-md mr-3">
                                                                <ShoppingCart className="h-5 w-5 text-green-600" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {po.code}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    Contract:{" "}
                                                                    {po.contract_number ||
                                                                        "N/A"}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-0.5">
                                                                    Job #:{" "}
                                                                    {po.job_number ||
                                                                        "N/A"}
                                                                </div>
                                                                {po.file && (
                                                                    <div className="flex items-center mt-2">
                                                                        {getFileIcon(
                                                                            po.file
                                                                        )}
                                                                        <span className="text-xs text-gray-500 ml-1 flex items-center">
                                                                            <a
                                                                                href={`/storage/files/purchaseOrders/${po.file}`}
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
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center text-sm text-gray-900">
                                                                <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                                                <Link
                                                                    href={route(
                                                                        "quotations.show",
                                                                        po
                                                                            .quotation
                                                                            ?.id
                                                                    )}
                                                                    className="font-medium text-blue-600 hover:underline"
                                                                >
                                                                    Quotation #
                                                                    {po
                                                                        .quotation
                                                                        ?.code ||
                                                                        "N/A"}
                                                                </Link>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <Building2 className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                                                <span>
                                                                    {po
                                                                        .quotation
                                                                        ?.inquiry
                                                                        ?.customer
                                                                        ?.name ||
                                                                        "N/A"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <CalendarDays className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                                            <span>
                                                                {formatDate(
                                                                    po.date
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm font-medium">
                                                            <span className="text-gray-900">
                                                                {formatCurrency(
                                                                    po.amount
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(
                                                            po.status
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <Link
                                                                href={route(
                                                                    "purchaseOrders.edit",
                                                                    po.id
                                                                )}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                            <Link
                                                                href={route(
                                                                    "purchaseOrders.show",
                                                                    po.id
                                                                )}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        Number(
                                                                            po.id
                                                                        )
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
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
                                                        statusFilter
                                                            ? "No purchase orders found matching your criteria"
                                                            : "No purchase orders available"}
                                                    </h3>
                                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                                        {searchTerm ||
                                                        statusFilter
                                                            ? "Try adjusting your search filters to see more results"
                                                            : "There are no purchase orders in the system yet"}
                                                    </p>

                                                    {searchTerm ||
                                                    statusFilter ? (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSearchTerm(
                                                                    ""
                                                                );
                                                                setStatusFilter(
                                                                    ""
                                                                );
                                                            }}
                                                            className="border-gray-200"
                                                        >
                                                            Clear Filters
                                                        </Button>
                                                    ) : (
                                                        <Link
                                                            href={route(
                                                                "purchaseOrders.create"
                                                            )}
                                                        >
                                                            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                                                                <ShoppingCart className="h-4 w-4" />
                                                                Create New
                                                                Purchase Order
                                                            </Button>
                                                        </Link>
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
                    {filteredPurchaseOrders.length > 0 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={pagination.goToPage}
                                totalItems={filteredPurchaseOrders.length}
                                startIndex={pagination.startIndex}
                                endIndex={Math.min(
                                    pagination.endIndex,
                                    filteredPurchaseOrders.length - 1
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

export default PurchaseOrdersIndex;

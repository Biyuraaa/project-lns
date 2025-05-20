"use client";

import type { PageProps, Negotiation } from "@/types";
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
    Mail,
    FileUp,
    Handshake,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { useForm } from "@inertiajs/react";
import { format } from "date-fns";

interface NegotiationsIndexProps extends PageProps {
    negotiations: Negotiation[];
}

const NegotiationsIndex = () => {
    const { negotiations } = usePage<NegotiationsIndexProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<keyof Negotiation>("created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return format(date, "MMM dd, yyyy");
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Pending</span>
                    </Badge>
                );
            case "approved":
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Approved</span>
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        <span>Rejected</span>
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

    // Filter negotiations based on search term and status
    const filteredNegotiations = negotiations.filter((negotiation) => {
        const quotationCode = negotiation.quotation?.code?.toLowerCase() || "";
        const inquiryCode =
            negotiation.quotation?.inquiry?.code?.toLowerCase() || "";
        const customerName =
            negotiation.quotation?.inquiry?.customer?.name?.toLowerCase() || "";

        const matchesSearch =
            quotationCode.includes(searchTerm.toLowerCase()) ||
            inquiryCode.includes(searchTerm.toLowerCase()) ||
            customerName.includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "" || negotiation.status === statusFilter;

        return matchesSearch && matchesStatus;
    });
    // Sort negotiations
    const sortedNegotiations = [...filteredNegotiations].sort((a, b) => {
        if (sortField === "created_at") {
            const dateA = new Date(a[sortField] || "");
            const dateB = new Date(b[sortField] || "");

            return sortDirection === "asc"
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
        }

        if (a[sortField] === undefined || b[sortField] === undefined) return 0;

        // Handle nested properties for sorting
        if (sortField === "quotation") {
            const aValue = a.quotation?.code?.toLowerCase() || "";
            const bValue = b.quotation?.code?.toLowerCase() || "";

            return sortDirection === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        const aValue = String(a[sortField]).toLowerCase();
        const bValue = String(b[sortField]).toLowerCase();

        return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
    });

    // Initialize pagination
    const pagination = usePagination({
        totalItems: sortedNegotiations.length,
        itemsPerPage,
    });

    // Get current page data
    const currentNegotiations = pagination.paginateData(sortedNegotiations);

    // Handle sort
    const handleSort = (field: keyof Negotiation) => {
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
        if (confirm("Are you sure you want to delete this negotiation?")) {
            destroy(route("negotiations.destroy", id), {
                onSuccess: () => {
                    console.log("Negotiation deleted successfully.");
                },
                onError: (errors) => {
                    console.error("Error deleting negotiation:", errors);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Breadcrumb items={[{ label: "Negotiation Management" }]} />
            <Head title="Negotiation Management" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-indigo-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-purple-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <Handshake className="mr-3 h-8 w-8" />
                                    Negotiation Management
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-indigo-100 text-lg">
                                    Track and manage all negotiations with
                                    customers
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <FileUp className="h-3.5 w-3.5" />
                                        <span>
                                            {negotiations.length} Total
                                            Negotiations
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
                                        placeholder="Search by quotation, inquiry or customer..."
                                        className="pl-10 w-full bg-gray-50 border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
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
                                        className="h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                                className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                                <option value="pending">
                                                    Pending
                                                </option>
                                                <option value="approved">
                                                    Approved
                                                </option>
                                                <option value="rejected">
                                                    Rejected
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sort By
                                            </label>
                                            <select
                                                className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={sortField}
                                                onChange={(e) =>
                                                    setSortField(
                                                        e.target
                                                            .value as keyof Negotiation
                                                    )
                                                }
                                            >
                                                <option value="created_at">
                                                    Date Created
                                                </option>
                                                <option value="status">
                                                    Status
                                                </option>
                                                <option value="quotation">
                                                    Quotation
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sort Direction
                                            </label>
                                            <select
                                                className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                                setSortField("created_at");
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
                            Showing {currentNegotiations.length} of{" "}
                            {filteredNegotiations.length} negotiations
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

                    {/* Negotiations Table */}
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() =>
                                                handleSort("created_at")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Negotiation Details
                                                {sortField === "created_at" && (
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
                                                handleSort("quotation")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Related Quotation
                                                {sortField === "quotation" && (
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
                                                Customer
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
                                    {currentNegotiations.length > 0 ? (
                                        currentNegotiations.map(
                                            (negotiation, index) => (
                                                <motion.tr
                                                    key={negotiation.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{
                                                        delay: index * 0.05,
                                                        duration: 0.2,
                                                    }}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start">
                                                            <div className="bg-indigo-100 p-2 rounded-md mr-3">
                                                                <FileUp className="h-5 w-5 text-indigo-600" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    Negotiation
                                                                    #
                                                                    {
                                                                        negotiation.id
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    Created on{" "}
                                                                    {formatDate(
                                                                        negotiation.created_at ||
                                                                            ""
                                                                    )}
                                                                </div>
                                                                {negotiation.file && (
                                                                    <div className="flex items-center mt-2">
                                                                        {getFileIcon(
                                                                            negotiation.file
                                                                        )}
                                                                        <span className="text-xs text-gray-500 ml-1 flex items-center">
                                                                            <a
                                                                                href={`/storage/files/negotiations/${negotiation.file}`}
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
                                                        <div className="flex items-center text-sm">
                                                            <FileText className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
                                                            <Link
                                                                href={
                                                                    negotiation.quotation
                                                                        ? route(
                                                                              "quotations.show",
                                                                              negotiation
                                                                                  .quotation
                                                                                  .id
                                                                          )
                                                                        : "#"
                                                                }
                                                                className="font-medium text-blue-600 hover:underline"
                                                            >
                                                                {negotiation
                                                                    .quotation
                                                                    ?.code ||
                                                                    "N/A"}
                                                            </Link>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Building2 className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                                            <span>
                                                                {negotiation
                                                                    .quotation
                                                                    ?.inquiry
                                                                    ?.customer
                                                                    ?.name ||
                                                                    "N/A"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                                            <Mail className="h-3.5 w-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
                                                            <span>
                                                                Inquiry #
                                                                {negotiation
                                                                    .quotation
                                                                    ?.inquiry
                                                                    ?.code ||
                                                                    "N/A"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(
                                                            negotiation.status
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <Link
                                                                href={route(
                                                                    "negotiations.edit",
                                                                    negotiation.id
                                                                )}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                            <Link
                                                                href={route(
                                                                    "negotiations.show",
                                                                    negotiation.id
                                                                )}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        Number(
                                                                            negotiation.id
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
                                                            ? "No negotiations found matching your criteria"
                                                            : "No negotiations available"}
                                                    </h3>
                                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                                        {searchTerm ||
                                                        statusFilter
                                                            ? "Try adjusting your search filters to see more results"
                                                            : "There are no negotiations in the system yet"}
                                                    </p>

                                                    {(searchTerm ||
                                                        statusFilter) && (
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
                    {filteredNegotiations.length > 0 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={pagination.goToPage}
                                totalItems={filteredNegotiations.length}
                                startIndex={pagination.startIndex}
                                endIndex={Math.min(
                                    pagination.endIndex,
                                    filteredNegotiations.length - 1
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

export default NegotiationsIndex;

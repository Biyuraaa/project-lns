"use client";

import type { PageProps } from "@/types";
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
    Plus,
    CalendarDays,
    ArrowUp,
    ArrowDown,
    ClipboardList,
    BarChart4,
    Clock,
    Check,
    Lock,
    MoreHorizontal,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { useForm } from "@inertiajs/react";
import { Inquiry } from "@/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

interface InquiriesIndexProps extends PageProps {
    inquiries: Inquiry[];
}

const InquiriesIndex = () => {
    const { inquiries } = usePage<InquiriesIndexProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<string>("code");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Filter inquiries based on search term and status
    const filteredInquiries = inquiries.filter((inquiry) => {
        const matchesSearch =
            inquiry.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.customer?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            inquiry.description
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            inquiry.end_user_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (inquiry.pic_engineer?.name &&
                inquiry.pic_engineer.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())) ||
            (inquiry.sales?.name &&
                inquiry.sales.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()));

        const matchesStatus =
            statusFilter === "all" || inquiry.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Sort inquiries
    const sortedInquiries = [...filteredInquiries].sort((a, b) => {
        let aValue, bValue;

        // Handle nested properties
        if (sortField.includes(".")) {
            const parts = sortField.split(".");
            aValue = parts.reduce((obj: any, key) => obj && obj[key], a as any);
            bValue = parts.reduce((obj: any, key) => obj && obj[key], b as any);
        } else {
            aValue = a[sortField as keyof Inquiry];
            bValue = b[sortField as keyof Inquiry];
        }

        // Handle null/undefined values
        if (aValue === undefined || aValue === null) aValue = "";
        if (bValue === undefined || bValue === null) bValue = "";

        // Convert to string for comparison
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();

        if (sortDirection === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Initialize pagination
    const pagination = usePagination({
        totalItems: sortedInquiries.length,
        itemsPerPage,
    });

    // Get current page data
    const currentInquiries = pagination.paginateData(sortedInquiries);

    // Handle sort
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field as any);
            setSortDirection("asc");
        }
    };

    // Reset to first page when search term changes
    useEffect(() => {
        pagination.goToFirstPage();
    }, [searchTerm, statusFilter]);

    // Get status badge variant
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "resolved":
                return "bg-green-100 text-green-800 border-green-200";
            case "closed":
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-blue-100 text-blue-800 border-blue-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Clock className="h-3.5 w-3.5 mr-1" />;
            case "resolved":
                return <Check className="h-3.5 w-3.5 mr-1" />;
            case "closed":
                return <Lock className="h-3.5 w-3.5 mr-1" />;
            default:
                return null;
        }
    };

    const { delete: destroy } = useForm({});

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this inquiry?")) {
            destroy(route("inquiries.destroy", id), {
                onSuccess: () => {
                    console.log("Inquiry deleted successfully.");
                },
                onError: (errors) => {
                    console.error("Error deleting inquiry:", errors);
                },
            });
        }
    };

    // Format date function
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Inquiry Management" />
            <Breadcrumb items={[{ label: "Inquiry Management" }]} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-blue-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-teal-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <ClipboardList className="mr-3 h-8 w-8" />
                                    Inquiry Management
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                                    Track and manage all customer inquiries in
                                    one place
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <BarChart4 className="h-3.5 w-3.5" />
                                        <span>
                                            {inquiries.length} Total Inquiries
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
                                <Link href={route("inquiries.create")}>
                                    <Button className="shadow-lg shadow-blue-900/30 bg-white text-blue-700 hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200">
                                        <Plus className="h-4 w-4" />
                                        <span>Create New Inquiry</span>
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
                                        placeholder="Search inquiries by code, customer, description or end user..."
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
                                        Status:
                                    </span>
                                    <select
                                        className="h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                    >
                                        <option value="all">
                                            All Statuses
                                        </option>
                                        <option value="pending">Pending</option>
                                        <option value="resolved">
                                            Resolved
                                        </option>
                                        <option value="closed">Closed</option>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sort By
                                            </label>
                                            <select
                                                className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={sortField}
                                                onChange={(e) =>
                                                    setSortField(
                                                        e.target
                                                            .value as keyof Inquiry
                                                    )
                                                }
                                            >
                                                <option value="code">
                                                    Inquiry Code
                                                </option>
                                                <option value="customer.name">
                                                    Customer
                                                </option>
                                                <option value="inquiry_date">
                                                    Inquiry Date
                                                </option>
                                                <option value="status">
                                                    Status
                                                </option>
                                                <option value="business_unit">
                                                    Quantity
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
                                                setSortField("code");
                                                setSortDirection("desc");
                                                setStatusFilter("all");
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
                            Showing {currentInquiries.length} of{" "}
                            {filteredInquiries.length} inquiries
                            {searchTerm && (
                                <span>
                                    {" "}
                                    for "<strong>{searchTerm}</strong>"
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Inquiries Table */}
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {/* Code Column */}
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("code")}
                                        >
                                            <div className="flex items-center">
                                                Inquiry Code
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

                                        {/* Customer Column */}
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() =>
                                                handleSort("customer.name")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Customer
                                                {sortField ===
                                                    "customer.name" && (
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

                                        {/* Date Column */}
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() =>
                                                handleSort("inquiry_date")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Date
                                                {sortField ===
                                                    "inquiry_date" && (
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

                                        {/* Status Column */}
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

                                        {/* Sales Column */}
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() =>
                                                handleSort("sales.name")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Sales
                                                {sortField === "sales.name" && (
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

                                        {/* PIC Engineer Column */}
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() =>
                                                handleSort("picEngineer.name")
                                            }
                                        >
                                            <div className="flex items-center">
                                                PIC Engineer
                                                {sortField ===
                                                    "picEngineer.name" && (
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

                                        {/* Business Unit Column */}
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() =>
                                                handleSort("business_unit")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Business Unit
                                                {sortField ===
                                                    "business_unit" && (
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

                                        {/* Actions Column */}
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentInquiries.length > 0 ? (
                                        currentInquiries.map(
                                            (inquiry, index) => (
                                                <motion.tr
                                                    key={inquiry.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{
                                                        delay: index * 0.05,
                                                        duration: 0.2,
                                                    }}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    {/* Code Cell */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-blue-600">
                                                            {inquiry.code}
                                                        </div>
                                                    </td>

                                                    {/* Customer Cell */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {inquiry
                                                                    .customer
                                                                    ?.name ||
                                                                    "N/A"}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Date Cell */}
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 flex items-center">
                                                            {formatDate(
                                                                inquiry.inquiry_date
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Status Cell */}
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeVariant(
                                                                inquiry.status
                                                            )}`}
                                                        >
                                                            {getStatusIcon(
                                                                inquiry.status
                                                            )}
                                                            {inquiry.status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                inquiry.status.slice(
                                                                    1
                                                                )}
                                                        </span>
                                                    </td>

                                                    {/* Sales Cell */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center text-sm">
                                                            <span className="text-gray-600">
                                                                {inquiry.sales
                                                                    ?.name ||
                                                                    "Not assigned"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* PIC Engineer Cell */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center text-sm">
                                                            <span className="text-gray-600">
                                                                {inquiry
                                                                    .pic_engineer
                                                                    ?.name ||
                                                                    "Not assigned"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Quantity Cell */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm flex items-center">
                                                            <span className="font-medium">
                                                                {
                                                                    inquiry
                                                                        .business_unit
                                                                        .name
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {/* Actions Cell */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 border-gray-200"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
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
                                                                            "inquiries.show",
                                                                            inquiry.id
                                                                        )}
                                                                        className="cursor-pointer flex items-center w-full"
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
                                                                            "inquiries.edit",
                                                                            inquiry.id
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
                                                                            inquiry.id
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </motion.tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <ClipboardList className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        {searchTerm ||
                                                        statusFilter !== "all"
                                                            ? "No inquiries found matching your filters"
                                                            : "No inquiries available yet"}
                                                    </h3>
                                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                                        {searchTerm ||
                                                        statusFilter !== "all"
                                                            ? "Try adjusting your search criteria or clear filters to see all inquiries"
                                                            : "Create your first inquiry to start managing customer requests"}
                                                    </p>

                                                    {!searchTerm &&
                                                    statusFilter === "all" ? (
                                                        <Link
                                                            href={route(
                                                                "inquiries.create"
                                                            )}
                                                        >
                                                            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                                                                <Plus className="h-4 w-4" />
                                                                Create New
                                                                Inquiry
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSearchTerm(
                                                                    ""
                                                                );
                                                                setStatusFilter(
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
                    {filteredInquiries.length > 0 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={pagination.goToPage}
                                totalItems={filteredInquiries.length}
                                startIndex={pagination.startIndex}
                                endIndex={Math.min(
                                    pagination.endIndex,
                                    filteredInquiries.length - 1
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

export default InquiriesIndex;

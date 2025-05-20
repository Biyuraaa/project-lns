"use client";

import type { PageProps, Sales } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { usePagination } from "@/hooks/use-pagination";
import { Pagination } from "@/Components/Pagination";
import { Input } from "@/Components/ui/input";
import {
    Search,
    UserPlus,
    Filter,
    ChevronDown,
    Phone,
    Mail,
    MapPin,
    Edit,
    Trash2,
    Eye,
    Plus,
    CalendarDays,
    Users,
    ArrowUp,
    ArrowDown,
    Briefcase,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { useForm } from "@inertiajs/react";

interface SalesIndexProps extends PageProps {
    sales: Sales[];
}

const SalesIndex = () => {
    const { sales } = usePage<SalesIndexProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<keyof Sales>("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [showFilters, setShowFilters] = useState(false);

    // Filter sales based on search term
    const filteredSales = sales.filter((sale) => {
        const matchesSearch =
            sale.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.address?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    // Sort sales
    const sortedSales = [...filteredSales].sort((a, b) => {
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
        totalItems: sortedSales.length,
        itemsPerPage,
    });

    // Get current page data
    const currentSales = pagination.paginateData(sortedSales);

    // Handle sort
    const handleSort = (field: keyof Sales) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Reset to first page when search term changes
    useEffect(() => {
        pagination.goToFirstPage();
    }, [searchTerm]);

    // Generate random color for avatar based on name
    const getAvatarColor = (name: string) => {
        const colors = [
            "from-blue-500 to-indigo-500",
            "from-purple-500 to-pink-500",
            "from-green-500 to-emerald-500",
            "from-amber-500 to-orange-500",
            "from-cyan-500 to-blue-500",
            "from-fuchsia-500 to-purple-500",
            "from-rose-500 to-red-500",
            "from-indigo-500 to-violet-500",
        ];

        // Simple hash function
        const hash = name.split("").reduce((acc, char) => {
            return acc + char.charCodeAt(0);
        }, 0);

        return colors[hash % colors.length];
    };

    const { delete: destroy } = useForm({});

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this sales person?")) {
            destroy(route("sales.destroy", id), {
                onSuccess: () => {
                    console.log("Sales deleted successfully.");
                },
                onError: (errors) => {
                    console.error("Error deleting sales:", errors);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Breadcrumb items={[{ label: "Sales Management" }]} />
            <Head title="Sales Management" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-700 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-purple-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-indigo-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <Briefcase className="mr-3 h-8 w-8" />
                                    Sales Team Management
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                                    Manage your sales team members in one place
                                    with advanced filtering and sorting
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <Users className="h-3.5 w-3.5" />
                                        <span>
                                            {sales.length} Registered Sales
                                            Personnel
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
                                <Link href={route("sales.create")}>
                                    <Button className="shadow-lg shadow-indigo-900/30 bg-white text-indigo-700 hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200">
                                        <Plus className="h-4 w-4" />
                                        <span>Add Sales Person</span>
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
                                        placeholder="Search sales by name, email, phone or address..."
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
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
                                                            .value as keyof Sales
                                                    )
                                                }
                                            >
                                                <option value="name">
                                                    Name
                                                </option>
                                                <option value="email">
                                                    Email
                                                </option>
                                                <option value="phone">
                                                    Phone
                                                </option>
                                                <option value="address">
                                                    Address
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
                                                setSortField("name");
                                                setSortDirection("asc");
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
                            Showing {currentSales.length} of{" "}
                            {filteredSales.length} results
                            {searchTerm && (
                                <span>
                                    {" "}
                                    for "<strong>{searchTerm}</strong>"
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Sales Table */}
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("name")}
                                        >
                                            <div className="flex items-center">
                                                Sales Person
                                                {sortField === "name" && (
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
                                            onClick={() => handleSort("email")}
                                        >
                                            <div className="flex items-center">
                                                Contact Information
                                                {sortField === "email" && (
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
                                                handleSort("address")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Address
                                                {sortField === "address" && (
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
                                    {currentSales.length > 0 ? (
                                        currentSales.map((sale, index) => (
                                            <motion.tr
                                                key={sale.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{
                                                    delay: index * 0.05,
                                                    duration: 0.2,
                                                }}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {sale.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                ID: #{sale.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                                            <span className="font-medium">
                                                                {sale.email}
                                                            </span>
                                                        </div>
                                                        {sale.phone ? (
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                                                <span>
                                                                    {sale.phone}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center text-xs text-gray-400 italic">
                                                                <Phone className="h-4 w-4 text-gray-300 mr-2 flex-shrink-0" />
                                                                <span>
                                                                    No phone
                                                                    number
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {sale.address ? (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                                            <span className="truncate max-w-[200px]">
                                                                {sale.address}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">
                                                            Not provided
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Link
                                                            href={route(
                                                                "sales.edit",
                                                                sale.id
                                                            )}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={route(
                                                                "sales.show",
                                                                sale.id
                                                            )}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    Number(
                                                                        sale.id
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <Search className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        {searchTerm
                                                            ? "No sales personnel found matching your search"
                                                            : "No sales personnel available"}
                                                    </h3>
                                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                                        {searchTerm
                                                            ? "Try adjusting your search or clear it to see all sales personnel"
                                                            : "Add your first sales person to start building your sales team"}
                                                    </p>

                                                    {!searchTerm ? (
                                                        <Link
                                                            href={route(
                                                                "sales.create"
                                                            )}
                                                        >
                                                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                                                                <UserPlus className="h-4 w-4" />
                                                                Add Your First
                                                                Sales Person
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSearchTerm(
                                                                    ""
                                                                );
                                                            }}
                                                            className="border-gray-200"
                                                        >
                                                            Clear Search
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
                    {filteredSales.length > 0 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={pagination.goToPage}
                                totalItems={filteredSales.length}
                                startIndex={pagination.startIndex}
                                endIndex={Math.min(
                                    pagination.endIndex,
                                    filteredSales.length - 1
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

export default SalesIndex;

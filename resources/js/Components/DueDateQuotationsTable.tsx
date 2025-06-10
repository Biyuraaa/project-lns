import { useState, useMemo } from "react";
import { Link } from "@inertiajs/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    Building2,
    Calendar,
    Search,
    AlertCircle,
    X,
    ChevronDown,
    Filter as FilterIcon,
    Clock,
} from "lucide-react";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/Components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BusinessUnit, DueDateQuotationData } from "@/types";

interface DueDateQuotationsTableProps {
    quotations: DueDateQuotationData[];
    businessUnits: BusinessUnit[];
}

const DueDateQuotationsTable = ({
    quotations,
    businessUnits,
}: DueDateQuotationsTableProps) => {
    const [businessUnitFilter, setBusinessUnitFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("due_date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Reset filters function
    const resetFilters = () => {
        setBusinessUnitFilter("all");
        setSearchQuery("");
        setStatusFilter("all");
    };

    // Get unique statuses
    const uniqueStatuses = useMemo(() => {
        return quotations ? [...new Set(quotations.map((q) => q.status))] : [];
    }, [quotations]);

    // Filter quotations based on selected filters
    const filteredQuotations = useMemo(() => {
        return quotations
            .filter((quotation) => {
                const matchesBusinessUnit =
                    businessUnitFilter === "all" ||
                    quotation.inquiry.business_unit.id?.toString() ===
                        businessUnitFilter;

                const matchesStatus =
                    statusFilter === "all" || quotation.status === statusFilter;

                const matchesSearch =
                    searchQuery === "" ||
                    quotation.customer.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    quotation.inquiry.code
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    quotation.code
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());

                return matchesBusinessUnit && matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                // Handle sorting
                if (sortBy === "due_date") {
                    const dateA = new Date(a.due_date).getTime();
                    const dateB = new Date(b.due_date).getTime();
                    return sortDirection === "asc"
                        ? dateA - dateB
                        : dateB - dateA;
                } else if (sortBy === "days_remaining") {
                    return sortDirection === "asc"
                        ? a.days_remaining - b.days_remaining
                        : b.days_remaining - a.days_remaining;
                } else if (sortBy === "customer") {
                    return sortDirection === "asc"
                        ? a.customer.name.localeCompare(b.customer.name)
                        : b.customer.name.localeCompare(a.customer.name);
                }
                return 0;
            });
    }, [
        quotations,
        businessUnitFilter,
        searchQuery,
        statusFilter,
        sortBy,
        sortDirection,
    ]);

    // Handle sort toggle
    const toggleSort = (column: string) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
    };

    // Format date function
    const formatDate = (dateString: string): string => {
        return format(new Date(dateString), "MMM dd, yyyy");
    };

    // Get status display name
    const getStatusDisplay = (status: string): string => {
        switch (status) {
            case "wip":
                return "In Progress";
            case "val":
                return "Validated";
            case "n/a":
                return "N/A";
            case "lost":
                return "Lost";
            default:
                return status.toUpperCase();
        }
    };

    // Get badge color based on days remaining
    const getDaysRemainingBadgeClass = (daysRemaining: number): string => {
        if (daysRemaining <= 2) return "bg-red-100 text-red-800 border-red-200";
        if (daysRemaining <= 4)
            return "bg-amber-100 text-amber-800 border-amber-200";
        return "bg-blue-100 text-blue-800 border-blue-200";
    };

    // Get status badge styling
    const getStatusBadgeClass = (status: string): string => {
        switch (status) {
            case "wip":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "val":
                return "bg-green-100 text-green-800 border-green-200";
            case "lost":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Check if any filter is active
    const hasActiveFilters =
        businessUnitFilter !== "all" ||
        statusFilter !== "all" ||
        searchQuery !== "";

    // Get sort icon
    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortDirection === "asc" ? (
            <ChevronDown className="h-4 w-4 ml-1" />
        ) : (
            <ChevronDown className="h-4 w-4 ml-1 transform rotate-180" />
        );
    };

    // Stats for the quotations
    const stats = useMemo(() => {
        const urgentCount = filteredQuotations.filter(
            (q) => q.days_remaining <= 2
        ).length;
        const warningCount = filteredQuotations.filter(
            (q) => q.days_remaining > 2 && q.days_remaining <= 4
        ).length;
        const okCount = filteredQuotations.filter(
            (q) => q.days_remaining > 4
        ).length;

        return {
            total: filteredQuotations.length,
            urgent: urgentCount,
            warning: warningCount,
            ok: okCount,
        };
    }, [filteredQuotations]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl flex items-center">
                            <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                            Quotations Approaching Due Date
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Showing {filteredQuotations.length} quotations due
                            within the next 7 days
                        </CardDescription>
                    </div>

                    {/* Stats summary */}
                    <div className="flex space-x-3 text-sm">
                        <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 gap-1.5"
                        >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Urgent: {stats.urgent}</span>
                        </Badge>
                        <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 gap-1.5"
                        >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Warning: {stats.warning}</span>
                        </Badge>
                        <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 gap-1.5"
                        >
                            <Clock className="h-3.5 w-3.5" />
                            <span>OK: {stats.ok}</span>
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="p-4 border-y bg-slate-50">
                    <div className="flex flex-col md:flex-row gap-3 justify-between">
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Search Input */}
                            <div className="relative min-w-[250px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by customer or code..."
                                    className="pl-9 h-10"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Business Unit Filter */}
                            <div className="min-w-[200px]">
                                <Select
                                    value={businessUnitFilter}
                                    onValueChange={(value) =>
                                        setBusinessUnitFilter(value)
                                    }
                                >
                                    <SelectTrigger className="h-10">
                                        <div className="flex items-center">
                                            <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                                            <SelectValue placeholder="All Business Units" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>
                                                Business Units
                                            </SelectLabel>
                                            <SelectItem value="all">
                                                All Business Units
                                            </SelectItem>
                                            {businessUnits.map((bu) => (
                                                <SelectItem
                                                    key={bu.id}
                                                    value={bu.id.toString()}
                                                >
                                                    {bu.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="min-w-[180px]">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) =>
                                        setStatusFilter(value)
                                    }
                                >
                                    <SelectTrigger className="h-10">
                                        <div className="flex items-center">
                                            <FilterIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                                            <SelectValue placeholder="Filter by Status" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Status</SelectLabel>
                                            <SelectItem value="all">
                                                All Statuses
                                            </SelectItem>
                                            {uniqueStatuses.map((status) => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                >
                                                    <div className="flex items-center">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "mr-2",
                                                                getStatusBadgeClass(
                                                                    status
                                                                )
                                                            )}
                                                        >
                                                            {getStatusDisplay(
                                                                status
                                                            )}
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Reset Filters button */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="h-10"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Reset Filters
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-md border-b">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => toggleSort("customer")}
                                >
                                    <div className="flex items-center">
                                        Customer
                                        {getSortIcon("customer")}
                                    </div>
                                </TableHead>
                                <TableHead>Inquiry Code</TableHead>
                                <TableHead>Quotation Code</TableHead>
                                <TableHead>Business Unit</TableHead>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => toggleSort("due_date")}
                                >
                                    <div className="flex items-center">
                                        Due Date
                                        {getSortIcon("due_date")}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => toggleSort("days_remaining")}
                                >
                                    <div className="flex items-center">
                                        Remaining
                                        {getSortIcon("days_remaining")}
                                    </div>
                                </TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQuotations.length > 0 ? (
                                filteredQuotations.map((quotation) => (
                                    <TableRow
                                        key={quotation.id}
                                        className={cn(
                                            "hover:bg-muted/50",
                                            quotation.days_remaining <= 2
                                                ? "bg-red-50/50"
                                                : ""
                                        )}
                                    >
                                        <TableCell className="font-medium">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>
                                                            {
                                                                quotation
                                                                    .customer
                                                                    .name
                                                            }
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            View customer
                                                            details
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={route(
                                                    "inquiries.show",
                                                    quotation.inquiry.id
                                                )}
                                                className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                            >
                                                {quotation.inquiry.code}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={route(
                                                    "quotations.show",
                                                    quotation.id
                                                )}
                                                className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                            >
                                                {quotation.code}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className="bg-blue-50 text-blue-700 border-blue-100"
                                            >
                                                {
                                                    quotation.inquiry
                                                        .business_unit.name
                                                }
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                                            {formatDate(quotation.due_date)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={getDaysRemainingBadgeClass(
                                                    quotation.days_remaining
                                                )}
                                            >
                                                {quotation.days_remaining} day
                                                {quotation.days_remaining !== 1
                                                    ? "s"
                                                    : ""}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(
                                                    quotation.status
                                                )}
                                            >
                                                {getStatusDisplay(
                                                    quotation.status
                                                )}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-10 text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center">
                                            <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                            <p className="font-medium">
                                                No quotations found
                                            </p>
                                            <p className="text-sm mt-1">
                                                Try adjusting your filters
                                            </p>
                                            {hasActiveFilters && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={resetFilters}
                                                    className="mt-4"
                                                >
                                                    Reset All Filters
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-3 text-sm text-muted-foreground flex items-center bg-slate-50 border-t rounded-b-lg">
                    <AlertCircle className="h-3.5 w-3.5 mr-2" />
                    Priority indicators:{" "}
                    <Badge className="ml-2 mr-1 bg-red-100 text-red-800 border-red-200">
                        ≤ 2 days
                    </Badge>
                    <Badge className="mx-1 bg-amber-100 text-amber-800 border-amber-200">
                        3-4 days
                    </Badge>
                    <Badge className="mx-1 bg-blue-100 text-blue-800 border-blue-200">
                        5+ days
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};
export default DueDateQuotationsTable;

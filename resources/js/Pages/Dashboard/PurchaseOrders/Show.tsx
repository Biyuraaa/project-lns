"use client";

import { Head, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import type { PurchaseOrder, PageProps } from "@/types";
import { motion } from "framer-motion";
import {
    Building2,
    Calendar,
    ClipboardList,
    Clock,
    Download,
    Edit,
    FileText,
    Mail,
    Phone,
    MapPin,
    Tag,
    CheckCircle,
    XCircle,
    Clock3,
    ChevronRight,
    ExternalLink,
    AlertCircle,
    Briefcase,
    Coins,
    ShoppingCart,
    FileCheck,
    Truck,
    ClipboardCheck,
    Paperclip,
} from "lucide-react";
import { Separator } from "@/Components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, formatTime } from "@/lib/utils";

interface PurchaseOrdersShowProps extends PageProps {
    purchaseOrder: PurchaseOrder;
}

const PurchaseOrdersShow = () => {
    const { purchaseOrder } = usePage<PurchaseOrdersShowProps>().props;

    // Format currency value
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

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

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "wip":
                return <Clock3 className="h-3.5 w-3.5 mr-1.5" />;
            case "ar":
                return <CheckCircle className="h-3.5 w-3.5 mr-1.5" />;
            case "ibt":
                return <FileCheck className="h-3.5 w-3.5 mr-1.5" />;
            default:
                return <Clock className="h-3.5 w-3.5 mr-1.5" />;
        }
    };

    // Get status description
    const getStatusDescription = (status: string) => {
        switch (status) {
            case "wip":
                return "Order is currently in Work In Progress status";
            case "ar":
                return "Order is in Accounts Receivable status";
            case "ibt":
                return "Order is in Inter-Branch Transfer status";
            default:
                return "Status information unavailable";
        }
    };

    // Get file extension
    const getFileExtension = (filename: string): string => {
        return filename ? filename.split(".").pop()?.toLowerCase() || "" : "";
    };

    // Get file icon based on extension
    const getFileIcon = (filename: string) => {
        if (!filename) return <FileText className="h-6 w-6 text-gray-500" />;

        const extension = getFileExtension(filename);

        switch (extension) {
            case "pdf":
                return <FileText className="h-6 w-6 text-red-500" />;
            case "doc":
            case "docx":
                return <FileText className="h-6 w-6 text-blue-500" />;
            case "xls":
            case "xlsx":
                return <FileText className="h-6 w-6 text-green-500" />;
            default:
                return <FileText className="h-6 w-6 text-gray-500" />;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Purchase Order: ${purchaseOrder.code}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb and actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <Breadcrumb
                            items={[
                                {
                                    label: "Purchase Order Management",
                                    href: route("purchaseOrders.index"),
                                },
                                { label: purchaseOrder.code },
                            ]}
                        />

                        <div className="flex items-center gap-2">
                            <Link
                                href={route(
                                    "purchaseOrders.edit",
                                    purchaseOrder.id
                                )}
                            >
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 border-gray-300"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Purchase Order
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Header with status and key info */}
                    <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-teal-500 p-6 shadow-lg">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-green-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-teal-500/30 blur-2xl"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                                            <ShoppingCart className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                                Purchase Order #
                                                {purchaseOrder.code}
                                            </h1>
                                            <p className="text-green-100 text-sm">
                                                Created on{" "}
                                                {formatDate(
                                                    purchaseOrder.created_at ||
                                                        ""
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Badge
                                            variant="outline"
                                            className={`px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-sm border-white/20 
                                            ${
                                                purchaseOrder.status === "wip"
                                                    ? "bg-blue-500/20 text-white"
                                                    : purchaseOrder.status ===
                                                      "ar"
                                                    ? "bg-green-500/20 text-white"
                                                    : "bg-amber-500/20 text-white"
                                            }`}
                                        >
                                            {getStatusIcon(
                                                purchaseOrder.status
                                            )}
                                            <span>
                                                {purchaseOrder.status.toUpperCase()}
                                            </span>
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                        >
                                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                            <span>
                                                {formatDate(purchaseOrder.date)}
                                            </span>
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                        >
                                            <Coins className="h-3.5 w-3.5 mr-1.5" />
                                            <span>
                                                {formatCurrency(
                                                    purchaseOrder.amount
                                                )}
                                            </span>
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex-1 min-w-[180px]">
                                        <p className="text-green-100 text-xs font-medium mb-1">
                                            Job Number
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="text-white font-medium">
                                                    {purchaseOrder.job_number ||
                                                        "Not specified"}
                                                </p>
                                                <p className="text-green-100 text-xs">
                                                    Reference ID
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex-1 min-w-[180px]">
                                        <p className="text-green-100 text-xs font-medium mb-1">
                                            Contract Number
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="text-white font-medium">
                                                    {purchaseOrder.contract_number ||
                                                        "Not specified"}
                                                </p>
                                                <p className="text-green-100 text-xs">
                                                    Contract reference
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content with tabs */}
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="flex w-full border-b border-border mb-8 p-0 bg-transparent">
                            <TabsTrigger
                                value="details"
                                className="flex items-center gap-2 px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:font-medium transition-all duration-200 text-muted-foreground hover:text-foreground -mb-px"
                            >
                                <FileText className="h-4 w-4" />
                                Details
                            </TabsTrigger>
                            <TabsTrigger
                                value="quotation"
                                className="flex items-center gap-2 px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:font-medium transition-all duration-200 text-muted-foreground hover:text-foreground -mb-px"
                            >
                                <ClipboardList className="h-4 w-4" />
                                Related Quotation
                            </TabsTrigger>
                            <TabsTrigger
                                value="attachments"
                                className="flex items-center gap-2 px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:font-medium transition-all duration-200 text-muted-foreground hover:text-foreground -mb-px"
                            >
                                <FileText className="h-4 w-4" />
                                Attachments
                            </TabsTrigger>
                        </TabsList>

                        {/* Details Tab */}
                        <TabsContent value="details" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left column - PO details */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* PO Information Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="overflow-hidden border-border">
                                            <CardHeader className="pb-3 bg-muted/40">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                            <div className="bg-green-100 p-1.5 rounded-md">
                                                                <ShoppingCart className="h-5 w-5 text-green-600" />
                                                            </div>
                                                            Purchase Order
                                                            Information
                                                        </CardTitle>
                                                        <CardDescription>
                                                            Details about the
                                                            purchase order
                                                        </CardDescription>
                                                    </div>
                                                    {getStatusBadge(
                                                        purchaseOrder.status
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Code */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            PO Number
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base font-semibold">
                                                            <Tag className="h-4 w-4 text-green-500 mr-2" />
                                                            {purchaseOrder.code}
                                                        </p>
                                                    </div>

                                                    {/* Date */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            PO Date
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Calendar className="h-4 w-4 text-green-500 mr-2" />
                                                            {formatDate(
                                                                purchaseOrder.date
                                                            )}
                                                        </p>
                                                    </div>

                                                    {/* Job Number */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Job Number
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Briefcase className="h-4 w-4 text-green-500 mr-2" />
                                                            {purchaseOrder.job_number ||
                                                                "Not specified"}
                                                        </p>
                                                    </div>

                                                    {/* Contract Number */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Contract Number
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                                                            {purchaseOrder.contract_number ||
                                                                "Not specified"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-100">
                                                    <h3 className="text-sm font-medium text-green-700 flex items-center mb-3">
                                                        <Coins className="h-4 w-4 text-green-600 mr-2" />
                                                        Purchase Order Amount
                                                    </h3>
                                                    <p className="text-3xl font-bold text-green-800">
                                                        {formatCurrency(
                                                            purchaseOrder.amount
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-green-600 mt-2">
                                                        Total value of this
                                                        purchase order
                                                    </p>
                                                </div>

                                                {/* Created / Updated */}
                                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Created At */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Created
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Clock className="h-4 w-4 text-green-500 mr-2" />
                                                            {formatDate(
                                                                purchaseOrder.created_at ||
                                                                    ""
                                                            )}{" "}
                                                            at{" "}
                                                            {formatTime(
                                                                purchaseOrder.created_at ||
                                                                    ""
                                                            )}
                                                        </p>
                                                    </div>

                                                    {/* Updated At */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Last Updated
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Clock className="h-4 w-4 text-green-500 mr-2" />
                                                            {formatDate(
                                                                purchaseOrder.updated_at ||
                                                                    purchaseOrder.created_at ||
                                                                    ""
                                                            )}{" "}
                                                            at{" "}
                                                            {formatTime(
                                                                purchaseOrder.updated_at ||
                                                                    purchaseOrder.created_at ||
                                                                    ""
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* Status Timeline Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.1,
                                        }}
                                    >
                                        <Card className="overflow-hidden border-border">
                                            <CardHeader className="pb-3 bg-muted/40">
                                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                    <div className="bg-blue-100 p-1.5 rounded-md">
                                                        <ClipboardCheck className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    Order Status
                                                </CardTitle>
                                                <CardDescription>
                                                    Current status and
                                                    processing timeline
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="relative pl-10 pb-8 pt-2">
                                                    {/* Timeline track */}
                                                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-muted"></div>

                                                    {/* Timeline items */}
                                                    <div className="space-y-6">
                                                        {/* Creation item */}
                                                        <div className="relative">
                                                            <div className="absolute -left-5 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                                                <ShoppingCart className="h-5 w-5 text-green-600" />
                                                            </div>
                                                            <div className="ml-6">
                                                                <h3 className="font-medium">
                                                                    Purchase
                                                                    Order
                                                                    Created
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    Order #
                                                                    {
                                                                        purchaseOrder.code
                                                                    }{" "}
                                                                    created in
                                                                    the system
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {formatDate(
                                                                        purchaseOrder.created_at ||
                                                                            ""
                                                                    )}{" "}
                                                                    at{" "}
                                                                    {formatTime(
                                                                        purchaseOrder.created_at ||
                                                                            ""
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Status item */}
                                                        <div className="relative">
                                                            <div
                                                                className={`absolute -left-5 top-1 flex h-10 w-10 items-center justify-center rounded-full 
                                                                ${
                                                                    purchaseOrder.status ===
                                                                    "wip"
                                                                        ? "bg-blue-100"
                                                                        : purchaseOrder.status ===
                                                                          "ar"
                                                                        ? "bg-green-100"
                                                                        : "bg-amber-100"
                                                                }`}
                                                            >
                                                                {purchaseOrder.status ===
                                                                    "wip" && (
                                                                    <Clock className="h-5 w-5 text-blue-600" />
                                                                )}
                                                                {purchaseOrder.status ===
                                                                    "ar" && (
                                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                                )}
                                                                {purchaseOrder.status ===
                                                                    "ibt" && (
                                                                    <FileCheck className="h-5 w-5 text-amber-600" />
                                                                )}
                                                            </div>
                                                            <div className="ml-6">
                                                                <h3 className="font-medium">
                                                                    Current
                                                                    Status:{" "}
                                                                    {purchaseOrder.status.toUpperCase()}
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {getStatusDescription(
                                                                        purchaseOrder.status
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {formatDate(
                                                                        purchaseOrder.updated_at ||
                                                                            purchaseOrder.created_at ||
                                                                            ""
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Delivery item - conditional for completed statuses */}
                                                        {(purchaseOrder.status ===
                                                            "ar" ||
                                                            purchaseOrder.status ===
                                                                "ibt") && (
                                                            <div className="relative">
                                                                <div className="absolute -left-5 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                                    <Truck className="h-5 w-5 text-blue-600" />
                                                                </div>
                                                                <div className="ml-6">
                                                                    <h3 className="font-medium">
                                                                        Order
                                                                        Processed
                                                                    </h3>
                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                        Purchase
                                                                        order
                                                                        has been
                                                                        processed
                                                                        for{" "}
                                                                        {purchaseOrder.status ===
                                                                        "ar"
                                                                            ? "accounts receivable"
                                                                            : "inter-branch transfer"}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        {formatDate(
                                                                            purchaseOrder.updated_at ||
                                                                                ""
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>

                                {/* Right column - Quotation & customer info */}
                                <div className="space-y-6">
                                    {/* Customer Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.3,
                                        }}
                                    >
                                        <Card className="overflow-hidden border-border">
                                            <CardHeader className="pb-3 bg-muted/40">
                                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                    <div className="bg-green-100 p-1.5 rounded-md">
                                                        <Building2 className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    Customer
                                                </CardTitle>
                                                <CardDescription>
                                                    Company associated with this
                                                    order
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="bg-gradient-to-r from-green-50 to-green-50/30 rounded-lg p-5 border border-green-100 mb-6">
                                                    <div className="flex items-center">
                                                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                                            <Building2 className="h-7 w-7 text-green-700" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-medium text-foreground">
                                                                {purchaseOrder
                                                                    .quotation
                                                                    ?.inquiry
                                                                    ?.customer
                                                                    ?.name ||
                                                                    "Customer information unavailable"}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Customer ID:{" "}
                                                                {purchaseOrder
                                                                    .quotation
                                                                    ?.inquiry
                                                                    ?.customer
                                                                    ?.id ||
                                                                    "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {purchaseOrder.quotation
                                                    ?.inquiry?.customer && (
                                                    <div className="space-y-4 mt-4">
                                                        {/* Email */}
                                                        <div className="flex items-start p-3 rounded-md hover:bg-muted/30 transition-colors">
                                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
                                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Email
                                                                </p>
                                                                <a
                                                                    href={`mailto:${purchaseOrder.quotation.inquiry.customer.email}`}
                                                                    className="text-sm text-blue-600 hover:underline flex items-center"
                                                                >
                                                                    {
                                                                        purchaseOrder
                                                                            .quotation
                                                                            .inquiry
                                                                            .customer
                                                                            .email
                                                                    }
                                                                    <ExternalLink className="h-3 w-3 ml-1" />
                                                                </a>
                                                            </div>
                                                        </div>

                                                        {/* Phone */}
                                                        {purchaseOrder.quotation
                                                            .inquiry.customer
                                                            .phone && (
                                                            <div className="flex items-start p-3 rounded-md hover:bg-muted/30 transition-colors">
                                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
                                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Phone
                                                                    </p>
                                                                    <a
                                                                        href={`tel:${purchaseOrder.quotation.inquiry.customer.phone}`}
                                                                        className="text-sm text-blue-600 hover:underline flex items-center"
                                                                    >
                                                                        {
                                                                            purchaseOrder
                                                                                .quotation
                                                                                .inquiry
                                                                                .customer
                                                                                .phone
                                                                        }
                                                                        <ExternalLink className="h-3 w-3 ml-1" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Address */}
                                                        {purchaseOrder.quotation
                                                            .inquiry.customer
                                                            .address && (
                                                            <div className="flex items-start p-3 rounded-md hover:bg-muted/30 transition-colors">
                                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
                                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Address
                                                                    </p>
                                                                    <p className="text-sm">
                                                                        {
                                                                            purchaseOrder
                                                                                .quotation
                                                                                .inquiry
                                                                                .customer
                                                                                .address
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <Separator className="my-6" />

                                                {purchaseOrder.quotation
                                                    ?.inquiry?.customer && (
                                                    <Link
                                                        href={route(
                                                            "customers.show",
                                                            purchaseOrder
                                                                .quotation
                                                                .inquiry
                                                                .customer.id
                                                        )}
                                                    >
                                                        <Button
                                                            variant="default"
                                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                            <Building2 className="h-4 w-4 mr-2" />
                                                            View Customer
                                                            Profile
                                                            <ChevronRight className="h-4 w-4 ml-1" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* Related Information Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.4,
                                        }}
                                        className="hidden lg:block"
                                    >
                                        <Card className="border-border">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg font-bold">
                                                    At a Glance
                                                </CardTitle>
                                                <CardDescription>
                                                    Key information summary
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                                                        <span className="text-sm text-muted-foreground">
                                                            Status
                                                        </span>
                                                        <Badge
                                                            className={
                                                                purchaseOrder.status ===
                                                                "wip"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : purchaseOrder.status ===
                                                                      "ar"
                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                    : "bg-amber-100 text-amber-800"
                                                            }
                                                        >
                                                            {purchaseOrder.status.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                                                        <span className="text-sm text-muted-foreground">
                                                            PO Date
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {formatDate(
                                                                purchaseOrder.date
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                                                        <span className="text-sm text-muted-foreground">
                                                            Amount
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {formatCurrency(
                                                                purchaseOrder.amount
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2">
                                                        <span className="text-sm text-muted-foreground">
                                                            Has File
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                purchaseOrder.file
                                                                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                                    : "bg-amber-100 text-amber-800 border-amber-200"
                                                            }
                                                        >
                                                            {purchaseOrder.file
                                                                ? "Yes"
                                                                : "No"}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="mt-6">
                                                    <Link
                                                        href={route(
                                                            "purchaseOrders.edit",
                                                            purchaseOrder.id
                                                        )}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="w-full"
                                                        >
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit Purchase Order
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Quotation Tab */}
                        <TabsContent value="quotation" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                <ClipboardList className="h-5 w-5 text-green-500" />
                                                Related Quotation
                                            </CardTitle>
                                            <CardDescription>
                                                The quotation associated with
                                                this purchase order
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {purchaseOrder.quotation ? (
                                        <div className="space-y-4">
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="group"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                                                    <div className="flex items-center mb-3 sm:mb-0">
                                                        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-amber-100 text-amber-700 mr-3">
                                                            <ClipboardList className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium flex items-center">
                                                                {
                                                                    purchaseOrder
                                                                        .quotation
                                                                        .code
                                                                }
                                                                <Badge
                                                                    className={`ml-2 ${
                                                                        purchaseOrder
                                                                            .quotation
                                                                            .status ===
                                                                        "draft"
                                                                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                                            : purchaseOrder
                                                                                  .quotation
                                                                                  .status ===
                                                                              "sent"
                                                                            ? "bg-blue-100 text-blue-800 border-blue-200"
                                                                            : purchaseOrder
                                                                                  .quotation
                                                                                  .status ===
                                                                              "accepted"
                                                                            ? "bg-green-100 text-green-800 border-green-200"
                                                                            : purchaseOrder
                                                                                  .quotation
                                                                                  .status ===
                                                                              "rejected"
                                                                            ? "bg-red-100 text-red-800 border-red-200"
                                                                            : "bg-slate-100 text-slate-800 border-slate-200"
                                                                    }`}
                                                                >
                                                                    {
                                                                        purchaseOrder
                                                                            .quotation
                                                                            .status
                                                                    }
                                                                </Badge>
                                                            </h4>
                                                            <div className="flex items-center mt-1">
                                                                <span className="text-xs text-muted-foreground flex items-center">
                                                                    <Calendar className="h-3 w-3 mr-1" />
                                                                    Due Date:{" "}
                                                                    {formatDate(
                                                                        purchaseOrder
                                                                            .quotation
                                                                            .due_date
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        {purchaseOrder.quotation
                                                            .file && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                    >
                                                                        <a
                                                                            href={`/storage/files/quotations/${purchaseOrder.quotation.file}`}
                                                                            download
                                                                            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                                        >
                                                                            <Download className="h-4 w-4" />
                                                                        </a>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>
                                                                            Download
                                                                            Quotation
                                                                        </p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}

                                                        <Link
                                                            href={route(
                                                                "quotations.show",
                                                                purchaseOrder
                                                                    .quotation
                                                                    .id
                                                            )}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-9"
                                                            >
                                                                View Details
                                                                <ChevronRight className="h-4 w-4 ml-1" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Additional Quotation Info */}
                                            <div className="mt-6 bg-muted/20 p-6 rounded-lg border border-border/40">
                                                <h3 className="text-base font-medium mb-4">
                                                    Related Inquiry
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-muted-foreground">
                                                            Customer
                                                        </h4>
                                                        <p className="text-base">
                                                            {purchaseOrder
                                                                .quotation
                                                                .inquiry
                                                                ?.customer
                                                                ?.name || "N/A"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-muted-foreground">
                                                            Inquiry Code
                                                        </h4>
                                                        <p className="text-base flex items-center">
                                                            <span>
                                                                {
                                                                    purchaseOrder
                                                                        .quotation
                                                                        .inquiry
                                                                        ?.code
                                                                }
                                                            </span>
                                                            {purchaseOrder
                                                                .quotation
                                                                .inquiry && (
                                                                <Link
                                                                    href={route(
                                                                        "inquiries.show",
                                                                        purchaseOrder
                                                                            .quotation
                                                                            .inquiry
                                                                            .id
                                                                    )}
                                                                    className="text-blue-600 hover:text-blue-800 ml-2"
                                                                >
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                </Link>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Quotation negotiations */}
                                                {purchaseOrder.quotation
                                                    .negotiations &&
                                                    purchaseOrder.quotation
                                                        .negotiations.length >
                                                        0 && (
                                                        <>
                                                            <h4 className="text-sm font-medium text-muted-foreground mb-2 mt-4">
                                                                Negotiations
                                                            </h4>
                                                            <div className="bg-muted/30 p-3 rounded border border-border/40">
                                                                <p className="text-sm font-medium mb-2">
                                                                    This
                                                                    quotation
                                                                    has{" "}
                                                                    {
                                                                        purchaseOrder
                                                                            .quotation
                                                                            .negotiations
                                                                            .length
                                                                    }{" "}
                                                                    negotiation
                                                                    records
                                                                </p>
                                                                <Link
                                                                    href={route(
                                                                        "quotations.show",
                                                                        purchaseOrder
                                                                            .quotation
                                                                            .id
                                                                    )}
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="mt-1"
                                                                    >
                                                                        View
                                                                        Negotiation
                                                                        History
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </>
                                                    )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 px-4">
                                            <div className="bg-muted/30 inline-flex rounded-full p-3 mb-4">
                                                <AlertCircle className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-medium mb-2">
                                                No related quotation
                                            </h3>
                                            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                                                This purchase order is not
                                                linked to any quotation.
                                            </p>
                                            <Link
                                                href={route("quotations.index")}
                                            >
                                                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                                                    <ClipboardList className="h-4 w-4 mr-2" />
                                                    View All Quotations
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Attachments Tab */}
                        <TabsContent value="attachments" className="space-y-6">
                            <Card>
                                <CardHeader className="pb-3 bg-muted/40">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                <div className="bg-green-100 p-1.5 rounded-md">
                                                    <FileText className="h-5 w-5 text-green-600" />
                                                </div>
                                                Documents & Attachments
                                            </CardTitle>
                                            <CardDescription>
                                                Files related to this purchase
                                                order
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {purchaseOrder.file ? (
                                        <div className="space-y-4">
                                            <div className="p-6 bg-green-50 border border-green-100 rounded-lg">
                                                <div className="flex items-start">
                                                    <div className="w-12 h-12 rounded-md flex items-center justify-center bg-white border border-green-200 shadow-sm mr-4">
                                                        {getFileIcon(
                                                            purchaseOrder.file
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-medium">
                                                            Purchase Order
                                                            Document
                                                        </h3>
                                                        <p className="text-sm text-green-700 mb-4">
                                                            Official purchase
                                                            order document for{" "}
                                                            {purchaseOrder.code}
                                                        </p>
                                                        <div className="flex items-center">
                                                            <p className="text-sm text-muted-foreground mr-4">
                                                                {purchaseOrder.file
                                                                    .split("/")
                                                                    .pop() ||
                                                                    purchaseOrder.file}
                                                            </p>
                                                            <Badge className="bg-green-100 text-green-800 border-green-200">
                                                                {getFileExtension(
                                                                    purchaseOrder.file
                                                                ).toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={`/storage/files/purchaseOrders/${purchaseOrder.file}`}
                                                        download
                                                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition-colors"
                                                    >
                                                        <Download className="h-5 w-5" />
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="mt-6">
                                                <a
                                                    href={`/storage/files/purchaseOrders/${purchaseOrder.file}`}
                                                    target="_blank"
                                                    className="w-full flex items-center justify-center p-6 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30 hover:bg-muted/30 transition-colors"
                                                >
                                                    <ExternalLink className="h-5 w-5 mr-2" />
                                                    <span className="text-blue-600 hover:underline">
                                                        Open document in new tab
                                                    </span>
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 px-4">
                                            <div className="bg-muted/30 inline-flex rounded-full p-3 mb-4">
                                                <FileText className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-medium mb-2">
                                                No documents attached
                                            </h3>
                                            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                                                This purchase order does not
                                                have any attached documents.
                                            </p>
                                            <Link
                                                href={route(
                                                    "purchaseOrders.edit",
                                                    purchaseOrder.id
                                                )}
                                            >
                                                <Button className="bg-green-600 hover:bg-green-700 text-white">
                                                    <Paperclip className="h-4 w-4 mr-2" />
                                                    Add Document
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default PurchaseOrdersShow;

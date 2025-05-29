import { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { PageProps, Quotation } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import {
    Building2,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    Edit,
    FileSpreadsheet,
    FileText,
    FileWarning,
    Layers,
    Mail,
    MapPin,
    Phone,
    XCircle,
    Trash,
    AlertTriangle,
    ChevronRight,
    Clock3,
    CreditCard,
    HardHat,
    UserCircle,
    Plus,
    Briefcase,
    MessageSquare,
    ClockIcon,
    FileUp,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import { format, parseISO, differenceInDays } from "date-fns";
import { Badge } from "@/Components/ui/badge";
import { useForm } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShowQuotationProps extends PageProps {
    quotation: Quotation;
}

const QuotationShow = () => {
    const { quotation } = usePage<ShowQuotationProps>().props;
    const { delete: destroy } = useForm({});

    // Get file icon based on filename
    const getFileIcon = (filename: string) => {
        if (!filename) return <FileText className="h-5 w-5 text-gray-500" />;

        const extension = filename.split(".").pop()?.toLowerCase();

        switch (extension) {
            case "pdf":
                return <FileText className="h-5 w-5 text-red-500" />;
            case "doc":
            case "docx":
                return <FileText className="h-5 w-5 text-blue-500" />;
            case "xls":
            case "xlsx":
                return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
            default:
                return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };

    const handleDeleteNegotiation = (id: number) => {
        if (
            confirm(
                "Are you sure you want to delete this negotiation document?"
            )
        ) {
            destroy(route("negotiations.destroy", id), {
                preserveScroll: true,
                onSuccess: () => {
                    console.log("Negotiation deleted successfully");
                },
            });
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return format(parseISO(dateString), "MMMM d, yyyy");
    };

    // Format time for display
    const formatTime = (dateString: string) => {
        if (!dateString) return "N/A";
        return format(parseISO(dateString), "h:mm a");
    };

    // Check if quotation is expired
    const isExpired = () => {
        if (!quotation.due_date) return false;
        const today = new Date();
        const dueDate = parseISO(quotation.due_date);
        return today > dueDate;
    };

    // Get days until expiration
    const getDaysUntilExpiration = () => {
        if (!quotation.due_date) return 0;
        const today = new Date();
        const dueDate = parseISO(quotation.due_date);
        return differenceInDays(dueDate, today);
    };

    // Get status badge variant
    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200";
            case "approved":
                return "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200";
            case "rejected":
                return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
            default:
                return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
        }
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "n/a":
                return <Clock className="h-3.5 w-3.5 mr-1.5" />;
            case "val":
                return <CheckCircle className="h-3.5 w-3.5 mr-1.5" />;
            case "lost":
                return <XCircle className="h-3.5 w-3.5 mr-1.5" />;
            case "clsd":
                return <CheckCircle className="h-3.5 w-3.5 mr-1.5" />;
            default:
                return <Clock className="h-3.5 w-3.5 mr-1.5" />;
        }
    };

    // Handle quotation deletion
    const handleDelete = () => {
        destroy(route("quotations.destroy", quotation.id), {
            onSuccess: () => {
                // Redirect will be handled by the controller
                console.log("Quotation deleted successfully");
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Quotation: ${quotation.code}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb and actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <Breadcrumb
                            items={[
                                {
                                    label: "Quotation Management",
                                    href: route("quotations.index"),
                                },
                                { label: quotation.code },
                            ]}
                        />
                    </div>

                    {/* Header with status and key info */}
                    <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 p-6 shadow-lg">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-blue-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-indigo-500/30 blur-2xl"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                                            <CreditCard className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                                Quotation #{quotation.code}
                                            </h1>
                                            <p className="text-blue-100 text-sm">
                                                Created on{" "}
                                                {formatDate(
                                                    quotation.created_at || ""
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Badge
                                            variant="outline"
                                            className={`px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-sm border-white/20 
                                            ${
                                                quotation.status === "pending"
                                                    ? "bg-yellow-500/20 text-white"
                                                    : quotation.status ===
                                                      "approved"
                                                    ? "bg-green-500/20 text-white"
                                                    : quotation.status ===
                                                      "rejected"
                                                    ? "bg-red-500/20 text-white"
                                                    : "bg-gray-500/20 text-white"
                                            }`}
                                        >
                                            {getStatusIcon(quotation.status)}
                                            <span>
                                                {quotation.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    quotation.status.slice(1)}
                                            </span>
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                        >
                                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                            <span>
                                                Due:{" "}
                                                {formatDate(quotation.due_date)}
                                            </span>
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex-1 min-w-[180px]">
                                        <p className="text-blue-100 text-xs font-medium mb-1">
                                            Customer
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="text-white font-medium">
                                                    {
                                                        quotation.inquiry
                                                            .customer.name
                                                    }
                                                </p>
                                                <p className="text-blue-100 text-xs">
                                                    {
                                                        quotation.inquiry
                                                            .customer.email
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex-1 min-w-[180px]">
                                        <p className="text-blue-100 text-xs font-medium mb-1">
                                            Inquiry
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="text-white font-medium">
                                                    #{quotation.inquiry.code}
                                                </p>
                                                <p className="text-blue-100 text-xs">
                                                    {formatDate(
                                                        quotation.inquiry
                                                            .inquiry_date
                                                    )}
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
                                className="flex items-center gap-2 px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:font-medium transition-all duration-200 text-muted-foreground hover:text-foreground -mb-px"
                            >
                                <FileText className="h-4 w-4" />
                                Details
                            </TabsTrigger>
                            <TabsTrigger
                                value="negotiations"
                                className="flex items-center gap-2 px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:font-medium transition-all duration-200 text-muted-foreground hover:text-foreground -mb-px"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Negotiations
                            </TabsTrigger>
                            <TabsTrigger
                                value="team"
                                className="flex items-center gap-2 px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:font-medium transition-all duration-200 text-muted-foreground hover:text-foreground -mb-px"
                            >
                                <Briefcase className="h-4 w-4" />
                                Team
                            </TabsTrigger>
                        </TabsList>

                        {/* Details Tab */}
                        <TabsContent value="details" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left column - Quotation details */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Quotation Information Card */}
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
                                                            <div className="bg-blue-100 p-1.5 rounded-md">
                                                                <CreditCard className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            Quotation
                                                            Information
                                                        </CardTitle>
                                                        <CardDescription>
                                                            Details about the
                                                            quotation
                                                        </CardDescription>
                                                    </div>

                                                    <Badge
                                                        className={cn(
                                                            quotation.status ===
                                                                "n/a"
                                                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                                                : quotation.status ===
                                                                  "val"
                                                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                                : quotation.status ===
                                                                  "lost"
                                                                ? "bg-red-100 text-red-800 border-red-200"
                                                                : quotation.status ===
                                                                  "clsd"
                                                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                                                : "bg-gray-100 text-gray-800 border-gray-200"
                                                        )}
                                                    >
                                                        {getStatusIcon(
                                                            quotation.status
                                                        )}
                                                        {quotation.status ===
                                                        "n/a"
                                                            ? "Not Applicable"
                                                            : quotation.status ===
                                                              "val"
                                                            ? "Validated"
                                                            : quotation.status ===
                                                              "lost"
                                                            ? "Lost"
                                                            : quotation.status ===
                                                              "clsd"
                                                            ? "Closed"
                                                            : quotation.status}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Code */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Quotation Code
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base font-semibold">
                                                            <FileText className="h-4 w-4 text-blue-500 mr-2" />
                                                            {quotation.code}
                                                        </p>
                                                    </div>

                                                    {/* Due Date */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Due Date
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                                                            {formatDate(
                                                                quotation.due_date
                                                            )}
                                                            {isExpired() ? (
                                                                <Badge className="ml-2 bg-red-100 text-red-800 border-red-200">
                                                                    Expired
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                                                                    {getDaysUntilExpiration()}{" "}
                                                                    days left
                                                                </Badge>
                                                            )}
                                                        </p>
                                                    </div>

                                                    {/* Created At */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Created
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Clock className="h-4 w-4 text-blue-500 mr-2" />
                                                            {formatDate(
                                                                quotation.created_at ||
                                                                    ""
                                                            )}{" "}
                                                            at{" "}
                                                            {formatTime(
                                                                quotation.created_at ||
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
                                                            <Clock className="h-4 w-4 text-blue-500 mr-2" />
                                                            {formatDate(
                                                                quotation.updated_at ||
                                                                    ""
                                                            )}{" "}
                                                            at{" "}
                                                            {formatTime(
                                                                quotation.updated_at ||
                                                                    ""
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Quotation File */}
                                                <div className="mt-8">
                                                    <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-3">
                                                        <FileText className="h-4 w-4 text-blue-500 mr-2" />
                                                        Quotation Document
                                                    </h3>
                                                    {quotation.file ? (
                                                        <div className="mt-2">
                                                            <a
                                                                href={`/storage/files/quotations/${quotation.file}`}
                                                                download
                                                                className="flex items-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group shadow-sm"
                                                            >
                                                                <div className="w-12 h-12 rounded-md flex items-center justify-center bg-blue-100 text-blue-700 mr-4 group-hover:bg-blue-200 transition-colors">
                                                                    {getFileIcon(
                                                                        quotation.file
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium">
                                                                        {quotation.file
                                                                            .split(
                                                                                "/"
                                                                            )
                                                                            .pop()}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Click to
                                                                        download
                                                                        quotation
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors"
                                                                >
                                                                    <Download className="h-4 w-4 mr-2" />
                                                                    Download
                                                                </Button>
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                                            <div className="text-center">
                                                                <FileWarning className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                                <p className="text-sm text-gray-500">
                                                                    No document
                                                                    attached to
                                                                    this
                                                                    quotation
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* Inquiry Info Card */}
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
                                                    <div className="bg-amber-100 p-1.5 rounded-md">
                                                        <FileText className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    Related Inquiry
                                                </CardTitle>
                                                <CardDescription>
                                                    Details about the inquiry
                                                    this quotation is for
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="bg-gradient-to-r from-amber-50 to-amber-50/30 rounded-lg p-5 border border-amber-100 mb-6">
                                                    <div className="flex items-center">
                                                        <div className="w-12 h-12 rounded-md bg-amber-100 flex items-center justify-center mr-4">
                                                            <FileText className="h-6 w-6 text-amber-700" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-medium">
                                                                Inquiry #
                                                                {
                                                                    quotation
                                                                        .inquiry
                                                                        .code
                                                                }
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Created on{" "}
                                                                {formatDate(
                                                                    quotation
                                                                        .inquiry
                                                                        .created_at ||
                                                                        ""
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Customer */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Customer
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Building2 className="h-4 w-4 text-amber-500 mr-2" />
                                                            {
                                                                quotation
                                                                    .inquiry
                                                                    .customer
                                                                    .name
                                                            }
                                                        </p>
                                                    </div>

                                                    {/* Status */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Inquiry Status
                                                        </h3>
                                                        <div className="mt-1">
                                                            <Badge
                                                                className={cn(
                                                                    quotation
                                                                        .inquiry
                                                                        .status ===
                                                                        "pending"
                                                                        ? "bg-amber-100 text-amber-800"
                                                                        : quotation
                                                                              .inquiry
                                                                              .status ===
                                                                          "resolved"
                                                                        ? "bg-emerald-100 text-emerald-800"
                                                                        : "bg-slate-100 text-slate-800"
                                                                )}
                                                            >
                                                                {
                                                                    quotation
                                                                        .inquiry
                                                                        .status
                                                                }
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Date */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Inquiry Date
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Calendar className="h-4 w-4 text-amber-500 mr-2" />
                                                            {formatDate(
                                                                quotation
                                                                    .inquiry
                                                                    .inquiry_date
                                                            )}
                                                        </p>
                                                    </div>

                                                    {/* Quantity */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Business Unit
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Layers className="h-4 w-4 text-amber-500 mr-2" />
                                                            {
                                                                quotation
                                                                    .inquiry
                                                                    .business_unit
                                                                    .name
                                                            }{" "}
                                                            units
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex justify-end">
                                                    <Link
                                                        href={route(
                                                            "inquiries.show",
                                                            quotation.inquiry.id
                                                        )}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="gap-2"
                                                        >
                                                            View Full Inquiry
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>

                                {/* Right column - Sidebar info */}
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
                                                    <div className="bg-blue-100 p-1.5 rounded-md">
                                                        <Building2 className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    Customer
                                                </CardTitle>
                                                <CardDescription>
                                                    Company that received this
                                                    quotation
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="bg-gradient-to-r from-blue-50 to-blue-50/30 rounded-lg p-5 border border-blue-100 mb-6">
                                                    <div className="flex items-center">
                                                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                                            <Building2 className="h-7 w-7 text-blue-700" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-medium text-foreground">
                                                                {
                                                                    quotation
                                                                        .inquiry
                                                                        .customer
                                                                        .name
                                                                }
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Customer ID:{" "}
                                                                {
                                                                    quotation
                                                                        .inquiry
                                                                        .customer
                                                                        .id
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

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
                                                                href={`mailto:${quotation.inquiry.customer.email}`}
                                                                className="text-sm text-blue-600 hover:underline flex items-center"
                                                            >
                                                                {
                                                                    quotation
                                                                        .inquiry
                                                                        .customer
                                                                        .email
                                                                }
                                                                <ChevronRight className="h-3 w-3 ml-1" />
                                                            </a>
                                                        </div>
                                                    </div>

                                                    {/* Phone */}
                                                    {quotation.inquiry.customer
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
                                                                    href={`tel:${quotation.inquiry.customer.phone}`}
                                                                    className="text-sm text-blue-600 hover:underline flex items-center"
                                                                >
                                                                    {
                                                                        quotation
                                                                            .inquiry
                                                                            .customer
                                                                            .phone
                                                                    }
                                                                    <ChevronRight className="h-3 w-3 ml-1" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Address */}
                                                    {quotation.inquiry.customer
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
                                                                        quotation
                                                                            .inquiry
                                                                            .customer
                                                                            .address
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <Separator className="my-6" />

                                                <Link
                                                    href={route(
                                                        "customers.show",
                                                        quotation.inquiry
                                                            .customer.id
                                                    )}
                                                >
                                                    <Button
                                                        variant="default"
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        <Building2 className="h-4 w-4 mr-2" />
                                                        View Customer Profile
                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* At a Glance Card */}
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
                                                            className={cn(
                                                                quotation.status ===
                                                                    "n/a"
                                                                    ? "bg-amber-100 text-amber-800 border-amber-200"
                                                                    : quotation.status ===
                                                                      "val"
                                                                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                                    : quotation.status ===
                                                                      "lost"
                                                                    ? "bg-red-100 text-red-800 border-red-200"
                                                                    : quotation.status ===
                                                                      "clsd"
                                                                    ? "bg-purple-100 text-purple-800 border-purple-200"
                                                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                                            )}
                                                        >
                                                            {getStatusIcon(
                                                                quotation.status
                                                            )}
                                                            {quotation.status ===
                                                            "n/a"
                                                                ? "Not Applicable"
                                                                : quotation.status ===
                                                                  "val"
                                                                ? "Validated"
                                                                : quotation.status ===
                                                                  "lost"
                                                                ? "Lost"
                                                                : quotation.status ===
                                                                  "clsd"
                                                                ? "Closed"
                                                                : quotation.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                                                        <span className="text-sm text-muted-foreground">
                                                            Due Date
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {formatDate(
                                                                quotation.due_date
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                                                        <span className="text-sm text-muted-foreground">
                                                            Created
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {formatDate(
                                                                quotation.created_at ||
                                                                    ""
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-6">
                                                    <Link
                                                        href={route(
                                                            "quotations.edit",
                                                            quotation.id
                                                        )}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="w-full"
                                                        >
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit Quotation
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="negotiations" className="space-y-6">
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
                                                    <div className="bg-blue-100 p-1.5 rounded-md">
                                                        <MessageSquare className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    Negotiation History
                                                </CardTitle>
                                                <CardDescription>
                                                    Record of all negotiation
                                                    documents and communications
                                                </CardDescription>
                                            </div>
                                            <Link
                                                href={route(
                                                    "quotations.negotiations.create",
                                                    quotation.id
                                                )}
                                            >
                                                <Button
                                                    variant="default"
                                                    className="gap-2"
                                                >
                                                    <FileUp className="h-4 w-4" />
                                                    Add Negotiation Document
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {quotation.negotiations &&
                                        quotation.negotiations.length > 0 ? (
                                            <div className="space-y-4">
                                                {quotation.negotiations.map(
                                                    (negotiation) => (
                                                        <div
                                                            key={negotiation.id}
                                                            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-md flex items-center justify-center bg-blue-100 text-blue-700">
                                                                    {getFileIcon(
                                                                        negotiation.file ||
                                                                            ""
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">
                                                                        {negotiation.file
                                                                            ? negotiation.file
                                                                                  .split(
                                                                                      "/"
                                                                                  )
                                                                                  .pop()
                                                                            : "Unnamed File"}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                                        <ClockIcon className="h-3.5 w-3.5" />
                                                                        {formatDate(
                                                                            negotiation.created_at ||
                                                                                ""
                                                                        )}{" "}
                                                                        at{" "}
                                                                        {formatTime(
                                                                            negotiation.created_at ||
                                                                                ""
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {negotiation.file && (
                                                                    <a
                                                                        href={`/storage/files/negotiations/${negotiation.file}`}
                                                                        download
                                                                        className="p-2 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </a>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="p-2 rounded-full hover:bg-red-100 hover:text-red-700 transition-colors"
                                                                    onClick={() =>
                                                                        handleDeleteNegotiation(
                                                                            negotiation.id
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                                                <div className="bg-blue-50 p-3 rounded-full mb-4">
                                                    <MessageSquare className="h-8 w-8 text-blue-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                    No negotiations yet
                                                </h3>
                                                <p className="text-sm text-gray-500 max-w-md mb-6">
                                                    There are no negotiation
                                                    documents recorded for this
                                                    quotation. Add a new
                                                    negotiation document to
                                                    track communication with the
                                                    customer.
                                                </p>
                                                <Button
                                                    variant="default"
                                                    className="gap-2"
                                                >
                                                    <FileUp className="h-4 w-4" />
                                                    Add First Negotiation
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        {/* Team Tab */}
                        <TabsContent value="team" className="space-y-6">
                            <Card>
                                <CardHeader className="pb-3 bg-muted/40">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                <div className="bg-blue-100 p-1.5 rounded-md">
                                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                                </div>
                                                Team Assignment
                                            </CardTitle>
                                            <CardDescription>
                                                Staff members assigned to handle
                                                this quotation
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {/* Team Summary */}
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-50/20 rounded-lg p-5 border border-blue-100 mb-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <div className="flex -space-x-4">
                                                {quotation.inquiry.sales && (
                                                    <Avatar className="h-12 w-12 border-2 border-white">
                                                        {quotation.inquiry.sales
                                                            .image ? (
                                                            <AvatarImage
                                                                src={`/storage/images/${quotation.inquiry.sales.image}`}
                                                                alt={
                                                                    quotation
                                                                        .inquiry
                                                                        .sales
                                                                        .name
                                                                }
                                                            />
                                                        ) : (
                                                            <AvatarFallback className="bg-amber-100 text-amber-800">
                                                                {quotation.inquiry.sales.name.charAt(
                                                                    0
                                                                )}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                )}
                                                {quotation.inquiry
                                                    .pic_engineer && (
                                                    <Avatar className="h-12 w-12 border-2 border-white">
                                                        {quotation.inquiry
                                                            .pic_engineer
                                                            .image ? (
                                                            <AvatarImage
                                                                src={`/storage/images/${quotation.inquiry.pic_engineer.image}`}
                                                                alt={
                                                                    quotation
                                                                        .inquiry
                                                                        .pic_engineer
                                                                        .name
                                                                }
                                                            />
                                                        ) : (
                                                            <AvatarFallback className="bg-blue-100 text-blue-800">
                                                                {quotation.inquiry.pic_engineer.name.charAt(
                                                                    0
                                                                )}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                )}
                                                {!quotation.inquiry.sales &&
                                                    !quotation.inquiry
                                                        .pic_engineer && (
                                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                                            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-foreground">
                                                    {quotation.inquiry.sales ||
                                                    quotation.inquiry
                                                        .pic_engineer
                                                        ? "Team Members"
                                                        : "No Team Assigned"}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {quotation.inquiry.sales &&
                                                    quotation.inquiry
                                                        .pic_engineer
                                                        ? "Sales representative and PIC engineer are assigned to this quotation"
                                                        : quotation.inquiry
                                                              .sales
                                                        ? "Only sales representative is assigned"
                                                        : quotation.inquiry
                                                              .pic_engineer
                                                        ? "Only PIC engineer is assigned"
                                                        : "No team members have been assigned to this quotation yet"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Sales Rep */}
                                        <div className="rounded-lg border border-border overflow-hidden">
                                            <div className="bg-amber-50/50 p-4 border-b border-border">
                                                <h3 className="font-medium flex items-center">
                                                    <UserCircle className="h-5 w-5 text-amber-500 mr-2" />
                                                    Sales Representative
                                                </h3>
                                            </div>

                                            {quotation.inquiry.sales ? (
                                                <div className="p-5">
                                                    <div className="flex items-start">
                                                        <Avatar className="h-16 w-16 mr-4 border border-border">
                                                            {quotation.inquiry
                                                                .sales.image ? (
                                                                <AvatarImage
                                                                    src={`/storage/images/${quotation.inquiry.sales.image}`}
                                                                    alt={
                                                                        quotation
                                                                            .inquiry
                                                                            .sales
                                                                            .name
                                                                    }
                                                                />
                                                            ) : (
                                                                <AvatarFallback className="bg-amber-100 text-amber-800 text-xl">
                                                                    {quotation.inquiry.sales.name.charAt(
                                                                        0
                                                                    )}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <h4 className="text-lg font-medium">
                                                                {
                                                                    quotation
                                                                        .inquiry
                                                                        .sales
                                                                        .name
                                                                }
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground mb-3">
                                                                Sales
                                                                Representative
                                                            </p>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                                                <a
                                                                    href={`mailto:${quotation.inquiry.sales.email}`}
                                                                    className="flex items-center p-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-blue-600 hover:underline"
                                                                >
                                                                    <div className="bg-blue-100 p-1.5 rounded-md mr-2">
                                                                        <Mail className="h-4 w-4 text-blue-600" />
                                                                    </div>
                                                                    <span className="truncate">
                                                                        {
                                                                            quotation
                                                                                .inquiry
                                                                                .sales
                                                                                .email
                                                                        }
                                                                    </span>
                                                                </a>

                                                                {quotation
                                                                    .inquiry
                                                                    .sales
                                                                    .phone && (
                                                                    <a
                                                                        href={`tel:${quotation.inquiry.sales.phone}`}
                                                                        className="flex items-center p-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-blue-600 hover:underline"
                                                                    >
                                                                        <div className="bg-green-100 p-1.5 rounded-md mr-2">
                                                                            <Phone className="h-4 w-4 text-green-600" />
                                                                        </div>
                                                                        <span>
                                                                            {
                                                                                quotation
                                                                                    .inquiry
                                                                                    .sales
                                                                                    .phone
                                                                            }
                                                                        </span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-8 bg-white">
                                                    <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30 text-center">
                                                        <div className="bg-muted rounded-full p-3 mb-4">
                                                            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                        <p className="text-base font-medium text-muted-foreground mb-1">
                                                            No Sales
                                                            Representative
                                                        </p>
                                                        <p className="text-sm text-muted-foreground/70 max-w-xs mx-auto mb-4">
                                                            A sales
                                                            representative
                                                            hasn't been assigned
                                                            to this quotation
                                                            yet.
                                                        </p>
                                                        <Link
                                                            href={route(
                                                                "inquiries.edit",
                                                                quotation
                                                                    .inquiry.id
                                                            )}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-1.5"
                                                            >
                                                                <UserCircle className="h-4 w-4" />
                                                                <span>
                                                                    Assign Sales
                                                                    Rep
                                                                </span>
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* PIC Engineer */}
                                        <div className="rounded-lg border border-border overflow-hidden">
                                            <div className="bg-blue-50/50 p-4 border-b border-border">
                                                <h3 className="font-medium flex items-center">
                                                    <HardHat className="h-5 w-5 text-blue-500 mr-2" />
                                                    PIC Engineer
                                                </h3>
                                            </div>

                                            {quotation.inquiry.pic_engineer ? (
                                                <div className="p-5">
                                                    <div className="flex items-start">
                                                        <Avatar className="h-16 w-16 mr-4 border border-border">
                                                            {quotation.inquiry
                                                                .pic_engineer
                                                                .image ? (
                                                                <AvatarImage
                                                                    src={`/storage/images/${quotation.inquiry.pic_engineer.image}`}
                                                                    alt={
                                                                        quotation
                                                                            .inquiry
                                                                            .pic_engineer
                                                                            .name
                                                                    }
                                                                />
                                                            ) : (
                                                                <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                                                                    {quotation.inquiry.pic_engineer.name.charAt(
                                                                        0
                                                                    )}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <h4 className="text-lg font-medium">
                                                                {
                                                                    quotation
                                                                        .inquiry
                                                                        .pic_engineer
                                                                        .name
                                                                }
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground mb-3">
                                                                PIC Engineer
                                                            </p>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                                                <a
                                                                    href={`mailto:${quotation.inquiry.pic_engineer.email}`}
                                                                    className="flex items-center p-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-blue-600 hover:underline"
                                                                >
                                                                    <div className="bg-blue-100 p-1.5 rounded-md mr-2">
                                                                        <Mail className="h-4 w-4 text-blue-600" />
                                                                    </div>
                                                                    <span className="truncate">
                                                                        {
                                                                            quotation
                                                                                .inquiry
                                                                                .pic_engineer
                                                                                .email
                                                                        }
                                                                    </span>
                                                                </a>

                                                                {quotation
                                                                    .inquiry
                                                                    .pic_engineer
                                                                    .phone && (
                                                                    <a
                                                                        href={`tel:${quotation.inquiry.pic_engineer.phone}`}
                                                                        className="flex items-center p-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-blue-600 hover:underline"
                                                                    >
                                                                        <div className="bg-green-100 p-1.5 rounded-md mr-2">
                                                                            <Phone className="h-4 w-4 text-green-600" />
                                                                        </div>
                                                                        <span>
                                                                            {
                                                                                quotation
                                                                                    .inquiry
                                                                                    .pic_engineer
                                                                                    .phone
                                                                            }
                                                                        </span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-8 bg-white">
                                                    <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30 text-center">
                                                        <div className="bg-muted rounded-full p-3 mb-4">
                                                            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                        <p className="text-base font-medium text-muted-foreground mb-1">
                                                            No PIC Engineer
                                                        </p>
                                                        <p className="text-sm text-muted-foreground/70 max-w-xs mx-auto mb-4">
                                                            A person-in-charge
                                                            engineer hasn't been
                                                            assigned to this
                                                            quotation yet.
                                                        </p>
                                                        <Link
                                                            href={route(
                                                                "inquiries.edit",
                                                                quotation
                                                                    .inquiry.id
                                                            )}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-1.5"
                                                            >
                                                                <HardHat className="h-4 w-4" />
                                                                <span>
                                                                    Assign
                                                                    Engineer
                                                                </span>
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default QuotationShow;

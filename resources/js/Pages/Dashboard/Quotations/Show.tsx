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
    FileCheck,
    DollarSign,
    Building,
    ArrowLeft,
    Trash2,
    ChevronDown,
    ChevronUp,
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
import { cn, formatCurrency } from "@/lib/utils";

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
                return <FileText className="h-5 w-5 text-amber-500" />;
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
                return "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200";
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

                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-amber-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-orange-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <FileCheck className="mr-3 h-8 w-8" />
                                    Quotation #{quotation.code}
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-amber-100 text-lg">
                                    Created on{" "}
                                    {formatDate(quotation.created_at || "")}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        {getStatusIcon(quotation.status)}
                                        <span>
                                            {quotation.status === "val"
                                                ? "Validated"
                                                : quotation.status === "n/a"
                                                ? "N/A"
                                                : quotation.status === "lost"
                                                ? "Lost"
                                                : quotation.status === "wip"
                                                ? "Work in Progress"
                                                : quotation.status}
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
                                    {quotation.amount && (
                                        <Badge
                                            variant="outline"
                                            className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                        >
                                            <DollarSign className="h-3.5 w-3.5" />
                                            <span>
                                                {formatCurrency(
                                                    quotation.amount
                                                )}
                                            </span>
                                        </Badge>
                                    )}
                                    {quotation.inquiry?.business_unit?.name && (
                                        <Badge
                                            variant="outline"
                                            className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                        >
                                            <Building className="h-3.5 w-3.5" />
                                            <span>
                                                {
                                                    quotation.inquiry
                                                        .business_unit.name
                                                }
                                            </span>
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <Link href={route("quotations.index")}>
                                    <Button className="shadow-lg shadow-amber-900/30 bg-white text-amber-700 hover:bg-amber-50 gap-1.5 font-medium transition-all duration-200">
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back to List</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main content with tabs */}
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="flex w-full border-b border-border mb-8 p-0 bg-transparent">
                            <TabsTrigger
                                value="details"
                                className="flex items-center gap-2 px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-600 data-[state=active]:text-amber-600 data-[state=active]:font-medium transition-all duration-200 text-muted-foreground hover:text-foreground -mb-px"
                            >
                                <FileText className="h-4 w-4" />
                                Details
                            </TabsTrigger>
                            <TabsTrigger
                                value="negotiations"
                                className="flex items-center gap-2 px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-600 data-[state=active]:text-amber-600 data-[state=active]:font-medium transition-all duration-200 text-muted-foreground hover:text-foreground -mb-px"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Negotiations
                            </TabsTrigger>
                            <TabsTrigger
                                value="team"
                                className="flex items-center gap-2 px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-600 data-[state=active]:text-amber-600 data-[state=active]:font-medium transition-all duration-200 text-muted-foreground hover:text-foreground -mb-px"
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
                                                            <div className="bg-amber-100 p-1.5 rounded-md">
                                                                <CreditCard className="h-5 w-5 text-amber-600" />
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
                                                                  "wip"
                                                                ? "bg-amber-100 text-amber-800 border-amber-200"
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
                                                              "wip"
                                                            ? "Work in Progress"
                                                            : quotation.status}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                {/* Amount Information - Featured prominently at the top */}
                                                <div className="bg-gradient-to-r from-amber-50 to-amber-50/30 rounded-lg p-5 border border-amber-100 mb-6">
                                                    <div className="flex items-center">
                                                        <div className="w-12 h-12 rounded-md bg-amber-100 flex items-center justify-center mr-4">
                                                            <DollarSign className="h-6 w-6 text-amber-700" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Quotation Amount
                                                            </p>
                                                            <h3 className="text-2xl font-semibold">
                                                                {formatCurrency(
                                                                    quotation.amount ||
                                                                        0
                                                                )}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Code */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Quotation Code
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base font-semibold">
                                                            <FileText className="h-4 w-4 text-amber-500 mr-2" />
                                                            {quotation.code}
                                                        </p>
                                                    </div>

                                                    {/* Due Date */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Due Date
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Calendar className="h-4 w-4 text-amber-500 mr-2" />
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

                                                    {/* Business Unit */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Business Unit
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Building className="h-4 w-4 text-amber-500 mr-2" />
                                                            {quotation.inquiry
                                                                ?.business_unit
                                                                ?.name || "N/A"}
                                                        </p>
                                                    </div>

                                                    {/* Customer */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Customer
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Building2 className="h-4 w-4 text-amber-500 mr-2" />
                                                            {quotation.inquiry
                                                                ?.customer
                                                                ?.name || "N/A"}
                                                        </p>
                                                    </div>

                                                    {/* Created At */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Created
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Clock className="h-4 w-4 text-amber-500 mr-2" />
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
                                                            <Clock className="h-4 w-4 text-amber-500 mr-2" />
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
                                                <div className="mt-6">
                                                    <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-3">
                                                        <FileText className="h-4 w-4 text-amber-500 mr-2" />
                                                        Quotation Document
                                                    </h3>
                                                    {quotation.file ? (
                                                        <div className="mt-2">
                                                            <a
                                                                href={`/storage/files/quotations/${quotation.file}`}
                                                                download
                                                                className="flex items-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group shadow-sm"
                                                            >
                                                                <div className="w-12 h-12 rounded-md flex items-center justify-center bg-amber-100 text-amber-700 mr-4 group-hover:bg-amber-200 transition-colors">
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
                                                                    className="group-hover:bg-amber-100 group-hover:text-amber-700 group-hover:border-amber-200 transition-colors"
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
                                                                <Link
                                                                    href={route(
                                                                        "quotations.edit",
                                                                        quotation.id
                                                                    )}
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="mt-4"
                                                                    >
                                                                        <FileUp className="h-4 w-4 mr-2" />
                                                                        Attach
                                                                        Document
                                                                    </Button>
                                                                </Link>
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

                                                    {/* Business Unit */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Business Unit
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Building className="h-4 w-4 text-amber-500 mr-2" />
                                                            {
                                                                quotation
                                                                    .inquiry
                                                                    .business_unit
                                                                    .name
                                                            }
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
                                    {/* Financial Summary Card - New card for the amount */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.2,
                                        }}
                                    >
                                        <Card className="overflow-hidden border-border">
                                            <CardHeader className="pb-3 bg-muted/40">
                                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                    <div className="bg-amber-100 p-1.5 rounded-md">
                                                        <DollarSign className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    Financial Summary
                                                </CardTitle>
                                                <CardDescription>
                                                    Quotation amount and
                                                    financial details
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="space-y-5">
                                                    <div className="flex flex-col items-center justify-center p-5 bg-amber-50 rounded-lg border border-amber-100">
                                                        <p className="text-sm text-amber-600 font-medium mb-1">
                                                            TOTAL AMOUNT
                                                        </p>
                                                        <h3 className="text-3xl font-bold text-amber-800">
                                                            {formatCurrency(
                                                                quotation.amount ||
                                                                    0
                                                            )}
                                                        </h3>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-muted/20 p-3 rounded-lg border border-border/40">
                                                            <p className="text-xs text-muted-foreground">
                                                                Status
                                                            </p>
                                                            <div className="mt-1">
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
                                                                              "wip"
                                                                            ? "bg-amber-100 text-amber-800 border-amber-200"
                                                                            : "bg-gray-100 text-gray-800 border-gray-200"
                                                                    )}
                                                                >
                                                                    {getStatusIcon(
                                                                        quotation.status
                                                                    )}
                                                                    <span className="text-xs">
                                                                        {quotation.status ===
                                                                        "val"
                                                                            ? "Validated"
                                                                            : quotation.status ===
                                                                              "n/a"
                                                                            ? "N/A"
                                                                            : quotation.status ===
                                                                              "lost"
                                                                            ? "Lost"
                                                                            : quotation.status ===
                                                                              "wip"
                                                                            ? "WIP"
                                                                            : quotation.status}
                                                                    </span>
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="bg-muted/20 p-3 rounded-lg border border-border/40">
                                                            <p className="text-xs text-muted-foreground">
                                                                Due Date
                                                            </p>
                                                            <p className="text-sm font-medium mt-1 flex items-center">
                                                                <Calendar className="h-3.5 w-3.5 text-amber-500 mr-1" />
                                                                {formatDate(
                                                                    quotation.due_date
                                                                )
                                                                    .split(" ")
                                                                    .slice(0, 2)
                                                                    .join(" ")}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Business Unit
                                                            </p>
                                                            <p className="text-sm font-medium mt-1">
                                                                {quotation
                                                                    .inquiry
                                                                    ?.business_unit
                                                                    ?.name ||
                                                                    "N/A"}
                                                            </p>
                                                        </div>
                                                        <div className="bg-amber-100 p-2 rounded-full">
                                                            <Building className="h-5 w-5 text-amber-600" />
                                                        </div>
                                                    </div>

                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Customer
                                                            </p>
                                                            <p className="text-sm font-medium mt-1">
                                                                {quotation
                                                                    .inquiry
                                                                    ?.customer
                                                                    ?.name ||
                                                                    "N/A"}
                                                            </p>
                                                        </div>
                                                        <div className="bg-amber-100 p-2 rounded-full">
                                                            <Building2 className="h-5 w-5 text-amber-600" />
                                                        </div>
                                                    </div>

                                                    <Link
                                                        href={route(
                                                            "quotations.edit",
                                                            quotation.id
                                                        )}
                                                    >
                                                        <Button
                                                            variant="default"
                                                            className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Edit Quotation
                                                            Details
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

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
                                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                    <div className="bg-amber-100 p-1.5 rounded-md">
                                                        <Building2 className="h-4 w-4 text-amber-600" />
                                                    </div>
                                                    Customer
                                                </CardTitle>
                                                <CardDescription>
                                                    Company that received this
                                                    quotation
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="bg-gradient-to-r from-amber-50 to-amber-50/30 rounded-lg p-4 border border-amber-100 mb-4">
                                                    <div className="flex items-center">
                                                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                                                            <Building2 className="h-6 w-6 text-amber-700" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-base font-medium text-foreground">
                                                                {
                                                                    quotation
                                                                        .inquiry
                                                                        .customer
                                                                        .name
                                                                }
                                                            </h3>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
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

                                                <div className="space-y-3 mt-3">
                                                    {/* Email */}
                                                    <div className="flex items-start p-2 rounded-md hover:bg-muted/30 transition-colors">
                                                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center mr-3">
                                                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Email
                                                            </p>
                                                            <a
                                                                href={`mailto:${quotation.inquiry.customer.email}`}
                                                                className="text-sm text-amber-600 hover:underline flex items-center"
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
                                                        <div className="flex items-start p-2 rounded-md hover:bg-muted/30 transition-colors">
                                                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center mr-3">
                                                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Phone
                                                                </p>
                                                                <a
                                                                    href={`tel:${quotation.inquiry.customer.phone}`}
                                                                    className="text-sm text-amber-600 hover:underline flex items-center"
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
                                                        <div className="flex items-start p-2 rounded-md hover:bg-muted/30 transition-colors">
                                                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center mr-3">
                                                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
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

                                                <Separator className="my-4" />

                                                <Link
                                                    href={route(
                                                        "customers.show",
                                                        quotation.inquiry
                                                            .customer.id
                                                    )}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        className="w-full gap-1.5"
                                                    >
                                                        <Building2 className="h-4 w-4" />
                                                        View Customer Profile
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Negotiations Tab */}
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
                                                    <div className="bg-amber-100 p-1.5 rounded-md">
                                                        <MessageSquare className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    Negotiation History
                                                </CardTitle>
                                                <CardDescription>
                                                    Record of all negotiation
                                                    documents and price
                                                    adjustments
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
                                        {/* Current Quotation Amount Summary */}
                                        <div className="bg-gradient-to-r from-amber-50 to-amber-50/30 rounded-lg p-4 border border-amber-100 mb-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center mr-3">
                                                        <DollarSign className="h-5 w-5 text-amber-700" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Current Quotation
                                                            Amount
                                                        </p>
                                                        <h3 className="text-xl font-semibold text-amber-900">
                                                            {formatCurrency(
                                                                quotation.amount ||
                                                                    0
                                                            )}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="mt-4 lg:mt-0 flex flex-col items-start lg:items-end">
                                                    <p className="text-sm text-muted-foreground">
                                                        {quotation.negotiations &&
                                                        quotation.negotiations
                                                            .length > 0
                                                            ? `${
                                                                  quotation
                                                                      .negotiations
                                                                      .length
                                                              } negotiation ${
                                                                  quotation
                                                                      .negotiations
                                                                      .length ===
                                                                  1
                                                                      ? "record"
                                                                      : "records"
                                                              }`
                                                            : "No negotiation records yet"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Last updated:{" "}
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
                                        </div>

                                        {quotation.negotiations &&
                                        quotation.negotiations.length > 0 ? (
                                            <div className="space-y-5">
                                                {/* Timeline heading */}
                                                <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                                                    <Clock3 className="h-4 w-4 mr-2 text-amber-500" />
                                                    Negotiation Timeline
                                                </h3>

                                                {/* Negotiation Timeline */}
                                                <div className="relative border-l-2 border-amber-200 pl-6 ml-3 space-y-6">
                                                    {quotation.negotiations
                                                        .sort(
                                                            (a, b) =>
                                                                new Date(
                                                                    b.created_at ||
                                                                        ""
                                                                ).getTime() -
                                                                new Date(
                                                                    a.created_at ||
                                                                        ""
                                                                ).getTime()
                                                        )
                                                        .map(
                                                            (
                                                                negotiation,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        negotiation.id
                                                                    }
                                                                    className="relative"
                                                                >
                                                                    {/* Timeline dot */}
                                                                    <div className="absolute -left-9 w-6 h-6 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center">
                                                                        {index ===
                                                                        0 ? (
                                                                            <DollarSign className="h-3 w-3 text-amber-600" />
                                                                        ) : (
                                                                            <span className="text-xs font-semibold text-amber-600">
                                                                                {quotation
                                                                                    .negotiations
                                                                                    .length -
                                                                                    index}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Negotiation card */}
                                                                    <div className="bg-white rounded-lg border border-border shadow-sm p-4 hover:bg-muted/10 transition-colors">
                                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="w-10 h-10 rounded-md flex items-center justify-center bg-amber-100 text-amber-700">
                                                                                    {getFileIcon(
                                                                                        negotiation.file ||
                                                                                            ""
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <p className="font-medium">
                                                                                            {negotiation.file
                                                                                                ? negotiation.file
                                                                                                      .split(
                                                                                                          "/"
                                                                                                      )
                                                                                                      .pop()
                                                                                                : "Negotiation Document"}
                                                                                        </p>
                                                                                        {index ===
                                                                                            0 && (
                                                                                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                                                                                Latest
                                                                                            </Badge>
                                                                                        )}
                                                                                    </div>
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

                                                                            {/* Amount display */}
                                                                            <div className="flex flex-col items-end">
                                                                                <div className="flex items-center gap-2">
                                                                                    <p className="text-sm text-muted-foreground">
                                                                                        Negotiated
                                                                                        Amount:
                                                                                    </p>
                                                                                    <p className="font-semibold text-amber-800">
                                                                                        {formatCurrency(
                                                                                            negotiation.amount ||
                                                                                                0
                                                                                        )}
                                                                                    </p>
                                                                                </div>

                                                                                {/* Price change indicator */}
                                                                                {negotiation.amount !==
                                                                                    undefined &&
                                                                                    (index ===
                                                                                    quotation
                                                                                        .negotiations
                                                                                        .length -
                                                                                        1
                                                                                        ? quotation.amount !==
                                                                                          negotiation.amount
                                                                                        : quotation
                                                                                              .negotiations[
                                                                                              index +
                                                                                                  1
                                                                                          ]
                                                                                              ?.amount !==
                                                                                          negotiation.amount) && (
                                                                                        <div
                                                                                            className={`text-xs flex items-center mt-1 ${
                                                                                                index ===
                                                                                                quotation
                                                                                                    .negotiations
                                                                                                    .length -
                                                                                                    1
                                                                                                    ? negotiation.amount >
                                                                                                      quotation.amount
                                                                                                        ? "text-green-600"
                                                                                                        : "text-red-600"
                                                                                                    : negotiation.amount >
                                                                                                      (quotation
                                                                                                          .negotiations[
                                                                                                          index +
                                                                                                              1
                                                                                                      ]
                                                                                                          ?.amount ||
                                                                                                          0)
                                                                                                    ? "text-green-600"
                                                                                                    : "text-red-600"
                                                                                            }`}
                                                                                        >
                                                                                            {index ===
                                                                                            quotation
                                                                                                .negotiations
                                                                                                .length -
                                                                                                1 ? (
                                                                                                negotiation.amount >
                                                                                                quotation.amount ? (
                                                                                                    <ChevronUp className="h-3 w-3 mr-1" />
                                                                                                ) : (
                                                                                                    <ChevronDown className="h-3 w-3 mr-1" />
                                                                                                )
                                                                                            ) : negotiation.amount >
                                                                                              (quotation
                                                                                                  .negotiations[
                                                                                                  index +
                                                                                                      1
                                                                                              ]
                                                                                                  ?.amount ||
                                                                                                  0) ? (
                                                                                                <ChevronUp className="h-3 w-3 mr-1" />
                                                                                            ) : (
                                                                                                <ChevronDown className="h-3 w-3 mr-1" />
                                                                                            )}
                                                                                            {index ===
                                                                                            quotation
                                                                                                .negotiations
                                                                                                .length -
                                                                                                1
                                                                                                ? formatCurrency(
                                                                                                      Math.abs(
                                                                                                          negotiation.amount -
                                                                                                              quotation.amount
                                                                                                      )
                                                                                                  )
                                                                                                : formatCurrency(
                                                                                                      Math.abs(
                                                                                                          negotiation.amount -
                                                                                                              (quotation
                                                                                                                  .negotiations[
                                                                                                                  index +
                                                                                                                      1
                                                                                                              ]
                                                                                                                  ?.amount ||
                                                                                                                  0)
                                                                                                      )
                                                                                                  )}

                                                                                            (
                                                                                            {index ===
                                                                                            quotation
                                                                                                .negotiations
                                                                                                .length -
                                                                                                1
                                                                                                ? (
                                                                                                      ((negotiation.amount -
                                                                                                          quotation.amount) /
                                                                                                          quotation.amount) *
                                                                                                      100
                                                                                                  ).toFixed(
                                                                                                      1
                                                                                                  )
                                                                                                : (
                                                                                                      ((negotiation.amount -
                                                                                                          (quotation
                                                                                                              .negotiations[
                                                                                                              index +
                                                                                                                  1
                                                                                                          ]
                                                                                                              ?.amount ||
                                                                                                              0)) /
                                                                                                          (quotation
                                                                                                              .negotiations[
                                                                                                              index +
                                                                                                                  1
                                                                                                          ]
                                                                                                              ?.amount ||
                                                                                                              1)) *
                                                                                                      100
                                                                                                  ).toFixed(
                                                                                                      1
                                                                                                  )}
                                                                                            %)
                                                                                        </div>
                                                                                    )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Action buttons */}
                                                                        <div className="mt-3 pt-3 border-t border-border flex justify-end gap-2">
                                                                            {negotiation.file && (
                                                                                <a
                                                                                    href={`/storage/files/negotiations/${negotiation.file}`}
                                                                                    download
                                                                                    className="flex items-center text-xs gap-1 px-2 py-1 rounded hover:bg-amber-50 text-amber-700 hover:text-amber-800 transition-colors"
                                                                                >
                                                                                    <Download className="h-3.5 w-3.5" />
                                                                                    Download
                                                                                </a>
                                                                            )}
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-xs px-2 py-1 h-auto font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                                onClick={() =>
                                                                                    handleDeleteNegotiation(
                                                                                        negotiation.id
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Trash className="h-3.5 w-3.5 mr-1" />
                                                                                Delete
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                </div>

                                                {/* Summary of negotiations */}
                                                <div className="mt-8 bg-muted/20 p-4 rounded-lg border border-border">
                                                    <h3 className="text-sm font-medium mb-3">
                                                        Negotiation Summary
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">
                                                                Initial Amount
                                                            </p>
                                                            <p className="text-base font-semibold">
                                                                {formatCurrency(
                                                                    quotation
                                                                        .negotiations
                                                                        .length >
                                                                        0
                                                                        ? quotation
                                                                              .negotiations[
                                                                              quotation
                                                                                  .negotiations
                                                                                  .length -
                                                                                  1
                                                                          ]
                                                                              ?.amount ||
                                                                              0
                                                                        : quotation.amount ||
                                                                              0
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">
                                                                Current Amount
                                                            </p>
                                                            <p className="text-base font-semibold">
                                                                {formatCurrency(
                                                                    quotation.amount ||
                                                                        0
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">
                                                                Total Change
                                                            </p>
                                                            {quotation
                                                                .negotiations
                                                                .length > 0 && (
                                                                <p
                                                                    className={`text-base font-semibold ${
                                                                        quotation.amount >
                                                                        (quotation
                                                                            .negotiations[
                                                                            quotation
                                                                                .negotiations
                                                                                .length -
                                                                                1
                                                                        ]
                                                                            ?.amount ||
                                                                            0)
                                                                            ? "text-green-600"
                                                                            : quotation.amount <
                                                                              (quotation
                                                                                  .negotiations[
                                                                                  quotation
                                                                                      .negotiations
                                                                                      .length -
                                                                                      1
                                                                              ]
                                                                                  ?.amount ||
                                                                                  0)
                                                                            ? "text-red-600"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {quotation.amount !==
                                                                    (quotation
                                                                        .negotiations[
                                                                        quotation
                                                                            .negotiations
                                                                            .length -
                                                                            1
                                                                    ]?.amount ||
                                                                        0)
                                                                        ? `${
                                                                              quotation.amount >
                                                                              (quotation
                                                                                  .negotiations[
                                                                                  quotation
                                                                                      .negotiations
                                                                                      .length -
                                                                                      1
                                                                              ]
                                                                                  ?.amount ||
                                                                                  0)
                                                                                  ? "+"
                                                                                  : ""
                                                                          }${formatCurrency(
                                                                              quotation.amount -
                                                                                  (quotation
                                                                                      .negotiations[
                                                                                      quotation
                                                                                          .negotiations
                                                                                          .length -
                                                                                          1
                                                                                  ]
                                                                                      ?.amount ||
                                                                                      0)
                                                                          )}`
                                                                        : "No change"}
                                                                    {quotation.amount !==
                                                                        (quotation
                                                                            .negotiations[
                                                                            quotation
                                                                                .negotiations
                                                                                .length -
                                                                                1
                                                                        ]
                                                                            ?.amount ||
                                                                            0) && (
                                                                        <span className="text-xs ml-1">
                                                                            (
                                                                            {(
                                                                                ((quotation.amount -
                                                                                    (quotation
                                                                                        .negotiations[
                                                                                        quotation
                                                                                            .negotiations
                                                                                            .length -
                                                                                            1
                                                                                    ]
                                                                                        ?.amount ||
                                                                                        0)) /
                                                                                    (quotation
                                                                                        .negotiations[
                                                                                        quotation
                                                                                            .negotiations
                                                                                            .length -
                                                                                            1
                                                                                    ]
                                                                                        ?.amount ||
                                                                                        1)) *
                                                                                100
                                                                            ).toFixed(
                                                                                1
                                                                            )}
                                                                            %)
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                                                <div className="bg-amber-50 p-3 rounded-full mb-4">
                                                    <MessageSquare className="h-8 w-8 text-amber-400" />
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
                                                    customer and price
                                                    adjustments.
                                                </p>
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
                                                        Add First Negotiation
                                                    </Button>
                                                </Link>
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
                                                <div className="bg-amber-100 p-1.5 rounded-md">
                                                    <Briefcase className="h-5 w-5 text-amber-600" />
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
                                    <div className="bg-gradient-to-r from-amber-50 to-amber-50/20 rounded-lg p-5 border border-amber-100 mb-6">
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
                                                            <AvatarFallback className="bg-amber-100 text-amber-800">
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
                                                                    className="flex items-center p-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-amber-600 hover:underline"
                                                                >
                                                                    <div className="bg-amber-100 p-1.5 rounded-md mr-2">
                                                                        <Mail className="h-4 w-4 text-amber-600" />
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
                                                                        className="flex items-center p-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-amber-600 hover:underline"
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
                                            <div className="bg-amber-50/50 p-4 border-b border-border">
                                                <h3 className="font-medium flex items-center">
                                                    <HardHat className="h-5 w-5 text-amber-500 mr-2" />
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
                                                                <AvatarFallback className="bg-amber-100 text-amber-800 text-xl">
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
                                                                    className="flex items-center p-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-amber-600 hover:underline"
                                                                >
                                                                    <div className="bg-amber-100 p-1.5 rounded-md mr-2">
                                                                        <Mail className="h-4 w-4 text-amber-600" />
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
                                                                        className="flex items-center p-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-amber-600 hover:underline"
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

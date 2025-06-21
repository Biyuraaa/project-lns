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
import type { Inquiry, PageProps, Quotation } from "@/types";
import { motion } from "framer-motion";
import {
    Building2,
    Calendar,
    ClipboardList,
    Clock,
    Download,
    Edit,
    FileText,
    HardHat,
    User,
    UserCircle,
    Mail,
    Phone,
    MapPin,
    ShoppingBag,
    Tag,
    CheckCircle,
    XCircle,
    Clock3,
    Plus,
    ChevronRight,
    ExternalLink,
    AlertCircle,
    Briefcase,
    MessageSquare,
    Users,
} from "lucide-react";
import { Separator } from "@/Components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { formatDate, formatTime } from "@/lib/utils";

interface InquiriesShowProps extends PageProps {
    inquiry: Inquiry;
    quotation: Quotation | null;
}

const InquiriesShow = () => {
    const { inquiry, quotation } = usePage<InquiriesShowProps>().props;

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return <Clock3 className="h-3.5 w-3.5 mr-1.5" />;
            case "resolved":
                return <CheckCircle className="h-3.5 w-3.5 mr-1.5" />;
            case "canceled":
                return <XCircle className="h-3.5 w-3.5 mr-1.5" />;
            default:
                return <Clock className="h-3.5 w-3.5 mr-1.5" />;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Inquiry: ${inquiry.code}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb and actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <Breadcrumb
                            items={[
                                {
                                    label: "Inquiry Management",
                                    href: route("inquiries.index"),
                                },
                                { label: inquiry.code },
                            ]}
                        />
                    </div>

                    {/* Header with status and key info */}
                    <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 p-6 shadow-lg">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-amber-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-orange-500/30 blur-2xl"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                                            <FileText className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                                Inquiry #{inquiry.code}
                                            </h1>
                                            <p className="text-amber-100 text-sm">
                                                Created on{" "}
                                                {formatDate(
                                                    inquiry.created_at || ""
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Badge
                                            variant="outline"
                                            className={`px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-sm border-white/20 
                        ${
                            inquiry.status === "pending"
                                ? "bg-yellow-500/20 text-white"
                                : inquiry.status === "resolved"
                                ? "bg-green-500/20 text-white"
                                : "bg-gray-500/20 text-white"
                        }`}
                                        >
                                            {getStatusIcon(inquiry.status)}
                                            <span>
                                                {inquiry.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    inquiry.status.slice(1)}
                                            </span>
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                        >
                                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                            <span>
                                                {formatDate(
                                                    inquiry.inquiry_date
                                                )}
                                            </span>
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                        >
                                            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                                            <span>
                                                {inquiry.business_unit.name}
                                            </span>
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex-1 min-w-[180px]">
                                        <p className="text-amber-100 text-xs font-medium mb-1">
                                            Customer
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="text-white font-medium">
                                                    {inquiry.customer.name}
                                                </p>
                                                <p className="text-amber-100 text-xs">
                                                    {inquiry.customer.email}
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
                                className="flex items-center gap-2 px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-600 data-[state=active]:text-amber-600 data-[state=active]:font-medium transition-all duration-200 text-muted-foreground hover:text-foreground -mb-px"
                            >
                                <FileText className="h-4 w-4" />
                                Details
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
                                {/* Left column - Inquiry details */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Inquiry Information Card */}
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
                                                                <FileText className="h-5 w-5 text-amber-600" />
                                                            </div>
                                                            Inquiry Information
                                                        </CardTitle>
                                                        <CardDescription>
                                                            Details about the
                                                            inquiry request
                                                        </CardDescription>
                                                    </div>
                                                    <Badge
                                                        className={
                                                            inquiry.status ===
                                                            "pending"
                                                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                                                : inquiry.status ===
                                                                  "resolved"
                                                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                                : "bg-slate-100 text-slate-800 border-slate-200"
                                                        }
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
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Code */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Inquiry Code
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base font-semibold">
                                                            <Tag className="h-4 w-4 text-amber-500 mr-2" />
                                                            {inquiry.code}
                                                        </p>
                                                    </div>

                                                    {/* Date */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Inquiry Date
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Calendar className="h-4 w-4 text-amber-500 mr-2" />
                                                            {formatDate(
                                                                inquiry.inquiry_date
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Due Date
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <Calendar className="h-4 w-4 text-amber-500 mr-2" />
                                                            {inquiry.due_date ? (
                                                                <>
                                                                    {formatDate(
                                                                        inquiry.due_date
                                                                    )}
                                                                    {new Date(
                                                                        inquiry.due_date
                                                                    ) <
                                                                    new Date() ? (
                                                                        <Badge className="ml-2 bg-red-100 text-red-800 border-red-200">
                                                                            Overdue
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                                                                            {Math.ceil(
                                                                                (new Date(
                                                                                    inquiry.due_date
                                                                                ).getTime() -
                                                                                    new Date().getTime()) /
                                                                                    (1000 *
                                                                                        60 *
                                                                                        60 *
                                                                                        24)
                                                                            )}{" "}
                                                                            days
                                                                            left
                                                                        </Badge>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="text-muted-foreground">
                                                                    Not
                                                                    specified
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>

                                                    {/* Quantity */}
                                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            Business Unit
                                                        </h3>
                                                        <p className="mt-1 flex items-center text-base">
                                                            <ShoppingBag className="h-4 w-4 text-amber-500 mr-2" />
                                                            <span className="font-medium">
                                                                {
                                                                    inquiry
                                                                        .business_unit
                                                                        .name
                                                                }
                                                            </span>
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
                                                                inquiry.created_at ||
                                                                    ""
                                                            )}{" "}
                                                            at{" "}
                                                            {formatTime(
                                                                inquiry.created_at ||
                                                                    ""
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div className="mt-8">
                                                    <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-3">
                                                        <MessageSquare className="h-4 w-4 text-amber-500 mr-2" />
                                                        Description
                                                    </h3>
                                                    <div className="p-5 bg-muted/30 rounded-lg border border-border">
                                                        <p className="text-base whitespace-pre-line leading-relaxed">
                                                            {
                                                                inquiry.description
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* File */}
                                                {inquiry.file && (
                                                    <div className="mt-8">
                                                        <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-3">
                                                            <FileText className="h-4 w-4 text-amber-500 mr-2" />
                                                            Attached File
                                                        </h3>
                                                        <div className="mt-2">
                                                            <a
                                                                href={`/storage/files/inquiries/${inquiry.file}`}
                                                                download
                                                                className="flex items-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group shadow-sm"
                                                            >
                                                                <div className="w-12 h-12 rounded-md flex items-center justify-center bg-amber-100 text-amber-700 mr-4 group-hover:bg-amber-200 transition-colors">
                                                                    <FileText className="h-6 w-6" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium">
                                                                        {
                                                                            inquiry.file
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Click to
                                                                        download
                                                                        attachment
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
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* Quotation Section (moved from tab) */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.1,
                                        }}
                                    >
                                        <Card>
                                            <CardHeader className="pb-3 bg-muted/40">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                            <div className="bg-amber-100 p-1.5 rounded-md">
                                                                <ClipboardList className="h-5 w-5 text-amber-600" />
                                                            </div>
                                                            Quotation
                                                        </CardTitle>
                                                        <CardDescription>
                                                            Quotation generated
                                                            for this inquiry
                                                        </CardDescription>
                                                    </div>
                                                    {!quotation && (
                                                        <Link
                                                            href={route(
                                                                "inquiries.quotations.create",
                                                                {
                                                                    inquiry:
                                                                        inquiry.id,
                                                                }
                                                            )}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                className="bg-amber-600 hover:bg-amber-700 text-white"
                                                            >
                                                                <Plus className="h-4 w-4 mr-1" />
                                                                Add Quotation
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                {quotation ? (
                                                    <motion.div
                                                        key={quotation.id}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.2,
                                                        }}
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
                                                                            quotation.code
                                                                        }
                                                                        <Badge
                                                                            className={`ml-2 ${
                                                                                quotation.status ===
                                                                                "n/a"
                                                                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                                                    : quotation.status ===
                                                                                      "val"
                                                                                    ? "bg-green-100 text-green-800 border-green-200"
                                                                                    : quotation.status ===
                                                                                      "wip"
                                                                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                                                                    : quotation.status ===
                                                                                      "lost"
                                                                                    ? "bg-red-100 text-red-800 border-red-200"
                                                                                    : quotation.status ===
                                                                                      "clsd"
                                                                                    ? "bg-slate-100 text-slate-800 border-slate-200"
                                                                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                                                            }`}
                                                                        >
                                                                            {quotation.status ===
                                                                            "n/a"
                                                                                ? "N/A"
                                                                                : quotation.status ===
                                                                                  "val"
                                                                                ? "Validated"
                                                                                : quotation.status ===
                                                                                  "wip"
                                                                                ? "In Progress"
                                                                                : quotation.status ===
                                                                                  "lost"
                                                                                ? "Lost"
                                                                                : quotation.status ===
                                                                                  "clsd"
                                                                                ? "Closed"
                                                                                : quotation.status}
                                                                        </Badge>
                                                                    </h4>
                                                                    <div className="flex items-center mt-1">
                                                                        <span className="text-xs text-muted-foreground flex items-center">
                                                                            <Calendar className="h-3 w-3 mr-1" />
                                                                            Due:{" "}
                                                                            {formatDate(
                                                                                quotation.due_date
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                {quotation.file && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger
                                                                                asChild
                                                                            >
                                                                                <a
                                                                                    href={`/storage/files/quotations/${quotation.file}`}
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
                                                                        quotation.id
                                                                    )}
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-9"
                                                                    >
                                                                        View
                                                                        Details
                                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <div className="text-center py-8 px-4">
                                                        <div className="bg-muted/30 inline-flex rounded-full p-3 mb-4">
                                                            <ClipboardList className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                        <h3 className="text-lg font-medium mb-2">
                                                            No quotation yet
                                                        </h3>
                                                        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                                                            Create a quotation
                                                            to provide pricing
                                                            and product details
                                                            to the customer.
                                                        </p>
                                                        <Link
                                                            href={route(
                                                                "inquiries.quotations.create",
                                                                {
                                                                    inquiry:
                                                                        inquiry.id,
                                                                }
                                                            )}
                                                        >
                                                            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Create Quotation
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* End User Information Card */}
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
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                            <div className="bg-blue-100 p-1.5 rounded-md">
                                                                <Users className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            End Users
                                                            Information
                                                        </CardTitle>
                                                        <CardDescription>
                                                            People or
                                                            organizations that
                                                            will use the product
                                                            or service
                                                        </CardDescription>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-blue-50 border-blue-200 text-blue-700"
                                                    >
                                                        {inquiry.end_users
                                                            ?.length || 0}{" "}
                                                        End Users
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                {inquiry.end_users &&
                                                inquiry.end_users.length > 0 ? (
                                                    <div className="space-y-6">
                                                        {inquiry.end_users.map(
                                                            (
                                                                endUser,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        endUser.id
                                                                    }
                                                                    className={`${
                                                                        index >
                                                                        0
                                                                            ? "pt-6 border-t border-gray-100"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    <div className="bg-gradient-to-r from-blue-50 to-blue-50/30 rounded-lg p-5 border border-blue-100 mb-4">
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                                                <User className="h-6 w-6 text-blue-600" />
                                                                            </div>
                                                                            <div>
                                                                                <h3 className="text-lg font-medium">
                                                                                    {endUser.name ||
                                                                                        "Not specified"}
                                                                                </h3>
                                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                                    End
                                                                                    User
                                                                                    #
                                                                                    {index +
                                                                                        1}{" "}
                                                                                    for
                                                                                    inquiry
                                                                                    #
                                                                                    {
                                                                                        inquiry.code
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        {/* Email */}
                                                                        <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                                            <h3 className="text-sm font-medium text-muted-foreground">
                                                                                Email
                                                                            </h3>
                                                                            <p className="mt-1 flex items-center text-base">
                                                                                <Mail className="h-4 w-4 text-blue-500 mr-2" />
                                                                                {endUser.email ? (
                                                                                    <a
                                                                                        href={`mailto:${endUser.email}`}
                                                                                        className="text-blue-600 hover:underline flex items-center"
                                                                                    >
                                                                                        {
                                                                                            endUser.email
                                                                                        }
                                                                                        <ExternalLink className="h-3 w-3 ml-1" />
                                                                                    </a>
                                                                                ) : (
                                                                                    "Not specified"
                                                                                )}
                                                                            </p>
                                                                        </div>

                                                                        {/* Phone */}
                                                                        <div className="bg-muted/20 p-4 rounded-lg border border-border/40">
                                                                            <h3 className="text-sm font-medium text-muted-foreground">
                                                                                Phone
                                                                            </h3>
                                                                            <p className="mt-1 flex items-center text-base">
                                                                                <Phone className="h-4 w-4 text-blue-500 mr-2" />
                                                                                {endUser.phone ? (
                                                                                    <a
                                                                                        href={`tel:${endUser.phone}`}
                                                                                        className="text-blue-600 hover:underline flex items-center"
                                                                                    >
                                                                                        {
                                                                                            endUser.phone
                                                                                        }
                                                                                        <ExternalLink className="h-3 w-3 ml-1" />
                                                                                    </a>
                                                                                ) : (
                                                                                    "Not specified"
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Address */}
                                                                    <div className="mt-4 bg-muted/20 p-4 rounded-lg border border-border/40">
                                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                                            Address
                                                                        </h3>
                                                                        <p className="mt-1 flex items-start text-base">
                                                                            <MapPin className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                                                            <span>
                                                                                {endUser.address ||
                                                                                    "Not specified"}
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                                        <div className="bg-blue-100 rounded-full p-3 w-14 h-14 flex items-center justify-center mx-auto mb-4">
                                                            <Users className="h-8 w-8 text-blue-600" />
                                                        </div>
                                                        <h3 className="text-gray-700 text-lg font-medium mb-2">
                                                            No End Users
                                                            Specified
                                                        </h3>
                                                        <p className="text-gray-500 mb-4 max-w-md mx-auto">
                                                            This inquiry doesn't
                                                            have any end users
                                                            specified. End users
                                                            are the people or
                                                            organizations that
                                                            will use the product
                                                            or service.
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>

                                {/* Right column - Customer info */}
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
                                                    <div className="bg-amber-100 p-1.5 rounded-md">
                                                        <Building2 className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    Customer
                                                </CardTitle>
                                                <CardDescription>
                                                    Company that initiated this
                                                    inquiry
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="bg-gradient-to-r from-amber-50 to-amber-50/30 rounded-lg p-5 border border-amber-100 mb-6">
                                                    <div className="flex items-center">
                                                        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                                                            <Building2 className="h-7 w-7 text-amber-700" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-medium text-foreground">
                                                                {
                                                                    inquiry
                                                                        .customer
                                                                        .name
                                                                }
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Customer ID:{" "}
                                                                {
                                                                    inquiry
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
                                                                href={`mailto:${inquiry.customer.email}`}
                                                                className="text-sm text-blue-600 hover:underline flex items-center"
                                                            >
                                                                {
                                                                    inquiry
                                                                        .customer
                                                                        .email
                                                                }
                                                                <ExternalLink className="h-3 w-3 ml-1" />
                                                            </a>
                                                        </div>
                                                    </div>

                                                    {/* Phone */}
                                                    {inquiry.customer.phone && (
                                                        <div className="flex items-start p-3 rounded-md hover:bg-muted/30 transition-colors">
                                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
                                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Phone
                                                                </p>
                                                                <a
                                                                    href={`tel:${inquiry.customer.phone}`}
                                                                    className="text-sm text-blue-600 hover:underline flex items-center"
                                                                >
                                                                    {
                                                                        inquiry
                                                                            .customer
                                                                            .phone
                                                                    }
                                                                    <ExternalLink className="h-3 w-3 ml-1" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Address */}
                                                    {inquiry.customer
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
                                                                        inquiry
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
                                                        inquiry.customer.id
                                                    )}
                                                >
                                                    <Button
                                                        variant="default"
                                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                                    >
                                                        <Building2 className="h-4 w-4 mr-2" />
                                                        View Customer Profile
                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </Link>
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
                                                                inquiry.status ===
                                                                "pending"
                                                                    ? "bg-amber-100 text-amber-800"
                                                                    : inquiry.status ===
                                                                      "resolved"
                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                    : "bg-slate-100 text-slate-800"
                                                            }
                                                        >
                                                            {inquiry.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                                                        <span className="text-sm text-muted-foreground">
                                                            Inquiry Date
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {formatDate(
                                                                inquiry.inquiry_date
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                                                        <span className="text-sm text-muted-foreground">
                                                            Business Unit
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {
                                                                inquiry
                                                                    .business_unit
                                                                    .name
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2">
                                                        <span className="text-sm text-muted-foreground">
                                                            Has Quotation
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                quotation
                                                                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                                    : "bg-amber-100 text-amber-800 border-amber-200"
                                                            }
                                                        >
                                                            {quotation
                                                                ? "Yes"
                                                                : "No"}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="mt-6">
                                                    <Link
                                                        href={route(
                                                            "inquiries.edit",
                                                            inquiry.id
                                                        )}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="w-full"
                                                        >
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit Inquiry
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>
                            </div>
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
                                                this inquiry
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {/* Team Summary */}
                                    <div className="bg-gradient-to-r from-amber-50 to-amber-50/20 rounded-lg p-5 border border-amber-100 mb-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <div className="flex -space-x-4">
                                                {inquiry.sales && (
                                                    <Avatar className="h-12 w-12 border-2 border-white">
                                                        {inquiry.sales.image ? (
                                                            <AvatarImage
                                                                src={`/storage/images/${inquiry.sales.image}`}
                                                                alt={
                                                                    inquiry
                                                                        .sales
                                                                        .name
                                                                }
                                                            />
                                                        ) : (
                                                            <AvatarFallback className="bg-amber-100 text-amber-800">
                                                                {inquiry.sales.name.charAt(
                                                                    0
                                                                )}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                )}
                                                {inquiry.pic_engineer && (
                                                    <Avatar className="h-12 w-12 border-2 border-white">
                                                        {inquiry.pic_engineer
                                                            .image ? (
                                                            <AvatarImage
                                                                src={`/storage/images/${inquiry.pic_engineer.image}`}
                                                                alt={
                                                                    inquiry
                                                                        .pic_engineer
                                                                        .name
                                                                }
                                                            />
                                                        ) : (
                                                            <AvatarFallback className="bg-blue-100 text-blue-800">
                                                                {inquiry.pic_engineer.name.charAt(
                                                                    0
                                                                )}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                )}
                                                {!inquiry.sales &&
                                                    !inquiry.pic_engineer && (
                                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                                            <AlertCircle className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-foreground">
                                                    {inquiry.sales ||
                                                    inquiry.pic_engineer
                                                        ? "Team Members"
                                                        : "No Team Assigned"}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {inquiry.sales &&
                                                    inquiry.pic_engineer
                                                        ? "Sales representative and PIC engineer are assigned to this inquiry"
                                                        : inquiry.sales
                                                        ? "Only sales representative is assigned"
                                                        : inquiry.pic_engineer
                                                        ? "Only PIC engineer is assigned"
                                                        : "No team members have been assigned to this inquiry yet"}
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

                                            {inquiry.sales ? (
                                                <div className="p-5">
                                                    <div className="flex items-start">
                                                        <Avatar className="h-16 w-16 mr-4 border border-border">
                                                            {inquiry.sales
                                                                .image ? (
                                                                <AvatarImage
                                                                    src={`/storage/images/${inquiry.sales.image}`}
                                                                    alt={
                                                                        inquiry
                                                                            .sales
                                                                            .name
                                                                    }
                                                                />
                                                            ) : (
                                                                <AvatarFallback className="bg-amber-100 text-amber-800 text-xl">
                                                                    {inquiry.sales.name.charAt(
                                                                        0
                                                                    )}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <h4 className="text-lg font-medium">
                                                                {
                                                                    inquiry
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
                                                                    href={`mailto:${inquiry.sales.email}`}
                                                                    className="flex items-center p-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-blue-600 hover:underline"
                                                                >
                                                                    <div className="bg-blue-100 p-1.5 rounded-md mr-2">
                                                                        <Mail className="h-4 w-4 text-blue-600" />
                                                                    </div>
                                                                    <span className="truncate">
                                                                        {
                                                                            inquiry
                                                                                .sales
                                                                                .email
                                                                        }
                                                                    </span>
                                                                </a>

                                                                {inquiry.sales
                                                                    .phone && (
                                                                    <a
                                                                        href={`tel:${inquiry.sales.phone}`}
                                                                        className="flex items-center p-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-blue-600 hover:underline"
                                                                    >
                                                                        <div className="bg-green-100 p-1.5 rounded-md mr-2">
                                                                            <Phone className="h-4 w-4 text-green-600" />
                                                                        </div>
                                                                        <span>
                                                                            {
                                                                                inquiry
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
                                                            <AlertCircle className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                        <p className="text-base font-medium text-muted-foreground mb-1">
                                                            No Sales
                                                            Representative
                                                        </p>
                                                        <p className="text-sm text-muted-foreground/70 max-w-xs mx-auto mb-4">
                                                            A sales
                                                            representative
                                                            hasn't been assigned
                                                            to this inquiry yet.
                                                        </p>
                                                        <Link
                                                            href={route(
                                                                "inquiries.edit",
                                                                inquiry.id
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

                                            {inquiry.pic_engineer ? (
                                                <div className="p-5">
                                                    <div className="flex items-start">
                                                        <Avatar className="h-16 w-16 mr-4 border border-border">
                                                            {inquiry
                                                                .pic_engineer
                                                                .image ? (
                                                                <AvatarImage
                                                                    src={`/storage/images/${inquiry.pic_engineer.image}`}
                                                                    alt={
                                                                        inquiry
                                                                            .pic_engineer
                                                                            .name
                                                                    }
                                                                />
                                                            ) : (
                                                                <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                                                                    {inquiry.pic_engineer.name.charAt(
                                                                        0
                                                                    )}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <h4 className="text-lg font-medium">
                                                                {
                                                                    inquiry
                                                                        .pic_engineer
                                                                        .name
                                                                }
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground mb-3">
                                                                PIC Engineer
                                                            </p>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                                                <a
                                                                    href={`mailto:${inquiry.pic_engineer.email}`}
                                                                    className="flex items-center p-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-blue-600 hover:underline"
                                                                >
                                                                    <div className="bg-blue-100 p-1.5 rounded-md mr-2">
                                                                        <Mail className="h-4 w-4 text-blue-600" />
                                                                    </div>
                                                                    <span className="truncate">
                                                                        {
                                                                            inquiry
                                                                                .pic_engineer
                                                                                .email
                                                                        }
                                                                    </span>
                                                                </a>

                                                                {inquiry
                                                                    .pic_engineer
                                                                    .phone && (
                                                                    <a
                                                                        href={`tel:${inquiry.pic_engineer.phone}`}
                                                                        className="flex items-center p-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-blue-600 hover:underline"
                                                                    >
                                                                        <div className="bg-green-100 p-1.5 rounded-md mr-2">
                                                                            <Phone className="h-4 w-4 text-green-600" />
                                                                        </div>
                                                                        <span>
                                                                            {
                                                                                inquiry
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
                                                            <AlertCircle className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                        <p className="text-base font-medium text-muted-foreground mb-1">
                                                            No PIC Engineer
                                                        </p>
                                                        <p className="text-sm text-muted-foreground/70 max-w-xs mx-auto mb-4">
                                                            A person-in-charge
                                                            engineer hasn't been
                                                            assigned to this
                                                            inquiry yet.
                                                        </p>
                                                        <Link
                                                            href={route(
                                                                "inquiries.edit",
                                                                inquiry.id
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

export default InquiriesShow;

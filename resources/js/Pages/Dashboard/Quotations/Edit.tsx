import { useState, useEffect, FormEvent } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import type { PageProps, Quotation } from "@/types";
import { usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Calendar as CalendarIcon,
    FileText,
    Info,
    Upload,
    X,
    Hash,
    ArrowLeft,
    AlertTriangle,
    Check,
    Clock,
    User,
    Mail,
    CheckCircle,
} from "lucide-react";
import { Separator } from "@/Components/ui/separator";
import { Badge } from "@/Components/ui/badge";
import { Calendar } from "@/Components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO, differenceInDays } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

interface EditQuotationProps extends PageProps {
    quotation: Quotation;
}

const QuotationEdit = () => {
    const { quotation } = usePage<EditQuotationProps>().props;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReplaceFile, setShowReplaceFile] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        _method: "put",
        id: quotation.id,
        code: quotation.code || "",
        status: quotation.status,
        due_date: quotation.due_date || "",
        file: null as File | null,
        _removeFile: false as boolean,
    });

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setSelectedFile(file);
            setData("file", file);
            setData("_removeFile", false);

            // Create a preview URL for the file
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
        }
    };

    // Remove selected file
    const removeFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setData("file", null);
        setData("_removeFile", true);
    };

    // Cancel file replacement
    const cancelReplaceFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setData("file", null);
        setData("_removeFile", false);
        setShowReplaceFile(false);
    };

    // Handle form submission
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        post(route("quotations.update", quotation.id), {
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    // Clean up preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return format(parseISO(dateString), "MMMM d, yyyy");
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

    // File icon and extensions
    const getFileIcon = (filename: string) => {
        if (!filename) return <FileText className="h-6 w-6 text-gray-500" />;

        const extension = filename.split(".").pop()?.toLowerCase();

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

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "n/a":
                return (
                    <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>N/A</span>
                    </Badge>
                );
            case "val":
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        <span>Validated</span>
                    </Badge>
                );
            case "lost":
                return (
                    <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                        <X className="h-3.5 w-3.5" />
                        <span>Lost</span>
                    </Badge>
                );
            case "wip":
                return (
                    <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Work in Progress</span>
                    </Badge>
                );
            case "ar":
                return (
                    <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Awaiting Review</span>
                    </Badge>
                );
            case "clsd":
                return (
                    <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Closed</span>
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Quotation ${quotation.code}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb and actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <Breadcrumb
                            items={[
                                {
                                    label: "Quotations",
                                    href: route("quotations.index"),
                                },
                                { label: `Edit Quotatio ${quotation.code}` },
                            ]}
                        />

                        <div className="flex items-center gap-2">
                            <Link href={route("quotations.index")}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left column - Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <form onSubmit={handleSubmit}>
                                <Card>
                                    <CardHeader className="pb-3 bg-muted/40">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                    <div className="bg-amber-100 p-1.5 rounded-md">
                                                        <FileText className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    Edit Quotation
                                                </CardTitle>
                                                <CardDescription>
                                                    Update the details for
                                                    quotation {quotation.code}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(data.status)}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-6 space-y-6">
                                        {/* Quotation Code */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="code"
                                                className="text-base"
                                            >
                                                Quotation Code{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="flex flex-col space-y-2">
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <Input
                                                        id="code"
                                                        type="text"
                                                        placeholder="QT-INQ-001"
                                                        value={data.code}
                                                        onChange={(e) =>
                                                            setData(
                                                                "code",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="h-10 pl-9"
                                                    />
                                                </div>
                                                {errors.code && (
                                                    <span className="text-sm text-red-500">
                                                        {errors.code}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                A unique code identifier for
                                                this quotation
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="status"
                                                className="text-base"
                                            >
                                                Status{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(value) =>
                                                    setData("status", value)
                                                }
                                            >
                                                <SelectTrigger
                                                    id="status"
                                                    className="h-10"
                                                >
                                                    <SelectValue placeholder="Select quotation status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="n/a">
                                                        N/A
                                                    </SelectItem>
                                                    <SelectItem value="val">
                                                        Validated
                                                    </SelectItem>
                                                    <SelectItem value="lost">
                                                        Lost
                                                    </SelectItem>
                                                    <SelectItem value="wip">
                                                        Work in Progress
                                                    </SelectItem>
                                                    <SelectItem value="ar">
                                                        Awaiting Review
                                                    </SelectItem>
                                                    <SelectItem value="clsd">
                                                        Closed
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && (
                                                <span className="text-sm text-red-500">
                                                    {errors.status}
                                                </span>
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                                Current status of this quotation
                                            </p>
                                        </div>

                                        {/* Due Date */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="due_date"
                                                className="text-base"
                                            >
                                                Due Date{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="flex flex-col space-y-2">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className={cn(
                                                                "justify-start text-left font-normal h-10 w-full",
                                                                !data.due_date &&
                                                                    "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {data.due_date
                                                                ? format(
                                                                      new Date(
                                                                          data.due_date
                                                                      ),
                                                                      "PPP"
                                                                  )
                                                                : "Select a date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-auto p-0"
                                                        align="start"
                                                    >
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                data.due_date
                                                                    ? new Date(
                                                                          data.due_date
                                                                      )
                                                                    : undefined
                                                            }
                                                            onSelect={(date) =>
                                                                setData(
                                                                    "due_date",
                                                                    date
                                                                        ? format(
                                                                              date,
                                                                              "yyyy-MM-dd"
                                                                          )
                                                                        : ""
                                                                )
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.due_date && (
                                                    <span className="text-sm text-red-500">
                                                        {errors.due_date}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                The expiration date for this
                                                quotation
                                            </p>
                                        </div>

                                        {/* Quotation Document */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="file"
                                                className="text-base"
                                            >
                                                Quotation Document
                                            </Label>

                                            {!showReplaceFile &&
                                            quotation.file &&
                                            !data._removeFile ? (
                                                <div className="border border-border rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="bg-amber-100 p-2 rounded-md">
                                                                {getFileIcon(
                                                                    quotation.file
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {quotation.file
                                                                        .split(
                                                                            "/"
                                                                        )
                                                                        .pop()}
                                                                </p>
                                                                <div className="flex items-center mt-1">
                                                                    <a
                                                                        href={`/storage/files/quotations/${quotation.file}`}
                                                                        download
                                                                        className="text-xs text-blue-600 hover:underline mr-3"
                                                                    >
                                                                        Download
                                                                    </a>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setShowReplaceFile(
                                                                                true
                                                                            )
                                                                        }
                                                                        className="text-xs text-amber-600 hover:underline"
                                                                    >
                                                                        Replace
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={removeFile}
                                                            className="text-muted-foreground hover:text-destructive"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : selectedFile ? (
                                                <div className="border border-border rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="bg-amber-100 p-2 rounded-md">
                                                                {getFileIcon(
                                                                    selectedFile.name
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {
                                                                        selectedFile.name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {(
                                                                        selectedFile.size /
                                                                        1024 /
                                                                        1024
                                                                    ).toFixed(
                                                                        2
                                                                    )}{" "}
                                                                    MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {quotation.file && (
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={
                                                                        cancelReplaceFile
                                                                    }
                                                                    className="text-muted-foreground mr-2"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={
                                                                    removeFile
                                                                }
                                                                className="text-muted-foreground hover:text-destructive"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer relative">
                                                    <Input
                                                        id="file"
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                    />
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                                        <h3 className="font-medium text-base mb-1">
                                                            {data._removeFile ||
                                                            !quotation.file
                                                                ? "Upload Quotation Document"
                                                                : "Replace Quotation Document"}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            Drag and drop or
                                                            click to upload
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Supported formats:
                                                            PDF, Word, Excel
                                                            (Max 10MB)
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {errors.file && (
                                                <span className="text-sm text-red-500">
                                                    {errors.file}
                                                </span>
                                            )}
                                        </div>

                                        {isExpired() && (
                                            <Alert
                                                variant="destructive"
                                                className="bg-red-50 text-red-800 border-red-200"
                                            >
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertTitle>
                                                    Warning: Quotation Expired
                                                </AlertTitle>
                                                <AlertDescription>
                                                    This quotation has already
                                                    expired. Please update the
                                                    due date.
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        <Separator className="my-4" />

                                        <div className="flex justify-end space-x-3">
                                            <Link
                                                href={route(
                                                    "quotations.show",
                                                    quotation.id
                                                )}
                                            >
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                >
                                                    Cancel
                                                </Button>
                                            </Link>
                                            <Button
                                                type="submit"
                                                className="bg-amber-600 hover:bg-amber-700 text-white"
                                                disabled={
                                                    processing ||
                                                    isSubmitting ||
                                                    !data.code ||
                                                    !data.due_date ||
                                                    !data.status
                                                }
                                            >
                                                {processing || isSubmitting
                                                    ? "Saving..."
                                                    : "Update Quotation"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        </div>

                        {/* Right column - Inquiry details */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="pb-3 bg-muted/40">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Info className="h-5 w-5 text-blue-500" />
                                        Inquiry Information
                                    </CardTitle>
                                    <CardDescription>
                                        Details of the inquiry this quotation is
                                        for
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-50/30 rounded-lg p-4 border border-blue-100">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                                                    <FileText className="h-5 w-5 text-blue-700" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">
                                                        <Link
                                                            href={route(
                                                                "inquiries.show",
                                                                quotation
                                                                    .inquiry.id
                                                            )}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            Inquiry #
                                                            {
                                                                quotation
                                                                    .inquiry
                                                                    .code
                                                            }
                                                        </Link>
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Created on{" "}
                                                        {formatDate(
                                                            quotation.inquiry
                                                                .created_at ||
                                                                ""
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mt-2">
                                            <div className="flex justify-between py-2 border-b border-border/60">
                                                <span className="text-sm text-muted-foreground">
                                                    Customer
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {
                                                        quotation.inquiry
                                                            .customer.name
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border/60">
                                                <span className="text-sm text-muted-foreground">
                                                    End User
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {quotation.inquiry
                                                        .end_user_name ||
                                                        "Not specified"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border/60">
                                                <span className="text-sm text-muted-foreground">
                                                    Inquiry Date
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {formatDate(
                                                        quotation.inquiry
                                                            .inquiry_date
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border/60">
                                                <span className="text-sm text-muted-foreground">
                                                    Quantity
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {quotation.inquiry.quantity}{" "}
                                                    units
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-sm text-muted-foreground">
                                                    Status
                                                </span>
                                                <Badge
                                                    className={
                                                        quotation.inquiry
                                                            .status ===
                                                        "pending"
                                                            ? "bg-amber-100 text-amber-800"
                                                            : quotation.inquiry
                                                                  .status ===
                                                              "resolved"
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : "bg-slate-100 text-slate-800"
                                                    }
                                                >
                                                    {quotation.inquiry.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        quotation.inquiry.status.slice(
                                                            1
                                                        )}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="mt-4">
                                        <Link
                                            href={route(
                                                "inquiries.show",
                                                quotation.inquiry.id
                                            )}
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                            >
                                                View Inquiry
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Assigned Personnel */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold">
                                        Assigned Personnel
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    {quotation.inquiry.sales && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs uppercase text-muted-foreground font-medium tracking-wide">
                                                Sales Representative
                                            </h4>
                                            <div className="flex items-center">
                                                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                                    <User className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {
                                                            quotation.inquiry
                                                                .sales.name
                                                        }
                                                    </p>
                                                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        <a
                                                            href={`mailto:${quotation.inquiry.sales.email}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {
                                                                quotation
                                                                    .inquiry
                                                                    .sales.email
                                                            }
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {quotation.inquiry.pic_engineer && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs uppercase text-muted-foreground font-medium tracking-wide">
                                                PIC Engineer
                                            </h4>
                                            <div className="flex items-center">
                                                <div className="bg-emerald-100 p-2 rounded-full mr-3">
                                                    <User className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {
                                                            quotation.inquiry
                                                                .pic_engineer
                                                                .name
                                                        }
                                                    </p>
                                                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        <a
                                                            href={`mailto:${quotation.inquiry.pic_engineer.email}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {
                                                                quotation
                                                                    .inquiry
                                                                    .pic_engineer
                                                                    .email
                                                            }
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default QuotationEdit;

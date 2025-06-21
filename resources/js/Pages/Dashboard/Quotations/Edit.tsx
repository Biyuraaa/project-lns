import { useState, useEffect, FormEvent, useRef } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import type { PageProps, Quotation } from "@/types";
import { usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Calendar as CalendarIcon,
    FileText,
    Info,
    Upload,
    X,
    AlertTriangle,
    Check,
    Clock,
    User,
    Mail,
    CheckCircle,
    ChevronLeft,
    AlertCircle,
    Save,
    Paperclip,
    FileIcon,
    CalendarDays,
    DollarSign,
} from "lucide-react";
import { Badge } from "@/Components/ui/badge";
import {
    cn,
    formatDate as formatDateUtil,
    handleDragOver,
    handleDragLeave,
    formatDate,
    formatFileSize,
} from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { motion } from "framer-motion";

interface EditQuotationProps extends PageProps {
    quotation: Quotation;
}

const QuotationEdit = () => {
    const { quotation } = usePage<EditQuotationProps>().props;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReplaceFile, setShowReplaceFile] = useState(false);

    // File input reference
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        _method: "put",
        id: quotation.id,
        status: quotation.status,
        due_date: quotation.due_date
            ? format(parseISO(quotation.due_date), "yyyy-MM-dd")
            : "",
        file: null as File | null,
        amount: quotation.amount ? String(quotation.amount) : "",
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
    // Handle amount input (numbers only with commas for display)
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Strip all non-numeric characters
        const rawValue = e.target.value.replace(/[^0-9]/g, "");
        setData("amount", rawValue);
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

    // Trigger file input click
    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle file drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("border-amber-400", "bg-amber-50");

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            setSelectedFile(file);
            setData("file", file);
            setData("_removeFile", false);

            // Create a preview URL for the file
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
        }
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

    // Add document drag handlers
    useEffect(() => {
        const handleDocumentDragOver = (e: DragEvent) => {
            e.preventDefault();
        };

        const handleDocumentDrop = (e: DragEvent) => {
            e.preventDefault();
        };

        document.addEventListener("dragover", handleDocumentDragOver);
        document.addEventListener("drop", handleDocumentDrop);

        return () => {
            document.removeEventListener("dragover", handleDocumentDragOver);
            document.removeEventListener("drop", handleDocumentDrop);
        };
    }, []);

    // Check if quotation is expired
    const isExpired = () => {
        if (!quotation.due_date) return false;
        const today = new Date();
        const dueDate = parseISO(quotation.due_date);
        return today > dueDate;
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
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Quotation ${quotation.code}`} />

            <Breadcrumb
                items={[
                    {
                        label: "Quotations",
                        href: route("quotations.index"),
                    },
                    { label: `Edit Quotation ${quotation.code}` },
                ]}
            />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-500 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-amber-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-yellow-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <FileText className="mr-3 h-8 w-8" />
                                    Edit Quotation {quotation.code}
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-amber-100 text-lg">
                                    Update the quotation details and information
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>Edit Mode</span>
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        <span>
                                            Created:{" "}
                                            {formatDate(
                                                quotation.created_at || ""
                                            )}
                                        </span>
                                    </Badge>
                                    {getStatusBadge(data.status)}
                                </div>
                            </div>
                            <div className="flex flex-shrink-0 items-center space-x-3">
                                <Link href={route("quotations.index")}>
                                    <Button className="shadow-lg shadow-amber-900/30 bg-white text-amber-700 hover:bg-amber-50 gap-1.5 font-medium transition-all duration-200">
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>Back to Quotations</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 gap-6">
                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <form
                                onSubmit={handleSubmit}
                                className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100"
                            >
                                <div className="p-6 divide-y divide-gray-200">
                                    {/* Basic Information Section */}
                                    <div className="pb-8">
                                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-amber-600" />
                                            Quotation Information
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Due Date */}
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="due_date"
                                                    className="text-sm font-medium"
                                                >
                                                    Due Date{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <Input
                                                        id="due_date"
                                                        type="date"
                                                        value={data.due_date}
                                                        onChange={(e) =>
                                                            setData(
                                                                "due_date",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 ${
                                                            errors.due_date
                                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                        }`}
                                                    />
                                                </div>
                                                {errors.due_date && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        {errors.due_date}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    The expiration date for this
                                                    quotation
                                                </p>
                                            </div>

                                            {/* Status */}
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="status"
                                                    className="text-sm font-medium"
                                                >
                                                    Status{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                        <FileText className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <Select
                                                        value={data.status}
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setData(
                                                                "status",
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            className={`pl-10 ${
                                                                errors.status
                                                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                    : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                            }`}
                                                        >
                                                            <SelectValue placeholder="Select status" />
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
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {errors.status && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        {errors.status}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Current status of this
                                                    quotation
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="amount"
                                                    className="text-sm font-medium"
                                                >
                                                    Quotation Amount{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <Input
                                                        id="amount"
                                                        type="text"
                                                        value={
                                                            data.amount
                                                                ? new Intl.NumberFormat().format(
                                                                      Number(
                                                                          data.amount
                                                                      )
                                                                  )
                                                                : ""
                                                        }
                                                        onChange={
                                                            handleAmountChange
                                                        }
                                                        placeholder="0"
                                                        className={`pl-10 ${
                                                            errors.amount
                                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                        }`}
                                                        required
                                                    />
                                                </div>
                                                {errors.amount && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        {errors.amount}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Enter the total amount for
                                                    this quotation
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Document Upload Section */}
                                    <div className="py-8">
                                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <Paperclip className="w-5 h-5 mr-2 text-amber-600" />
                                            Quotation Document
                                        </h2>

                                        <div className="space-y-4">
                                            {!showReplaceFile &&
                                            quotation.file &&
                                            !data._removeFile ? (
                                                <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-white border border-amber-200 flex items-center justify-center">
                                                            {getFileIcon(
                                                                quotation.file
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {quotation.file
                                                                    .split("/")
                                                                    .pop()}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                                                    {quotation.file
                                                                        .split(
                                                                            "."
                                                                        )
                                                                        .pop()
                                                                        ?.toUpperCase()}
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
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50"
                                                        onClick={removeFile}
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ) : selectedFile ? (
                                                <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-white border border-amber-200 flex items-center justify-center">
                                                            <FileIcon className="h-6 w-6 text-amber-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {
                                                                    selectedFile.name
                                                                }
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                                                    {selectedFile.name
                                                                        .split(
                                                                            "."
                                                                        )
                                                                        .pop()
                                                                        ?.toUpperCase()}
                                                                </p>
                                                                <p className="text-xs text-gray-600">
                                                                    {formatFileSize(
                                                                        selectedFile.size
                                                                    )}
                                                                </p>
                                                            </div>
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
                                                            onClick={removeFile}
                                                            className="text-muted-foreground hover:text-destructive"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={triggerFileInput}
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={
                                                        handleDragLeave
                                                    }
                                                    onDrop={handleDrop}
                                                    className={cn(
                                                        "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
                                                        "border-gray-300 bg-gray-50 hover:bg-gray-100"
                                                    )}
                                                >
                                                    <input
                                                        ref={fileInputRef}
                                                        id="file"
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                                        className="hidden"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                    />

                                                    <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                                                        <Upload className="h-7 w-7 text-amber-600" />
                                                    </div>

                                                    <h3 className="text-base font-medium text-gray-900">
                                                        {data._removeFile ||
                                                        !quotation.file
                                                            ? "Upload Quotation Document"
                                                            : "Replace Quotation Document"}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1 text-center max-w-md">
                                                        Drag and drop files
                                                        here, or click to browse
                                                        through your files.
                                                        Support for PDF, Office
                                                        documents, and
                                                        spreadsheets.
                                                    </p>

                                                    {/* File type hints */}
                                                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                                                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                            PDF
                                                        </span>
                                                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                            DOC/DOCX
                                                        </span>
                                                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                            XLS/XLSX
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {errors.file && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.file}
                                                </p>
                                            )}
                                        </div>

                                        {isExpired() && (
                                            <Alert
                                                variant="destructive"
                                                className="bg-red-50 text-red-800 border-red-200 mt-4"
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
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                                    <Link
                                        href={route(
                                            "quotations.show",
                                            quotation.id
                                        )}
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-gray-300 text-gray-700"
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
                                            !data.due_date ||
                                            !data.status
                                        }
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing || isSubmitting
                                            ? "Saving..."
                                            : "Update Quotation"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>

                        {/* Information Box - Moved below the form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 shadow-sm">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-amber-800">
                                            Information
                                        </h3>
                                        <div className="mt-2 text-sm text-amber-700">
                                            <p>
                                                Fields marked with an asterisk
                                                (*) are mandatory. Make sure to
                                                keep your quotation details
                                                up-to-date.
                                            </p>
                                            <p className="mt-1">
                                                If you upload a new document, it
                                                will replace the existing one.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Inquiry Information & Assigned Personnel Cards - Now in a grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Inquiry Information Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 h-full">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100/50">
                                        <h2 className="font-medium text-base text-blue-800 flex items-center">
                                            <Info className="h-4.5 w-4.5 mr-2 text-blue-600" />
                                            Inquiry Information
                                        </h2>
                                        <p className="text-sm text-blue-600/80 mt-0.5">
                                            Details of the inquiry this
                                            quotation is for
                                        </p>
                                    </div>

                                    <div className="p-4">
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
                                                        {formatDateUtil(
                                                            quotation.inquiry
                                                                .created_at ||
                                                                ""
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mt-4">
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="text-sm text-gray-500">
                                                    Customer
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {
                                                        quotation.inquiry
                                                            .customer.name
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="text-sm text-gray-500">
                                                    Inquiry Date
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {formatDateUtil(
                                                        quotation.inquiry
                                                            .inquiry_date
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="text-sm text-gray-500">
                                                    Business Unit
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {
                                                        quotation.inquiry
                                                            .business_unit.name
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-sm text-gray-500">
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

                                        <div className="mt-4 pt-1">
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
                                    </div>
                                </div>
                            </motion.div>

                            {/* Assigned Personnel Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                            >
                                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 h-full">
                                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 border-b border-gray-100">
                                        <h2 className="font-medium text-base text-gray-800 flex items-center">
                                            <User className="h-4.5 w-4.5 mr-2 text-gray-600" />
                                            Assigned Personnel
                                        </h2>
                                    </div>

                                    <div className="p-4 space-y-4">
                                        {quotation.inquiry.sales && (
                                            <div className="space-y-2">
                                                <h4 className="text-xs uppercase text-gray-500 font-medium tracking-wide">
                                                    Sales Representative
                                                </h4>
                                                <div className="flex items-center">
                                                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                                        <User className="h-4 w-4 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {
                                                                quotation
                                                                    .inquiry
                                                                    .sales.name
                                                            }
                                                        </p>
                                                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                            <Mail className="h-3 w-3 mr-1" />
                                                            <a
                                                                href={`mailto:${quotation.inquiry.sales.email}`}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                {
                                                                    quotation
                                                                        .inquiry
                                                                        .sales
                                                                        .email
                                                                }
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {quotation.inquiry.pic_engineer && (
                                            <div className="space-y-2">
                                                <h4 className="text-xs uppercase text-gray-500 font-medium tracking-wide">
                                                    PIC Engineer
                                                </h4>
                                                <div className="flex items-center">
                                                    <div className="bg-emerald-100 p-2 rounded-full mr-3">
                                                        <User className="h-4 w-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {
                                                                quotation
                                                                    .inquiry
                                                                    .pic_engineer
                                                                    .name
                                                            }
                                                        </p>
                                                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
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

                                        {!quotation.inquiry.sales &&
                                            !quotation.inquiry.pic_engineer && (
                                                <div className="p-4 text-center text-gray-500">
                                                    <User className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                                                    <p>
                                                        No personnel assigned to
                                                        this inquiry yet.
                                                    </p>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default QuotationEdit;

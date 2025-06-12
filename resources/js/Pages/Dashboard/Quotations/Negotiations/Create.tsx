import { useState, useRef } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { PageProps, Quotation } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import {
    AlertCircle,
    Building2,
    CreditCard,
    FileText,
    UploadCloud,
    X,
    Calendar,
    DollarSign,
    Building,
    ChevronLeft,
    Paperclip,
    Info,
    FileCheck,
    Save,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/Components/ui/badge";
import { cn, formatCurrency, formatDate, formatFileSize } from "@/lib/utils";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Separator } from "@/Components/ui/separator";

interface CreateNegotiationProps extends PageProps {
    quotation: Quotation;
}

const CreateNegotiation = () => {
    const { quotation } = usePage<CreateNegotiationProps>().props;
    const [dragActive, setDragActive] = useState(false);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
        amount: quotation.amount || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(
            route("quotations.negotiations.store", {
                quotation: quotation,
            }),
            {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setFilePreview(null);
                    setFileName(null);
                },
            }
        );
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        setData("file", file);
        setFileName(file.name);

        // Create preview for PDF, images, etc
        if (file.type.includes("image")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            // For non-image files, we'll just display an icon
            setFilePreview(null);
        }
    };

    const removeFile = () => {
        setData("file", null);
        setFileName(null);
        setFilePreview(null);
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const validateForm = () => {
        return data.file !== null && data.amount !== null;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Add Negotiation Document" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <Breadcrumb
                        items={[
                            {
                                label: "Quotation Management",
                                href: route("quotations.index"),
                            },
                            {
                                label: quotation.code,
                                href: route("quotations.show", quotation.id),
                            },
                            { label: "Add Negotiation Document" },
                        ]}
                    />

                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-amber-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-orange-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <FileCheck className="mr-3 h-8 w-8" />
                                    Add Negotiation Document
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-amber-100 text-lg">
                                    Upload negotiation documents for quotation #
                                    {quotation.code}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>Quotation #{quotation.code}</span>
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <DollarSign className="h-3.5 w-3.5" />
                                        <span>
                                            Current Amount:{" "}
                                            {formatCurrency(
                                                quotation.amount || 0
                                            )}
                                        </span>
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <Link
                                    href={route(
                                        "quotations.show",
                                        quotation.id
                                    )}
                                >
                                    <Button className="shadow-lg shadow-amber-900/30 bg-white text-amber-700 hover:bg-amber-50 gap-1.5 font-medium transition-all duration-200">
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>Back to Quotation</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 divide-y divide-gray-200">
                                {/* Negotiation Details Section */}
                                <div className="pb-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <DollarSign className="w-5 h-5 mr-2 text-amber-600" />
                                        Negotiation Amount
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Amount Field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="amount"
                                                className="text-sm font-medium"
                                            >
                                                Negotiated Amount{" "}
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
                                                    type="number"
                                                    value={data.amount}
                                                    onChange={(e) =>
                                                        setData(
                                                            "amount",
                                                            parseInt(
                                                                e.target.value
                                                            ) || 0
                                                        )
                                                    }
                                                    className={`pl-9 ${
                                                        errors.amount
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                    }`}
                                                    placeholder="Enter negotiated amount"
                                                    min="0"
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
                                                Enter the new negotiated amount
                                                for this quotation
                                            </p>
                                        </div>

                                        {/* Original Amount (Read-only) */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="original_amount"
                                                className="text-sm font-medium"
                                            >
                                                Original Quotation Amount
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <DollarSign className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="original_amount"
                                                    type="text"
                                                    value={formatCurrency(
                                                        quotation.amount || 0
                                                    )}
                                                    className="pl-9 bg-gray-50 text-gray-500"
                                                    readOnly
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Original amount from the
                                                quotation
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amount Comparison Card */}
                                    <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-100">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-amber-800 font-medium">
                                                    ORIGINAL AMOUNT
                                                </p>
                                                <p className="text-lg font-semibold text-amber-900">
                                                    {formatCurrency(
                                                        quotation.amount || 0
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-amber-800 font-medium">
                                                    NEW AMOUNT
                                                </p>
                                                <p className="text-lg font-semibold text-amber-900">
                                                    {formatCurrency(
                                                        data.amount || 0
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-amber-800 font-medium">
                                                    DIFFERENCE
                                                </p>
                                                <p
                                                    className={`text-lg font-semibold ${
                                                        (data.amount || 0) >
                                                        (quotation.amount || 0)
                                                            ? "text-green-600"
                                                            : (data.amount ||
                                                                  0) <
                                                              (quotation.amount ||
                                                                  0)
                                                            ? "text-red-600"
                                                            : "text-amber-900"
                                                    }`}
                                                >
                                                    {formatCurrency(
                                                        (data.amount || 0) -
                                                            (quotation.amount ||
                                                                0)
                                                    )}
                                                    {(data.amount || 0) !==
                                                        (quotation.amount ||
                                                            0) && (
                                                        <span className="text-xs ml-1">
                                                            (
                                                            {(data.amount ||
                                                                0) >
                                                            (quotation.amount ||
                                                                0)
                                                                ? "+"
                                                                : ""}
                                                            {(
                                                                (((data.amount ||
                                                                    0) -
                                                                    (quotation.amount ||
                                                                        0)) /
                                                                    (quotation.amount ||
                                                                        1)) *
                                                                100
                                                            ).toFixed(1)}
                                                            %)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* File Upload Section */}
                                <div className="py-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Paperclip className="w-5 h-5 mr-2 text-amber-600" />
                                        Document Upload
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </h2>

                                    <div className="space-y-4">
                                        {/* Upload area */}
                                        <div
                                            className={cn(
                                                "border-2 border-dashed rounded-lg p-8 transition-colors text-center cursor-pointer",
                                                dragActive
                                                    ? "border-amber-400 bg-amber-50"
                                                    : "border-gray-300 hover:bg-gray-50",
                                                errors.file
                                                    ? "border-red-300"
                                                    : ""
                                            )}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            onClick={triggerFileInput}
                                        >
                                            <Input
                                                ref={fileInputRef}
                                                id="file-input"
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                            />

                                            {!data.file ? (
                                                <div className="flex flex-col items-center justify-center py-4">
                                                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                                                        <UploadCloud className="h-8 w-8 text-amber-600" />
                                                    </div>
                                                    <p className="text-lg font-medium text-gray-700">
                                                        Drop your file here, or{" "}
                                                        <span className="text-amber-600">
                                                            browse
                                                        </span>
                                                    </p>
                                                    <p className="mt-2 text-sm text-gray-500">
                                                        Support for PDF, Word,
                                                        Excel, or image files
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-4 py-4">
                                                    {filePreview ? (
                                                        <img
                                                            src={filePreview}
                                                            alt="Preview"
                                                            className="w-16 h-16 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-amber-100 rounded flex items-center justify-center">
                                                            <FileText className="h-8 w-8 text-amber-600" />
                                                        </div>
                                                    )}

                                                    <div className="flex-1 text-left">
                                                        <p className="font-medium truncate max-w-xs">
                                                            {fileName}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {data.file &&
                                                                formatFileSize(
                                                                    data.file
                                                                        .size
                                                                )}
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="mt-1 text-red-500 hover:text-red-700 p-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeFile();
                                                            }}
                                                        >
                                                            <X className="h-4 w-4 mr-1" />
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {errors.file && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                {errors.file}
                                            </p>
                                        )}

                                        <div className="bg-amber-50 p-4 rounded-md border border-amber-100 flex items-start">
                                            <Info className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm text-amber-800">
                                                <p>
                                                    Upload documents related to
                                                    the negotiation process for
                                                    this quotation. This can
                                                    include email
                                                    correspondence, revised
                                                    terms, price adjustments, or
                                                    other relevant documents.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
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
                                        variant="outline"
                                        type="button"
                                        className="border-gray-300 text-gray-700"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={!validateForm() || processing}
                                    className="bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing
                                        ? "Uploading..."
                                        : "Save Negotiation"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Quotation Information Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="mt-8 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100"
                    >
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <CreditCard className="w-5 h-5 mr-2 text-amber-600" />
                                Quotation Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {/* Quotation Code */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                                        Quotation Code
                                    </h3>
                                    <p className="text-lg font-semibold flex items-center">
                                        <FileText className="h-4 w-4 text-amber-500 mr-2" />
                                        {quotation.code}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                                        Amount
                                    </h3>
                                    <p className="text-lg font-semibold flex items-center">
                                        <DollarSign className="h-4 w-4 text-amber-500 mr-2" />
                                        {formatCurrency(quotation.amount || 0)}
                                    </p>
                                </div>

                                {/* Due Date */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                                        Due Date
                                    </h3>
                                    <p className="text-lg font-semibold flex items-center">
                                        <Calendar className="h-4 w-4 text-amber-500 mr-2" />
                                        {formatDate(quotation.due_date)}
                                    </p>
                                </div>

                                {/* Status */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                                        Status
                                    </h3>
                                    <Badge
                                        className={cn(
                                            quotation.status === "n/a"
                                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                                : quotation.status === "val"
                                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                : quotation.status === "lost"
                                                ? "bg-red-100 text-red-800 border-red-200"
                                                : quotation.status === "wip"
                                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                                : "bg-gray-100 text-gray-800 border-gray-200"
                                        )}
                                    >
                                        {quotation.status === "val"
                                            ? "Validated"
                                            : quotation.status === "n/a"
                                            ? "N/A"
                                            : quotation.status === "lost"
                                            ? "Lost"
                                            : quotation.status === "wip"
                                            ? "Work in Progress"
                                            : quotation.status}
                                    </Badge>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Information */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                        <Building2 className="h-4 w-4 text-amber-500 mr-2" />
                                        Customer Information
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="font-medium">
                                            {quotation.inquiry?.customer?.name}
                                        </p>
                                        {quotation.inquiry?.customer?.email && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                {
                                                    quotation.inquiry.customer
                                                        .email
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Business Unit */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                        <Building className="h-4 w-4 text-amber-500 mr-2" />
                                        Business Unit
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="font-medium">
                                            {
                                                quotation.inquiry?.business_unit
                                                    ?.name
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default CreateNegotiation;

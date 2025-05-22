"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
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
    Hash,
    ChevronLeft,
    AlertCircle,
    Save,
    Paperclip,
    FileIcon,
    Search,
    CalendarDays,
    Check,
    Clock,
    CheckCircle,
} from "lucide-react";
import { Badge } from "@/Components/ui/badge";
import {
    cn,
    formatFileSize,
    handleDragLeave,
    handleDragOver,
} from "@/lib/utils";
import type { Inquiry, PageProps } from "@/types";
import { motion } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

interface CreateQuotationProps extends PageProps {
    inquiries: Inquiry[];
}

const QuotationsCreate = () => {
    const { inquiries } = usePage<CreateQuotationProps>().props;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // For inquiry search and selection
    const [filteredInquiries, setFilteredInquiries] =
        useState<Inquiry[]>(inquiries);
    const [inquirySearchTerm, setInquirySearchTerm] = useState("");
    const [showInquiryDropdown, setShowInquiryDropdown] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(
        null
    );

    // File input reference
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: "",
        status: "n/a",
        due_date: "",
        file: null as File | null,
        inquiry_id: "",
    });

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setSelectedFile(file);
            setData("file", file);

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
    };

    // Handle inquiry search
    const handleInquirySearch = (searchTerm: string) => {
        setInquirySearchTerm(searchTerm);
        if (searchTerm.trim() === "") {
            setFilteredInquiries(inquiries);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = inquiries.filter(
                (inquiry) =>
                    inquiry.code?.toLowerCase().includes(term) ||
                    inquiry.customer?.name?.toLowerCase().includes(term)
            );
            setFilteredInquiries(filtered);
        }
    };

    // Select an inquiry
    const handleInquirySelect = (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        setData("inquiry_id", String(inquiry.id));
        setInquirySearchTerm(inquiry.code || "");
        setShowInquiryDropdown(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("border-amber-400", "bg-amber-50");

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            setSelectedFile(file);
            setData("file", file);

            // Create a preview URL for the file
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
        }
    };

    // Trigger file input click
    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle form submission
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Create FormData for handling file upload
        const formData = new FormData();
        for (const key in data) {
            if (key === "file" && data.file instanceof File) {
                formData.append(key, data.file);
            } else if (key !== "file") {
                formData.append(
                    key,
                    String(data[key as keyof typeof data] || "")
                );
            }
        }

        post(route("quotations.store"), {
            forceFormData: true,
            onSuccess: () => {
                setIsSubmitting(false);
                reset();
                setSelectedFile(null);
                setPreviewUrl(null);
                setSelectedInquiry(null);
                setInquirySearchTerm("");
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

    // Update selected inquiry when inquiry_id changes
    useEffect(() => {
        if (data.inquiry_id) {
            const inquiry = inquiries.find(
                (inq) => inq.id.toString() === data.inquiry_id
            );
            setSelectedInquiry(inquiry || null);
        }
    }, [data.inquiry_id, inquiries]);

    // Form validation check
    const validateForm = () => {
        return (
            data.code.trim() !== "" &&
            data.due_date !== "" &&
            selectedFile !== null &&
            data.inquiry_id !== ""
        );
    };

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

    // Close inquiry dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (
                !target.closest("#inquiry-search") &&
                !target.closest("#inquiry-dropdown")
            ) {
                setShowInquiryDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

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
            <Head title="Create Quotation" />
            <Breadcrumb
                items={[
                    {
                        label: "Quotations",
                        href: route("quotations.index"),
                    },
                    { label: "Create New Quotation" },
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
                                    Create New Quotation
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-amber-100 text-lg">
                                    Create a new quotation for a customer
                                    inquiry
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>New Quotation</span>
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        <span>
                                            Today:{" "}
                                            {new Date().toLocaleDateString()}
                                        </span>
                                    </Badge>
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

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 divide-y divide-gray-200">
                                {/* Basic Information Section */}
                                <div className="pb-8">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-amber-600" />
                                        Quotation Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Inquiry Selection */}
                                        <div className="space-y-1 md:col-span-2 lg:col-span-3">
                                            <Label
                                                htmlFor="inquiry_search"
                                                className="text-sm font-medium"
                                            >
                                                Select Inquiry{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Search className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="inquiry-search"
                                                    type="text"
                                                    placeholder="Search by inquiry code or customer name"
                                                    value={inquirySearchTerm}
                                                    onChange={(e) => {
                                                        handleInquirySearch(
                                                            e.target.value
                                                        );
                                                        setShowInquiryDropdown(
                                                            true
                                                        );
                                                    }}
                                                    onFocus={() =>
                                                        setShowInquiryDropdown(
                                                            true
                                                        )
                                                    }
                                                    className={`pl-10 ${
                                                        errors.inquiry_id
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                    }`}
                                                />
                                                {selectedInquiry && (
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                        <Badge
                                                            variant="outline"
                                                            className="border-green-300 bg-green-50 text-green-700"
                                                        >
                                                            {
                                                                selectedInquiry.code
                                                            }
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {showInquiryDropdown && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: -5,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    id="inquiry-dropdown"
                                                    className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-full max-h-60 overflow-y-auto"
                                                >
                                                    {filteredInquiries.length ===
                                                    0 ? (
                                                        <div className="p-3 text-sm text-gray-500">
                                                            No inquiries found
                                                        </div>
                                                    ) : (
                                                        filteredInquiries.map(
                                                            (inquiry) => (
                                                                <div
                                                                    key={
                                                                        inquiry.id
                                                                    }
                                                                    className={cn(
                                                                        "p-3 cursor-pointer hover:bg-gray-100",
                                                                        selectedInquiry?.id ===
                                                                            inquiry.id
                                                                            ? "bg-amber-50"
                                                                            : ""
                                                                    )}
                                                                    onClick={() =>
                                                                        handleInquirySelect(
                                                                            inquiry
                                                                        )
                                                                    }
                                                                >
                                                                    <div className="flex justify-between">
                                                                        <span className="font-medium">
                                                                            {
                                                                                inquiry.code
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {
                                                                            inquiry
                                                                                .customer
                                                                                ?.name
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                        )
                                                    )}
                                                </motion.div>
                                            )}

                                            {errors.inquiry_id && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.inquiry_id}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Select the inquiry this
                                                quotation is for
                                            </p>
                                        </div>

                                        {/* Quotation Code Field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="code"
                                                className="text-sm font-medium"
                                            >
                                                Quotation Code{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Hash className="h-4 w-4 text-gray-400" />
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
                                                    className={`pl-10 ${
                                                        errors.code
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                    }`}
                                                    required
                                                />
                                            </div>
                                            {errors.code && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.code}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Enter a unique code for this
                                                quotation
                                            </p>
                                        </div>

                                        {/* Due Date Field */}
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
                                                    min={
                                                        new Date()
                                                            .toISOString()
                                                            .split("T")[0]
                                                    }
                                                    className={`pl-10 ${
                                                        errors.due_date
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                    }`}
                                                    required
                                                />
                                            </div>
                                            {errors.due_date && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.due_date}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Set the expiration date for this
                                                quotation
                                            </p>
                                        </div>

                                        {/* Status Field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="status"
                                                className="text-sm font-medium"
                                            >
                                                Status
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Select
                                                    value={data.status}
                                                    onValueChange={(value) =>
                                                        setData("status", value)
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
                                                        <SelectItem value="ar">
                                                            Awaiting Review
                                                        </SelectItem>
                                                        <SelectItem value="clsd">
                                                            Closed
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
                                                Current status of this quotation
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Document Upload Section */}
                                <div className="py-8">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Paperclip className="w-5 h-5 mr-2 text-amber-600" />
                                        Quotation Document
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </h2>

                                    <div className="space-y-4">
                                        {selectedFile ? (
                                            <div className="mb-4">
                                                <h3 className="text-sm font-medium text-gray-900 mb-2">
                                                    Selected Document
                                                </h3>
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
                                                    <button
                                                        type="button"
                                                        className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50"
                                                        onClick={removeFile}
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={triggerFileInput}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                className={cn(
                                                    "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
                                                    "border-gray-300 bg-gray-50 hover:bg-gray-100"
                                                )}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                                />

                                                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                                                    <Upload className="h-7 w-7 text-amber-600" />
                                                </div>

                                                <h3 className="text-base font-medium text-gray-900">
                                                    Upload Quotation Document
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1 text-center max-w-md">
                                                    Drag and drop files here, or
                                                    click to browse through your
                                                    files. Support for PDF,
                                                    Office documents, and
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
                                </div>

                                {/* Inquiry Information Section - Only shown when an inquiry is selected */}
                                {selectedInquiry && (
                                    <div className="py-8">
                                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <Info className="w-5 h-5 mr-2 text-amber-600" />
                                            Selected Inquiry Information
                                        </h2>

                                        <div className="bg-amber-50 rounded-lg border border-amber-200 p-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Inquiry Code
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedInquiry.code}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Customer
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {
                                                            selectedInquiry
                                                                .customer?.name
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Business Unit
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {
                                                            selectedInquiry
                                                                .business_unit
                                                                ?.name
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        End User
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedInquiry.end_user_name ||
                                                            "Not specified"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Inquiry Date
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {formatDate(
                                                            selectedInquiry.inquiry_date
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Status
                                                    </p>
                                                    <Badge
                                                        className={
                                                            selectedInquiry.status ===
                                                            "pending"
                                                                ? "bg-amber-100 text-amber-800"
                                                                : selectedInquiry.status ===
                                                                  "resolved"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }
                                                    >
                                                        {selectedInquiry.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            selectedInquiry.status.slice(
                                                                1
                                                            )}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-amber-200">
                                                <p className="text-sm font-medium text-gray-700 mb-1">
                                                    Description
                                                </p>
                                                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                                    {
                                                        selectedInquiry.description
                                                    }
                                                </p>
                                            </div>

                                            {/* Team Information */}
                                            <div className="mt-4 pt-4 border-t border-amber-200">
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    Team Assignment
                                                </p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <div>
                                                        <span className="text-xs text-gray-500">
                                                            Sales Person:
                                                        </span>
                                                        <p className="text-sm">
                                                            {selectedInquiry
                                                                .sales?.name ||
                                                                "Unassigned"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500">
                                                            PIC Engineer:
                                                        </span>
                                                        <p className="text-sm">
                                                            {selectedInquiry
                                                                .pic_engineer
                                                                ?.name ||
                                                                "Unassigned"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                                <Link href={route("quotations.index")}>
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
                                    disabled={
                                        processing ||
                                        isSubmitting ||
                                        !validateForm()
                                    }
                                    className="bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing || isSubmitting
                                        ? "Creating..."
                                        : "Create Quotation"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Help Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="mt-6 bg-amber-50 border border-amber-100 rounded-lg p-4"
                    >
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
                                        Fields marked with an asterisk (*) are
                                        mandatory. Start by selecting an inquiry
                                        for this quotation.
                                    </p>
                                    <p className="mt-1">
                                        Once created, this quotation will be
                                        linked to the selected inquiry and can
                                        be accessed through both the quotation
                                        and inquiry management sections.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default QuotationsCreate;

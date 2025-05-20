"use client";

import type React from "react";
import { type FormEvent, useState, useEffect, useRef } from "react";
import { Head, useForm, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ChevronLeft,
    Save,
    ShoppingCart,
    FileText,
    Calendar,
    DollarSign,
    Hash,
    Building2,
    Paperclip,
    Info,
    AlertCircle,
    Upload,
    X,
    FileIcon,
    Search,
    Check,
    Briefcase,
    ClipboardList,
    ArrowUpDown,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Badge } from "@/Components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import type { Customer, Inquiry, PageProps, PurchaseOrder } from "@/types";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { format } from "date-fns";

interface PurchaseOrdersEditProps extends PageProps {
    purchaseOrder: PurchaseOrder;
    inquiries: Inquiry[];
}

const PurchaseOrdersEdit = () => {
    const { purchaseOrder, inquiries } =
        usePage<PurchaseOrdersEditProps>().props;

    // File input reference
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        code: purchaseOrder.code || "",
        inquiry_id: purchaseOrder.inquiry?.id?.toString() || "",
        status: purchaseOrder.status || "pending",
        amount: purchaseOrder.amount || 0,
        contract_number: purchaseOrder.contract_number || "",
        date: purchaseOrder.date || new Date().toISOString().split("T")[0],
        job_number: purchaseOrder.job_number || "",
        file: null as File | null,
        _method: "PUT", // For Laravel method spoofing
    });

    // State for inquiry search and dropdown
    const [inquirySearch, setInquirySearch] = useState(
        purchaseOrder.inquiry?.code || ""
    );
    const [inquiryDropdownOpen, setInquiryDropdownOpen] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(
        purchaseOrder.inquiry || null
    );
    const [currentFile, setCurrentFile] = useState<string | null>(
        purchaseOrder.file || null
    );

    // Filtered inquiries based on search term
    const filteredInquiries = inquiries.filter((inquiry) => {
        const searchLower = inquirySearch.toLowerCase();
        return (
            inquiry.code?.toLowerCase().includes(searchLower) ||
            inquiry.customer?.name?.toLowerCase().includes(searchLower)
        );
    });

    // Format currency input
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Create FormData for handling file upload
        const formData = new FormData();

        // Add all regular form fields to FormData
        Object.keys(data).forEach((key) => {
            if (key !== "file") {
                formData.append(
                    key,
                    data[key as keyof typeof data]?.toString() || ""
                );
            }
        });

        // Add the file if it exists and is a File object
        if (data.file && data.file instanceof File) {
            formData.append("file", data.file);
        }

        router.post(
            route("purchaseOrders.update", purchaseOrder.id),
            formData,
            {
                forceFormData: true,
            }
        );
    };

    // File handling functions
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setData("file", e.target.files[0]);
            setCurrentFile(null);
        }
    };

    const removeFile = () => {
        setData("file", null as unknown as File);
        setCurrentFile(null);
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +
            " " +
            sizes[i]
        );
    };

    // Get file extension
    const getFileExtension = (filename: string): string => {
        return filename.split(".").pop()?.toLowerCase() || "";
    };

    // Get file icon based on extension
    const getFileIcon = (filename: string) => {
        if (!filename) return <FileText className="h-4 w-4 text-gray-500" />;

        const extension = getFileExtension(filename);

        switch (extension) {
            case "pdf":
                return <FileText className="h-5 w-5 text-red-500" />;
            case "doc":
            case "docx":
                return <FileText className="h-5 w-5 text-blue-500" />;
            case "xls":
            case "xlsx":
                return <FileText className="h-5 w-5 text-green-500" />;
            default:
                return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add("border-green-400", "bg-green-50");
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("border-green-400", "bg-green-50");
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("border-green-400", "bg-green-50");

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setData("file", e.dataTransfer.files[0]);
            setCurrentFile(null);
        }
    };

    // Form validation
    const validateForm = () => {
        const requiredFields = [
            data.code,
            data.inquiry_id,
            data.date,
            data.amount > 0,
        ];

        return requiredFields.every((field) => field);
    };

    // Update selected inquiry when inquiry_id changes
    useEffect(() => {
        if (data.inquiry_id) {
            const inquiry = inquiries.find(
                (inq) => inq.id.toString() === data.inquiry_id.toString()
            );
            setSelectedInquiry(inquiry || null);
        } else {
            setSelectedInquiry(null);
        }
    }, [data.inquiry_id]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            if (
                !target.closest("#inquiry-dropdown-container") &&
                !target.closest("#inquiry_search")
            ) {
                setInquiryDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Edit Purchase Order" />
            <Breadcrumb
                items={[
                    {
                        label: "Purchase Order Management",
                        href: route("purchaseOrders.index"),
                    },
                    {
                        label: `View: ${purchaseOrder.code}`,
                        href: route("purchaseOrders.show", purchaseOrder.id),
                    },
                    { label: "Edit Purchase Order" },
                ]}
            />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-green-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-teal-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <ShoppingCart className="mr-3 h-8 w-8" />
                                    Edit Purchase Order
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-green-100 text-lg">
                                    Update details for PO #{purchaseOrder.code}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <ShoppingCart className="h-3.5 w-3.5" />
                                        <span>Edit Purchase Order</span>
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            Created:{" "}
                                            {format(
                                                new Date(
                                                    purchaseOrder.created_at ||
                                                        new Date()
                                                ),
                                                "MMM dd, yyyy"
                                            )}
                                        </span>
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-shrink-0 items-center space-x-3">
                                <Link
                                    href={route(
                                        "purchaseOrders.show",
                                        purchaseOrder.id
                                    )}
                                >
                                    <Button className="shadow-lg shadow-green-900/30 bg-white text-green-700 hover:bg-green-50 gap-1.5 font-medium transition-all duration-200">
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>Back to Details</span>
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
                                        <FileText className="w-5 h-5 mr-2 text-green-600" />
                                        Purchase Order Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* PO Code Field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="code"
                                                className="text-sm font-medium"
                                            >
                                                PO Number{" "}
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
                                                            : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                                                    }`}
                                                    placeholder="e.g., PO-230501-1234"
                                                    required
                                                />
                                            </div>
                                            {errors.code && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.code}
                                                </p>
                                            )}
                                        </div>

                                        {/* PO Date Field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="date"
                                                className="text-sm font-medium"
                                            >
                                                PO Date{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="date"
                                                    type="date"
                                                    value={data.date}
                                                    onChange={(e) =>
                                                        setData(
                                                            "date",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`pl-10 ${
                                                        errors.date
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                                                    }`}
                                                    required
                                                />
                                            </div>
                                            {errors.date && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.date}
                                                </p>
                                            )}
                                        </div>

                                        {/* Amount Field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="amount"
                                                className="text-sm font-medium"
                                            >
                                                Amount{" "}
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
                                                    min="0"
                                                    step="0.01"
                                                    value={data.amount}
                                                    onChange={(e) =>
                                                        setData(
                                                            "amount",
                                                            Number.parseFloat(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className={`pl-10 ${
                                                        errors.amount
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                                                    }`}
                                                    placeholder="0.00"
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
                                                Total amount of this purchase
                                                order
                                            </p>
                                        </div>

                                        {/* Contract Number Field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="contract_number"
                                                className="text-sm font-medium"
                                            >
                                                Contract Number
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="contract_number"
                                                    type="text"
                                                    value={data.contract_number}
                                                    onChange={(e) =>
                                                        setData(
                                                            "contract_number",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`pl-10 ${
                                                        errors.contract_number
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                                                    }`}
                                                    placeholder="e.g., CTR-2023-001"
                                                />
                                            </div>
                                            {errors.contract_number && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.contract_number}
                                                </p>
                                            )}
                                        </div>

                                        {/* Job Number Field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="job_number"
                                                className="text-sm font-medium"
                                            >
                                                Job Number
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="job_number"
                                                    type="text"
                                                    value={data.job_number}
                                                    onChange={(e) =>
                                                        setData(
                                                            "job_number",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`pl-10 ${
                                                        errors.job_number
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                                                    }`}
                                                    placeholder="e.g., JOB-23-001"
                                                />
                                            </div>
                                            {errors.job_number && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.job_number}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Internal job reference number
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
                                            <Select
                                                value={data.status}
                                                onValueChange={(value) =>
                                                    setData("status", value)
                                                }
                                            >
                                                <SelectTrigger
                                                    className={`${
                                                        errors.status
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                                                    }`}
                                                >
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">
                                                        Pending
                                                    </SelectItem>
                                                    <SelectItem value="approved">
                                                        Approved
                                                    </SelectItem>
                                                    <SelectItem value="rejected">
                                                        Rejected
                                                    </SelectItem>
                                                    <SelectItem value="completed">
                                                        Completed
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.status}
                                                </p>
                                            )}
                                        </div>

                                        {/* Inquiry Selection Field - Full width */}
                                        <div
                                            className="space-y-2 md:col-span-2 lg:col-span-3"
                                            id="inquiry-dropdown-container"
                                        >
                                            <Label
                                                htmlFor="inquiry_search"
                                                className="text-sm font-medium"
                                            >
                                                Related Inquiry{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <ClipboardList className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="inquiry_search"
                                                    type="text"
                                                    placeholder="Search inquiry by code or customer name..."
                                                    value={inquirySearch}
                                                    onChange={(e) => {
                                                        setInquirySearch(
                                                            e.target.value
                                                        );
                                                        setInquiryDropdownOpen(
                                                            true
                                                        );
                                                    }}
                                                    onClick={() => {
                                                        setInquiryDropdownOpen(
                                                            true
                                                        );
                                                    }}
                                                    className={`pl-10 ${
                                                        errors.inquiry_id
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                                                    }`}
                                                />
                                                {inquirySearch && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setInquirySearch(
                                                                ""
                                                            );
                                                            setData(
                                                                "inquiry_id",
                                                                ""
                                                            );
                                                            setInquiryDropdownOpen(
                                                                true
                                                            );
                                                        }}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    >
                                                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                    </button>
                                                )}

                                                {data.inquiry_id &&
                                                    inquirySearch && (
                                                        <div className="absolute inset-y-0 right-8 pr-3 flex items-center">
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-green-100 text-green-700"
                                                            >
                                                                {
                                                                    selectedInquiry?.code
                                                                }
                                                            </Badge>
                                                        </div>
                                                    )}

                                                {inquiryDropdownOpen && (
                                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200">
                                                        {/* Search Header */}
                                                        <div className="sticky top-0 z-20 bg-white p-2 border-b border-gray-200">
                                                            <div className="relative">
                                                                <Search className="h-4 w-4 text-gray-400 absolute top-1/2 transform -translate-y-1/2 left-3" />
                                                                <Input
                                                                    type="text"
                                                                    placeholder="Type to search inquiries..."
                                                                    className="pl-10 py-1 text-sm"
                                                                    value={
                                                                        inquirySearch
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        setInquirySearch(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        );
                                                                    }}
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Inquiry List */}
                                                        <div className="max-h-52 overflow-y-auto">
                                                            {filteredInquiries.length ===
                                                            0 ? (
                                                                <div className="px-4 py-3 text-sm text-gray-500">
                                                                    {inquiries.length >
                                                                    0
                                                                        ? "No inquiries found matching your search"
                                                                        : "No inquiries available in the system"}
                                                                </div>
                                                            ) : (
                                                                filteredInquiries.map(
                                                                    (
                                                                        inquiry
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                inquiry.id
                                                                            }
                                                                            className={`${
                                                                                data.inquiry_id ===
                                                                                inquiry.id.toString()
                                                                                    ? "bg-green-50 text-green-700"
                                                                                    : "text-gray-900 hover:bg-gray-100"
                                                                            } cursor-pointer select-none relative py-2 pl-3 pr-9`}
                                                                            onClick={() => {
                                                                                setData(
                                                                                    "inquiry_id",
                                                                                    inquiry.id.toString()
                                                                                );
                                                                                setInquirySearch(
                                                                                    inquiry.code ||
                                                                                        "Unknown Code"
                                                                                );
                                                                                setInquiryDropdownOpen(
                                                                                    false
                                                                                );
                                                                            }}
                                                                        >
                                                                            <span className="block truncate font-medium">
                                                                                {
                                                                                    inquiry.code
                                                                                }
                                                                            </span>
                                                                            <span className="block text-xs text-gray-500 mt-0.5 truncate">
                                                                                Customer:{" "}
                                                                                {inquiry
                                                                                    .customer
                                                                                    ?.name ||
                                                                                    "Unknown"}
                                                                            </span>
                                                                            {data.inquiry_id ===
                                                                                inquiry.id.toString() && (
                                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                                                    <Check className="h-5 w-5 text-green-600" />
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {errors.inquiry_id && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.inquiry_id}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Select the inquiry this purchase
                                                order is related to
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* File Upload Section */}
                                <div className="py-8">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Paperclip className="w-5 h-5 mr-2 text-green-600" />
                                        Purchase Order Document
                                        <span className="text-sm font-normal text-gray-500 ml-2">
                                            (Optional)
                                        </span>
                                    </h2>

                                    <div className="space-y-4">
                                        {/* Current file display */}
                                        {currentFile && (
                                            <div className="mb-4">
                                                <h3 className="text-sm font-medium text-gray-900 mb-2">
                                                    Current Document
                                                </h3>
                                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 flex-shrink-0 rounded bg-white border border-gray-200 flex items-center justify-center">
                                                            {getFileIcon(
                                                                currentFile
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {currentFile
                                                                    .split("/")
                                                                    .pop() ||
                                                                    currentFile}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {getFileExtension(
                                                                    currentFile
                                                                ).toUpperCase()}{" "}
                                                                File
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <a
                                                            href={`/storage/files/purchaseOrders/${currentFile}`}
                                                            target="_blank"
                                                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                        >
                                                            Download
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeFile()
                                                            }
                                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                        >
                                                            Replace
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* File upload area */}
                                        {(!currentFile || data.file) && (
                                            <>
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
                                                        type="file"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                        className="hidden"
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                    />

                                                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                                        <Upload className="h-7 w-7 text-green-600" />
                                                    </div>

                                                    <h3 className="text-base font-medium text-gray-900">
                                                        {currentFile
                                                            ? "Replace current document"
                                                            : "Upload PO document"}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1 text-center max-w-md">
                                                        Drag and drop files
                                                        here, or click to browse
                                                        through your files.
                                                        Support for PDF, Office
                                                        documents, and images.
                                                    </p>
                                                </div>

                                                {/* New file display */}
                                                {data.file &&
                                                    data.file instanceof
                                                        File && (
                                                        <div className="mt-4">
                                                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                                                                New Document to
                                                                Upload
                                                            </h3>
                                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-10 h-10 flex-shrink-0 rounded bg-white border border-gray-200 flex items-center justify-center">
                                                                        <FileIcon className="h-5 w-5 text-gray-500" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                                            {
                                                                                data
                                                                                    .file
                                                                                    .name
                                                                            }
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {formatFileSize(
                                                                                data
                                                                                    .file
                                                                                    .size
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="text-gray-500 hover:text-red-500"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        setData(
                                                                            "file",
                                                                            null as unknown as File
                                                                        );
                                                                        if (
                                                                            currentFile
                                                                        ) {
                                                                            setCurrentFile(
                                                                                currentFile
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    <X className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Information Section - if inquiry is selected */}
                                {selectedInquiry && (
                                    <div className="py-8">
                                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <Building2 className="w-5 h-5 mr-2 text-green-600" />
                                            Customer Information
                                        </h2>

                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Customer Name
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedInquiry
                                                            .customer?.name ||
                                                            "N/A"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Customer Email
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedInquiry
                                                            .customer?.email ||
                                                            "N/A"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Customer Phone
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedInquiry
                                                            .customer?.phone ||
                                                            "N/A"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Inquiry Date
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedInquiry.inquiry_date
                                                            ? format(
                                                                  new Date(
                                                                      selectedInquiry.inquiry_date
                                                                  ),
                                                                  "MMM dd, yyyy"
                                                              )
                                                            : "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                                <Link
                                    href={route(
                                        "purchaseOrders.show",
                                        purchaseOrder.id
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
                                    disabled={processing || !validateForm()}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Revision History - For Advanced Implementation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="mt-6 bg-white shadow-md rounded-xl border border-gray-100 p-6"
                    >
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <ArrowUpDown className="w-5 h-5 mr-2 text-green-600" />
                            Update History
                        </h2>

                        <div className="text-sm text-gray-500">
                            <p>
                                Last updated on:{" "}
                                {format(
                                    new Date(
                                        purchaseOrder.updated_at ||
                                            purchaseOrder.created_at ||
                                            new Date()
                                    ),
                                    "MMM dd, yyyy HH:mm"
                                )}
                            </p>
                            <p>
                                Created on:{" "}
                                {format(
                                    new Date(
                                        purchaseOrder.created_at || new Date()
                                    ),
                                    "MMM dd, yyyy HH:mm"
                                )}
                            </p>
                        </div>
                    </motion.div>

                    {/* Help Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="mt-6 bg-green-50 border border-green-100 rounded-lg p-4"
                    >
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Info className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">
                                    Information
                                </h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>
                                        Fields marked with an asterisk (*) are
                                        mandatory. The purchase order is linked
                                        to the selected inquiry.
                                    </p>
                                    <p className="mt-1">
                                        You can update all information including
                                        the attachment document. Any changes
                                        will be logged in the system.
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

export default PurchaseOrdersEdit;

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
    Coins,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Badge } from "@/Components/ui/badge";
import { motion } from "framer-motion";
import type { Quotation, PageProps } from "@/types";
import {
    cn,
    formatFileSize,
    formatIDRInput,
    handleDragLeave,
    handleDragOver,
} from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { format } from "date-fns";

interface PurchaseOrdersCreateProps extends PageProps {
    quotations: Quotation[];
}

const PurchaseOrdersCreate = () => {
    const { quotations } = usePage<PurchaseOrdersCreateProps>().props;

    // File input reference
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        code: "",
        quotation_id: "",
        status: "wip",
        amount: 0,
        contract_number: "",
        date: new Date().toISOString().split("T")[0],
        job_number: "",
        file: null as File | null,
    });

    // Update state variables
    const [quotationSearch, setQuotationSearch] = useState("");
    const [quotationDropdownOpen, setQuotationDropdownOpen] = useState(false);
    const [selectedQuotation, setSelectedQuotation] =
        useState<Quotation | null>(null);

    // Update filtered data
    const filteredQuotations = quotations.filter((quotation) => {
        const searchLower = quotationSearch.toLowerCase();
        return (
            quotation.code?.toLowerCase().includes(searchLower) ||
            quotation.inquiry?.customer?.name
                ?.toLowerCase()
                .includes(searchLower)
        );
    });

    useEffect(() => {
        if (data.quotation_id) {
            const quotation = quotations.find(
                (q) => q.id.toString() === data.quotation_id.toString()
            );
            setSelectedQuotation(quotation || null);

            // Auto generate job number based on inquiry code if available
            if (quotation?.inquiry?.code && !data.job_number) {
                setData(
                    "job_number",
                    `JOB-${quotation.inquiry.code.split("-")[1] || ""}`
                );
            }
        } else {
            setSelectedQuotation(null);
        }
    }, [data.quotation_id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            if (
                !target.closest("#quotation-dropdown-container") &&
                !target.closest("#quotation_search")
            ) {
                setQuotationDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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

        // Add the file if it exists
        if (data.file && data.file instanceof File) {
            formData.append("file", data.file);
        }

        router.post(route("purchaseOrders.store"), formData, {
            forceFormData: true,
        });
    };

    // File handling functions
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setData("file", e.target.files[0]);
        }
    };

    const removeFile = () => {
        setData("file", null as unknown as File);
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("border-green-400", "bg-green-50");

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setData("file", e.dataTransfer.files[0]);
        }
    };

    const validateForm = () => {
        const requiredFields = [
            data.code,
            data.quotation_id,
            data.date,
            data.amount > 0,
        ];

        return requiredFields.every((field) => field);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Purchase Order" />
            <Breadcrumb
                items={[
                    {
                        label: "Purchase Order Management",
                        href: route("purchaseOrders.index"),
                    },
                    { label: "Create Purchase Order" },
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
                                    Create Purchase Order
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-green-100 text-lg">
                                    Create a new purchase order in the system
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <ShoppingCart className="h-3.5 w-3.5" />
                                        <span>New Purchase Order</span>
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            Today:{" "}
                                            {format(new Date(), "MMM dd, yyyy")}
                                        </span>
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-shrink-0 items-center space-x-3">
                                <Link href={route("purchaseOrders.index")}>
                                    <Button className="shadow-lg shadow-green-900/30 bg-white text-green-700 hover:bg-green-50 gap-1.5 font-medium transition-all duration-200">
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>Back to Purchase Orders</span>
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
                                                A unique code is auto-generated,
                                                but you can customize it
                                            </p>
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
                                                    <Coins className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="amount"
                                                    type="text" // Changed from number to text to allow for formatted input
                                                    value={
                                                        data.amount === 0
                                                            ? ""
                                                            : formatIDRInput(
                                                                  data.amount
                                                              )
                                                    }
                                                    onChange={(e) => {
                                                        // Remove all non-numeric characters and convert to number
                                                        const numericValue =
                                                            e.target.value.replace(
                                                                /\D/g,
                                                                ""
                                                            );
                                                        setData(
                                                            "amount",
                                                            numericValue
                                                                ? Number(
                                                                      numericValue
                                                                  )
                                                                : 0
                                                        );
                                                    }}
                                                    className={`pl-10 ${
                                                        errors.amount
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                                                    }`}
                                                    placeholder="0"
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
                                                    <SelectItem value="wip">
                                                        WIP (Work In Progress)
                                                    </SelectItem>
                                                    <SelectItem value="ar">
                                                        AR (Accounts Receivable)
                                                    </SelectItem>
                                                    <SelectItem value="ibt">
                                                        IBT (Inter-Branch
                                                        Transfer)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.status}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Current processing status of
                                                this purchase order
                                            </p>
                                        </div>
                                        {/* Quotation Selection Field - Full width */}
                                        <div
                                            className="space-y-2 md:col-span-2 lg:col-span-3"
                                            id="quotation-dropdown-container"
                                        >
                                            <Label
                                                htmlFor="quotation_search"
                                                className="text-sm font-medium"
                                            >
                                                Related Quotation{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <ClipboardList className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="quotation_search"
                                                    type="text"
                                                    placeholder="Search quotation by code or customer name..."
                                                    value={quotationSearch}
                                                    onChange={(e) => {
                                                        setQuotationSearch(
                                                            e.target.value
                                                        );
                                                        setQuotationDropdownOpen(
                                                            true
                                                        );
                                                    }}
                                                    onClick={() => {
                                                        setQuotationDropdownOpen(
                                                            true
                                                        );
                                                    }}
                                                    className={`pl-10 ${
                                                        errors.quotation_id
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                                                    }`}
                                                />
                                                {quotationSearch && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setQuotationSearch(
                                                                ""
                                                            );
                                                            setData(
                                                                "quotation_id",
                                                                ""
                                                            );
                                                            setQuotationDropdownOpen(
                                                                true
                                                            );
                                                        }}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    >
                                                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                    </button>
                                                )}

                                                {data.quotation_id &&
                                                    quotationSearch && (
                                                        <div className="absolute inset-y-0 right-8 pr-3 flex items-center">
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-green-100 text-green-700"
                                                            >
                                                                {
                                                                    selectedQuotation?.code
                                                                }
                                                            </Badge>
                                                        </div>
                                                    )}

                                                {quotationDropdownOpen && (
                                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200">
                                                        {/* Search Header */}
                                                        <div className="sticky top-0 z-20 bg-white p-2 border-b border-gray-200">
                                                            <div className="relative">
                                                                <Search className="h-4 w-4 text-gray-400 absolute top-1/2 transform -translate-y-1/2 left-3" />
                                                                <Input
                                                                    type="text"
                                                                    placeholder="Type to search quotations..."
                                                                    className="pl-10 py-1 text-sm"
                                                                    value={
                                                                        quotationSearch
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        setQuotationSearch(
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

                                                        {/* Quotation List */}
                                                        <div className="max-h-52 overflow-y-auto">
                                                            {filteredQuotations.length ===
                                                            0 ? (
                                                                <div className="px-4 py-3 text-sm text-gray-500">
                                                                    {quotations.length >
                                                                    0
                                                                        ? "No quotations found matching your search"
                                                                        : "No quotations available in the system"}
                                                                </div>
                                                            ) : (
                                                                filteredQuotations.map(
                                                                    (
                                                                        quotation
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                quotation.id
                                                                            }
                                                                            className={`${
                                                                                data.quotation_id ===
                                                                                quotation.id.toString()
                                                                                    ? "bg-green-50 text-green-700"
                                                                                    : "text-gray-900 hover:bg-gray-100"
                                                                            } cursor-pointer select-none relative py-2 pl-3 pr-9`}
                                                                            onClick={() => {
                                                                                setData(
                                                                                    "quotation_id",
                                                                                    quotation.id.toString()
                                                                                );
                                                                                setQuotationSearch(
                                                                                    quotation.code ||
                                                                                        "Unknown Code"
                                                                                );
                                                                                setQuotationDropdownOpen(
                                                                                    false
                                                                                );
                                                                            }}
                                                                        >
                                                                            <span className="block truncate font-medium">
                                                                                {
                                                                                    quotation.code
                                                                                }
                                                                            </span>
                                                                            <span className="block text-xs text-gray-500 mt-0.5 truncate">
                                                                                Customer:{" "}
                                                                                {quotation
                                                                                    .inquiry
                                                                                    ?.customer
                                                                                    ?.name ||
                                                                                    "Unknown"}
                                                                            </span>
                                                                            {data.quotation_id ===
                                                                                quotation.id.toString() && (
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
                                            {errors.quotation_id && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.quotation_id}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Select the quotation this
                                                purchase order is related to
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
                                        {/* Upload area */}
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
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                            />

                                            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                                <Upload className="h-7 w-7 text-green-600" />
                                            </div>

                                            <h3 className="text-base font-medium text-gray-900">
                                                Upload PO document
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1 text-center max-w-md">
                                                Drag and drop files here, or
                                                click to browse through your
                                                files. Support for PDF, Office
                                                documents, and images.
                                            </p>
                                        </div>

                                        {/* Show file info only when file exists */}
                                        {data.file && (
                                            <div className="mt-4">
                                                <h3 className="text-sm font-medium text-gray-900 mb-2">
                                                    Attached File
                                                </h3>
                                                <div className="space-y-2">
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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeFile();
                                                            }}
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Information Section - if quotation is selected */}
                                {selectedQuotation && (
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
                                                        {selectedQuotation
                                                            .inquiry?.customer
                                                            ?.name || "N/A"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Customer Email
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedQuotation
                                                            .inquiry?.customer
                                                            ?.email || "N/A"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Quotation Code
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedQuotation.code ||
                                                            "N/A"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Due Date
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedQuotation.due_date
                                                            ? format(
                                                                  new Date(
                                                                      selectedQuotation.due_date
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
                                <Link href={route("purchaseOrders.index")}>
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
                                    {processing
                                        ? "Creating..."
                                        : "Create Purchase Order"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Help Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
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
                                        mandatory. The purchase order will be
                                        linked to the selected inquiry.
                                    </p>
                                    <p className="mt-1">
                                        You can upload an optional purchase
                                        order document for reference. The status
                                        will be initially set as pending until
                                        approved.
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

export default PurchaseOrdersCreate;

"use client";

import type React from "react";
import { type FormEvent, useState, useEffect, useRef } from "react";
import { Head, useForm, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ChevronLeft,
    Save,
    Building2,
    FileText,
    Calendar,
    User,
    Mail,
    Phone,
    MapPin,
    AlertCircle,
    ClipboardList,
    Users,
    CalendarDays,
    HardHat,
    UserCircle,
    Edit,
    Search,
    X,
    FileIcon,
    Paperclip,
    Upload,
    Check,
    Factory,
    Plus,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Badge } from "@/Components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import type {
    Customer,
    PageProps,
    PicEngineer,
    Sales,
    Inquiry,
    BusinessUnit,
    EndUser,
} from "@/types";
import { cn, formatDateForInput } from "@/lib/utils";

interface InquiriesEditProps extends PageProps {
    customers: Customer[];
    picEngineers: PicEngineer[];
    sales: Sales[];
    inquiry: Inquiry;
    businessUnits: BusinessUnit[];
}

const InquiriesEdit = () => {
    const { customers, picEngineers, sales, inquiry, businessUnits } =
        usePage<InquiriesEditProps>().props;

    // File input reference
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize form with existing inquiry data
    const { data, setData, processing, errors } = useForm({
        code: inquiry.code,
        customer_id: inquiry.customer.id.toString(),
        pic_engineer_id: inquiry.pic_engineer
            ? inquiry.pic_engineer.id.toString()
            : "",
        sales_id: inquiry.sales ? inquiry.sales.id.toString() : "",
        description: inquiry.description,
        business_unit_id: inquiry.business_unit
            ? inquiry.business_unit.id.toString()
            : "",
        inquiry_date: inquiry.inquiry_date,
        due_date: inquiry.due_date || "",
        endUsers:
            inquiry.endUsers && inquiry.endUsers.length > 0
                ? (inquiry.endUsers as {
                      name: string;
                      email: string;
                      phone: string;
                      address: string;
                  }[])
                : [],
        status: inquiry.status,
        file: null as File | null,
        _method: "PUT",
    });

    // State for tracking if the file has been changed
    const [fileChanged, setFileChanged] = useState(false);
    const [existingFile, setExistingFile] = useState(inquiry.file || "");

    // State for searchable dropdowns
    const [customerSearch, setCustomerSearch] = useState(inquiry.customer.name);
    const [salesSearch, setSalesSearch] = useState(
        inquiry.sales ? inquiry.sales.name : ""
    );
    const [engineerSearch, setEngineerSearch] = useState(
        inquiry.pic_engineer ? inquiry.pic_engineer.name : ""
    );

    // Dropdown visibility states
    const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
    const [salesDropdownOpen, setSalesDropdownOpen] = useState(false);
    const [engineerDropdownOpen, setEngineerDropdownOpen] = useState(false);
    const [businessUnitDropdownOpen, setBusinessUnitDropdownOpen] =
        useState(false);

    const updateEndUser = (
        index: number,
        field: keyof EndUser,
        value: string
    ) => {
        const updatedEndUsers = [...data.endUsers];
        updatedEndUsers[index] = {
            ...updatedEndUsers[index],
            [field]: value,
        };
        setData("endUsers", updatedEndUsers);
    };

    const addEndUser = () => {
        setData("endUsers", [
            ...data.endUsers,
            { name: "", email: "", phone: "", address: "" },
        ]);
    };

    const removeEndUser = (index: number) => {
        if (data.endUsers.length === 1) {
            return; // Pertahankan minimal 1 end user
        }
        const updatedEndUsers = data.endUsers.filter((_, i) => i !== index);
        setData("endUsers", updatedEndUsers);
    };
    // Filtered results based on search terms
    const filteredCustomers = customers.filter((customer) =>
        customer.name.toLowerCase().includes(customerSearch.toLowerCase())
    );

    const filteredSales = sales.filter((salesPerson) =>
        salesPerson.name.toLowerCase().includes(salesSearch.toLowerCase())
    );

    const filteredEngineers = picEngineers.filter((engineer) =>
        engineer.name.toLowerCase().includes(engineerSearch.toLowerCase())
    );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Create FormData for handling file upload
        const formData = new FormData();

        // Add all regular form fields to FormData except endUsers and file
        Object.keys(data).forEach((key) => {
            if (key !== "file" && key !== "endUsers") {
                formData.append(
                    key,
                    data[key as keyof typeof data]?.toString() || ""
                );
            }
        });

        // Handle endUsers correctly by appending each item individually
        // Ini adalah kunci perbaikannya - menambahkan setiap endUser dengan indeks array
        if (data.endUsers && data.endUsers.length > 0) {
            data.endUsers.forEach((endUser, index) => {
                formData.append(`endUsers[${index}][name]`, endUser.name || "");
                formData.append(
                    `endUsers[${index}][email]`,
                    endUser.email || ""
                );
                formData.append(
                    `endUsers[${index}][phone]`,
                    endUser.phone || ""
                );
                formData.append(
                    `endUsers[${index}][address]`,
                    endUser.address || ""
                );
            });
        } else {
            // Jika tidak ada endUsers, tambahkan array kosong
            formData.append("endUsers", JSON.stringify([]));
        }

        // Add the file if it exists
        if (data.file && data.file instanceof File) {
            formData.append("file", data.file);
            formData.append("file_changed", "1");
        } else if (fileChanged && !data.file) {
            // If file was removed
            formData.append("file_changed", "1");
            formData.append("remove_file", "1");
        }

        router.post(route("inquiries.update", inquiry.id), formData, {
            forceFormData: true,
        });
    };

    const validateForm = () => {
        // Basic required fields validation
        const requiredFields = [
            data.customer_id,
            data.description,
            data.inquiry_date,
            data.code,
            data.business_unit_id,
        ];

        const hasRequiredFields = requiredFields.every(
            (field) => field && field.toString().trim() !== ""
        );

        // Code validation

        return hasRequiredFields;
    };

    // File handling functions
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setData("file", e.target.files[0]);
            setFileChanged(true);
        }
    };

    const removeFile = () => {
        setData("file", null);
        setExistingFile("");
        setFileChanged(true);
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

    // Extract filename from path
    const getFilenameFromPath = (path: string): string => {
        if (!path) return "";
        return path.split("/").pop() || path;
    };

    // Add these functions after the existing file handling functions
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add("border-blue-400", "bg-blue-50");
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setData("file", e.dataTransfer.files[0]);
            setFileChanged(true);
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            if (!target.closest("#customer-dropdown-container")) {
                setCustomerDropdownOpen(false);
            }

            if (!target.closest("#sales-dropdown-container")) {
                setSalesDropdownOpen(false);
            }

            if (!target.closest("#engineer-dropdown-container")) {
                setEngineerDropdownOpen(false);
            }

            if (!target.closest("#business-unit-dropdown-container")) {
                setBusinessUnitDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Add this useEffect after the other useEffect hooks
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

    return (
        <AuthenticatedLayout>
            <Head title="Edit Inquiry" />
            <Breadcrumb
                items={[
                    {
                        label: "Inquiry Management",
                        href: route("inquiries.index"),
                    },
                    { label: "Edit Inquiry" },
                ]}
            />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-amber-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-orange-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <ClipboardList className="mr-3 h-8 w-8" />
                                    Edit Inquiry
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-amber-100 text-lg">
                                    Update inquiry information
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                        <span>Edit Mode</span>
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>ID: {inquiry.id}</span>
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        <span>
                                            Created:{" "}
                                            {new Date(
                                                inquiry.created_at || ""
                                            ).toLocaleDateString()}
                                        </span>
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-shrink-0 items-center space-x-3">
                                <Link href={route("inquiries.index")}>
                                    <Button className="shadow-lg shadow-amber-900/30 bg-white text-amber-700 hover:bg-amber-50 gap-1.5 font-medium transition-all duration-200">
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>Back to Inquiries</span>
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
                                        Inquiry Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        {/* Inquiry Code Field */}
                                        <div className="space-y-1 md:col-span-6">
                                            <Label
                                                htmlFor="code"
                                                className="text-sm font-medium"
                                            >
                                                Inquiry Code{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FileText className="h-4 w-4 text-gray-400" />
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
                                                            : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                    }`}
                                                    placeholder=""
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
                                                A unique identifier for this
                                                inquiry
                                            </p>
                                        </div>

                                        {/* Customer Field - Searchable Dropdown */}
                                        <div
                                            className="space-y-1 md:col-span-6"
                                            id="customer-dropdown-container"
                                        >
                                            <Label
                                                htmlFor="customer_search"
                                                className="text-sm font-medium"
                                            >
                                                Customer{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Building2 className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="customer_search"
                                                    type="text"
                                                    placeholder="Search customer..."
                                                    value={customerSearch}
                                                    onChange={(e) =>
                                                        setCustomerSearch(
                                                            e.target.value
                                                        )
                                                    }
                                                    onClick={() =>
                                                        setCustomerDropdownOpen(
                                                            true
                                                        )
                                                    }
                                                    className={`pl-10 ${
                                                        errors.customer_id
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                    }`}
                                                />
                                                {data.customer_id && (
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-amber-100 text-amber-700"
                                                        >
                                                            {
                                                                customers.find(
                                                                    (c) =>
                                                                        c.id.toString() ===
                                                                        data.customer_id
                                                                )?.name
                                                            }
                                                        </Badge>
                                                    </div>
                                                )}
                                                <AnimatePresence>
                                                    {customerDropdownOpen && (
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                y: -10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                                y: -10,
                                                            }}
                                                            className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200"
                                                        >
                                                            <div className="sticky top-0 z-10 bg-white p-2 border-b border-gray-200">
                                                                <div className="relative">
                                                                    <Search className="h-4 w-4 text-gray-400 absolute top-1/2 transform -translate-y-1/2 left-3" />
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="Type to search..."
                                                                        className="pl-10 py-1 text-sm"
                                                                        value={
                                                                            customerSearch
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setCustomerSearch(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        onClick={(
                                                                            e
                                                                        ) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            {filteredCustomers.length ===
                                                            0 ? (
                                                                <div className="px-4 py-3 text-sm text-gray-500">
                                                                    No customers
                                                                    found
                                                                </div>
                                                            ) : (
                                                                filteredCustomers.map(
                                                                    (
                                                                        customer
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                customer.id
                                                                            }
                                                                            className={`${
                                                                                data.customer_id ===
                                                                                customer.id.toString()
                                                                                    ? "bg-amber-50 text-amber-700"
                                                                                    : "text-gray-900 hover:bg-gray-100"
                                                                            } cursor-pointer select-none relative py-2 pl-3 pr-9`}
                                                                            onClick={() => {
                                                                                setData(
                                                                                    "customer_id",
                                                                                    customer.id.toString()
                                                                                );
                                                                                setCustomerSearch(
                                                                                    customer.name
                                                                                );
                                                                                setCustomerDropdownOpen(
                                                                                    false
                                                                                );
                                                                            }}
                                                                        >
                                                                            <span className="block truncate">
                                                                                {
                                                                                    customer.name
                                                                                }
                                                                            </span>
                                                                            {data.customer_id ===
                                                                                customer.id.toString() && (
                                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                                                    <Check className="h-5 w-5 text-amber-600" />
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                )
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            {errors.customer_id && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.customer_id}
                                                </p>
                                            )}
                                        </div>

                                        {/* Inquiry Date Field */}
                                        <div className="space-y-1 md:col-span-6">
                                            <Label
                                                htmlFor="inquiry_date"
                                                className="text-sm font-medium"
                                            >
                                                Inquiry Date{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="inquiry_date"
                                                    type="date"
                                                    value={formatDateForInput(
                                                        data.inquiry_date
                                                    )}
                                                    onChange={(e) =>
                                                        setData(
                                                            "inquiry_date",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`pl-10 cursor-pointer ${
                                                        errors.inquiry_date
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                    } appearance-none`}
                                                    required
                                                />
                                            </div>
                                            {errors.inquiry_date && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.inquiry_date}
                                                </p>
                                            )}
                                        </div>

                                        {/* Due Date Field */}
                                        <div className="space-y-1 md:col-span-6">
                                            <Label
                                                htmlFor="due_date"
                                                className="text-sm font-medium"
                                            >
                                                Due Date
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <CalendarDays className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="due_date"
                                                    type="date"
                                                    value={formatDateForInput(
                                                        data.due_date
                                                    )}
                                                    onChange={(e) =>
                                                        setData(
                                                            "due_date",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`pl-10 cursor-pointer ${
                                                        errors.due_date
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                    } appearance-none`}
                                                />
                                            </div>
                                            {errors.due_date && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.due_date}
                                                </p>
                                            )}
                                        </div>

                                        {/* Status Field */}
                                        <div className="space-y-1 md:col-span-6">
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
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <ClipboardList className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <select
                                                    id="status"
                                                    value={data.status}
                                                    onChange={(e) =>
                                                        setData(
                                                            "status",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none sm:text-sm rounded-md ${
                                                        errors.status
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                    }`}
                                                    required
                                                >
                                                    <option value="pending">
                                                        Pending
                                                    </option>
                                                    <option value="process">
                                                        In Process
                                                    </option>
                                                </select>
                                            </div>
                                            {errors.status && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.status}
                                                </p>
                                            )}
                                        </div>

                                        {/* Business Unit Field */}
                                        <div
                                            className="space-y-1 md:col-span-6"
                                            id="business-unit-dropdown-container"
                                        >
                                            <Label
                                                htmlFor="business_unit_id"
                                                className="text-sm font-medium"
                                            >
                                                Business Unit{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Factory className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <select
                                                    id="business_unit_id"
                                                    value={
                                                        data.business_unit_id
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "business_unit_id",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none sm:text-sm rounded-md ${
                                                        errors.business_unit_id
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                    }`}
                                                    required
                                                >
                                                    <option value="">
                                                        Select Business Unit
                                                    </option>
                                                    {businessUnits.map(
                                                        (unit) => (
                                                            <option
                                                                key={unit.id}
                                                                value={unit.id.toString()}
                                                            >
                                                                {unit.name}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                            {errors.business_unit_id && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.business_unit_id}
                                                </p>
                                            )}
                                        </div>

                                        {/* Description Field - Full width */}
                                        <div className="space-y-1 md:col-span-12">
                                            <Label
                                                htmlFor="description"
                                                className="text-sm font-medium"
                                            >
                                                Description{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) =>
                                                    setData(
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                className={`min-h-[100px] ${
                                                    errors.description
                                                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                }`}
                                                placeholder="Enter detailed inquiry description..."
                                                required
                                            />
                                            {errors.description && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* End User Information Section */}
                                <div className="py-8">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <User className="w-5 h-5 mr-2 text-amber-600" />
                                        End User Information
                                        <span className="text-sm font-normal text-gray-500 ml-2">
                                            (Optional)
                                        </span>
                                    </h2>

                                    {data.endUsers.length === 0 ? (
                                        <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                            <UserCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                            <h3 className="text-gray-500 text-lg font-medium mb-2">
                                                No End Users Added
                                            </h3>
                                            <p className="text-gray-400 mb-4">
                                                Click the button below to add
                                                end users to this inquiry
                                            </p>
                                            <Button
                                                type="button"
                                                onClick={addEndUser}
                                                variant="outline"
                                                size="sm"
                                                className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add First End User
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            {data.endUsers.map(
                                                (endUser, index) => (
                                                    <div
                                                        key={index}
                                                        className="mb-6 pb-6 border-b border-gray-100"
                                                    >
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h3 className="text-sm font-medium text-gray-700">
                                                                End User #
                                                                {index + 1}
                                                            </h3>
                                                            {data.endUsers
                                                                .length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        removeEndUser(
                                                                            index
                                                                        )
                                                                    }
                                                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                                                >
                                                                    <X className="h-3.5 w-3.5 mr-1" />{" "}
                                                                    Remove
                                                                </Button>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* End User Name Field */}
                                                            <div className="space-y-1">
                                                                <Label
                                                                    htmlFor={`endUsers.${index}.name`}
                                                                    className="text-sm font-medium"
                                                                >
                                                                    End User
                                                                    Name{" "}
                                                                    <span className="text-red-500">
                                                                        *
                                                                    </span>
                                                                </Label>
                                                                <div className="relative">
                                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                        <User className="h-4 w-4 text-gray-400" />
                                                                    </div>
                                                                    <Input
                                                                        id={`endUsers.${index}.name`}
                                                                        type="text"
                                                                        value={
                                                                            endUser.name
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateEndUser(
                                                                                index,
                                                                                "name",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className={`pl-10 border-gray-200 focus:ring-amber-500 focus:border-amber-500`}
                                                                        placeholder="Enter end user name"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* End User Email Field */}
                                                            <div className="space-y-1">
                                                                <Label
                                                                    htmlFor={`endUsers.${index}.email`}
                                                                    className="text-sm font-medium"
                                                                >
                                                                    End User
                                                                    Email{" "}
                                                                    <span className="text-red-500">
                                                                        *
                                                                    </span>
                                                                </Label>
                                                                <div className="relative">
                                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                                    </div>
                                                                    <Input
                                                                        id={`endUsers.${index}.email`}
                                                                        type="email"
                                                                        value={
                                                                            endUser.email
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateEndUser(
                                                                                index,
                                                                                "email",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className={`pl-10 border-gray-200 focus:ring-amber-500 focus:border-amber-500`}
                                                                        placeholder="enduser@example.com"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* End User Phone Field */}
                                                            <div className="space-y-1">
                                                                <Label
                                                                    htmlFor={`endUsers.${index}.phone`}
                                                                    className="text-sm font-medium"
                                                                >
                                                                    End User
                                                                    Phone
                                                                </Label>
                                                                <div className="relative">
                                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                                    </div>
                                                                    <Input
                                                                        id={`endUsers.${index}.phone`}
                                                                        type="text"
                                                                        value={
                                                                            endUser.phone ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateEndUser(
                                                                                index,
                                                                                "phone",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className={`pl-10 border-gray-200 focus:ring-amber-500 focus:border-amber-500`}
                                                                        placeholder="+1 (123) 456-7890"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* End User Address Field */}
                                                            <div className="space-y-1">
                                                                <Label
                                                                    htmlFor={`endUsers.${index}.address`}
                                                                    className="text-sm font-medium"
                                                                >
                                                                    End User
                                                                    Address
                                                                </Label>
                                                                <div className="relative">
                                                                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                                                        <MapPin className="h-4 w-4 text-gray-400" />
                                                                    </div>
                                                                    <Textarea
                                                                        id={`endUsers.${index}.address`}
                                                                        value={
                                                                            endUser.address ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateEndUser(
                                                                                index,
                                                                                "address",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className={`pl-10 min-h-[80px] border-gray-200 focus:ring-amber-500 focus:border-amber-500`}
                                                                        placeholder="Enter end user address"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            {/* Add More End User Button */}
                                            <div className="mt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addEndUser}
                                                    className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Another End User
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* File Upload Section */}
                                <div className="py-8">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Paperclip className="w-5 h-5 mr-2 text-amber-600" />
                                        Supporting Documents
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

                                            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                                                <Upload className="h-7 w-7 text-amber-600" />
                                            </div>

                                            <h3 className="text-base font-medium text-gray-900">
                                                {existingFile || data.file
                                                    ? "Replace document"
                                                    : "Upload document"}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1 text-center max-w-md">
                                                Drag and drop files here, or
                                                click to browse through your
                                                files. Support for PDF, Office
                                                documents, and images.
                                            </p>
                                        </div>

                                        {/* Show file info - either existing file or newly uploaded file */}
                                        {(data.file || existingFile) && (
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
                                                                {data.file ? (
                                                                    <>
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
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                                            {getFilenameFromPath(
                                                                                existingFile
                                                                            )}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            Current
                                                                            file
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="text-gray-500 hover:text-red-500"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent triggering the parent onClick
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
                                {/* Team Assignment Section */}
                                <div className="pt-8">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Users className="w-5 h-5 mr-2 text-amber-600" />
                                        Team Assignment
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Sales Person Field - Searchable Dropdown */}
                                        <div
                                            className="space-y-1"
                                            id="sales-dropdown-container"
                                        >
                                            <Label
                                                htmlFor="sales_search"
                                                className="text-sm font-medium"
                                            >
                                                Sales Person
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <UserCircle className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="sales_search"
                                                    type="text"
                                                    placeholder="Search sales person..."
                                                    value={salesSearch}
                                                    onChange={(e) =>
                                                        setSalesSearch(
                                                            e.target.value
                                                        )
                                                    }
                                                    onClick={() =>
                                                        setSalesDropdownOpen(
                                                            true
                                                        )
                                                    }
                                                    className={`pl-10 ${
                                                        errors.sales_id
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                    }`}
                                                />
                                                {data.sales_id && (
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-amber-100 text-amber-700"
                                                        >
                                                            {
                                                                sales.find(
                                                                    (s) =>
                                                                        s.id.toString() ===
                                                                        data.sales_id
                                                                )?.name
                                                            }
                                                        </Badge>
                                                    </div>
                                                )}
                                                <AnimatePresence>
                                                    {salesDropdownOpen && (
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                y: -10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                                y: -10,
                                                            }}
                                                            className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200"
                                                        >
                                                            <div className="sticky top-0 z-10 bg-white p-2 border-b border-gray-200">
                                                                <div className="relative">
                                                                    <Search className="h-4 w-4 text-gray-400 absolute top-1/2 transform -translate-y-1/2 left-3" />
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="Type to search..."
                                                                        className="pl-10 py-1 text-sm"
                                                                        value={
                                                                            salesSearch
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setSalesSearch(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        onClick={(
                                                                            e
                                                                        ) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            {filteredSales.length ===
                                                            0 ? (
                                                                <div className="px-4 py-3 text-sm text-gray-500">
                                                                    No sales
                                                                    persons
                                                                    found
                                                                </div>
                                                            ) : (
                                                                filteredSales.map(
                                                                    (
                                                                        salesPerson
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                salesPerson.id
                                                                            }
                                                                            className={`${
                                                                                data.sales_id ===
                                                                                salesPerson.id.toString()
                                                                                    ? "bg-amber-50 text-amber-700"
                                                                                    : "text-gray-900 hover:bg-gray-100"
                                                                            } cursor-pointer select-none relative py-2 pl-3 pr-9`}
                                                                            onClick={() => {
                                                                                setData(
                                                                                    "sales_id",
                                                                                    salesPerson.id.toString()
                                                                                );
                                                                                setSalesSearch(
                                                                                    salesPerson.name
                                                                                );
                                                                                setSalesDropdownOpen(
                                                                                    false
                                                                                );
                                                                            }}
                                                                        >
                                                                            <span className="block truncate">
                                                                                {
                                                                                    salesPerson.name
                                                                                }
                                                                            </span>
                                                                            {data.sales_id ===
                                                                                salesPerson.id.toString() && (
                                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                                                    <Check className="h-5 w-5 text-amber-600" />
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                )
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            {errors.sales_id && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.sales_id}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                This person will be responsible
                                                for sales follow-up
                                            </p>
                                        </div>

                                        {/* PIC Engineer Field - Searchable Dropdown */}
                                        <div
                                            className="space-y-1"
                                            id="engineer-dropdown-container"
                                        >
                                            <Label
                                                htmlFor="engineer_search"
                                                className="text-sm font-medium"
                                            >
                                                PIC Engineer
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <HardHat className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="engineer_search"
                                                    type="text"
                                                    placeholder="Search PIC engineer..."
                                                    value={engineerSearch}
                                                    onChange={(e) =>
                                                        setEngineerSearch(
                                                            e.target.value
                                                        )
                                                    }
                                                    onClick={() =>
                                                        setEngineerDropdownOpen(
                                                            true
                                                        )
                                                    }
                                                    className={`pl-10 ${
                                                        errors.pic_engineer_id
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                                    }`}
                                                />
                                                {data.pic_engineer_id && (
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-amber-100 text-amber-700"
                                                        >
                                                            {
                                                                picEngineers.find(
                                                                    (e) =>
                                                                        e.id.toString() ===
                                                                        data.pic_engineer_id
                                                                )?.name
                                                            }
                                                        </Badge>
                                                    </div>
                                                )}
                                                <AnimatePresence>
                                                    {engineerDropdownOpen && (
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                y: -10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                                y: -10,
                                                            }}
                                                            className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200"
                                                        >
                                                            <div className="sticky top-0 z-10 bg-white p-2 border-b border-gray-200">
                                                                <div className="relative">
                                                                    <Search className="h-4 w-4 text-gray-400 absolute top-1/2 transform -translate-y-1/2 left-3" />
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="Type to search..."
                                                                        className="pl-10 py-1 text-sm"
                                                                        value={
                                                                            engineerSearch
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setEngineerSearch(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        onClick={(
                                                                            e
                                                                        ) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            {filteredEngineers.length ===
                                                            0 ? (
                                                                <div className="px-4 py-3 text-sm text-gray-500">
                                                                    No engineers
                                                                    found
                                                                </div>
                                                            ) : (
                                                                filteredEngineers.map(
                                                                    (
                                                                        engineer
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                engineer.id
                                                                            }
                                                                            className={`${
                                                                                data.pic_engineer_id ===
                                                                                engineer.id.toString()
                                                                                    ? "bg-amber-50 text-amber-700"
                                                                                    : "text-gray-900 hover:bg-gray-100"
                                                                            } cursor-pointer select-none relative py-2 pl-3 pr-9`}
                                                                            onClick={() => {
                                                                                setData(
                                                                                    "pic_engineer_id",
                                                                                    engineer.id.toString()
                                                                                );
                                                                                setEngineerSearch(
                                                                                    engineer.name
                                                                                );
                                                                                setEngineerDropdownOpen(
                                                                                    false
                                                                                );
                                                                            }}
                                                                        >
                                                                            <span className="block truncate">
                                                                                {
                                                                                    engineer.name
                                                                                }
                                                                            </span>
                                                                            {data.pic_engineer_id ===
                                                                                engineer.id.toString() && (
                                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                                                    <Check className="h-5 w-5 text-amber-600" />
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                )
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            {errors.pic_engineer_id && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.pic_engineer_id}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                This engineer will be
                                                responsible for technical
                                                aspects
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-between space-x-3 border-t border-gray-200">
                                <div>
                                    <Link
                                        href={route(
                                            "inquiries.show",
                                            inquiry.id
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
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        type="submit"
                                        disabled={processing || !validateForm()}
                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </Button>
                                </div>
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
                                        mandatory. Changes will be tracked in
                                        the system.
                                    </p>
                                    <p className="mt-1">
                                        Team members will be notified when you
                                        update their assignments. File changes
                                        will be recorded.
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

export default InquiriesEdit;

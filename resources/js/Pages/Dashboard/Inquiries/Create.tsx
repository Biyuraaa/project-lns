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
    Package,
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
    Plus,
    Search,
    X,
    FileIcon,
    Paperclip,
    Upload,
    Check,
    Info,
    Briefcase,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Badge } from "@/Components/ui/badge";
import { Switch } from "@/Components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import type {
    BusinessUnit,
    Customer,
    PageProps,
    PicEngineer,
    Sales,
} from "@/types";

import {
    cn,
    formatFileSize,
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
interface InquiriesCreateProps extends PageProps {
    customers: Customer[];
    picEngineers: PicEngineer[];
    sales: Sales[];
    businessUnits: BusinessUnit[];
}

const InquiriesCreate = () => {
    const { customers, picEngineers, sales, businessUnits } =
        usePage<InquiriesCreateProps>().props;
    const calculateDaysRemaining = (dueDate: string): number => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    // File input reference
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check if code value already exists
    const today = new Date();
    const defaultDate = today.toISOString().split("T")[0];

    const { data, setData, post, processing, errors } = useForm({
        customer_id: "",
        pic_engineer_id: "",
        sales_id: "",
        description: "",
        business_unit_id: "",
        inquiry_date: defaultDate,
        due_date: "",
        new_customer: false as boolean,
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        customer_address: "",
        endUsers: [] as {
            name: string;
            email: string;
            phone: string;
            address: string;
            position: string;
        }[],
        status: "pending",
        file: null as File | null,
    });

    // State for searchable dropdowns
    const [customerSearch, setCustomerSearch] = useState("");
    const [salesSearch, setSalesSearch] = useState("");
    const [engineerSearch, setEngineerSearch] = useState("");
    const [isNewCustomer, setIsNewCustomer] = useState(false);

    // Dropdown visibility states
    const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
    const [salesDropdownOpen, setSalesDropdownOpen] = useState(false);
    const [engineerDropdownOpen, setEngineerDropdownOpen] = useState(false);

    // Filtered results based on search terms
    const filteredCustomers = customers.filter((customer) => {
        const searchLower = customerSearch.toLowerCase();
        return (
            customer.name?.toLowerCase().includes(searchLower) ||
            customer.email?.toLowerCase().includes(searchLower) ||
            customer.phone?.toLowerCase().includes(searchLower)
        );
    });

    const filteredSales = sales.filter((salesPerson) =>
        salesPerson.name.toLowerCase().includes(salesSearch.toLowerCase())
    );

    const filteredEngineers = picEngineers.filter((engineer) =>
        engineer.name.toLowerCase().includes(engineerSearch.toLowerCase())
    );

    const handleNewCustomerToggle = (checked: boolean) => {
        setIsNewCustomer(checked);
        setData("new_customer", checked);
        if (!checked) {
            // Clear new customer fields when switching to existing customer
            setData("customer_name", "");
            setData("customer_email", "");
            setData("customer_phone", "");
            setData("customer_address", "");
        } else {
            // Clear customer_id when switching to new customer
            setData("customer_id", "");
            setCustomerSearch("");
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Create FormData for handling file upload
        const formData = new FormData();

        // Add all regular form fields to FormData
        Object.keys(data).forEach((key) => {
            if (key !== "file") {
                // Convert boolean values to strings properly
                if (typeof data[key as keyof typeof data] === "boolean") {
                    formData.append(
                        key,
                        data[key as keyof typeof data] ? "1" : "0"
                    );
                } else {
                    formData.append(
                        key,
                        data[key as keyof typeof data]?.toString() || ""
                    );
                }
            }
        });

        if (Array.isArray(data.endUsers)) {
            data.endUsers.forEach((endUser, index) => {
                if (endUser) {
                    formData.append(
                        `endUsers[${index}][name]`,
                        endUser.name || ""
                    );
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
                    formData.append(
                        `endUsers[${index}][position]`,
                        endUser.position || ""
                    );
                }
            });
        }

        // Add the file if it exists
        if (data.file && data.file instanceof File) {
            formData.append("file", data.file);
        }

        router.post(route("inquiries.store"), formData, {
            forceFormData: true,
        });
    };

    const [isCodeValid, setIsCodeValid] = useState(true);
    const [isPickingDate, setIsPickingDate] = useState(false);

    const validateForm = () => {
        const requiredFields = [data.description, data.inquiry_date];
        if (isNewCustomer) {
            requiredFields.push(data.customer_name, data.customer_email);
        } else {
            requiredFields.push(data.customer_id);
        }

        const hasRequiredFields = requiredFields.every(
            (field) => field && field.toString().trim() !== ""
        );
        return hasRequiredFields;
    };

    // File handling functions
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setData("file", e.target.files[0]);
        }
    };

    // 2. Update the removeFile function to clear the file
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
        e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setData("file", e.dataTransfer.files[0]);
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Only close dropdowns if clicking outside their containers
            // and not on their respective input fields
            if (
                !target.closest("#customer-dropdown-container") &&
                !target.closest("#customer_search")
            ) {
                setCustomerDropdownOpen(false);
            }

            if (
                !target.closest("#sales-dropdown-container") &&
                !target.closest("#sales_search")
            ) {
                setSalesDropdownOpen(false);
            }

            if (
                !target.closest("#engineer-dropdown-container") &&
                !target.closest("#engineer_search")
            ) {
                setEngineerDropdownOpen(false);
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
            <Head title="Create New Inquiry" />
            <Breadcrumb
                items={[
                    {
                        label: "Inquiry Management",
                        href: route("inquiries.index"),
                    },
                    { label: "Create New Inquiry" },
                ]}
            />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-blue-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-teal-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <ClipboardList className="mr-3 h-8 w-8" />
                                    Create New Inquiry
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                                    Register a new customer inquiry request
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>New Inquiry</span>
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
                                <Link href={route("inquiries.index")}>
                                    <Button className="shadow-lg shadow-blue-900/30 bg-white text-blue-700 hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200">
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
                                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                        Inquiry Information
                                    </h2>

                                    {/* Core inquiry fields in a card */}
                                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm mb-6 p-5">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                            {/* Inquiry Date Field */}
                                            <div className="space-y-1 md:col-span-4">
                                                <Label
                                                    htmlFor="inquiry_date"
                                                    className="text-sm font-medium flex items-center gap-1"
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
                                                        value={
                                                            data.inquiry_date
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "inquiry_date",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 pr-4 cursor-pointer ${
                                                            errors.inquiry_date
                                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
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
                                                <p className="text-xs text-gray-500">
                                                    {data.inquiry_date &&
                                                        new Date(
                                                            data.inquiry_date
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                weekday: "long",
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                </p>
                                            </div>

                                            {/* Inquiry Due Date Field */}
                                            <div className="space-y-1 md:col-span-4">
                                                <Label
                                                    htmlFor="due_date"
                                                    className="text-sm font-medium flex items-center gap-1"
                                                >
                                                    Due Date
                                                </Label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Calendar className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
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
                                                        className={`pl-10 pr-4 cursor-pointer ${
                                                            errors.due_date
                                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                : "border-gray-200 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400"
                                                        } transition-colors`}
                                                    />
                                                    {data.due_date && (
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setData(
                                                                        "due_date",
                                                                        ""
                                                                    )
                                                                }
                                                                className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                {errors.due_date && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        {errors.due_date}
                                                    </p>
                                                )}
                                                {data.due_date && (
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${
                                                                calculateDaysRemaining(
                                                                    data.due_date
                                                                ) <= 3
                                                                    ? "bg-red-50 text-red-600 border-red-200"
                                                                    : "bg-blue-50 text-blue-600 border-blue-200"
                                                            }`}
                                                        >
                                                            {calculateDaysRemaining(
                                                                data.due_date
                                                            )}{" "}
                                                            days remaining
                                                        </Badge>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(
                                                                data.due_date
                                                            ).toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    weekday:
                                                                        "short",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                }
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Business Unit Field */}
                                            <div className="space-y-1 md:col-span-4">
                                                <Label
                                                    htmlFor="business_unit_id"
                                                    className="text-sm font-medium flex items-center gap-1"
                                                >
                                                    Business Unit{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                        <Package className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <Select
                                                        value={
                                                            data.business_unit_id.toString() ||
                                                            ""
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setData(
                                                                "business_unit_id",
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            className={`pl-10 ${
                                                                errors.business_unit_id
                                                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                    : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                            }`}
                                                        >
                                                            <SelectValue placeholder="Select business unit" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {businessUnits.map(
                                                                (unit) => (
                                                                    <SelectItem
                                                                        key={
                                                                            unit.id
                                                                        }
                                                                        value={unit.id.toString()}
                                                                    >
                                                                        {
                                                                            unit.name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {errors.business_unit_id && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        {
                                                            errors.business_unit_id
                                                        }
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {businessUnits.find(
                                                        (unit) =>
                                                            unit.id.toString() ===
                                                            data.business_unit_id
                                                    )?.description ||
                                                        "Select the business unit for this inquiry"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Information Card */}
                                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm mb-6">
                                        <div className="p-5 border-b border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-blue-600" />
                                                    Customer Information{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <span
                                                        className={`text-sm ${
                                                            isNewCustomer
                                                                ? "text-gray-500"
                                                                : "text-blue-600 font-medium"
                                                        }`}
                                                    >
                                                        Existing
                                                    </span>
                                                    <Switch
                                                        checked={isNewCustomer}
                                                        onCheckedChange={
                                                            handleNewCustomerToggle
                                                        }
                                                        id="customer_type"
                                                    />
                                                    <span
                                                        className={`text-sm ${
                                                            isNewCustomer
                                                                ? "text-blue-600 font-medium"
                                                                : "text-gray-500"
                                                        }`}
                                                    >
                                                        New
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            {/* New Customer Form */}
                                            {isNewCustomer ? (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Customer Name Field */}
                                                        <div className="space-y-1">
                                                            <Label
                                                                htmlFor="customer_name"
                                                                className="text-sm font-medium flex items-center gap-1"
                                                            >
                                                                Customer Name{" "}
                                                                <span className="text-red-500">
                                                                    *
                                                                </span>
                                                            </Label>
                                                            <div className="relative">
                                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                    <Building2 className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                                <Input
                                                                    id="customer_name"
                                                                    type="text"
                                                                    value={
                                                                        data.customer_name
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setData(
                                                                            "customer_name",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className={`pl-10 ${
                                                                        errors.customer_name
                                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                            : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                                    }`}
                                                                    placeholder="Company name"
                                                                />
                                                            </div>
                                                            {errors.customer_name && (
                                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                                    {
                                                                        errors.customer_name
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Customer Email Field */}
                                                        <div className="space-y-1">
                                                            <Label
                                                                htmlFor="customer_email"
                                                                className="text-sm font-medium flex items-center gap-1"
                                                            >
                                                                Customer Email{" "}
                                                                <span className="text-red-500">
                                                                    *
                                                                </span>
                                                            </Label>
                                                            <div className="relative">
                                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                                <Input
                                                                    id="customer_email"
                                                                    type="email"
                                                                    value={
                                                                        data.customer_email
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setData(
                                                                            "customer_email",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className={`pl-10 ${
                                                                        errors.customer_email
                                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                            : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                                    }`}
                                                                    placeholder="company@example.com"
                                                                />
                                                            </div>
                                                            {errors.customer_email && (
                                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                                    {
                                                                        errors.customer_email
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Customer Phone Field */}
                                                        <div className="space-y-1">
                                                            <Label
                                                                htmlFor="customer_phone"
                                                                className="text-sm font-medium"
                                                            >
                                                                Customer Phone
                                                            </Label>
                                                            <div className="relative">
                                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                                <Input
                                                                    id="customer_phone"
                                                                    type="text"
                                                                    value={
                                                                        data.customer_phone
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setData(
                                                                            "customer_phone",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className={`pl-10 ${
                                                                        errors.customer_phone
                                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                            : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                                    }`}
                                                                    placeholder="+1 (123) 456-7890"
                                                                />
                                                            </div>
                                                            {errors.customer_phone && (
                                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                                    {
                                                                        errors.customer_phone
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Customer Address Field */}
                                                        <div className="space-y-1">
                                                            <Label
                                                                htmlFor="customer_address"
                                                                className="text-sm font-medium"
                                                            >
                                                                Customer Address
                                                            </Label>
                                                            <div className="relative">
                                                                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                                <Textarea
                                                                    id="customer_address"
                                                                    value={
                                                                        data.customer_address
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setData(
                                                                            "customer_address",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className={`pl-10 min-h-[80px] ${
                                                                        errors.customer_address
                                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                            : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                                    }`}
                                                                    placeholder="Enter customer address"
                                                                />
                                                            </div>
                                                            {errors.customer_address && (
                                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                                    {
                                                                        errors.customer_address
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="text-sm text-blue-600 bg-blue-50 rounded-md p-3 flex items-start">
                                                        <Info className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
                                                        <p>
                                                            This customer will
                                                            be automatically
                                                            created in the
                                                            system when you
                                                            submit the inquiry.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className="space-y-2"
                                                    id="customer-dropdown-container"
                                                >
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Search className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <Input
                                                            id="customer_search"
                                                            type="text"
                                                            placeholder="Search customer by name, email or phone..."
                                                            value={
                                                                customerSearch
                                                            }
                                                            onChange={(e) => {
                                                                setCustomerSearch(
                                                                    e.target
                                                                        .value
                                                                );
                                                                setCustomerDropdownOpen(
                                                                    true
                                                                );
                                                            }}
                                                            onClick={() => {
                                                                setCustomerDropdownOpen(
                                                                    true
                                                                );
                                                            }}
                                                            className={`pl-10 ${
                                                                errors.customer_id
                                                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                    : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                            }`}
                                                        />

                                                        {customerSearch && (
                                                            <button
                                                                type="button"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setCustomerSearch(
                                                                        ""
                                                                    );
                                                                    setData(
                                                                        "customer_id",
                                                                        ""
                                                                    );
                                                                    setCustomerDropdownOpen(
                                                                        true
                                                                    );
                                                                }}
                                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                            >
                                                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                            </button>
                                                        )}

                                                        {data.customer_id &&
                                                            customerSearch && (
                                                                <div className="absolute inset-y-0 right-8 pr-3 flex items-center">
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="bg-blue-100 text-blue-700"
                                                                    >
                                                                        {
                                                                            customers.find(
                                                                                (
                                                                                    c
                                                                                ) =>
                                                                                    c.id.toString() ===
                                                                                    data.customer_id
                                                                            )
                                                                                ?.name
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                            )}

                                                        {/* Customer Dropdown with z-index to ensure it's visible */}
                                                        {customerDropdownOpen && (
                                                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200">
                                                                {/* Customer List */}
                                                                <div className="max-h-52 overflow-y-auto">
                                                                    {filteredCustomers.length ===
                                                                    0 ? (
                                                                        <div className="px-4 py-3 text-sm text-gray-500">
                                                                            {customers.length >
                                                                            0
                                                                                ? "No customers found matching your search"
                                                                                : "No customers available in the system"}
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
                                                                                            ? "bg-blue-50 text-blue-700"
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
                                                                                    <span className="block truncate font-medium">
                                                                                        {
                                                                                            customer.name
                                                                                        }
                                                                                    </span>
                                                                                    <span className="block text-xs text-gray-500 mt-0.5 truncate">
                                                                                        {
                                                                                            customer.email
                                                                                        }
                                                                                    </span>
                                                                                    {data.customer_id ===
                                                                                        customer.id.toString() && (
                                                                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                                                            <Check className="h-5 w-5 text-blue-600" />
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
                                                    {errors.customer_id && (
                                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            {errors.customer_id}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description Card */}
                                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
                                        <div className="p-5 border-b border-gray-100">
                                            <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                                Inquiry Description{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </h3>
                                        </div>
                                        <div className="p-5">
                                            <div className="space-y-1">
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) =>
                                                        setData(
                                                            "description",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`min-h-[150px] ${
                                                        errors.description
                                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                    }`}
                                                    placeholder="Enter detailed inquiry description..."
                                                    required
                                                />
                                                {errors.description && (
                                                    <p className="text-red-500 text-xs mt-2 flex items-center">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        {errors.description}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Please provide as much
                                                    detail as possible about the
                                                    inquiry. Include any
                                                    relevant specifications,
                                                    requirements, and
                                                    expectations.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* User Information Section */}
                                <div className="py-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                            <Users className="w-5 h-5 mr-2 text-blue-600" />
                                            Users Information
                                            <span className="text-sm font-normal text-gray-500 ml-2">
                                                (Optional)
                                            </span>
                                        </h2>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                const newEndUsers = [
                                                    ...data.endUsers,
                                                    {
                                                        name: "",
                                                        email: "",
                                                        phone: "",
                                                        address: "",
                                                        position: "",
                                                    },
                                                ];
                                                setData(
                                                    "endUsers",
                                                    newEndUsers
                                                );
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add User
                                        </Button>
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {data.endUsers.map((endUser, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    height: "auto",
                                                }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="relative mb-6 border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                                                    <div className="absolute top-4 right-4">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const newEndUsers =
                                                                    [
                                                                        ...data.endUsers,
                                                                    ];
                                                                newEndUsers.splice(
                                                                    index,
                                                                    1
                                                                );
                                                                setData(
                                                                    "endUsers",
                                                                    newEndUsers
                                                                );
                                                            }}
                                                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </Button>
                                                    </div>

                                                    <h3 className="text-base font-medium mb-4 text-gray-800 flex items-center">
                                                        <UserCircle className="mr-2 h-5 w-5 text-blue-500" />
                                                        User #{index + 1}
                                                    </h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* User Name Field */}
                                                        <div className="space-y-1">
                                                            <Label
                                                                htmlFor={`end_user_name_${index}`}
                                                                className="text-sm font-medium"
                                                            >
                                                                User Name
                                                            </Label>
                                                            <div className="relative">
                                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                    <User className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                                <Input
                                                                    id={`end_user_name_${index}`}
                                                                    type="text"
                                                                    value={
                                                                        endUser.name
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newEndUsers =
                                                                            [
                                                                                ...data.endUsers,
                                                                            ];
                                                                        newEndUsers[
                                                                            index
                                                                        ].name =
                                                                            e.target.value;
                                                                        setData(
                                                                            "endUsers",
                                                                            newEndUsers
                                                                        );
                                                                    }}
                                                                    className={`pl-10 border-gray-200 focus:ring-blue-500 focus:border-blue-500`}
                                                                    placeholder="Enter end user name"
                                                                />
                                                            </div>
                                                            {/* Using optional chaining and type safety for errors */}
                                                        </div>

                                                        {/* End User Email Field */}
                                                        <div className="space-y-1">
                                                            <Label
                                                                htmlFor={`end_user_email_${index}`}
                                                                className="text-sm font-medium"
                                                            >
                                                                User Email
                                                            </Label>
                                                            <div className="relative">
                                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                                <Input
                                                                    id={`end_user_email_${index}`}
                                                                    type="email"
                                                                    value={
                                                                        endUser.email
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newEndUsers =
                                                                            [
                                                                                ...data.endUsers,
                                                                            ];
                                                                        newEndUsers[
                                                                            index
                                                                        ].email =
                                                                            e.target.value;
                                                                        setData(
                                                                            "endUsers",
                                                                            newEndUsers
                                                                        );
                                                                    }}
                                                                    className={`pl-10 border-gray-200 focus:ring-blue-500 focus:border-blue-500`}
                                                                    placeholder="enduser@example.com"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* End User Phone Field */}
                                                        <div className="space-y-1">
                                                            <Label
                                                                htmlFor={`end_user_phone_${index}`}
                                                                className="text-sm font-medium"
                                                            >
                                                                User Phone
                                                            </Label>
                                                            <div className="relative">
                                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                                <Input
                                                                    id={`end_user_phone_${index}`}
                                                                    type="text"
                                                                    value={
                                                                        endUser.phone
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newEndUsers =
                                                                            [
                                                                                ...data.endUsers,
                                                                            ];
                                                                        newEndUsers[
                                                                            index
                                                                        ].phone =
                                                                            e.target.value;
                                                                        setData(
                                                                            "endUsers",
                                                                            newEndUsers
                                                                        );
                                                                    }}
                                                                    className={`pl-10 border-gray-200 focus:ring-blue-500 focus:border-blue-500`}
                                                                    placeholder="+1 (123) 456-7890"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* End User Position Field */}
                                                        <div className="space-y-1">
                                                            <Label
                                                                htmlFor={`end_users_position_${index}`}
                                                                className="text-sm font-medium"
                                                            >
                                                                Position
                                                            </Label>
                                                            <div className="relative">
                                                                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                                <Input
                                                                    id={`end_user_position_${index}`}
                                                                    type="text"
                                                                    value={
                                                                        endUser.position
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newEndUsers =
                                                                            [
                                                                                ...data.endUsers,
                                                                            ];
                                                                        newEndUsers[
                                                                            index
                                                                        ].position =
                                                                            e.target.value;
                                                                        setData(
                                                                            "endUsers",
                                                                            newEndUsers
                                                                        );
                                                                    }}
                                                                    className={`pl-10 border-gray-200 focus:ring-blue-500 focus:border-blue-500`}
                                                                    placeholder="Enter end user position"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* End User Address Field */}
                                                        <div className="space-y-1">
                                                            <Label
                                                                htmlFor={`end_user_address_${index}`}
                                                                className="text-sm font-medium"
                                                            >
                                                                User Address
                                                            </Label>
                                                            <div className="relative">
                                                                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                                <Textarea
                                                                    id={`end_user_address_${index}`}
                                                                    value={
                                                                        endUser.address
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newEndUsers =
                                                                            [
                                                                                ...data.endUsers,
                                                                            ];
                                                                        newEndUsers[
                                                                            index
                                                                        ].address =
                                                                            e.target.value;
                                                                        setData(
                                                                            "endUsers",
                                                                            newEndUsers
                                                                        );
                                                                    }}
                                                                    className={`pl-10 min-h-[80px] border-gray-200 focus:ring-blue-500 focus:border-blue-500}`}
                                                                    placeholder="Enter end user address"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {data.endUsers.length === 0 && (
                                        <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                            <UserCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                            <h3 className="text-gray-500 text-lg font-medium mb-2">
                                                No End Users Added
                                            </h3>
                                            <p className="text-gray-400 mb-4">
                                                Click the button above to add
                                                users to this inquiry
                                            </p>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    const newEndUsers = [
                                                        ...data.endUsers,
                                                        {
                                                            name: "",
                                                            email: "",
                                                            phone: "",
                                                            address: "",
                                                            position: "",
                                                        },
                                                    ];
                                                    setData(
                                                        "endUsers",
                                                        newEndUsers
                                                    );
                                                }}
                                                variant="outline"
                                                size="sm"
                                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add First User
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {/* File Upload Section */}
                                <div className="py-8">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Paperclip className="w-5 h-5 mr-2 text-blue-600" />
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

                                            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                                                <Upload className="h-7 w-7 text-blue-600" />
                                            </div>

                                            <h3 className="text-base font-medium text-gray-900">
                                                Upload documents
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
                                        <Users className="w-5 h-5 mr-2 text-blue-600" />
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
                                                            : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                    }`}
                                                />
                                                {data.sales_id && (
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-blue-100 text-blue-700"
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
                                                                                    ? "bg-blue-50 text-blue-700"
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
                                                                                    <Check className="h-5 w-5 text-blue-600" />
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
                                                            : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                    }`}
                                                />
                                                {data.pic_engineer_id && (
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-blue-100 text-blue-700"
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
                                                                                    ? "bg-blue-50 text-blue-700"
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
                                                                                    <Check className="h-5 w-5 text-blue-600" />
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
                            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                                <Link href={route("inquiries.index")}>
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
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing
                                        ? "Creating..."
                                        : "Create Inquiry"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                    {/* Help Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4"
                    >
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Information
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        Fields marked with an asterisk (*) are
                                        mandatory. Inquiries will be
                                        automatically tracked in the system.
                                    </p>
                                    <p className="mt-1">
                                        Team members will be notified when you
                                        assign them to an inquiry. Uploaded
                                        files will be attached to this inquiry.
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

export default InquiriesCreate;

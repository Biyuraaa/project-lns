import React, { FormEvent } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ChevronLeft,
    Save,
    User,
    Mail,
    Phone,
    MapPin,
    AlertCircle,
    Pencil,
    Users,
    CalendarDays,
} from "lucide-react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Badge } from "@/Components/ui/badge";
import { motion } from "framer-motion";
import { Customer, PageProps } from "@/types";

interface CustomersEditProps extends PageProps {
    customer: Customer;
}

const CustomersEdit = () => {
    const { customer } = usePage<CustomersEditProps>().props;
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route("customers.update", customer.id));
    };

    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Customer: ${customer.name}`} />
            <Breadcrumb
                items={[
                    {
                        label: "Customer Management",
                        href: route("customers.index"),
                    },
                    { label: `Edit: ${customer.name}` },
                ]}
            />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-blue-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-indigo-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <Pencil className="mr-3 h-8 w-8" />
                                    Edit Customer
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                                    Update information for {customer.name}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <Users className="h-3.5 w-3.5" />
                                        <span>Customer ID: #{customer.id}</span>
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        <span>
                                            Created:{" "}
                                            {formatDate(customer.created_at)}
                                        </span>
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-shrink-0 items-center space-x-3">
                                <Link href={route("customers.index")}>
                                    <Button className="shadow-lg shadow-indigo-900/30 bg-white text-indigo-700 hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200">
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>Back to Customers</span>
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
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name Field */}
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="name"
                                            className="text-sm font-medium"
                                        >
                                            Customer Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                className={`pl-10 ${
                                                    errors.name
                                                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                                }`}
                                                placeholder="Enter customer name"
                                                required
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="email"
                                            className="text-sm font-medium"
                                        >
                                            Email Address{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                className={`pl-10 ${
                                                    errors.email
                                                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                                }`}
                                                placeholder="customer@example.com"
                                                required
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone Field */}
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="phone"
                                            className="text-sm font-medium"
                                        >
                                            Phone Number
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <Input
                                                id="phone"
                                                type="text"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        "phone",
                                                        e.target.value
                                                    )
                                                }
                                                className={`pl-10 ${
                                                    errors.phone
                                                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                                }`}
                                                placeholder="+1 (123) 456-7890"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Address Field - Full width */}
                                    <div className="space-y-1 md:col-span-2">
                                        <Label
                                            htmlFor="address"
                                            className="text-sm font-medium"
                                        >
                                            Address
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <Textarea
                                                id="address"
                                                value={data.address}
                                                onChange={(e) =>
                                                    setData(
                                                        "address",
                                                        e.target.value
                                                    )
                                                }
                                                className={`pl-10 min-h-[100px] ${
                                                    errors.address
                                                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                                }`}
                                                placeholder="Enter customer address"
                                            />
                                        </div>
                                        {errors.address && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                                <Link href={route("customers.index")}>
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
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing
                                        ? "Saving Changes..."
                                        : "Update Customer"}
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
                                        mandatory. Customer email addresses must
                                        be unique in the system.
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

export default CustomersEdit;

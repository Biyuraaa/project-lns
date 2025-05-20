"use client";

import type React from "react";

import type { FormEvent } from "react";
import { useForm, Head, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ChevronLeft,
    Save,
    User,
    Mail,
    Phone,
    MapPin,
    AlertCircle,
    Users,
    CalendarDays,
    Lock,
    Upload,
    Check,
    X,
    AlertTriangle,
    Activity,
    HardHat,
    Wrench,
} from "lucide-react";
import { Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Badge } from "@/Components/ui/badge";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Progress } from "@/Components/ui/progress";
import type { PageProps } from "@/types";
import { PicEngineer } from "@/types";

interface PicEngineerEditProps extends PageProps {
    pic_engineer: PicEngineer;
}

const PicEngineerEdit = () => {
    const { pic_engineer } = usePage<PicEngineerEditProps>().props;
    const { data, setData, processing, errors } = useForm({
        name: pic_engineer.name,
        email: pic_engineer.email,
        phone: pic_engineer.phone,
        address: pic_engineer.address,
        status: pic_engineer.status,
        image: null as File | null,
        password: "",
        password_confirmation: "",
    });

    const [imagePreview, setImagePreview] = useState<string | null>(
        pic_engineer.image
            ? `/storage/images/pic_engineers/${pic_engineer.image}`
            : null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [passwordFeedback, setPasswordFeedback] = useState("");
    const [changePassword, setChangePassword] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (changePassword && !passwordMatch) {
            return;
        }

        // Create FormData object for file uploads
        const formData = new FormData();

        // Add all text fields
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("status", data.status);
        formData.append("_method", "PATCH"); // Laravel method spoofing

        // Only add these if they exist
        if (data.phone) formData.append("phone", data.phone);
        if (data.address) formData.append("address", data.address);

        // Add image if selected
        if (data.image) {
            formData.append("image", data.image);
        }

        // Add password fields only if changing password
        if (changePassword && data.password) {
            formData.append("password", data.password);
            formData.append(
                "password_confirmation",
                data.password_confirmation
            );
        }
        console.log("Form Data:", formData);

        // Use the sales ID directly in the route
        router.post(route("picEngineers.update", pic_engineer.id), formData, {
            onError: (errors) => {
                console.error("Form submission errors:", errors);
            },
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData("image", file);

        // Create preview URL for the selected image
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Check password strength
    const checkPasswordStrength = (password: string) => {
        if (!password) {
            setPasswordStrength(0);
            setPasswordFeedback("");
            return;
        }

        let strength = 0;
        const feedback = [];

        // Length check
        if (password.length >= 8) {
            strength += 25;
        } else {
            feedback.push("Password should be at least 8 characters long");
        }

        // Uppercase check
        if (/[A-Z]/.test(password)) {
            strength += 25;
        } else {
            feedback.push("Add uppercase letters");
        }

        // Lowercase check
        if (/[a-z]/.test(password)) {
            strength += 25;
        } else {
            feedback.push("Add lowercase letters");
        }

        // Number or special character check
        if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
            strength += 25;
        } else {
            feedback.push("Add numbers or special characters");
        }

        setPasswordStrength(strength);
        setPasswordFeedback(feedback.join(", "));
    };

    // Check if passwords match
    useEffect(() => {
        if (data.password_confirmation) {
            setPasswordMatch(data.password === data.password_confirmation);
        } else {
            setPasswordMatch(true);
        }
    }, [data.password, data.password_confirmation]);

    // Check password strength whenever password changes
    useEffect(() => {
        checkPasswordStrength(data.password);
    }, [data.password]);

    // Get strength color based on strength value
    const getStrengthColor = () => {
        if (passwordStrength <= 25) return "bg-red-500";
        if (passwordStrength <= 50) return "bg-orange-500";
        if (passwordStrength <= 75) return "bg-yellow-500";
        return "bg-green-500";
    };

    // Get strength label based on strength value
    const getStrengthLabel = () => {
        if (passwordStrength <= 25) return "Weak";
        if (passwordStrength <= 50) return "Fair";
        if (passwordStrength <= 75) return "Good";
        return "Strong";
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit PIC Engineer" />
            <Breadcrumb
                items={[
                    {
                        label: "PIC Engineers Management",
                        href: route("picEngineers.index"),
                    },
                    { label: `Edit ${pic_engineer.name}` },
                ]}
            />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-700 p-8 shadow-xl">
                        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-64 w-64 rounded-full bg-blue-500/30 blur-2xl"></div>
                        <div className="absolute top-0 left-0 -mt-12 -ml-12 h-48 w-48 rounded-full bg-cyan-500/30 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                                    <Wrench className="mr-3 h-8 w-8" />
                                    Edit PIC Engineer: {pic_engineer.name}
                                </h1>
                                <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                                    Update the PIC Engineer's information
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <Users className="h-3.5 w-3.5" />
                                        <span>
                                            Engineer ID: #{pic_engineer.id}
                                        </span>
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5"
                                    >
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        <span>
                                            Updated:{" "}
                                            {new Date().toLocaleDateString()}
                                        </span>
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-shrink-0 items-center space-x-3">
                                <Link href={route("picEngineers.index")}>
                                    <Button className="shadow-lg shadow-blue-900/30 bg-white text-blue-700 hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200">
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>Back to Engineers</span>
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
                                    {/* Profile Image Field */}
                                    <div className="space-y-1 md:col-span-2">
                                        <Label
                                            htmlFor="image"
                                            className="text-sm font-medium"
                                        >
                                            Profile Image
                                        </Label>
                                        <div className="mt-1 flex items-center">
                                            <div className="flex-shrink-0">
                                                {imagePreview ? (
                                                    <div className="h-24 w-24 rounded-lg overflow-hidden bg-gray-100">
                                                        <img
                                                            src={
                                                                imagePreview ||
                                                                "/placeholder.svg"
                                                            }
                                                            alt="Profile preview"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-24 w-24 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <HardHat className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <input
                                                    type="file"
                                                    id="image"
                                                    ref={fileInputRef}
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={triggerFileInput}
                                                    className="border-gray-300 text-gray-700"
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    {imagePreview
                                                        ? "Change Image"
                                                        : "Upload Image"}
                                                </Button>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    JPEG, PNG or GIF up to 2MB
                                                </p>
                                            </div>
                                        </div>
                                        {errors.image && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                {errors.image}
                                            </p>
                                        )}
                                    </div>

                                    {/* Name Field */}
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="name"
                                            className="text-sm font-medium"
                                        >
                                            Full Name{" "}
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
                                                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                }`}
                                                placeholder="Enter full name"
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
                                                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                }`}
                                                placeholder="engineer@example.com"
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
                                                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
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

                                    {/* Status Field */}
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
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Activity className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <select
                                                id="status"
                                                value={data.status}
                                                onChange={(e) =>
                                                    setData(
                                                        "status",
                                                        e.target.value as
                                                            | "active"
                                                            | "inactive"
                                                    )
                                                }
                                                className={`block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                                                    errors.status
                                                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        : "border-gray-200"
                                                }`}
                                                required
                                            >
                                                <option value="active">
                                                    Active
                                                </option>
                                                <option value="inactive">
                                                    Inactive
                                                </option>
                                            </select>
                                        </div>
                                        {errors.status && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                {errors.status}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                            Inactive users cannot login to the
                                            system
                                        </p>
                                    </div>

                                    {/* Change Password Toggle */}
                                    <div className="space-y-1 md:col-span-2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="changePassword"
                                                checked={changePassword}
                                                onChange={() => {
                                                    setChangePassword(
                                                        !changePassword
                                                    );
                                                    if (!changePassword) {
                                                        // Reset password fields when unchecking
                                                        setData("password", "");
                                                        setData(
                                                            "password_confirmation",
                                                            ""
                                                        );
                                                    }
                                                }}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label
                                                htmlFor="changePassword"
                                                className="ml-2 block text-sm text-gray-700"
                                            >
                                                Change Password
                                            </label>
                                        </div>
                                    </div>

                                    {changePassword && (
                                        <>
                                            {/* Password Field */}
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="password"
                                                    className="text-sm font-medium"
                                                >
                                                    New Password{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Lock className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        value={data.password}
                                                        onChange={(e) =>
                                                            setData(
                                                                "password",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 ${
                                                            errors.password
                                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                        }`}
                                                        placeholder="••••••••"
                                                        required={
                                                            changePassword
                                                        }
                                                    />
                                                </div>
                                                {errors.password && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        {errors.password}
                                                    </p>
                                                )}

                                                {/* Password strength indicator */}
                                                {data.password && (
                                                    <div className="mt-2">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs text-gray-500">
                                                                Password
                                                                strength:
                                                            </span>
                                                            <span
                                                                className={`text-xs font-medium ${
                                                                    passwordStrength <=
                                                                    25
                                                                        ? "text-red-500"
                                                                        : passwordStrength <=
                                                                          50
                                                                        ? "text-orange-500"
                                                                        : passwordStrength <=
                                                                          75
                                                                        ? "text-yellow-600"
                                                                        : "text-green-600"
                                                                }`}
                                                            >
                                                                {getStrengthLabel()}
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={
                                                                passwordStrength
                                                            }
                                                            className={`h-1.5 bg-gray-100`}
                                                            style={
                                                                {
                                                                    "--progress-indicator-color": `var(--${getStrengthColor().replace(
                                                                        "bg-",
                                                                        ""
                                                                    )})`,
                                                                } as React.CSSProperties
                                                            }
                                                        />

                                                        {passwordFeedback && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {
                                                                    passwordFeedback
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Password Confirmation Field */}
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor="password_confirmation"
                                                    className="text-sm font-medium"
                                                >
                                                    Confirm New Password{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Lock className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <div className="relative">
                                                        <Input
                                                            id="password_confirmation"
                                                            type="password"
                                                            value={
                                                                data.password_confirmation
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "password_confirmation",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className={`pl-10 ${
                                                                !passwordMatch ||
                                                                errors.password_confirmation
                                                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                                    : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                            }`}
                                                            placeholder="••••••••"
                                                            required={
                                                                changePassword
                                                            }
                                                        />
                                                        {/* Password match indicator icon */}
                                                        {data.password_confirmation && (
                                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                                {passwordMatch ? (
                                                                    <Check className="h-4 w-4 text-green-500" />
                                                                ) : (
                                                                    <X className="h-4 w-4 text-red-500" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {!passwordMatch &&
                                                    data.password_confirmation && (
                                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Passwords do not
                                                            match
                                                        </p>
                                                    )}
                                                {errors.password_confirmation && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        {
                                                            errors.password_confirmation
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}

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
                                                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                }`}
                                                placeholder="Enter engineer's address"
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
                                <Link href={route("picEngineers.index")}>
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
                                        (changePassword &&
                                            !passwordMatch &&
                                            data.password_confirmation !== "")
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing
                                        ? "Saving..."
                                        : "Update PIC Engineer"}
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
                                        mandatory. Email addresses must be
                                        unique in the system.
                                    </p>
                                    <p className="mt-1">
                                        Setting a user to "Inactive" will
                                        prevent them from logging in without
                                        deleting their account or associated
                                        data.
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

export default PicEngineerEdit;

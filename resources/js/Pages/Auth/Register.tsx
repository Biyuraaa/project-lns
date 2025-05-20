import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout fullWidth>
            <Head title="Register" />

            <div className="py-12 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
                <div className="grid lg:grid-cols-2 w-full max-w-6xl shadow-lg rounded-2xl overflow-hidden">
                    {/* Left side - Information */}
                    <div className="hidden lg:block relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900">
                            {/* Pattern overlay */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern-grid.svg')] bg-repeat"></div>
                            </div>

                            <div className="flex flex-col justify-center items-center h-full p-12 text-center">
                                <div className="max-w-md mx-auto">
                                    <h2 className="text-3xl font-bold text-white mb-6">
                                        Join Our Business System
                                    </h2>
                                    <p className="text-blue-100 mb-8 leading-relaxed">
                                        Create an account to access PT. LNS
                                        Indonesia's comprehensive business
                                        management system and streamline your
                                        workflow.
                                    </p>

                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                                        <h3 className="text-xl font-semibold text-white mb-4">
                                            Benefits of Registration
                                        </h3>
                                        <ul className="space-y-3 text-left">
                                            <li className="flex items-start">
                                                <CheckCircle className="h-6 w-6 text-blue-300 mr-3 flex-shrink-0 mt-0.5" />
                                                <span className="text-blue-100">
                                                    Access to project tracking
                                                    and management tools
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="h-6 w-6 text-blue-300 mr-3 flex-shrink-0 mt-0.5" />
                                                <span className="text-blue-100">
                                                    Real-time customer
                                                    relationship insights
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="h-6 w-6 text-blue-300 mr-3 flex-shrink-0 mt-0.5" />
                                                <span className="text-blue-100">
                                                    Streamlined quotation and
                                                    order processing
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="h-6 w-6 text-blue-300 mr-3 flex-shrink-0 mt-0.5" />
                                                <span className="text-blue-100">
                                                    Comprehensive business
                                                    analytics dashboard
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Form */}
                    <div className="p-6 sm:p-10 bg-white">
                        <div className="max-w-md mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Logo and welcome message */}
                                <div className="text-center mb-8">
                                    <Link
                                        href="/"
                                        className="inline-block mb-6"
                                    >
                                        <div className="flex items-center justify-center">
                                            <img
                                                src="/images/logo.png"
                                                alt="Logo"
                                                className="h-12 w-12"
                                            />
                                            <span className="ml-3 text-blue-800 font-bold text-xl">
                                                PT. LNS Indonesia
                                            </span>
                                        </div>
                                    </Link>

                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        Create an Account
                                    </h1>
                                    <p className="text-gray-600">
                                        Register to access the business system
                                    </p>
                                </div>

                                {/* Registration Form */}
                                <form onSubmit={submit} className="space-y-5">
                                    {/* Name Field */}
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                className={`block w-full pl-10 py-3 border ${
                                                    errors.name
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="Enter your full name"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        {errors.name && (
                                            <div className="mt-1 text-red-500 text-sm flex items-center">
                                                <AlertTriangle className="h-4 w-4 mr-1" />
                                                {errors.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                className={`block w-full pl-10 py-3 border ${
                                                    errors.email
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="Enter your email address"
                                                required
                                            />
                                        </div>
                                        {errors.email && (
                                            <div className="mt-1 text-red-500 text-sm flex items-center">
                                                <AlertTriangle className="h-4 w-4 mr-1" />
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData(
                                                        "password",
                                                        e.target.value
                                                    )
                                                }
                                                className={`block w-full pl-10 pr-10 py-3 border ${
                                                    errors.password
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="Create a password"
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        {errors.password && (
                                            <div className="mt-1 text-red-500 text-sm flex items-center">
                                                <AlertTriangle className="h-4 w-4 mr-1" />
                                                {errors.password}
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div>
                                        <label
                                            htmlFor="password_confirmation"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="password_confirmation"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    data.password_confirmation
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "password_confirmation",
                                                        e.target.value
                                                    )
                                                }
                                                className={`block w-full pl-10 pr-10 py-3 border ${
                                                    errors.password_confirmation
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="Confirm your password"
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword
                                                        )
                                                    }
                                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        {errors.password_confirmation && (
                                            <div className="mt-1 text-red-500 text-sm flex items-center">
                                                <AlertTriangle className="h-4 w-4 mr-1" />
                                                {errors.password_confirmation}
                                            </div>
                                        )}
                                    </div>

                                    {/* Terms and conditions */}
                                    <div className="text-sm text-gray-600">
                                        By registering, you agree to PT. LNS
                                        Indonesia's{" "}
                                        <Link
                                            href="/terms"
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link
                                            href="/privacy"
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            Privacy Policy
                                        </Link>
                                        .
                                    </div>

                                    {/* Submit Button */}
                                    <div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg
                                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    Creating Account...
                                                </>
                                            ) : (
                                                "Create Account"
                                            )}
                                        </button>
                                    </div>

                                    {/* Login Link */}
                                    <div className="text-center mt-6">
                                        <p className="text-sm text-gray-600">
                                            Already have an account?{" "}
                                            <Link
                                                href={route("login")}
                                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                Sign in
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}

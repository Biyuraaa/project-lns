import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const Login = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    useEffect(() => {
        return () => {
            reset("password");
        };
    }, []);

    return (
        <GuestLayout fullWidth={true}>
            <Head title="Log in" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
                <div className="grid lg:grid-cols-2 w-full max-7-7xl shadow-lg rounded-2xl overflow-hidden">
                    {/* Left side - Form */}
                    <div className="p-6 sm:p-10 bg-white">
                        <div className="max-w-md mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Logo and welcome message */}
                                <div className="text-center mb-10">
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
                                        Welcome back
                                    </h1>
                                    <p className="text-gray-600">
                                        Sign in to access your account
                                    </p>
                                </div>

                                {/* Login Form */}
                                <form onSubmit={submit} className="space-y-6">
                                    {/* Email Field */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Email
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
                                                placeholder="Enter your email"
                                                required
                                                autoFocus
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
                                                placeholder="Enter your password"
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
                                                    aria-label={
                                                        showPassword
                                                            ? "Hide password"
                                                            : "Show password"
                                                    }
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

                                    {/* Remember Me */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                id="remember"
                                                type="checkbox"
                                                checked={data.remember}
                                                onChange={(e) =>
                                                    setData(
                                                        "remember",
                                                        e.target.checked
                                                    )
                                                }
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label
                                                htmlFor="remember"
                                                className="ml-2 block text-sm text-gray-700"
                                            >
                                                Remember me
                                            </label>
                                        </div>
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
                                                    Signing in...
                                                </>
                                            ) : (
                                                "Sign in"
                                            )}
                                        </button>
                                    </div>

                                    {/* Register Link */}
                                    <div className="text-center mt-6">
                                        <p className="text-sm text-gray-600">
                                            Don't have an account?{" "}
                                            <Link
                                                href={route("register")}
                                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                Create an account
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right side - Image and text */}
                    <div className="hidden lg:block relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900">
                            {/* Pattern overlay */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern-grid.svg')] bg-repeat"></div>
                            </div>

                            <div className="flex flex-col justify-center items-center h-full p-12 text-center">
                                <div className="max-w-md mx-auto">
                                    <h2 className="text-3xl font-bold text-white mb-6">
                                        Access Your Business System
                                    </h2>
                                    <p className="text-blue-100 mb-8 leading-relaxed">
                                        Manage your inquiries, track quotations,
                                        monitor project performance, and gain
                                        valuable insights into your customer
                                        relationships.
                                    </p>

                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                                        <h3 className="text-xl font-semibold text-white mb-4">
                                            System Features
                                        </h3>
                                        <ul className="space-y-3 text-left">
                                            <li className="flex items-start">
                                                <div className="h-6 w-6 rounded-full bg-blue-300 flex items-center justify-center text-blue-800 font-bold text-sm mt-0.5 mr-3">
                                                    1
                                                </div>
                                                <span className="text-blue-100">
                                                    Inquiry Management
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <div className="h-6 w-6 rounded-full bg-blue-300 flex items-center justify-center text-blue-800 font-bold text-sm mt-0.5 mr-3">
                                                    2
                                                </div>
                                                <span className="text-blue-100">
                                                    Quotation & PO Tracking
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <div className="h-6 w-6 rounded-full bg-blue-300 flex items-center justify-center text-blue-800 font-bold text-sm mt-0.5 mr-3">
                                                    3
                                                </div>
                                                <span className="text-blue-100">
                                                    Customer Relationship
                                                    Management
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <div className="h-6 w-6 rounded-full bg-blue-300 flex items-center justify-center text-blue-800 font-bold text-sm mt-0.5 mr-3">
                                                    4
                                                </div>
                                                <span className="text-blue-100">
                                                    Performance Analytics
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default Login;

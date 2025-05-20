"use client";

import { Link, usePage } from "@inertiajs/react";
import { type ReactNode, useState, useEffect } from "react";
import Sidebar from "@/Components/Sidebar";
import Header from "@/Components/Header";
import { motion } from "framer-motion";

interface AuthenticatedLayoutProps {
    children: ReactNode;
    header?: ReactNode;
}

export default function AuthenticatedLayout({
    children,
}: AuthenticatedLayoutProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // Handle initial mount - prevents flash of content
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-200">
            {/* Sidebar component */}
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

            {/* Main content area */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                {/* Header component */}
                <Header isOpen={isOpen} setIsOpen={setIsOpen} />
                {/* Main content */}
                <main className="py-6 flex-grow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 mt-auto">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                            <p className="text-center md:text-left text-sm text-gray-500">
                                &copy; {new Date().getFullYear()} PT. LNS
                                Indonesia. All rights reserved.
                            </p>
                            <div className="flex justify-center md:justify-end space-x-6 mt-3 md:mt-0">
                                <Link
                                    href="#"
                                    className="text-gray-500 hover:text-gray-700 text-sm"
                                >
                                    Privacy Policy
                                </Link>
                                <Link
                                    href="#"
                                    className="text-gray-500 hover:text-gray-700 text-sm"
                                >
                                    Terms of Service
                                </Link>
                                <Link
                                    href="#"
                                    className="text-gray-500 hover:text-gray-700 text-sm"
                                >
                                    Help Center
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

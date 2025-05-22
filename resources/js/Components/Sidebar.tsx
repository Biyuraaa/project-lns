"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Users,
    ClipboardList,
    BarChart2,
    Settings,
    LogOut,
    Home,
    ChevronRight,
    Mail,
    CreditCard,
    FileCheck,
    Search,
    Calendar,
    HelpCircle,
    FileText,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { url } = usePage();
    const user = usePage().props.auth.user;
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Auto-open submenu based on active route
    useEffect(() => {
        const activeMenuItem = menuItems.find((item) =>
            item.children?.some((child) => child.active)
        );

        if (activeMenuItem) {
            setOpenSubmenu(activeMenuItem.name);
        }
    }, [url]);

    // Menu items with nested structure
    const menuItems = [
        {
            name: "Dashboard",
            route: route("dashboard"),
            icon: <Home size={20} />,
            active: url === route("dashboard"),
        },
        {
            name: "Organization",
            icon: <Users size={20} />,
            children: [
                {
                    name: "Customers",
                    route: route("customers.index"),
                    active: url.startsWith("/customers"),
                },
                {
                    name: "Sales",
                    route: route("sales.index"),
                    active: url.startsWith("/sales"),
                },
                {
                    name: "PIC Engineers",
                    route: route("picEngineers.index"),
                    active: url.startsWith("/pic-engineers"),
                },
            ],
        },
        {
            name: "Inquiries",
            icon: <Mail size={20} />,
            route: route("inquiries.index"),
            active: url.startsWith("/inquiries"),
        },
        {
            name: "Quotations",
            icon: <FileText size={20} />,
            route: route("quotations.index"),
            active: url.startsWith("/quotations"),
        },
        {
            name: "Purchase Orders",
            icon: <CreditCard size={20} />,
            route: route("purchaseOrders.index"),
            active: url.startsWith("/purchaseOrders"),
        },
    ];

    const toggleSubmenu = (name: string) => {
        if (openSubmenu === name) {
            setOpenSubmenu(null);
        } else {
            setOpenSubmenu(name);
        }
    };

    // Filter menu items based on search query
    const filteredMenuItems = searchQuery
        ? menuItems.filter(
              (item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.children?.some((child) =>
                      child.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                  )
          )
        : menuItems;

    return (
        <>
            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30
          w-64 lg:translate-x-0 shadow-lg lg:shadow-none
        `}
                initial={{ x: -320 }}
                animate={{ x: isOpen ? 0 : -320 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Logo section */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    <Link href="/" className="flex items-center">
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            className="h-8 w-8"
                        />
                        <span className="ml-2 text-lg font-semibold text-gray-900">
                            LNS Indonesia
                        </span>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* User info */}
                <div className="px-4 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                                {user?.name || "User Name"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {user?.email || "user@example.com"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-gray-200">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search menu..."
                            className={`w-full pl-10 pr-3 py-2 text-sm border ${
                                isSearchFocused
                                    ? "border-blue-500 ring-2 ring-blue-200"
                                    : "border-gray-300"
                            } rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none transition-all`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                    </div>
                </div>

                {/* Navigation Menu - Using SidebarItem component */}
                <nav className="mt-2 px-2 overflow-y-auto flex-grow h-[calc(100vh-14.5rem)]">
                    <AnimatePresence>
                        {filteredMenuItems.length > 0 ? (
                            filteredMenuItems.map((item, index) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <SidebarItem
                                        name={item.name}
                                        icon={item.icon}
                                        route={item.route}
                                        active={item.active}
                                        children={item.children}
                                        openSubmenu={openSubmenu}
                                        toggleSubmenu={toggleSubmenu}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-8 text-center text-gray-500"
                            >
                                <p className="text-sm">No menu items found</p>
                                <p className="text-xs mt-1">
                                    Try a different search term
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-0 w-full border-t border-gray-200 p-4 bg-white">
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} className="mr-3" />
                        Sign Out
                    </Link>
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;

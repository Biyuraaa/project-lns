"use client";

import React, { useState, useEffect, useMemo } from "react";
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
    LineChart,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import { motion, AnimatePresence } from "framer-motion";
import { PageProps } from "@/types"; // Import PageProps

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

// Define types for menu items
interface MenuItem {
    name: string;
    icon?: React.ReactNode;
    route?: string;
    active?: boolean;
    permission?: string;
    children?: ChildMenuItem[];
}

interface ChildMenuItem {
    name: string;
    route: string;
    active: boolean;
    permission?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { url, props } = usePage<PageProps>();

    const { auth } = props;
    const userPermissions = useMemo(
        () => new Set(auth.user?.permissions || []),
        [auth.user]
    );

    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const allMenuItems = useMemo(
        () =>
            [
                {
                    name: "Dashboard",
                    route: route("dashboard"),
                    icon: <Home size={20} />,
                    active: url === route("dashboard"),
                    permission: "view-dashboard",
                },
                {
                    name: "Organization",
                    icon: <Users size={20} />,
                    children: [
                        {
                            name: "Customers",
                            route: route("customers.index"),
                            active: url.startsWith("/customers"),
                            permission: "view-any-customer",
                        },
                        {
                            name: "Sales",
                            route: route("sales.index"),
                            active: url.startsWith("/sales"),
                            permission: "view-any-sales",
                        },
                        {
                            name: "PIC Engineers",
                            route: route("picEngineers.index"),
                            active: url.startsWith("/picEngineers"),
                            permission: "view-any-pic-engineer",
                        },
                    ],
                },
                {
                    name: "Inquiries",
                    icon: <Mail size={20} />,
                    route: route("inquiries.index"),
                    active: url.startsWith("/inquiries"),
                    permission: "view-any-inquiry",
                },
                {
                    name: "Quotations",
                    icon: <FileText size={20} />,
                    route: route("quotations.index"),
                    active: url.startsWith("/quotations"),
                    permission: "view-any-quotation",
                },
                {
                    name: "Purchase Orders",
                    icon: <CreditCard size={20} />,
                    route: route("purchaseOrders.index"),
                    active: url.startsWith("/purchaseOrders"),
                    permission: "view-any-purchase-order",
                },
                {
                    name: "Target Sales",
                    icon: <LineChart size={20} />,
                    route: route("targetSales.index"), // Adjust with your route name
                    active: url.startsWith("/targetSales"),
                    permission: "view-any-company-growth-selling",
                },
            ] as MenuItem[],
        [url]
    );

    // Filter menu based on user permissions
    const accessibleMenuItems = useMemo(() => {
        const filterItems = (items: MenuItem[]): MenuItem[] => {
            return items
                .map((item) => {
                    // If item has submenu (children)
                    if (item.children) {
                        const accessibleChildren = filterItems(
                            item.children as MenuItem[]
                        );
                        // Show parent if at least one child is accessible
                        if (accessibleChildren.length > 0) {
                            return { ...item, children: accessibleChildren };
                        }
                        return null;
                    }

                    // If item doesn't have permission requirement, show it
                    if (!item.permission) {
                        return item;
                    }

                    // Show item if user has the appropriate permission
                    if (userPermissions.has(item.permission)) {
                        return item;
                    }

                    return null;
                })
                .filter(Boolean) as MenuItem[]; // Remove null items
        };

        return filterItems(allMenuItems);
    }, [userPermissions, allMenuItems]);

    useEffect(() => {
        const activeMenuItem = accessibleMenuItems.find((item) =>
            item.children?.some((child) => child.active)
        );
        if (activeMenuItem) {
            setOpenSubmenu(activeMenuItem.name);
        }
    }, [url, accessibleMenuItems]);

    const toggleSubmenu = (name: string) => {
        setOpenSubmenu(openSubmenu === name ? null : name);
    };

    // Filter menu based on search
    const filteredMenuItems = searchQuery
        ? accessibleMenuItems.filter(
              (item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.children?.some((child) =>
                      child.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                  )
          )
        : accessibleMenuItems;

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
                                {auth.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                                {auth.user?.name || "User Name"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {auth.user?.email || "user@example.com"}
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

                {/* Navigation Menu */}
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

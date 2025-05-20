"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import {
    Bell,
    Menu,
    Search,
    MessageSquare,
    ChevronDown,
    Settings,
    User,
    LogOut,
    HelpCircle,
} from "lucide-react";

interface HeaderProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isOpen, setIsOpen }) => {
    const [scrolled, setScrolled] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowUserMenu(false);
            setShowNotifications(false);
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Sample notifications
    const notifications = [
        {
            id: 1,
            title: "New inquiry received",
            time: "5 min ago",
            read: false,
        },
        {
            id: 2,
            title: "Project status updated",
            time: "1 hour ago",
            read: false,
        },
        { id: 3, title: "Meeting scheduled", time: "3 hours ago", read: true },
    ];

    return (
        <header
            className={`bg-white sticky top-0 z-20 transition-all duration-200 ${
                scrolled ? "shadow-md" : "border-b border-gray-200"
            }`}
        >
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Menu button & breadcrumbs */}
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(!isOpen);
                            }}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Right side: Search, Notifications, etc. */}
                    <div className="flex items-center space-x-3">
                        {/* Search */}
                        <div
                            className={`relative ${
                                searchFocused ? "w-64" : "w-40"
                            } transition-all duration-200`}
                        >
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                placeholder="Search..."
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                            />
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNotifications(!showNotifications);
                                    setShowUserMenu(false);
                                }}
                                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors relative"
                            >
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                            </button>

                            {/* Notifications dropdown */}
                            {showNotifications && (
                                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-200">
                                    <div className="py-2">
                                        <div className="px-4 py-2 border-b border-gray-200">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                Notifications
                                            </h3>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {notifications.map(
                                                (notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                                                            notification.read
                                                                ? ""
                                                                : "bg-blue-50"
                                                        }`}
                                                    >
                                                        <div className="flex justify-between">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {
                                                                    notification.title
                                                                }
                                                            </p>
                                                            {!notification.read && (
                                                                <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {notification.time}
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        <div className="border-t border-gray-200 px-4 py-2">
                                            <Link
                                                href="#"
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                View all notifications
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors">
                            <MessageSquare className="h-5 w-5" />
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowUserMenu(!showUserMenu);
                                    setShowNotifications(false);
                                }}
                                className="flex items-center space-x-2 focus:outline-none"
                            >
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold shadow-sm">
                                    U
                                </div>
                                <span className="hidden md:block text-sm font-medium text-gray-700">
                                    User
                                </span>
                                <ChevronDown className="hidden md:block h-4 w-4 text-gray-500" />
                            </button>

                            {/* User dropdown menu */}
                            {showUserMenu && (
                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-200">
                                    <div className="py-1">
                                        <Link
                                            href={route("profile.edit")}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <User className="mr-3 h-4 w-4 text-gray-500" />
                                            Your Profile
                                        </Link>
                                        <Link
                                            href="#"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <Settings className="mr-3 h-4 w-4 text-gray-500" />
                                            Settings
                                        </Link>
                                        <Link
                                            href="#"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <HelpCircle className="mr-3 h-4 w-4 text-gray-500" />
                                            Help Center
                                        </Link>
                                        <div className="border-t border-gray-200"></div>
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="mr-3 h-4 w-4" />
                                            Sign Out
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

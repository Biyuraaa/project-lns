"use client";

import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Menu, X, User, LogOut } from "lucide-react";
import { PageProps } from "@/types";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { url, props } = usePage<PageProps>();
    const { auth } = props as PageProps;
    const isAuthenticated = auth?.user !== null;

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdown = document.getElementById("userDropdown");
            const userButton = document.getElementById("userButton");

            if (
                dropdown &&
                !dropdown.contains(event.target as Node) &&
                userButton &&
                !userButton.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const isActive = (path: string) => {
        return url === path;
    };

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About Us", href: "/about" },
        { name: "Services", href: "/services" },
        { name: "Projects", href: "/projects" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-white/95 backdrop-blur-sm shadow-lg py-3"
                    : "bg-white py-5"
            }`}
        >
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link
                            href={route("welcome")}
                            className="flex items-center gap-2"
                        >
                            <img
                                src="/images/logo.png"
                                alt="Logo"
                                className="h-12 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                    isActive(link.href)
                                        ? "text-blue-800 bg-blue-50"
                                        : "text-gray-700 hover:text-blue-800 hover:bg-blue-50/50"
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {isAuthenticated ? (
                            <div className="relative ml-4">
                                <button
                                    id="userButton"
                                    onClick={toggleDropdown}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    <User className="h-4 w-4" />
                                    <span>{auth.user.name}</span>
                                </button>

                                {isDropdownOpen && (
                                    <div
                                        id="userDropdown"
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200"
                                    >
                                        <div className="py-1">
                                            <Link
                                                href="/dashboard"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                                            >
                                                Dashboard
                                            </Link>
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Logout</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center ml-4 space-x-2">
                                <Link
                                    href="/login"
                                    className="px-5 py-2 border border-blue-800 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2 bg-blue-800 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-md text-gray-700 hover:text-blue-800 hover:bg-blue-50 focus:outline-none transition-colors"
                            aria-expanded={isMenuOpen}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div
                    className={`fixed inset-0 z-50 bg-white transform ${
                        isMenuOpen ? "translate-x-0" : "translate-x-full"
                    } transition-transform duration-300 ease-in-out md:hidden`}
                    style={{ top: "61px" }}
                >
                    <div className="px-2 pt-2 pb-3 h-full flex flex-col">
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`block py-3 px-4 text-base font-medium rounded-md ${
                                        isActive(link.href)
                                            ? "text-blue-800 bg-blue-50"
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                                    }`}
                                    onClick={toggleMenu}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {/* Authentication links for mobile */}
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="block py-3 px-4 text-base font-medium rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                                        onClick={toggleMenu}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="block py-3 px-4 text-base font-medium rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                                        onClick={toggleMenu}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full text-left py-3 px-4 text-base font-medium rounded-md text-red-600 hover:bg-red-50"
                                        onClick={toggleMenu}
                                    >
                                        Logout
                                    </Link>
                                </>
                            ) : (
                                <div className="mt-4 space-y-2 px-4">
                                    <Link
                                        href="/login"
                                        className="block w-full text-center py-3 border border-blue-800 text-blue-800 rounded-md text-base font-medium hover:bg-blue-50 transition-colors"
                                        onClick={toggleMenu}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="block w-full text-center py-3 bg-blue-800 text-white rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
                                        onClick={toggleMenu}
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 px-4">
                            <Link
                                href="/contact/quote"
                                className="w-full flex items-center justify-center px-4 py-3 bg-blue-800 text-white rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
                                onClick={toggleMenu}
                            >
                                Get a Quote
                            </Link>
                        </div>

                        <div className="mt-auto p-4 border-t border-gray-200">
                            <div className="flex items-center space-x-3 text-gray-700">
                                <span className="text-sm">Need help?</span>
                                <a
                                    href="tel:+6221123456789"
                                    className="text-blue-800 font-medium text-sm"
                                >
                                    +62 21 1234 5678
                                </a>
                            </div>

                            {isAuthenticated && (
                                <div className="mt-2 text-sm text-gray-600">
                                    Logged in as{" "}
                                    <span className="font-medium">
                                        {auth.user.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

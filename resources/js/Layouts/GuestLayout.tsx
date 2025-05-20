"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import ScrollToTop from "@/Components/ScrollToTop";
import { Transition } from "@headlessui/react";
import { usePage } from "@inertiajs/react";

interface GuestLayoutProps {
    children: React.ReactNode;
    hideNavbar?: boolean;
    hideFooter?: boolean;
    fullWidth?: boolean;
    className?: string;
}

const GuestLayout: React.FC<GuestLayoutProps> = ({
    children,
    hideNavbar = false,
    hideFooter = false,
    fullWidth = false,
    className = "",
}) => {
    const [pageReady, setPageReady] = useState(false);
    const { url } = usePage();

    // Handle page transitions
    useEffect(() => {
        setPageReady(false);
        const timeout = setTimeout(() => {
            setPageReady(true);
        }, 150);

        return () => clearTimeout(timeout);
    }, [url]);

    // Add smooth scrolling to all anchor links
    useEffect(() => {
        const handleSmoothScroll = (e: Event) => {
            const target = e.currentTarget as HTMLAnchorElement;
            e.preventDefault();

            const href = target.getAttribute("href");
            if (!href || !href.startsWith("#")) return;

            const targetElement = document.querySelector(href);
            if (!targetElement) return;

            window.scrollTo({
                top:
                    targetElement.getBoundingClientRect().top +
                    window.pageYOffset -
                    80, // Offset for fixed header
                behavior: "smooth",
            });
        };

        const anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach((anchor) => {
            anchor.addEventListener("click", handleSmoothScroll);
        });

        return () => {
            anchors.forEach((anchor) => {
                anchor.removeEventListener("click", handleSmoothScroll);
            });
        };
    }, [url]);

    // Handle page scroll memory between navigations
    useEffect(() => {
        // Save scroll position before navigating away
        window.history.scrollRestoration = "manual";

        // Restore to top when page loads
        window.scrollTo(0, 0);
    }, [url]);

    return (
        <div className={`flex flex-col min-h-screen bg-white ${className}`}>
            {!hideNavbar && <Navbar />}

            {/* Main Content with appropriate padding for fixed navbar */}
            <Transition
                show={pageReady}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                as="main"
                className={`flex-grow ${!hideNavbar ? "pt-24" : ""} ${
                    fullWidth ? "w-full" : ""
                }`}
            >
                {fullWidth ? (
                    // Full width content without container constraints
                    children
                ) : (
                    // Contained content with proper padding
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        {children}
                    </div>
                )}
            </Transition>

            {!hideFooter && <Footer />}
            <ScrollToTop />
        </div>
    );
};

export default GuestLayout;

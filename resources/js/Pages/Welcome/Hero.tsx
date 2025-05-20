"use client";

import React, { useEffect, useRef } from "react";
import { Link } from "@inertiajs/react";
import { ChevronRight, CheckCircle, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
    const videoRef = useRef<HTMLDivElement>(null);

    // Parallax effect on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (videoRef.current) {
                const scrollY = window.scrollY;
                videoRef.current.style.transform = `translateY(${
                    scrollY * 0.1
                }px)`;
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
                <div className="absolute top-1/2 -left-24 w-80 h-80 bg-blue-300 rounded-full filter blur-3xl opacity-10"></div>
            </div>

            <div className="relative container mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-24 lg:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Hero content */}
                    <motion.div
                        className="max-w-2xl"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.1,
                                },
                            },
                        }}
                    >
                        <motion.div
                            variants={fadeInUp}
                            className="inline-block px-4 py-1 bg-blue-800/50 backdrop-blur-sm rounded-full text-blue-200 text-sm font-medium mb-6 border border-blue-700/50"
                        >
                            Leading Engineering Solutions Provider
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6"
                        >
                            Engineering Excellence with{" "}
                            <span className="text-blue-300 relative">
                                Precise, Rapid, and Reliable
                                <svg
                                    className="absolute -bottom-2 left-0 w-full"
                                    viewBox="0 0 300 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M1 5.5C32.3333 1.16667 123.6 -3.4 299 10.5"
                                        stroke="#3B82F6"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>{" "}
                            Service
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="text-blue-100 text-lg md:text-xl mb-8 leading-relaxed"
                        >
                            PT. LNS Indonesia delivers comprehensive mechanical
                            services and maintenance solutions across marine,
                            cement, oil & gas, and power plant industries.
                        </motion.p>

                        <motion.div
                            variants={fadeInUp}
                            className="space-y-4 mb-8"
                        >
                            {[
                                "Advanced Metal Stitching Method Technology",
                                "Comprehensive Maintenance Management",
                                "Expert Handling of Complex Projects",
                                "High Quality Standards",
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-start"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                >
                                    <CheckCircle className="h-6 w-6 text-blue-300 mr-3 flex-shrink-0 mt-0.5" />
                                    <span className="text-blue-100">
                                        {item}
                                    </span>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Link
                                href="/services"
                                className="px-6 py-3 bg-white text-blue-800 font-medium rounded-md hover:bg-blue-50 transition-colors text-center shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 transform hover:-translate-y-1 duration-200"
                            >
                                Our Services
                            </Link>
                            <Link
                                href="/contact"
                                className="px-6 py-3 border border-blue-300 text-blue-100 font-medium rounded-md hover:bg-white/10 transition-colors flex items-center justify-center group"
                            >
                                Get a Quote{" "}
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Hero image/illustration */}
                    <motion.div
                        className="hidden lg:flex justify-end relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="relative">
                            {/* Video thumbnail or 3D model placeholder */}
                            <div
                                ref={videoRef}
                                className="relative rounded-xl overflow-hidden shadow-2xl shadow-blue-900/30 border border-white/10"
                            >
                                <div className="aspect-video w-full max-w-lg bg-gradient-to-br from-blue-800 to-blue-900 relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <img
                                            src="/placeholder.svg?height=400&width=600"
                                            alt="Engineering services"
                                            className="w-full h-full object-cover opacity-70"
                                        />
                                        <div className="absolute inset-0 bg-blue-900/40"></div>
                                        <button className="absolute inset-0 flex items-center justify-center group">
                                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:bg-white transition-colors duration-200">
                                                <Play className="h-6 w-6 text-blue-800 ml-1" />
                                            </div>
                                            <span className="absolute bottom-6 text-white font-medium">
                                                Watch Our Process
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Client logos */}
                <motion.div
                    className="mt-16 pt-8 border-t border-blue-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <p className="text-blue-300 text-center mb-6 text-sm font-medium tracking-wider">
                        TRUSTED BY INDUSTRY LEADERS
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                        {/* Replace with actual client logos */}
                        {[1, 2, 3, 4, 5].map((client) => (
                            <div
                                key={client}
                                className="h-12 w-32 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <img
                                    src={`/placeholder.svg?height=48&width=120&text=Client ${client}`}
                                    alt={`Client ${client}`}
                                    className="h-8 opacity-70 hover:opacity-100 transition-opacity"
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                >
                    {[
                        { value: "13+", label: "Years Experience" },
                        { value: "200+", label: "Projects Completed" },
                        { value: "50+", label: "Professional Staff" },
                        { value: "98%", label: "Client Satisfaction" },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/10 hover:bg-white/15 transition-colors duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 + index * 0.1 }}
                        >
                            <div className="text-3xl font-bold text-white mb-1">
                                {stat.value}
                            </div>
                            <div className="text-blue-200 text-sm">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Wave divider */}
            <div className="relative h-24 overflow-hidden">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 320"
                    className="absolute bottom-0 w-full h-auto"
                >
                    <path
                        fill="#ffffff"
                        fillOpacity="1"
                        d="M0,96L48,85.3C96,75,192,53,288,53.3C384,53,480,75,576,80C672,85,768,75,864,58.7C960,43,1056,21,1152,16C1248,11,1344,21,1392,26.7L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </svg>
            </div>
        </div>
    );
};

export default Hero;

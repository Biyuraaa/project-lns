"use client";

import React, { useRef } from "react";
import { Link } from "@inertiajs/react";
import { motion, useInView } from "framer-motion";
import {
    Wrench,
    Factory,
    Cog,
    BarChart3,
    Baseline,
    ArrowRight,
    Settings,
    ChevronRight,
} from "lucide-react";

const Services = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    const services = [
        {
            title: "Metal Stitching Method",
            description:
                "Innovative crack repair technology for metal components without welding, preserving the original material properties.",
            icon: <Wrench className="h-8 w-8" />,
            color: "blue",
            link: "/services/metal-stitching",
        },
        {
            title: "Overhaul Boilers",
            description:
                "Comprehensive maintenance and repair services for industrial boilers to ensure optimal performance and safety.",
            icon: <Factory className="h-8 w-8" />,
            color: "indigo",
            link: "/services/overhaul-boilers",
        },
        {
            title: "Belt Conveyor System",
            description:
                "Installation, maintenance and repair of belt conveyor systems for efficient material handling operations.",
            icon: <Baseline className="h-8 w-8" />,
            color: "teal",
            link: "/services/belt-conveyor",
        },
        {
            title: "CMMS Integration",
            description:
                "Implementation of Computerized Maintenance Management Systems to streamline maintenance operations.",
            icon: <BarChart3 className="h-8 w-8" />,
            color: "cyan",
            link: "/services/cmms",
        },
        {
            title: "Maintenance Management",
            description:
                "Strategic planning and execution of maintenance programs to maximize equipment reliability and lifespan.",
            icon: <Settings className="h-8 w-8" />,
            color: "emerald",
            link: "/services/maintenance",
        },
        {
            title: "Engineering Consultancy",
            description:
                "Expert technical advice and solutions for complex engineering challenges across various industries.",
            icon: <Cog className="h-8 w-8" />,
            color: "blue",
            link: "/services/consultancy",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const getGradient = (color: string) => {
        switch (color) {
            case "blue":
                return "from-blue-500 to-blue-700";
            case "indigo":
                return "from-indigo-500 to-indigo-700";
            case "cyan":
                return "from-cyan-500 to-cyan-700";
            case "teal":
                return "from-teal-500 to-teal-700";
            case "emerald":
                return "from-emerald-500 to-emerald-700";
            default:
                return "from-blue-500 to-blue-700";
        }
    };

    return (
        <section ref={ref} className="py-20 md:py-28 bg-white">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -20 }}
                    animate={
                        isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }
                    }
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Our Services
                    </h2>
                    <p className="max-w-3xl mx-auto text-gray-600 text-lg">
                        Comprehensive engineering solutions delivered with
                        precision and reliability across various industries
                    </p>
                    <div className="w-24 h-1 bg-blue-600 mx-auto mt-6"></div>
                </motion.div>

                {/* Services grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            className="relative group"
                        >
                            <div className="h-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100">
                                {/* Service icon */}
                                <div
                                    className={`p-6 bg-gradient-to-r ${getGradient(
                                        service.color
                                    )} text-white`}
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="bg-white/20 p-3 rounded-lg">
                                            {service.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">
                                        {service.title}
                                    </h3>
                                </div>

                                {/* Service description */}
                                <div className="p-6">
                                    <p className="text-gray-600 mb-6">
                                        {service.description}
                                    </p>
                                    <Link
                                        href={service.link}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group"
                                    >
                                        Learn more
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>

                            {/* Decorative corner element */}
                            <div className="absolute top-0 right-0 w-10 h-10 bg-white/50 backdrop-blur-sm rounded-bl-xl transform rotate-90 -translate-x-px -translate-y-px opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA section */}
                <motion.div
                    className="mt-16 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                        isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                    }
                    transition={{ delay: 0.6 }}
                >
                    <div className="max-w-3xl mx-auto bg-blue-50 p-8 rounded-xl border border-blue-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Need Customized Solutions?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            We understand that each project is unique. Our team
                            of experts is ready to develop tailored engineering
                            solutions that meet your specific requirements and
                            challenges.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow group"
                        >
                            Request a Consultation
                            <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Services;

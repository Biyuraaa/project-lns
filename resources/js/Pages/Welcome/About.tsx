"use client";

import { useRef } from "react";
import { Link } from "@inertiajs/react";
import {
    CheckCircle,
    Calendar,
    Activity,
    Target,
    ChevronRight,
} from "lucide-react";
import { motion, useInView } from "framer-motion";

const About = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div ref={ref}>
            {/* Company History */}
            <section className="py-20 md:py-28">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <motion.div
                        className="max-w-4xl mx-auto"
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.1,
                                },
                            },
                        }}
                    >
                        <motion.div
                            variants={fadeIn}
                            className="flex items-center mb-8"
                        >
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-5 shadow-md">
                                <Calendar className="h-8 w-8 text-blue-800" />
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                                    Our Journey
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    Established in 2010, evolving with
                                    excellence
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={fadeIn}
                            className="prose prose-lg max-w-none"
                        >
                            <p className="text-gray-700 mb-6 text-lg">
                                <span className="font-semibold text-blue-800">
                                    PT. LNS Indonesia was established on March
                                    15, 2010
                                </span>{" "}
                                as an engineering company specializing in
                                Mechanical Services, including maintenance and
                                repair of cracks using the innovative "Metal
                                Stitching Method" technology. Our services are
                                applied across diverse industries including
                                Marine & shipping companies, Cement Plants, and
                                Power Plants.
                            </p>

                            <p className="text-gray-700 mb-6 text-lg">
                                As industry needs evolved, PT. LNS Indonesia has
                                transformed into a{" "}
                                <span className="font-semibold text-blue-800">
                                    Full Service Company
                                </span>{" "}
                                competent in a wide variety of projects:
                            </p>
                        </motion.div>

                        <motion.div
                            variants={fadeIn}
                            className="grid md:grid-cols-2 gap-6 mt-8"
                        >
                            {[
                                "Overhaul Boilers",
                                "Cement Plants",
                                "Oil & Gas Plants",
                                "Power Plant",
                                "Belt Conveyor System",
                                "Maintenance Management with CMMS",
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={
                                        isInView
                                            ? { opacity: 1, y: 0 }
                                            : { opacity: 0, y: 20 }
                                    }
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                >
                                    <CheckCircle className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">
                                        {item}
                                    </span>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            variants={fadeIn}
                            className="mt-10 bg-blue-50 p-6 rounded-xl border border-blue-100"
                        >
                            <p className="text-gray-700 text-lg">
                                In our partnerships, we focus on coordination
                                and integration of multi-disciplinary teams,
                                involving professional experts who have handled
                                complex, large-scale projects. We are committed
                                to continuously improving our capabilities and
                                work quality to become a professional company
                                pioneering maintenance and repair projects that
                                are environmentally sound.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={fadeIn}
                            className="mt-8 text-center"
                        >
                            <Link
                                href="/about"
                                className="inline-flex items-center px-6 py-3 bg-blue-800 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg group"
                            >
                                Learn More About Us
                                <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Vision and Mission */}
            <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 md:py-28 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full opacity-30 translate-y-1/2 -translate-x-1/2"></div>

                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                    <motion.div
                        className="max-w-6xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={
                                isInView
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 20 }
                            }
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Vision & Mission
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                                Guiding principles that drive our operations and
                                shape our future
                            </p>
                            <div className="w-24 h-1 bg-blue-600 mx-auto mt-6"></div>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Vision */}
                            <motion.div
                                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative overflow-hidden"
                                initial={{ opacity: 0, x: -50 }}
                                animate={
                                    isInView
                                        ? { opacity: 1, x: 0 }
                                        : { opacity: 0, x: -50 }
                                }
                                transition={{ delay: 0.3 }}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 z-0"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-5 shadow-md">
                                            <Target className="h-8 w-8 text-blue-800" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            Our Vision
                                        </h3>
                                    </div>
                                    <p className="text-gray-700 italic border-l-4 border-blue-500 pl-4 py-3 mb-6 bg-blue-50 rounded-r-md text-lg">
                                        "To be a Precise, Rapidly and Reliable
                                        service company to meet customer
                                        satisfaction, supported by human
                                        resources that are qualified, competent
                                        and professional."
                                    </p>
                                    <p className="text-gray-600">
                                        We strive to be the leading engineering
                                        service provider that consistently
                                        exceeds customer expectations through
                                        excellence in every aspect of our
                                        operations.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Mission */}
                            <motion.div
                                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative overflow-hidden"
                                initial={{ opacity: 0, x: 50 }}
                                animate={
                                    isInView
                                        ? { opacity: 1, x: 0 }
                                        : { opacity: 0, x: 50 }
                                }
                                transition={{ delay: 0.4 }}
                            >
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full translate-y-1/2 -translate-x-1/2 z-0"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-5 shadow-md">
                                            <Activity className="h-8 w-8 text-blue-800" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            Our Mission
                                        </h3>
                                    </div>
                                    <ul className="space-y-5">
                                        {[
                                            "Provide innovative, reliable, and high quality services to our customers",
                                            "Give a challenging work environment, emphasis on health and safety at work for all employees",
                                            "Deliver the best results for business partners, employees, and shareholders",
                                        ].map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start"
                                            >
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0 mt-0.5 shadow-md">
                                                    {index + 1}
                                                </div>
                                                <span className="text-gray-700">
                                                    {item}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;

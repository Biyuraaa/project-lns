"use client";

import { motion } from "framer-motion";
import { Target, Activity } from "lucide-react";

const VisionMissionSection = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: "easeOut" },
        },
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, ease: "easeOut" },
        },
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, ease: "easeOut" },
        },
    };

    return (
        <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 md:py-28 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full opacity-30 translate-y-1/2 -translate-x-1/2"></div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                <motion.div
                    className="max-w-6xl mx-auto"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ staggerChildren: 0.2 }}
                >
                    <motion.div className="text-center mb-16" variants={fadeIn}>
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
                            variants={slideInLeft}
                        >
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
                                    satisfaction, supported by human resources
                                    that are qualified, competent and
                                    professional."
                                </p>
                            </div>
                        </motion.div>

                        {/* Mission */}
                        <motion.div
                            className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative overflow-hidden"
                            variants={slideInRight}
                        >
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
    );
};

export default VisionMissionSection;

"use client";

import { motion } from "framer-motion";
import { Calendar, Users, MapPin, Zap, Award } from "lucide-react";

const JourneySection = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    };

    const timelineItems = [
        {
            year: "2010",
            title: "Foundation",
            description:
                "Established in Surabaya as an engineering company specializing in Mechanical Services.",
            icon: <Calendar className="h-5 w-5 text-white" />,
        },
        {
            year: "2012",
            title: "Expansion",
            description:
                "Expanded service offerings to include comprehensive maintenance solutions for various industries.",
            icon: <MapPin className="h-5 w-5 text-white" />,
        },
        {
            year: "2015",
            title: "Full Service Company",
            description:
                "Evolved into a Full Service Company with capabilities in Overhaul Boilers, Oil & Gas Plants, and more.",
            icon: <Zap className="h-5 w-5 text-white" />,
        },
        {
            year: "Today",
            title: "Industry Leader",
            description:
                "Operating as a leading engineering service provider with a team of 201-500 professionals across multiple industries.",
            icon: <Award className="h-5 w-5 text-white" />,
        },
    ];

    return (
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={{
                        visible: { transition: { staggerChildren: 0.2 } },
                    }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Judul Section */}
                    <motion.div
                        variants={fadeIn}
                        className="flex flex-col md:flex-row md:items-center mb-12 md:mb-16"
                    >
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-5 shadow-lg">
                            <Calendar className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-800 to-blue-500 bg-clip-text text-transparent">
                                Our Journey
                            </h2>
                            <p className="text-gray-600 mt-1 text-lg">
                                From inception to industry leadership
                            </p>
                        </div>
                    </motion.div>

                    {/* Paragraf Deskripsi */}
                    <motion.div
                        variants={fadeIn}
                        className="prose prose-lg max-w-none bg-white rounded-xl p-6 shadow-md mb-12"
                    >
                        <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                            <span className="font-semibold text-blue-800">
                                PT. LNS Indonesia was established on March 15,
                                2010
                            </span>{" "}
                            as an engineering company specializing in Mechanical
                            Services, including maintenance and repair of cracks
                            using the innovative "Metal Stitching Method"
                            technology. Our services are applied across diverse
                            industries including Marine & shipping companies,
                            Cement Plants, and Power Plants.
                        </p>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            As industry needs evolved, PT. LNS Indonesia has
                            transformed into a{" "}
                            <span className="font-semibold text-blue-800">
                                Full Service Company
                            </span>{" "}
                            competent in a wide variety of projects. We focus on
                            coordination and integration of multi-disciplinary
                            teams, involving professional experts who have
                            handled complex, large-scale projects.
                        </p>
                    </motion.div>

                    {/* Timeline */}
                    <motion.div variants={fadeIn}>
                        <h3 className="text-2xl font-bold text-center mb-10 text-gray-800">
                            Our Growth Timeline
                        </h3>
                        <div className="relative mt-8 border-l-2 border-blue-400 pl-8 ml-4 md:ml-6">
                            {timelineItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeIn}
                                    className="mb-12 last:mb-0 relative"
                                >
                                    <div className="absolute -left-10 top-0 bg-blue-600 w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="flex items-center mb-3">
                                            <span className="bg-blue-100 text-blue-800 text-sm font-semibold py-1 px-3 rounded-full">
                                                {item.year}
                                            </span>
                                            <h3 className="text-xl font-bold text-gray-900 ml-3">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <p className="text-gray-700">
                                            {item.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default JourneySection;

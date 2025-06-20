"use client";

import { motion } from "framer-motion";
import {
    Wrench,
    Briefcase,
    Activity,
    Globe,
    Clock,
    Shield,
} from "lucide-react";

// Hapus props 'isInView' dan 'fadeIn'
const ExpertiseSection = () => {
    // Definisikan varian animasi di dalam komponen
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: "easeOut",
            },
        },
    };

    const services = [
        {
            title: "Overhaul Boilers",
            description:
                "Complete maintenance and repair services for industrial boilers to maximize efficiency and extend operational life.",
            icon: <Wrench className="h-8 w-8 text-blue-600" />,
        },
        {
            title: "Cement Plants",
            description:
                "Specialized maintenance solutions for cement manufacturing facilities to ensure continuous production.",
            icon: <Briefcase className="h-8 w-8 text-blue-600" />,
        },
        {
            title: "Oil & Gas Plants",
            description:
                "Comprehensive services for critical equipment in oil and gas processing facilities.",
            icon: <Activity className="h-8 w-8 text-blue-600" />,
        },
        {
            title: "Power Plants",
            description:
                "Maintenance and efficiency improvement services for various types of power generation facilities.",
            icon: <Globe className="h-8 w-8 text-blue-600" />,
        },
        {
            title: "Belt Conveyor Systems",
            description:
                "Installation, repair and maintenance of material handling systems across multiple industries.",
            icon: <Clock className="h-8 w-8 text-blue-600" />,
        },
        {
            title: "Maintenance Management (CMMS)",
            description:
                "Implementation of Computerized Maintenance Management Systems for efficient asset management.",
            icon: <Shield className="h-8 w-8 text-blue-600" />,
        },
    ];

    return (
        <section className="bg-gray-50 py-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <motion.div
                    className="max-w-6xl mx-auto"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.2, // Atur jeda antar animasi anak
                            },
                        },
                    }}
                >
                    <motion.div variants={fadeIn} className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Areas of Expertise
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Our competencies span across diverse industrial
                            sectors, delivering specialized solutions tailored
                            to each client's unique needs
                        </p>
                        <div className="w-24 h-1 bg-blue-600 mx-auto mt-6"></div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                                variants={fadeIn} // Setiap item akan menggunakan varian `fadeIn`
                            >
                                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-5">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600">
                                    {service.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ExpertiseSection;

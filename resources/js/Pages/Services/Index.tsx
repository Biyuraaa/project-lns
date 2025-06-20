"use client";

import { motion } from "framer-motion";
import GuestLayout from "@/Layouts/GuestLayout";
import {
    Wrench,
    Layers3,
    ShieldCheck,
    Replace,
    Sparkles,
    ChevronRight,
    CheckCircle2,
    ArrowRight,
} from "lucide-react";

// Data untuk setiap layanan (tidak ada perubahan di sini)
const services = [
    {
        icon: <Wrench size={32} className="text-blue-600" />,
        title: "Trouble Shooting & Field Engineering",
        description:
            "Expert on-site analysis and solutions to resolve complex engineering challenges efficiently.",
        benefits: [
            "24/7 emergency response",
            "Experienced field engineers",
            "Root cause analysis",
            "Minimal downtime solutions",
        ],
        bgImage: "/images/services/troubleshooting.jpg",
    },
    {
        icon: <Layers3 size={32} className="text-blue-600" />,
        title: "Pressure Part & Fabrication Services",
        description:
            "High-precision fabrication of pressure parts and components, adhering to the strictest industry standards.",
        benefits: [
            "ISO certified processes",
            "Custom fabrication",
            "High-pressure testing",
            "Quality materials",
        ],
        bgImage: "/images/services/fabrication.jpg",
    },
    {
        icon: <ShieldCheck size={32} className="text-blue-600" />,
        title: "Repair & Maintenance Service",
        description:
            "Comprehensive repair and preventive maintenance to ensure equipment longevity and optimal performance.",
        benefits: [
            "Preventive maintenance plans",
            "Extended equipment life",
            "Performance optimization",
            "Cost-effective solutions",
        ],
        bgImage: "/images/services/maintenance.jpg",
    },
    {
        icon: <Replace size={32} className="text-blue-600" />,
        title: "High Quality Bending Tubes",
        description:
            "Advanced tube bending services for various industrial applications, ensuring precision and durability.",
        benefits: [
            "Precise tolerances",
            "Multiple materials available",
            "Custom specifications",
            "Rapid turnaround times",
        ],
        bgImage: "/images/services/tubes.jpg",
    },
    {
        icon: <Sparkles size={32} className="text-blue-600" />,
        title: "Special Repair",
        description:
            "Customized repair solutions for unique and non-standard equipment, utilizing innovative techniques.",
        benefits: [
            "Specialized expertise",
            "Innovative repair methods",
            "Hard-to-find parts",
            "Legacy equipment support",
        ],
        bgImage: "/images/services/special-repair.jpg",
    },
];

const ServicesPage = () => {
    // Varian animasi (tidak ada perubahan)
    const fadeIn = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number = 0) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: "easeOut",
                delay: i * 0.1,
            },
        }),
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    return (
        <GuestLayout fullWidth>
            {/* Hero Section */}
            <motion.section
                className="relative h-[60vh] min-h-[450px] bg-gradient-to-br from-blue-900 via-blue-800 to-sky-700 text-white overflow-hidden flex items-center"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h1
                        className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
                        variants={fadeIn}
                    >
                        Our Services
                    </motion.h1>
                    <motion.p
                        className="text-xl text-sky-100 max-w-3xl mx-auto"
                        custom={1}
                        variants={fadeIn}
                    >
                        In partnership with our customers, we have established
                        operations, maintenance, and services agreements that
                        truly create value and quantifiable results.
                    </motion.p>
                </div>
            </motion.section>

            {/* Enhanced Services Grid Section */}
            <section id="services" className="py-20 md:py-28 bg-gray-50">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={staggerContainer}
                    >
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                className="group bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                                variants={fadeIn}
                            >
                                <div className="p-8 flex-grow flex flex-col">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-5 shadow-sm group-hover:bg-blue-200 transition-colors">
                                        {service.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        {service.title}
                                    </h3>
                                    <p className="text-gray-600 mb-5">
                                        {service.description}
                                    </p>

                                    {/* Key Benefits selalu ditampilkan */}
                                    <div className="space-y-3 mt-auto pt-5 border-t border-gray-100">
                                        <h4 className="font-semibold text-gray-800">
                                            Key Benefits:
                                        </h4>
                                        <ul className="space-y-2">
                                            {service.benefits.map(
                                                (benefit, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-start"
                                                    >
                                                        <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                                        <span className="text-gray-600">
                                                            {benefit}
                                                        </span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <motion.div
                        className="max-w-4xl mx-auto text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        variants={fadeIn}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Ready to work with professionals?
                        </h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Our team is ready to help you with your engineering
                            needs. Contact us today to discuss how we can
                            support your project.
                        </p>
                        <a
                            href="/contact"
                            className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
                        >
                            Get in Touch
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </a>
                    </motion.div>
                </div>
            </section>
        </GuestLayout>
    );
};

export default ServicesPage;

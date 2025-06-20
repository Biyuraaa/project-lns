"use client";
import { motion } from "framer-motion";
import { Calendar, Users, MapPin } from "lucide-react";

const HeroSection = () => {
    return (
        <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white py-24 md:py-32 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20"></div>
                <div className="absolute top-60 right-20 w-40 h-40 bg-blue-400 rounded-full opacity-20"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500 rounded-full opacity-20"></div>
            </div>
            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h1
                        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        About PT LNS Indonesia
                    </motion.h1>
                    <motion.p
                        className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        A leading engineering company delivering innovative
                        mechanical services and solutions since 2010
                    </motion.p>
                    <motion.div
                        className="flex flex-wrap justify-center gap-4 mt-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-lg">
                            <div className="flex items-center">
                                <Calendar className="h-6 w-6 mr-3 text-blue-300" />
                                <span>Founded in 2010</span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-lg">
                            <div className="flex items-center">
                                <Users className="h-6 w-6 mr-3 text-blue-300" />
                                <span>201-500 Employees</span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-lg">
                            <div className="flex items-center">
                                <MapPin className="h-6 w-6 mr-3 text-blue-300" />
                                <span>HQ in Surabaya</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;

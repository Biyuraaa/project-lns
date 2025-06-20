"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Globe } from "lucide-react";

const ContactSection = () => {
    const address =
        "Blk. B, Margomulyo Jaya, Jl. Sentong Asri No.22, Bibis, Kec. Tandes, Surabaya, Jawa Timur 60186, Indonesia";
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(
        address
    )}`;

    return (
        <section className="bg-blue-900 text-white py-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-800 rounded-full opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-700 rounded-full opacity-50"></div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                <motion.div
                    className="max-w-6xl mx-auto"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.8 },
                        },
                    }}
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Get In Touch
                        </h2>
                        <p className="text-blue-100 max-w-2xl mx-auto text-lg">
                            Visit our office, give us a call, or send an email
                            to learn more about our services
                        </p>
                        <div className="w-24 h-1 bg-blue-300 mx-auto mt-6"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Location Card */}
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <MapPin className="h-6 w-6 text-blue-300 mr-3" />
                                <h3 className="text-xl font-semibold">
                                    Our Location
                                </h3>
                            </div>
                            <p className="text-blue-50 mb-3">{address}</p>
                            <a
                                href={gmapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-blue-300 hover:text-white transition-colors"
                            >
                                Get Directions →
                            </a>
                        </div>

                        {/* Contact Us Card */}
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <Phone className="h-6 w-6 text-blue-300 mr-3" />
                                <h3 className="text-xl font-semibold">
                                    Contact Us
                                </h3>
                            </div>
                            <div className="space-y-3 text-blue-50">
                                <p>
                                    <strong className="text-white">
                                        Phone:
                                    </strong>
                                    <br /> +62 31 7482969
                                </p>
                                <p>
                                    <strong className="text-white">
                                        Email:
                                    </strong>
                                    <br /> info@lnsindonesia.co.id
                                </p>
                            </div>
                        </div>

                        {/* Online Presence Card */}
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <Globe className="h-6 w-6 text-blue-300 mr-3" />
                                <h3 className="text-xl font-semibold">
                                    Online Presence
                                </h3>
                            </div>
                            <a
                                href="https://lnsindonesia.co.id/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-blue-300 hover:text-white transition-colors"
                            >
                                www.lnsindonesia.co.id →
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ContactSection;

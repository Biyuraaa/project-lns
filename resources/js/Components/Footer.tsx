import { Link } from "@inertiajs/react";
import {
    Linkedin,
    Facebook,
    Twitter,
    Instagram,
    Phone,
    Mail,
    MapPin,
    ArrowRight,
    Clock,
} from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-blue-900 to-blue-950 text-white">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Newsletter Section */}
                <div className="py-10 border-b border-blue-800/50">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">
                                Stay Updated
                            </h3>
                            <p className="text-blue-200">
                                Subscribe to our newsletter for the latest
                                industry news and updates.
                            </p>
                        </div>
                        <div>
                            <form className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="flex-grow px-4 py-3 rounded-md bg-blue-800/30 border border-blue-700 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    Subscribe <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-10 w-10 rounded-md bg-white flex items-center justify-center text-blue-900 font-bold text-xl">
                                LNS
                            </div>
                            <span className="text-white font-bold text-xl">
                                PT. LNS Indonesia
                            </span>
                        </div>
                        <p className="mb-6 text-blue-200 leading-relaxed">
                            Engineering company specializing in mechanical
                            services, maintenance, and repair using "Metal
                            Stitching Method" technology.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full bg-blue-800/30 flex items-center justify-center hover:bg-blue-700 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full bg-blue-800/30 flex items-center justify-center hover:bg-blue-700 transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full bg-blue-800/30 flex items-center justify-center hover:bg-blue-700 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full bg-blue-800/30 flex items-center justify-center hover:bg-blue-700 transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-blue-500 pb-3">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {[
                                "Home",
                                "About Us",
                                "Services",
                                "Projects",
                                "Contact Us",
                            ].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={`/${
                                            item === "Home"
                                                ? ""
                                                : item
                                                      .toLowerCase()
                                                      .replace(" ", "-")
                                        }`}
                                        className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                                    >
                                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                        <span>{item}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-blue-500 pb-3">
                            Our Services
                        </h3>
                        <ul className="space-y-3">
                            {[
                                "Metal Stitching Repair",
                                "Equipment Maintenance",
                                "Mechanical Engineering",
                                "On-site Services",
                                "Emergency Repairs",
                            ].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={`/services#${item
                                            .toLowerCase()
                                            .replace(/\s+/g, "-")}`}
                                        className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                                    >
                                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                        <span>{item}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-blue-500 pb-3">
                            Contact Us
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                                <span className="text-blue-200">
                                    Jl. Example Street No. 123, Jakarta,
                                    Indonesia
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                <a
                                    href="tel:+6221123456789"
                                    className="text-blue-200 hover:text-white transition-colors"
                                >
                                    +62 21 1234 5678
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                <a
                                    href="mailto:info@lnsindonesia.com"
                                    className="text-blue-200 hover:text-white transition-colors"
                                >
                                    info@lnsindonesia.com
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                <span className="text-blue-200">
                                    Mon - Fri: 8:00 AM - 5:00 PM
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-blue-800/50 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-blue-300 text-sm">
                            &copy; {currentYear} PT. LNS Indonesia. All Rights
                            Reserved.
                        </p>
                        <div className="flex gap-6 text-sm text-blue-300">
                            <a
                                href="/privacy-policy"
                                className="hover:text-white transition-colors"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="/terms-of-service"
                                className="hover:text-white transition-colors"
                            >
                                Terms of Service
                            </a>
                            <a
                                href="/sitemap"
                                className="hover:text-white transition-colors"
                            >
                                Sitemap
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

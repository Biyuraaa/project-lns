"use client";

import React, { useEffect } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { motion } from "framer-motion";
import Hero from "./Hero";
import About from "./About";
import AOS from "aos";
import Services from "./Services";

const Welcome = () => {
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });
    }, []);

    return (
        <GuestLayout fullWidth={true}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Hero />
                <About />
                <Services />
            </motion.div>
        </GuestLayout>
    );
};

export default Welcome;

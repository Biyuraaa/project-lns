"use client";

import { useRef, useEffect, useState, lazy, Suspense } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { motion } from "framer-motion";
import LoadingSpinner from "@/Components/ui/loading-spinner";

// 1. Perbaiki typo pada nama komponen dan path import
const VisionMissionSection = lazy(() => import("./Partials/VisionMission"));
const ContactSection = lazy(() => import("./Partials/Contact"));
const ExpertiseSection = lazy(() => import("./Partials/Expertise"));
const HeroSection = lazy(() => import("./Partials/Hero"));
const JourneySection = lazy(() => import("./Partials/Journey"));
const QualityStandardsSection = lazy(
    () => import("./Partials/QualityStandards")
);

const AboutPage = () => {
    const [activeSection, setActiveSection] = useState<string>("hero");
    const [scrollProgress, setScrollProgress] = useState<number>(0);

    const sections = [
        {
            id: "hero",
            ref: useRef<HTMLDivElement>(null),
            label: "Home",
            Component: HeroSection,
        },
        {
            id: "journey",
            ref: useRef<HTMLDivElement>(null),
            label: "Our Journey",
            Component: JourneySection,
        },
        {
            id: "expertise",
            ref: useRef<HTMLDivElement>(null),
            label: "Expertise",
            Component: ExpertiseSection,
        },
        {
            id: "vision",
            ref: useRef<HTMLDivElement>(null),
            label: "Vision & Mission",
            Component: VisionMissionSection,
        },
        {
            id: "quality",
            ref: useRef<HTMLDivElement>(null),
            label: "Quality Standards",
            Component: QualityStandardsSection,
        },
        {
            id: "contact",
            ref: useRef<HTMLDivElement>(null),
            label: "Contact Us",
            Component: ContactSection,
        },
    ];

    // 3. useEffect yang lebih efisien untuk memantau scroll
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            setScrollProgress(scrollPercent);
            let currentSection = "";
            sections.forEach((section) => {
                const sectionTop = section.ref.current?.offsetTop ?? 0;
                if (scrollTop >= sectionTop - window.innerHeight / 3) {
                    currentSection = section.id;
                }
            });

            if (activeSection !== currentSection) {
                setActiveSection(currentSection);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [activeSection, sections]);

    const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return (
        <GuestLayout fullWidth={true}>
            {/* Progress bar and Navigation dots */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
                style={{ scaleX: scrollProgress / 100 }}
            />
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:block">
                <ul className="flex flex-col gap-4">
                    {sections.map((section) => (
                        <li key={section.id}>
                            <button
                                onClick={() => scrollToSection(section.ref)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 hover:bg-primary ${
                                    activeSection === section.id
                                        ? "bg-primary scale-125"
                                        : "bg-gray-300"
                                }`}
                                aria-label={section.label}
                                title={section.label}
                            />
                        </li>
                    ))}
                </ul>
            </div>

            {/* Render semua section dengan Suspense */}
            <Suspense fallback={<LoadingSpinner />}>
                {sections.map(({ id, ref, Component }) => (
                    <div key={id} ref={ref} className="section">
                        <Component />
                    </div>
                ))}
            </Suspense>
        </GuestLayout>
    );
};

export default AboutPage;

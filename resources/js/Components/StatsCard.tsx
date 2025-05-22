"use client";

import type React from "react";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: number;
    description?: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    trend: number;
    isPositiveBetter?: boolean;
    highlighted?: boolean;
    altText?: string;
}

const StatsCard = ({
    title,
    value,
    description,
    icon,
    iconBg,
    iconColor,
    trend,
    isPositiveBetter = true,
    highlighted = false,
    altText,
}: StatsCardProps) => {
    // Determine if trend is considered positive based on the isPositiveBetter flag
    const isPositive = isPositiveBetter ? trend >= 0 : trend < 0;

    // Select description based on trend
    const trendText = trend >= 0 ? "Naik" : "Turun";
    const displayDescription =
        description || `${trendText} ${Math.abs(trend)}% dari bulan lalu`;

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.4, ease: "easeOut" },
                },
            }}
            whileHover={{ scale: 1.03 }}
            className="h-full"
        >
            <Card
                className={cn(
                    "relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group h-full",
                    highlighted && "ring-2 ring-blue-500/20"
                )}
            >
                {/* Background gradient effect */}
                <div
                    className={cn(
                        "absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity",
                        isPositive
                            ? "bg-gradient-to-br from-emerald-400 to-blue-500"
                            : "bg-gradient-to-br from-red-400 to-orange-500"
                    )}
                />

                {/* Highlight border for special items */}
                {highlighted && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
                )}

                {/* Content */}
                <div className="relative p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-3 rounded-xl", iconBg)}>
                            <div className={iconColor}>{icon}</div>
                        </div>
                        <div
                            className={cn(
                                "flex items-center text-sm font-medium",
                                isPositive ? "text-green-600" : "text-red-600"
                            )}
                        >
                            {isPositive ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                            ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                            )}
                            {Math.abs(trend)}%
                        </div>
                    </div>

                    <div className="space-y-2 flex-grow">
                        <h3 className="text-sm font-medium text-gray-600">
                            {title}
                        </h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {value.toLocaleString()}
                        </p>
                    </div>

                    {/* Fixed height container for description */}
                    <div className="h-10 mt-2 flex items-center">
                        <p
                            className={cn(
                                "text-xs line-clamp-2",
                                altText
                                    ? "text-red-500 font-medium"
                                    : "text-gray-500"
                            )}
                        >
                            {altText || displayDescription}
                        </p>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default StatsCard;

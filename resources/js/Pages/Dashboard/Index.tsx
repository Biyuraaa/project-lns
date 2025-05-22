"use client";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import type {
    BusinessUnit,
    CompanyGrowthData,
    PageProps,
    TopCustomerData,
} from "@/types";
import {
    FileText,
    FileCheck,
    ClipboardList,
    Clock,
    User,
    Calendar,
    BarChart2,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import StatsCard from "@/Components/StatsCard";
import { motion } from "framer-motion";
import DashboardCharts from "@/Components/DashboardChart";

interface Statistics {
    inquiries: {
        count: number;
        growth: number;
        insight: string;
    };
    activeQuotations: {
        count: number;
        growth: number;
        insight: string;
    };
    purchaseOrders: {
        count: number;
        growth: number;
        insight: string;
    };
    expiredQuotations: {
        count: number;
        growth: number;
        insight: string;
    };
}

interface ChartData {
    companyGrowthData: CompanyGrowthData[];
    topCustomersData: TopCustomerData[];
    businessUnits: BusinessUnit[];
    totalPOCount: number;
    totalPOValue: number;
    selectedBusinessUnit?: string;
}

interface DashboardProps extends PageProps {
    statistics: Statistics;
    chartData: ChartData;
}

const DashboardIndex = () => {
    const { statistics, chartData, auth } = usePage<DashboardProps>().props;
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Helper function to get greeting based on time of day
    const getGreeting = () => {
        const hour = currentDate.getHours();
        if (hour < 12) return "Selamat Pagi";
        if (hour < 17) return "Selamat Siang";
        return "Selamat Malam";
    };

    // Animation variants for staggered children
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Dashboard Header Section */}
            <div className="relative overflow-hidden">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Welcome Section */}
                    <div className="mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="flex flex-col md:flex-row md:items-center md:justify-between"
                        >
                            <div className="mb-6 md:mb-0">
                                <div className="flex items-center mb-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-amber-200 rounded-xl blur-lg opacity-60"></div>
                                        <div className="relative bg-gradient-to-r from-amber-100 to-amber-50 p-3 rounded-xl shadow-lg border border-amber-200">
                                            <User className="h-6 w-6 text-amber-700" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                            {getGreeting()}, {auth.user.name}!
                                        </h1>
                                        <div className="flex items-center mt-2 text-gray-600">
                                            <Calendar className="h-4 w-4 mr-2 text-amber-600" />
                                            <span className="font-medium">
                                                {formattedDate}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Stats Section */}
                    <div className="mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mb-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg mr-3">
                                        <BarChart2 className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Statistik Bulan Ini
                                        </h2>
                                        <p className="text-gray-600 text-sm">
                                            Ringkasan performa bisnis Anda
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                        <span>Pertumbuhan Positif</span>
                                    </div>
                                    <div className="flex items-center">
                                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                        <span>Perlu Perhatian</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            <StatsCard
                                title="Total Inquiries"
                                value={statistics.inquiries.count}
                                icon={<FileText className="w-6 h-6" />}
                                iconBg="bg-blue-100"
                                iconColor="text-blue-600"
                                trend={statistics.inquiries.growth}
                                description={statistics.inquiries.insight}
                                isPositiveBetter={true}
                            />

                            <StatsCard
                                title="Active Quotations"
                                value={statistics.activeQuotations.count}
                                icon={<FileCheck className="w-6 h-6" />}
                                iconBg="bg-purple-100"
                                iconColor="text-purple-600"
                                trend={statistics.activeQuotations.growth}
                                description={
                                    statistics.activeQuotations.insight
                                }
                                isPositiveBetter={true}
                            />

                            <StatsCard
                                title="Purchase Orders"
                                value={statistics.purchaseOrders.count}
                                icon={<ClipboardList className="w-6 h-6" />}
                                iconBg="bg-amber-200"
                                iconColor="text-amber-700"
                                trend={statistics.purchaseOrders.growth}
                                description={statistics.purchaseOrders.insight}
                                isPositiveBetter={true}
                            />

                            <StatsCard
                                title="Expired Quotations"
                                value={statistics.expiredQuotations.count}
                                icon={<Clock className="w-6 h-6" />}
                                iconBg="bg-red-100"
                                iconColor="text-red-600"
                                trend={statistics.expiredQuotations.growth}
                                description={
                                    statistics.expiredQuotations.insight
                                }
                                isPositiveBetter={false}
                            />
                        </motion.div>
                    </div>

                    {/* Charts Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-12"
                    >
                        <DashboardCharts
                            companyGrowthData={chartData.companyGrowthData}
                            businessUnits={chartData.businessUnits}
                            topCustomersData={chartData.topCustomersData}
                            totalPOCount={chartData.totalPOCount}
                            totalPOValue={chartData.totalPOValue}
                        />
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default DashboardIndex;

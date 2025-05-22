"use client";

import { useState } from "react";
import { CompanyGrowthChart } from "./ComponyGrowthChart";

interface CompanyGrowthData {
    month: string;
    inquiry: number;
    quotation: number;
    po: number;
    target: number;
    business_unit_id: string;
}

interface BusinessUnit {
    id: number | string;
    name: string;
}

interface CustomerData {
    name: string;
    value: number;
    poCount: number;
    business_unit_id: string;
}

interface DashboardChartsProps {
    companyGrowthData: CompanyGrowthData[];
    businessUnits: BusinessUnit[];
    topCustomersData: CustomerData[];
    totalPOCount: number;
    totalPOValue: number;
}

const DashboardCharts = ({
    companyGrowthData,
    businessUnits,
    topCustomersData,
    totalPOCount,
    totalPOValue,
}: DashboardChartsProps) => {
    // Use client-side state for filtering
    const [selectedBusinessUnit, setSelectedBusinessUnit] =
        useState<string>("all");

    const handleBusinessUnitChange = (businessUnitId: string) => {
        setSelectedBusinessUnit(businessUnitId);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CompanyGrowthChart
                    data={companyGrowthData}
                    businessUnits={businessUnits}
                    selectedBusinessUnit={selectedBusinessUnit}
                    onBusinessUnitChange={handleBusinessUnitChange}
                />
            </div>
        </div>
    );
};

export default DashboardCharts;

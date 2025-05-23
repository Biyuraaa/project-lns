"use client";

import { useState } from "react";
import { CompanyGrowthChart } from "./ComponyGrowthChart";
import { TopCustomerChart } from "./TopCustomerChart";
import {
    BusinessUnit,
    CompanyGrowthData,
    CompanyGrowthSelling,
    TopCustomerData,
} from "@/types";
import { CompanyGrowthSellingChart } from "./CompanyGrowthSellingChart";

interface DashboardChartsProps {
    companyGrowthData: CompanyGrowthData[];
    businessUnits: BusinessUnit[];
    topCustomersData: TopCustomerData[];
    companyGrowthSellingData: CompanyGrowthSelling[];
    totalPOCount: number;
    totalPOValue: number;
}

const DashboardCharts = ({
    companyGrowthData,
    companyGrowthSellingData,
    businessUnits,
    topCustomersData,
    totalPOCount,
    totalPOValue,
}: DashboardChartsProps) => {
    // Use separate state for each chart's filter
    const [growthChartBusinessUnit, setGrowthChartBusinessUnit] =
        useState<string>("all");
    const [customerChartBusinessUnit, setTopCustomerChartBusinessUnit] =
        useState<string>("all");

    // Separate handler functions for each chart
    const handleGrowthChartBusinessUnitChange = (businessUnitId: string) => {
        setGrowthChartBusinessUnit(businessUnitId);
    };

    const handleTopCustomerChartBusinessUnitChange = (
        businessUnitId: string
    ) => {
        setTopCustomerChartBusinessUnit(businessUnitId);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CompanyGrowthChart
                    data={companyGrowthData}
                    businessUnits={businessUnits}
                    selectedBusinessUnit={growthChartBusinessUnit}
                    onBusinessUnitChange={handleGrowthChartBusinessUnitChange}
                />
                <TopCustomerChart
                    data={topCustomersData}
                    businessUnits={businessUnits}
                    selectedBusinessUnit={customerChartBusinessUnit}
                    onBusinessUnitChange={
                        handleTopCustomerChartBusinessUnitChange
                    }
                    totalPOValue={totalPOValue}
                    totalPOCount={totalPOCount}
                />
            </div>

            <div>
                <CompanyGrowthSellingChart data={companyGrowthSellingData} />
            </div>

            
        </div>
    );
};

export default DashboardCharts;

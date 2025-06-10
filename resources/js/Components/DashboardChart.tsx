"use client";

import { useState } from "react";
import { CompanyGrowthChart } from "./Chart/ComponyGrowthChart";
import { TopCustomerChart } from "./Chart/TopCustomerChart";
import {
    BusinessUnit,
    CompanyGrowthData,
    CompanyGrowthSellingCumulativeData,
    CompanyGrowthSellingData,
    PurchaseOrderStatusData,
    QuotationAmountData,
    TopCustomerData,
    TotalValueCardData,
} from "@/types";
import { CompanyGrowthSellingChart } from "./Chart/CompanyGrowthSellingChart";
import { PurchaseOrderStatusChart } from "./Chart/PurchaseOrderStatusChart";
import { TotalValueCard } from "./Chart/TotalValueCard";
import { CumulativeCompanyGrowthSellingChart } from "./Chart/CumulativeCompanyGrowthChart";
import QuotationAmountChart from "./Chart/QuotationAmountChart";

interface DashboardChartsProps {
    companyGrowthData: CompanyGrowthData[];
    companyGrowthSellingCumulativeData: CompanyGrowthSellingCumulativeData[];
    businessUnits: BusinessUnit[];
    topCustomersData: TopCustomerData[];
    companyGrowthSellingData: CompanyGrowthSellingData[];
    quotationAmountData: QuotationAmountData[];
    totalValueCardData: TotalValueCardData;
    purchaseOrderStatusData: PurchaseOrderStatusData[];
}

const DashboardCharts = ({
    companyGrowthData,
    companyGrowthSellingData,
    companyGrowthSellingCumulativeData,
    businessUnits,
    quotationAmountData,
    topCustomersData,
    totalValueCardData,
    purchaseOrderStatusData,
}: DashboardChartsProps) => {
    const [growthChartBusinessUnit, setGrowthChartBusinessUnit] =
        useState<string>("all");
    const [customerChartBusinessUnit, setCustomerChartBusinessUnit] =
        useState<string>("all");

    const handleGrowthChartBusinessUnitChange = (businessUnitId: string) => {
        setGrowthChartBusinessUnit(businessUnitId);
    };

    const handleTopCustomerChartBusinessUnitChange = (
        businessUnitId: string
    ) => {
        setCustomerChartBusinessUnit(businessUnitId);
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
                />
            </div>

            <QuotationAmountChart
                data={quotationAmountData}
                businessUnits={businessUnits}
            />

            <CompanyGrowthSellingChart
                data={companyGrowthSellingData}
                businessUnits={businessUnits}
            />

            <CumulativeCompanyGrowthSellingChart
                data={companyGrowthSellingCumulativeData}
                businessUnits={businessUnits}
                className="h-full"
            />

            <TotalValueCard
                data={totalValueCardData}
                businessUnits={businessUnits}
            />
            <PurchaseOrderStatusChart
                data={purchaseOrderStatusData}
                businessUnits={businessUnits}
            />
        </div>
    );
};

export default DashboardCharts;

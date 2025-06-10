"use client";

import { useState } from "react";
import { CompanyGrowthChart } from "./Chart/ComponyGrowthChart";
import { TopCustomerChart } from "./Chart/TopCustomerChart";
import {
    BusinessUnit,
    CompanyGrowthData,
    CompanyGrowthSellingData,
    QuotationAmountData,
    TopCustomerData,
} from "@/types";
import { CompanyGrowthSellingChart } from "./Chart/CompanyGrowthSellingChart";
import { PurchaseOrderStatusChart } from "./Chart/PurchaseOrderStatusChart";
import { TotalValueCard } from "./Chart/TotalValueCard";
import { CumulativeCompanyGrowthSellingChart } from "./Chart/CumulativeCompanyGrowthChart";
import QuotationAmountChart from "./Chart/QuotationAmountChart";

interface DashboardChartsProps {
    companyGrowthData: CompanyGrowthData[];
    cumulativeCompanyGrowthSellingData: any[];
    businessUnits: BusinessUnit[];
    topCustomersData: TopCustomerData[];
    companyGrowthSellingData: CompanyGrowthSellingData[];
    quotationAmountData: QuotationAmountData[];
    purchaseOrderDetails: {
        id: number;
        amount: number;
        status: string;
        business_unit_id: number | string;
        created_at: string;
        month: number;
        year: number;
    }[];
    totalPOCount: number;
    totalPOValue: number;
}

const DashboardCharts = ({
    companyGrowthData,
    companyGrowthSellingData,
    cumulativeCompanyGrowthSellingData,
    businessUnits,
    quotationAmountData,
    topCustomersData,
    totalPOCount,
    totalPOValue,
    purchaseOrderDetails,
}: DashboardChartsProps) => {
    const [growthChartBusinessUnit, setGrowthChartBusinessUnit] =
        useState<string>("all");
    const [customerChartBusinessUnit, setCustomerChartBusinessUnit] =
        useState<string>("all");

    // Separate handler functions for each chart
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
                    totalPOValue={totalPOValue}
                    totalPOCount={totalPOCount}
                />
            </div>

            <QuotationAmountChart
                quotations={quotationAmountData}
                businessUnits={businessUnits}
            />

            <CompanyGrowthSellingChart
                data={companyGrowthSellingData}
                businessUnits={businessUnits}
            />

            <CumulativeCompanyGrowthSellingChart
                data={cumulativeCompanyGrowthSellingData}
                businessUnits={businessUnits}
                className="h-full"
            />

            <TotalValueCard
                purchaseOrders={purchaseOrderDetails}
                businessUnits={businessUnits}
            />
            <PurchaseOrderStatusChart
                purchaseOrders={purchaseOrderDetails}
                businessUnits={businessUnits}
            />
        </div>
    );
};

export default DashboardCharts;

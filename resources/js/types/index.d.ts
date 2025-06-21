export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    permissions: string[];
    roles: string[];
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    inquiries: Inquiry[];
    created_at?: string;
    updated_at?: string;
}

export interface Sales {
    id: number;
    name: string;
    email: string;
    address: string;
    phone: string;
    status: string;
    image: string;
    inquiries: Inquiry[];
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PicEngineer {
    id: number;
    name: string;
    email: string;
    address: string;
    phone: string;
    status: string;
    image: string;
    inquiries: Inquiry[];
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CompanyGrowthSelling {
    id: number;
    month: number;
    year: number;
    target: number;
    actual: number;
    difference: number;
    percentage: number;
    business_unit: BusinessUnit;
    created_at?: string;
    updated_at?: string;
}

export interface Inquiry {
    id: number;
    code: string;
    description: string;
    inquiry_date: string;
    due_date: string;
    file: string;
    status: string;
    created_at?: string;
    updated_at?: string;
    customer: Customer;
    pic_engineer: PicEngineer;
    sales: Sales;
    quotation: Quotation;
    business_unit: BusinessUnit;
    endUsers: EndUser[];
}

export interface EndUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    created_at?: string;
    updated_at?: string;
    inquiries: Inquiry;
}

export interface BusinessUnit {
    id: number;
    name: string;
    description?: string;
    inquiries: Inquiry[];
    companyGrowthSellings: CompanyGrowthSelling[];
    created_at?: string;
    updated_at?: string;
}

export interface Quotation {
    id: number;
    code: string;
    inquiry: Inquiry;
    status: string;
    file: string;
    due_date: string;
    amount: number;
    negotiations: Negotiation[];
    created_at?: string;
    updated_at?: string;
}

export interface Negotiation {
    id: number;
    quotation: Quotation;
    file: string;
    amount: number;
    created_at?: string;
    updated_at?: string;
}
export interface PurchaseOrder {
    id: number;
    code: string;
    quotation: Quotation;
    status: string;
    amount: number;
    contract_number: string;
    date: string;
    job_number: string;
    file: string;
    created_at?: string;
    updated_at?: string;
}

export interface CompanyGrowthData {
    month: string;
    month_year?: string;
    year: string;
    inquiry: number;
    quotation: number;
    po: number;
    target: number;
    business_unit_id: string;
}

export interface TopCustomerData {
    name: string;
    value: number;
    poCount: number;
    business_unit_id: string;
}

export interface QuotationAmountData {
    id: number;
    amount: number;
    business_unit_id: number | string;
    status: string;
    created_at: string;
    month: number;
    year: number;
}

export interface CompanyGrowthSellingData {
    id: number;
    month: number;
    year: number;
    month_name: string;
    target: number;
    actual: number;
    difference: number;
    business_unit: {
        id: number | string;
        name: string;
    };
}

export interface CompanyGrowthSellingCumulativeData {
    month: number;
    year: number;
    month_name: string;
    target: number;
    actual: number;
    difference: number;
    percentage: number;
    cumulative_target: number;
    cumulative_actual: number;
    cumulative_difference: number;
    cumulative_percentage: number;
    business_unit: {
        id: string | number;
        name: string;
    };
}

export interface PurchaseOrderStatusData {
    id: number;
    amount: number;
    raw_amount: number;
    formatted_amount: string;
    status: string;
    business_unit_id: number | string;
    created_at: string;
    month: number;
    year: number;
}

export interface TotalValueData {
    count: number;
    value: number;
    formatted_value: string;
}

interface PeriodData {
    period: string;
    year: number;
    month: number;
    businessUnitId?: string | number;
    po: TotalValueData;
    quotation: TotalValueData;
}

export interface TotalValueCardData {
    all: {
        po: TotalValueData;
        quotation: TotalValueData;
    };
    periods: PeriodData[];
    [businessUnitId: string]: {
        po: TotalValueData;
        quotation: TotalValueData;
    };
}

export interface DueDateQuotationData {
    id: number;
    code: string;
    due_date: string;
    days_remaining: number;
    status: string;
    created_at: string;
    inquiry: {
        id: number;
        code: string;
        description: string;
        business_unit: {
            id: number | null;
            name: string;
        };
    };
    customer: {
        id: number | null;
        name: string;
    };
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
};

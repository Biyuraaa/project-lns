export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
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

export interface Inquiry {
    id: number;
    code: string;
    customer: Customer;
    pic_engineer: PicEngineer;
    sales: Sales;
    quotation: Quotation;
    description: string;
    business_unit: BusinessUnit;
    inquiry_date: string;
    end_user_name: string;
    end_user_email: string;
    end_user_phone: string;
    end_user_address: string;
    file: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface BusinessUnit {
    id: number;
    name: string;
    description?: string;
    inquiries: Inquiry[];
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

interface CompanyGrowthData {
    month: string;
    inquiry: number;
    quotation: number;
    po: number;
    target: number;
    business_unit_id: string;
}

interface TopCustomerData {
    name: string;
    value: number;
    poCount: number;
    business_unit_id: string;
}

interface CompanyGrowthSelling {
    id: number;
    month: number;
    year: number;
    target: number;
    actual: number;
    difference: number;
    percentage: number;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
};

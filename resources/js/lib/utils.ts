import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
export const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    // Parse the ISO date string and format it as YYYY-MM-DD for the input
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
};

export const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatIDRInput = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

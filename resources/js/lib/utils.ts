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

export const formatCurrency = (value: number): string => {
    return value.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    });
};

export const formatIDRInput = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
        Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
};

// Add these functions after the existing file handling functions
export const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("border-blue-400", "bg-blue-50");
};

export const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
};

export const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
};

export function formatValue(value: number) {
    return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function getValueUnit(value: number) {
    if (value >= 1000000000) {
        return "Billion";
    } else if (value >= 1000000) {
        return "Million";
    } else if (value >= 1000) {
        return "Thousand";
    }
    return "";
}

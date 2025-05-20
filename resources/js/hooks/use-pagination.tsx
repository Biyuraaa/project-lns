"use client";

import { useState } from "react";

interface UsePaginationProps {
    totalItems: number;
    initialPage?: number;
    itemsPerPage?: number;
}

export function usePagination({
    totalItems,
    initialPage = 1,
    itemsPerPage = 10,
}: UsePaginationProps) {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Ensure current page is within valid range
    if (currentPage < 1) {
        setCurrentPage(1);
    } else if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }

    // Calculate start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);

    // Get paginated data from the original array
    const paginateData = <T,>(data: T[]): T[] => {
        return data.slice(startIndex, endIndex + 1);
    };

    // Navigation functions
    const goToPage = (page: number) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToFirstPage = () => {
        setCurrentPage(1);
    };

    const goToLastPage = () => {
        setCurrentPage(totalPages);
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if there are fewer than maxPagesToShow
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show first page
            pageNumbers.push(1);

            // Calculate start and end of page numbers to show
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Adjust if we're near the beginning
            if (currentPage <= 3) {
                end = Math.min(totalPages - 1, 4);
            }

            // Adjust if we're near the end
            if (currentPage >= totalPages - 2) {
                start = Math.max(2, totalPages - 3);
            }

            // Add ellipsis after first page if needed
            if (start > 2) {
                pageNumbers.push("...");
            }

            // Add middle pages
            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }

            // Add ellipsis before last page if needed
            if (end < totalPages - 1) {
                pageNumbers.push("...");
            }

            // Always show last page
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    return {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        paginateData,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        goToFirstPage,
        goToLastPage,
        getPageNumbers,
        itemsPerPage,
    };
}

"use client";

import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { Button } from "@/Components/ui/button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    getPageNumbers: () => (number | string)[];
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    startIndex,
    endIndex,
    getPageNumbers,
}: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{endIndex + 1}</span> of{" "}
                <span className="font-medium">{totalItems}</span> results
            </div>

            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                    aria-label="First page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center">
                    {pageNumbers.map((page, index) =>
                        typeof page === "number" ? (
                            <Button
                                key={index}
                                variant={
                                    currentPage === page ? "default" : "outline"
                                }
                                size="icon"
                                onClick={() => onPageChange(page)}
                                className="h-8 w-8"
                                aria-label={`Page ${page}`}
                                aria-current={
                                    currentPage === page ? "page" : undefined
                                }
                            >
                                {page}
                            </Button>
                        ) : (
                            <span key={index} className="px-2">
                                {page}
                            </span>
                        )
                    )}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8"
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8"
                    aria-label="Last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

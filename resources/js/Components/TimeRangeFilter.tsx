import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";
import {
    CalendarDays,
    Clock,
    Calendar,
    CalendarRange,
    ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { Badge } from "@/Components/ui/badge";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/Components/ui/calendar";

interface TimeRangeFilterProps {
    selectedRange: string;
    onRangeChange: (range: string) => void;
    className?: string;
}

export function TimeRangeFilter({
    selectedRange = "6m",
    onRangeChange,
    className,
}: TimeRangeFilterProps) {
    const [isCustom, setIsCustom] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const ranges = [
        {
            value: "1m",
            label: "1 Month",
            icon: <Clock className="h-3 w-3" />,
            description: "Last 1 month of data",
        },
        {
            value: "3m",
            label: "3 Months",
            icon: <Calendar className="h-3 w-3" />,
            description: "Last quarter data",
        },
        {
            value: "6m",
            label: "6 Months",
            icon: <Calendar className="h-3 w-3" />,
            description: "Last 6 months",
        },
        {
            value: "12m",
            label: "12 Months",
            icon: <CalendarRange className="h-3 w-3" />,
            description: "Full year data",
        },
        {
            value: "24m",
            label: "24 Months",
            icon: <CalendarRange className="h-3 w-3" />,
            description: "2 years of data",
        },
    ];

    const handleRangeSelect = (range: string) => {
        setIsCustom(false);
        onRangeChange(range);
    };

    const handleCustomRangeSelect = () => {
        setIsCustom(true);
        setIsCalendarOpen(true);
    };

    const getRangeLabel = () => {
        const range = ranges.find((r) => r.value === selectedRange);
        return range ? range.label : "Custom Range";
    };

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-white/20 p-1.5 rounded-md mr-2.5">
                        <CalendarDays className="h-3.5 w-3.5 text-blue-100" />
                    </div>
                    <span className="text-sm font-medium text-blue-50">
                        Time Period
                    </span>
                </div>

                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white gap-1.5 h-8"
                        >
                            <span>{getRangeLabel()}</span>
                            <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <div className="grid gap-1 p-2">
                            <div className="px-2 py-1.5 text-sm font-semibold">
                                Select Time Range
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                                {ranges.map((range) => (
                                    <Button
                                        key={range.value}
                                        variant="ghost"
                                        className={cn(
                                            "justify-start text-left h-auto py-1.5 px-2 font-normal",
                                            selectedRange === range.value &&
                                                !isCustom &&
                                                "bg-blue-50 text-blue-700"
                                        )}
                                        onClick={() =>
                                            handleRangeSelect(range.value)
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "p-1 rounded-md",
                                                    selectedRange ===
                                                        range.value && !isCustom
                                                        ? "bg-blue-100"
                                                        : "bg-gray-100"
                                                )}
                                            >
                                                {range.icon}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {range.label}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {range.description}
                                                </div>
                                            </div>
                                        </div>
                                    </Button>
                                ))}
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "justify-start text-left h-auto py-1.5 px-2 font-normal border-t mt-1 pt-2",
                                        isCustom && "bg-blue-50 text-blue-700"
                                    )}
                                    onClick={handleCustomRangeSelect}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "p-1 rounded-md",
                                                isCustom
                                                    ? "bg-blue-100"
                                                    : "bg-gray-100"
                                            )}
                                        >
                                            <CalendarRange className="h-3 w-3" />
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                Custom Range
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Select specific date range
                                            </div>
                                        </div>
                                    </div>
                                </Button>
                            </div>

                            {isCustom && (
                                <div className="p-2 border-t mt-1">
                                    <CalendarComponent
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        className="rounded-md border"
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setIsCustom(false);
                                                setIsCalendarOpen(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                // Logic for custom date range
                                                setIsCalendarOpen(false);
                                                // Implement your custom range logic here
                                                // onRangeChange("custom");
                                            }}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}

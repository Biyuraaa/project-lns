import { FC } from "react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    color?: "primary" | "secondary" | "white" | "gray";
    className?: string;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({
    size = "md",
    color = "primary",
    className = "",
}) => {
    // Size mapping
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
    };

    // Color mapping
    const colorClasses = {
        primary: "text-primary",
        secondary: "text-secondary",
        white: "text-white",
        gray: "text-gray-400",
    };

    return (
        <div className={`flex items-center justify-center p-4 ${className}`}>
            <div
                className={`spinner ${sizeClasses[size]} ${colorClasses[color]}`}
            >
                <svg
                    className="animate-spin -ml-1 mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            </div>
        </div>
    );
};

// You can also create a full-page version
export const FullPageSpinner: FC<Omit<LoadingSpinnerProps, "className">> = (
    props
) => (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <LoadingSpinner {...props} size="lg" />
    </div>
);

export default LoadingSpinner;

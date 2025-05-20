"use client";

import type React from "react";
import type { ReactNode } from "react";
import { Link } from "@inertiajs/react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface SubmenuItem {
    name: string;
    route: string;
    active: boolean;
}

interface SidebarItemProps {
    name: string;
    icon: ReactNode;
    route?: string;
    active?: boolean;
    children?: SubmenuItem[];
    openSubmenu?: string | null;
    toggleSubmenu?: (name: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    name,
    icon,
    route,
    active,
    children,
    openSubmenu,
    toggleSubmenu,
}) => {
    // If this is a submenu item (has children)
    if (children) {
        const isOpen = openSubmenu === name;

        return (
            <div className="py-1">
                <button
                    onClick={() => toggleSubmenu && toggleSubmenu(name)}
                    className={`
            w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg
            transition-all duration-200
            ${
                isOpen
                    ? "text-blue-800 bg-blue-50"
                    : "text-gray-700 hover:bg-gray-100"
            }
          `}
                >
                    <div className="flex items-center">
                        <span
                            className={`mr-3 ${
                                isOpen ? "text-blue-600" : "text-gray-500"
                            }`}
                        >
                            {icon}
                        </span>
                        {name}
                    </div>
                    <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                            isOpen ? "transform rotate-180" : ""
                        }`}
                    />
                </button>

                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-1 space-y-1 pl-10"
                    >
                        {children.map((subItem, subIndex) => (
                            <Link
                                key={subIndex}
                                href={subItem.route}
                                className={`
                  block px-3 py-2 text-sm rounded-lg transition-colors duration-200
                  ${
                      subItem.active
                          ? "bg-blue-100 text-blue-800 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                  }
                `}
                            >
                                {subItem.name}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </div>
        );
    }

    // If this is a regular menu item (no children)
    return (
        <div className="py-1">
            <Link
                href={route || "#"}
                className={`
          flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
          transition-all duration-200
          ${
              active
                  ? "bg-blue-100 text-blue-800"
                  : "text-gray-700 hover:bg-gray-100"
          }
        `}
            >
                <span
                    className={`mr-3 ${
                        active ? "text-blue-600" : "text-gray-500"
                    }`}
                >
                    {icon}
                </span>
                {name}
            </Link>
        </div>
    );
};

export default SidebarItem;

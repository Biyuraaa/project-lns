import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

import { DollarSign, Mail, ClipboardList, FileCheck } from "lucide-react";

export default function Dashboard() {
    // Sample data for stats cards
    const stats = [
        {
            title: "Total Inquiries",
            value: "124",
            icon: <Mail className="h-6 w-6" />,
            change: { value: "12%", positive: true },
            color: "blue",
            delay: 0.1,
        },
        {
            title: "Active Quotations",
            value: "38",
            icon: <ClipboardList className="h-6 w-6" />,
            change: { value: "5%", positive: true },
            color: "purple",
            delay: 0.2,
        },
        {
            title: "Ongoing Projects",
            value: "15",
            icon: <FileCheck className="h-6 w-6" />,
            change: { value: "2%", positive: false },
            color: "green",
            delay: 0.3,
        },
        {
            title: "Monthly Revenue",
            value: "$48,250",
            icon: <DollarSign className="h-6 w-6" />,
            change: { value: "8%", positive: true },
            color: "orange",
            delay: 0.4,
        },
    ];

    // Sample data for recent activities
    const recentActivities = [
        {
            id: 1,
            title: "New inquiry from PT. Cemerlang",
            description: "Inquiry for metal stitching repair services",
            time: "10 minutes ago",
            type: "inquiry",
            link: "#",
        },
        {
            id: 2,
            title: "Quotation #QT-2023-089 approved",
            description:
                "Client has approved the quotation for boiler repair project",
            time: "2 hours ago",
            type: "quotation",
            link: "#",
        },
        {
            id: 3,
            title: "Project milestone completed",
            description: "Phase 1 of Power Plant maintenance project completed",
            time: "Yesterday",
            type: "project",
            link: "#",
        },
        {
            id: 4,
            title: "Payment received",
            description: "Payment of $12,500 received from PT. Energi Utama",
            time: "2 days ago",
            type: "payment",
            link: "#",
        },
        {
            id: 5,
            title: "New customer registered",
            description:
                "PT. Maju Bersama has been added to the customer database",
            time: "3 days ago",
            type: "customer",
            link: "#",
        },
    ];

    // Sample data for upcoming tasks
    const upcomingTasks = [
        {
            id: 1,
            title: "Prepare quotation for PT. Cemerlang",
            dueDate: "Today",
            priority: "high",
            status: "in-progress",
            project: "Metal Stitching Services",
        },
        {
            id: 2,
            title: "Follow up on pending payments",
            dueDate: "Tomorrow",
            priority: "medium",
            status: "pending",
        },
        {
            id: 3,
            title: "Project kickoff meeting",
            dueDate: "May 15, 2023",
            priority: "high",
            status: "pending",
            project: "Boiler Maintenance",
        },
        {
            id: 4,
            title: "Prepare monthly report",
            dueDate: "May 20, 2023",
            priority: "low",
            status: "pending",
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">{/* Stats Cards */}</div>
        </AuthenticatedLayout>
    );
}

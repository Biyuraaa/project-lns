import { useState, useEffect, FormEvent } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    FileText,
    Info,
    Upload,
    X,
    Hash,
    Banknote,
    CreditCard,
    Calendar,
    User,
    Building,
} from "lucide-react";
import { Separator } from "@/Components/ui/separator";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import type { Quotation } from "@/types";
import { cn } from "@/lib/utils";

interface CreateNegotiationProps {
    quotation: Quotation;
}

const NegotiationsCreate = ({ quotation }: CreateNegotiationProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        quotation_id: quotation.id,
        code: `NEG-${new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "")}-${Math.floor(Math.random() * 1000)}`,
        file: null as File | null,
    });

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setSelectedFile(file);
            setData("file", file);

            // Create a preview URL for the file
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
        }
    };

    // Remove selected file
    const removeFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setData("file", null);
    };

    // Handle form submission
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        post(route("quotations.negotiations.store", quotation.id), {
            onSuccess: () => {
                setIsSubmitting(false);
                reset();
                setSelectedFile(null);
                setPreviewUrl(null);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    // Clean up preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Format date for display
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Format currency
    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined) return "N/A";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Negotiation" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb and actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <Breadcrumb
                            items={[
                                {
                                    label: "Quotations",
                                    href: route("quotations.index"),
                                },
                                {
                                    label: quotation.code,
                                    href: route(
                                        "quotations.show",
                                        quotation.id
                                    ),
                                },
                                { label: "Create Negotiation" },
                            ]}
                        />

                        <div className="flex items-center gap-2">
                            <Link href={route("quotations.show", quotation.id)}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9"
                                >
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left column - Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <form onSubmit={handleSubmit}>
                                <Card>
                                    <CardHeader className="pb-3 bg-muted/40">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                    <div className="bg-blue-100 p-1.5 rounded-md">
                                                        <Banknote className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    Create New Negotiation
                                                </CardTitle>
                                                <CardDescription>
                                                    Submit a negotiation for
                                                    quotation #{quotation.code}
                                                </CardDescription>
                                            </div>
                                            <Badge>New Negotiation</Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-6 space-y-6">
                                        {/* Negotiation Code */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="code"
                                                className="text-base"
                                            >
                                                Negotiation Code{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="flex flex-col space-y-2">
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <Input
                                                        id="code"
                                                        type="text"
                                                        placeholder="NEG-20250519-001"
                                                        value={data.code}
                                                        onChange={(e) =>
                                                            setData(
                                                                "code",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="h-10 pl-9"
                                                    />
                                                </div>
                                                {errors.code && (
                                                    <span className="text-sm text-red-500">
                                                        {errors.code}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Enter a unique code for this
                                                negotiation
                                            </p>
                                        </div>

                                        {/* Upload File */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="file"
                                                className="text-base"
                                            >
                                                Negotiation Document{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>

                                            {selectedFile ? (
                                                <div className="border border-border rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="bg-blue-100 p-2 rounded-md">
                                                                <FileText className="h-6 w-6 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {
                                                                        selectedFile.name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {(
                                                                        selectedFile.size /
                                                                        1024 /
                                                                        1024
                                                                    ).toFixed(
                                                                        2
                                                                    )}{" "}
                                                                    MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={removeFile}
                                                            className="text-muted-foreground hover:text-destructive"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer relative">
                                                    <Input
                                                        id="file"
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                    />
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                                        <h3 className="font-medium text-base mb-1">
                                                            Upload Negotiation
                                                            Document
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            Drag and drop or
                                                            click to upload
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Supported formats:
                                                            PDF, Word, Excel
                                                            (Max 10MB)
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {errors.file && (
                                                <span className="text-sm text-red-500">
                                                    {errors.file}
                                                </span>
                                            )}
                                        </div>

                                        <Alert className="bg-blue-50 text-blue-800 border-blue-100">
                                            <Info className="h-4 w-4" />
                                            <AlertTitle>
                                                Negotiation Process
                                            </AlertTitle>
                                            <AlertDescription className="text-sm">
                                                Your negotiation will be
                                                reviewed by our team. You will
                                                be notified once it has been
                                                approved or rejected.
                                            </AlertDescription>
                                        </Alert>

                                        <Separator className="my-4" />

                                        <div className="flex justify-end space-x-3">
                                            <Link
                                                href={route(
                                                    "quotations.show",
                                                    quotation.id
                                                )}
                                            >
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                >
                                                    Cancel
                                                </Button>
                                            </Link>
                                            <Button
                                                type="submit"
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                disabled={
                                                    processing ||
                                                    isSubmitting ||
                                                    !data.code ||
                                                    !selectedFile
                                                }
                                            >
                                                {processing || isSubmitting
                                                    ? "Submitting..."
                                                    : "Submit Negotiation"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        </div>

                        {/* Right column - Quotation details */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="pb-3 bg-muted/40">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Info className="h-5 w-5 text-blue-500" />
                                        Quotation Information
                                    </CardTitle>
                                    <CardDescription>
                                        Details of the quotation this
                                        negotiation is for
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-50/30 rounded-lg p-4 border border-blue-100">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                                                    <CreditCard className="h-5 w-5 text-blue-700" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">
                                                        Quotation #
                                                        {quotation.code}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Created on{" "}
                                                        {formatDate(
                                                            quotation.created_at
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3 mt-2">
                                            <div className="flex justify-between py-2 border-b border-border/60">
                                                <span className="text-sm text-muted-foreground">
                                                    Customer
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {quotation.inquiry?.customer
                                                        ?.name || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border/60">
                                                <span className="text-sm text-muted-foreground">
                                                    Quotation Date
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {formatDate(
                                                        quotation.due_date
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border/60">
                                                <span className="text-sm text-muted-foreground">
                                                    Due Date
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {formatDate(
                                                        quotation.due_date
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-sm text-muted-foreground">
                                                    Status
                                                </span>
                                                <Badge
                                                    className={cn(
                                                        quotation.status ===
                                                            "pending" &&
                                                            "bg-amber-100 text-amber-800",
                                                        quotation.status ===
                                                            "approved" &&
                                                            "bg-emerald-100 text-emerald-800",
                                                        quotation.status ===
                                                            "rejected" &&
                                                            "bg-red-100 text-red-800"
                                                    )}
                                                >
                                                    {quotation.status
                                                        ?.charAt(0)
                                                        .toUpperCase() +
                                                        quotation.status?.slice(
                                                            1
                                                        )}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <Alert className="bg-amber-50 text-amber-800 border-amber-100">
                                        <Info className="h-4 w-4" />
                                        <AlertTitle>Important Note</AlertTitle>
                                        <AlertDescription className="text-sm">
                                            Once submitted, this negotiation
                                            will be associated with the
                                            quotation and will need approval
                                            before proceeding.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="mt-4">
                                        <Link
                                            href={route(
                                                "quotations.show",
                                                quotation.id
                                            )}
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                            >
                                                View Full Quotation
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default NegotiationsCreate;

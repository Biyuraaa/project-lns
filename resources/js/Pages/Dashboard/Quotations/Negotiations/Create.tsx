import { useState } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { PageProps, Quotation } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    CreditCard,
    FileText,
    FileUp,
    UploadCloud,
    X,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Badge } from "@/Components/ui/badge";
import { cn } from "@/lib/utils";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";

interface CreateNegotiationProps extends PageProps {
    quotation: Quotation;
}

const CreateNegotiation = () => {
    const { quotation } = usePage<CreateNegotiationProps>().props;
    const [dragActive, setDragActive] = useState(false);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
        quotation_id: quotation.id,
    });

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return format(parseISO(dateString), "MMMM d, yyyy");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(
            route("quotations.negotiations.store", {
                quotation: quotation.id,
            }),
            {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setFilePreview(null);
                    setFileName(null);
                },
            }
        );
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        setData("file", file);
        setFileName(file.name);

        // Create preview for PDF, images, etc
        if (file.type.includes("image")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            // For non-image files, we'll just display an icon
            setFilePreview(null);
        }
    };

    const removeFile = () => {
        setData("file", null);
        setFileName(null);
        setFilePreview(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Add Negotiation Document" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb and title */}
                    <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
                        <div>
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
                                    { label: "Add Negotiation Document" },
                                ]}
                            />
                            <h1 className="mt-2 text-2xl font-semibold text-gray-900">
                                Add Negotiation Document
                            </h1>
                        </div>
                        <div>
                            <Link href={route("quotations.show", quotation.id)}>
                                <Button variant="outline" className="gap-1">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Quotation
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main content - Form for file upload */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <form onSubmit={handleSubmit}>
                                    <Card className="overflow-hidden border-border">
                                        <CardHeader className="pb-4 bg-muted/40">
                                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                <div className="bg-blue-100 p-1.5 rounded-md">
                                                    <FileUp className="h-5 w-5 text-blue-600" />
                                                </div>
                                                Upload Negotiation Document
                                            </CardTitle>
                                            <CardDescription>
                                                Upload documents related to
                                                negotiations with the customer
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            {/* File Upload */}
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="file"
                                                    className="text-sm font-medium"
                                                >
                                                    Document File{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>

                                                <div
                                                    className={cn(
                                                        "border-2 border-dashed rounded-lg p-8 transition-colors text-center cursor-pointer",
                                                        dragActive
                                                            ? "border-blue-400 bg-blue-50"
                                                            : "border-gray-300 hover:bg-gray-50",
                                                        errors.file
                                                            ? "border-red-300"
                                                            : ""
                                                    )}
                                                    onDragEnter={handleDrag}
                                                    onDragLeave={handleDrag}
                                                    onDragOver={handleDrag}
                                                    onDrop={handleDrop}
                                                    onClick={() =>
                                                        document
                                                            .getElementById(
                                                                "file-input"
                                                            )
                                                            ?.click()
                                                    }
                                                >
                                                    <Input
                                                        id="file-input"
                                                        type="file"
                                                        className="hidden"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                    />

                                                    {!data.file ? (
                                                        <div className="flex flex-col items-center justify-center py-4">
                                                            <UploadCloud className="h-12 w-12 text-gray-400 mb-3" />
                                                            <p className="text-lg font-medium text-gray-700">
                                                                Drop your file
                                                                here, or{" "}
                                                                <span className="text-blue-600">
                                                                    browse
                                                                </span>
                                                            </p>
                                                            <p className="mt-1 text-sm text-gray-500">
                                                                Support for PDF,
                                                                Word, Excel, or
                                                                image files
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center space-x-4 py-4">
                                                            {filePreview ? (
                                                                <img
                                                                    src={
                                                                        filePreview
                                                                    }
                                                                    alt="Preview"
                                                                    className="w-16 h-16 object-cover rounded"
                                                                />
                                                            ) : (
                                                                <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center">
                                                                    <FileText className="h-8 w-8 text-blue-600" />
                                                                </div>
                                                            )}

                                                            <div className="flex-1 text-left">
                                                                <p className="font-medium truncate max-w-xs">
                                                                    {fileName}
                                                                </p>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="mt-1 text-red-500 hover:text-red-700 p-0"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        removeFile();
                                                                    }}
                                                                >
                                                                    <X className="h-4 w-4 mr-1" />
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {errors.file && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        {errors.file}
                                                    </p>
                                                )}

                                                <p className="text-sm text-gray-500 mt-2">
                                                    Upload the document related
                                                    to the negotiation. This can
                                                    be an email, contract draft,
                                                    price adjustment, or any
                                                    other relevant file.
                                                </p>
                                            </div>

                                            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-6">
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
                                                    disabled={
                                                        !data.file || processing
                                                    }
                                                    className="gap-2"
                                                >
                                                    <FileUp className="h-4 w-4" />
                                                    {processing
                                                        ? "Uploading..."
                                                        : "Upload Negotiation Document"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </form>
                            </motion.div>
                        </div>

                        {/* Right sidebar - Quotation information */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <Card className="overflow-hidden border-border">
                                    <CardHeader className="pb-3 bg-muted/40">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <div className="bg-blue-100 p-1.5 rounded-md">
                                                <CreditCard className="h-4 w-4 text-blue-600" />
                                            </div>
                                            Quotation Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        {/* Customer Info */}
                                        <div className="mb-5 pb-4 border-b border-border/60">
                                            <div className="flex items-center mb-3">
                                                <Building2 className="h-4 w-4 text-gray-500 mr-2" />
                                                <h3 className="text-sm font-medium text-gray-500">
                                                    Customer
                                                </h3>
                                            </div>
                                            <p className="font-medium">
                                                {
                                                    quotation.inquiry.customer
                                                        .name
                                                }
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {
                                                    quotation.inquiry.customer
                                                        .email
                                                }
                                            </p>
                                        </div>

                                        {/* Quotation Info */}
                                        <div>
                                            <div className="flex items-center mb-3">
                                                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                                                <h3 className="text-sm font-medium text-gray-500">
                                                    Quotation
                                                </h3>
                                            </div>

                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm text-gray-500">
                                                    Code
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono"
                                                >
                                                    {quotation.code}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm text-gray-500">
                                                    Due Date
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {formatDate(
                                                        quotation.due_date
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm text-gray-500">
                                                    Status
                                                </span>
                                                <Badge
                                                    className={cn(
                                                        quotation.status ===
                                                            "pending"
                                                            ? "bg-amber-100 text-amber-800 border-amber-200"
                                                            : quotation.status ===
                                                              "approved"
                                                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                            : quotation.status ===
                                                              "rejected"
                                                            ? "bg-red-100 text-red-800 border-red-200"
                                                            : "bg-gray-100 text-gray-800 border-gray-200"
                                                    )}
                                                >
                                                    {quotation.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        quotation.status.slice(
                                                            1
                                                        )}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm text-gray-500">
                                                    Inquiry
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono"
                                                >
                                                    {quotation.inquiry.code}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default CreateNegotiation;

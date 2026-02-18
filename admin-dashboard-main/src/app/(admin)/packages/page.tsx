"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSidebar } from "@/context/SidebarContext";
import {
    PencilIcon,
    TrashBinIcon,
    PlusIcon,
} from "@/icons";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Checkbox from "@/components/form/input/Checkbox";

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Package {
    id: string;
    name: string;
    tier: string;
    price: number;
    monthlyFee: number;
    description: string;
    features: string[];
    badge?: string;
    isActive: boolean;
    sortOrder: number;
}

interface FormData {
    name: string;
    tier: string;
    price: number | string;
    monthlyFee: number | string;
    description: string;
    features: string;
    badge: string;
    isActive: boolean;
    sortOrder: number | string;
}

export default function PackagesPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<Package | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Form State
    const [formData, setFormData] = useState<FormData>({
        name: "",
        tier: "basic",
        price: "",
        monthlyFee: "",
        description: "",
        features: "",
        badge: "",
        isActive: true,
        sortOrder: ""
    });

    const fetchPackages = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/packages?admin=true');
            if (res.ok) {
                const data = await res.json();
                setPackages(data);
            }
        } catch (error) {
            console.error("Failed to fetch packages", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleOpenModal = (pkg?: Package) => {
        if (pkg) {
            setCurrentPackage(pkg);
            setFormData({
                name: pkg.name,
                tier: pkg.tier,
                price: pkg.price,
                monthlyFee: pkg.monthlyFee,
                description: pkg.description,
                features: Array.isArray(pkg.features) ? pkg.features.join("\n") : "",
                badge: pkg.badge || "",
                isActive: pkg.isActive,
                sortOrder: pkg.sortOrder
            });
        } else {
            setCurrentPackage(null);
            setFormData({
                name: "",
                tier: "basic",
                price: "",
                monthlyFee: "",
                description: "",
                features: "",
                badge: "",
                isActive: true,
                sortOrder: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPackage(null);
    };

    // Standard Event Handler for InputField
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler for TextArea
    const handleTextAreaChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler for Checkbox
    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, isActive: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            features: formData.features.split("\n").filter(f => f.trim() !== ""),
            price: Number(formData.price || 0),
            monthlyFee: Number(formData.monthlyFee || 0),
            sortOrder: Number(formData.sortOrder || 0)
        };

        try {
            const url = currentPackage
                ? `http://localhost:3000/api/packages/${currentPackage.id}`
                : `http://localhost:3000/api/packages`;

            const method = currentPackage ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                handleCloseModal();
                fetchPackages();
            } else {
                alert("Failed to save package");
            }
        } catch (error) {
            console.error("Error saving package", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return;
        try {
            await fetch(`http://localhost:3000/api/packages/${id}`, { method: 'DELETE' });
            fetchPackages();
        } catch (error) {
            console.error("Error deleting package", error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Package Management</h1>
                <Button
                    onClick={() => handleOpenModal()}
                    size="sm"
                >
                    Add Package
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1000px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Price</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Monthly</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Badge</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {packages.map((pkg) => (
                                    <TableRow key={pkg.id}>
                                        <TableCell className="px-5 py-4 font-medium text-gray-900 dark:text-white">{pkg.name}</TableCell>
                                        <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">Rp {pkg.price.toLocaleString()}</TableCell>
                                        <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">Rp {pkg.monthlyFee.toLocaleString()}</TableCell>
                                        <TableCell className="px-5 py-4">
                                            {pkg.badge && <Badge color="success" size="sm" className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">{pkg.badge}</Badge>}
                                        </TableCell>
                                        <TableCell className="px-5 py-4">
                                            <Badge
                                                size="sm"
                                                color={pkg.isActive ? "success" : "error"}
                                            // className={pkg.isActive ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500" : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"}
                                            >
                                                {pkg.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 flex gap-3">
                                            <button onClick={() => handleOpenModal(pkg)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(pkg.id)} className="text-red-500 hover:text-red-700">
                                                <TrashBinIcon className="w-5 h-5" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {/* Modal */}
            {isModalOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
                        <h2 className="mb-4 text-xl font-bold dark:text-white">
                            {currentPackage ? "Edit Package" : "New Package"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Section: Basic Info */}
                            <div>
                                <h3 className="mb-3 font-semibold text-gray-800 dark:text-white/90">Package Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Package Name</Label>
                                        <Input name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Pro Plan" />
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <TextArea
                                            value={formData.description}
                                            onChange={(val) => handleTextAreaChange("description", val)}
                                            placeholder="Brief description of the package"
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <Label>Badge Label (Optional)</Label>
                                        <Input name="badge" value={formData.badge} onChange={handleInputChange} placeholder="e.g. Best Value" />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-white/[0.05]" />

                            {/* Section: Pricing */}
                            <div>
                                <h3 className="mb-3 font-semibold text-gray-800 dark:text-white/90">Pricing</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>One-time Price (Rp)</Label>
                                        <Input name="price" type="number" value={formData.price} onChange={handleInputChange} required placeholder="0" />
                                    </div>
                                    <div>
                                        <Label>Monthly Fee (Rp)</Label>
                                        <Input name="monthlyFee" type="number" value={formData.monthlyFee} onChange={handleInputChange} placeholder="0" />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-white/[0.05]" />

                            {/* Section: Features & Config */}
                            <div>
                                <h3 className="mb-3 font-semibold text-gray-800 dark:text-white/90">Features & Settings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Features List (One feature per line)</Label>
                                        <TextArea
                                            value={formData.features}
                                            onChange={(val) => handleTextAreaChange("features", val)}
                                            placeholder="- Unlimited Students&#10;- Custom Domain&#10;- 24/7 Support"
                                            rows={5}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <div>
                                            <Label>Sort Order</Label>
                                            <Input name="sortOrder" type="number" value={formData.sortOrder} onChange={handleInputChange} placeholder="0" />
                                        </div>
                                        <div className="pt-6">
                                            <Checkbox
                                                label="Active Status"
                                                checked={formData.isActive}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                                <Button variant="outline" onClick={handleCloseModal} type="button">Cancel</Button>
                                <Button type="submit">Save Package</Button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

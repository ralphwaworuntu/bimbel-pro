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


    // Promo State
    interface Promo {
        id: string;
        code: string;
        description: string;
        discountType: 'fixed' | 'percentage';
        discountValue: number;
        validUntil: string;
        isActive: boolean;
        usageCount: number;
    }

    const mockPromos: Promo[] = [
        { id: '1', code: 'HELLO2025', description: 'Promo tahun baru', discountType: 'percentage', discountValue: 20, validUntil: '2025-12-31', isActive: true, usageCount: 45 },
        { id: '2', code: 'MERDEKA17', description: 'Diskon kemerdekaan', discountType: 'fixed', discountValue: 170000, validUntil: '2025-08-17', isActive: false, usageCount: 120 },
        { id: '3', code: 'STUDENT50', description: 'Khusus pelajar', discountType: 'percentage', discountValue: 50, validUntil: '2025-06-30', isActive: true, usageCount: 12 }
    ];

    const [promos, setPromos] = useState<Promo[]>(mockPromos);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [currentPromo, setCurrentPromo] = useState<Promo | null>(null);
    const [promoFormData, setPromoFormData] = useState<Omit<Promo, 'id' | 'usageCount'>>({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        validUntil: '',
        isActive: true
    });

    const handleOpenPromoModal = (promo?: Promo) => {
        if (promo) {
            setCurrentPromo(promo);
            setPromoFormData({
                code: promo.code,
                description: promo.description,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
                validUntil: promo.validUntil,
                isActive: promo.isActive
            });
        } else {
            setCurrentPromo(null);
            setPromoFormData({
                code: '',
                description: '',
                discountType: 'percentage',
                discountValue: 0,
                validUntil: '',
                isActive: true
            });
        }
        setIsPromoModalOpen(true);
    };

    const handlePromoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentPromo) {
            setPromos(promos.map(p => p.id === currentPromo.id ? { ...p, ...promoFormData } : p));
        } else {
            setPromos([...promos, { ...promoFormData, id: Math.random().toString(36).substr(2, 9), usageCount: 0 }]);
        }
        setIsPromoModalOpen(false);
    };

    const handleDeletePromo = (id: string) => {
        if (confirm("Are you sure you want to delete this promo?")) {
            setPromos(promos.filter(p => p.id !== id));
        }
    };

    return (
        <div className="p-6 space-y-8">
            {/* Packages Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Package Management</h1>
                    <Button onClick={() => handleOpenModal()} size="sm">Add Package</Button>
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
                                                <Badge size="sm" color={pkg.isActive ? "success" : "error"}>{pkg.isActive ? "Active" : "Inactive"}</Badge>
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
            </div>

            {/* Promo Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Promo Management</h2>
                    <Button onClick={() => handleOpenPromoModal()} size="sm" variant="warning">Add Promo</Button>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[1000px]">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Code</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Description</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Discount</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Valid Until</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Usage</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {promos.map((promo) => (
                                        <TableRow key={promo.id}>
                                            <TableCell className="px-5 py-4 font-bold text-gray-900 dark:text-white font-mono">{promo.code}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{promo.description}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `Rp ${promo.discountValue.toLocaleString()}`}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{promo.validUntil}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{promo.usageCount} used</TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={promo.isActive ? "success" : "warning"}>{promo.isActive ? "Active" : "Inactive"}</Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 flex gap-3">
                                                <button onClick={() => handleOpenPromoModal(promo)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeletePromo(promo.id)} className="text-red-500 hover:text-red-700">
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
            </div>

            {/* Package Modal */}
            {isModalOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
                        <h2 className="mb-4 text-xl font-bold dark:text-white">
                            {currentPackage ? "Edit Package" : "New Package"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* ... existing form content ... (omitted for brevity in replacement, but logically should be kept - wait, replacement replaces block!) */}
                            {/* I MUST include the full existing form content if I replace the block containing it. */}
                            {/* Wait, the TargetContent below is the RETURN block. I need to be careful. */}
                            {/* The user's prompt implies I should just ADD the section. */}
                            {/* I will rewrite the return statement to include both sections. */}
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

            {/* Promo Modal */}
            {isPromoModalOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
                        <h2 className="mb-4 text-xl font-bold dark:text-white">
                            {currentPromo ? "Edit Promo" : "New Promo"}
                        </h2>
                        <form onSubmit={handlePromoSubmit} className="space-y-5">
                            <div>
                                <Label>Promo Code</Label>
                                <Input
                                    value={promoFormData.code}
                                    onChange={(e) => setPromoFormData({ ...promoFormData, code: e.target.value.toUpperCase() })}
                                    required
                                    placeholder="e.g. SALE50"
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input
                                    value={promoFormData.description}
                                    onChange={(e) => setPromoFormData({ ...promoFormData, description: e.target.value })}
                                    placeholder="Promo description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Discount Type</Label>
                                    <select
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white outline-none focus:border-brand-500"
                                        value={promoFormData.discountType}
                                        onChange={(e) => setPromoFormData({ ...promoFormData, discountType: e.target.value as 'fixed' | 'percentage' })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (Rp)</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>Value</Label>
                                    <Input
                                        type="number"
                                        value={promoFormData.discountValue}
                                        onChange={(e) => setPromoFormData({ ...promoFormData, discountValue: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Valid Until</Label>
                                <Input
                                    type="date"
                                    value={promoFormData.validUntil}
                                    onChange={(e) => setPromoFormData({ ...promoFormData, validUntil: e.target.value })}
                                />
                            </div>
                            <div className="pt-2">
                                <Checkbox
                                    label="Active Status"
                                    checked={promoFormData.isActive}
                                    onChange={(checked) => setPromoFormData({ ...promoFormData, isActive: checked })}
                                />
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                                <Button variant="outline" onClick={() => setIsPromoModalOpen(false)} type="button">Cancel</Button>
                                <Button type="submit">Save Promo</Button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

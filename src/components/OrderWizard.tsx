"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";

const steps = [
    { id: "package", name: "Pilih Paket" },
    { id: "details", name: "Data Bisnis" },
    { id: "domain", name: "Domain" },
    { id: "review", name: "Review & Bayar" },
];

export default function OrderWizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [packages, setPackages] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        packageId: searchParams.get("packageId") || "",
        clientName: "",
        brandName: "",
        email: "",
        phone: "",
        address: "",
        domainRequested: "",
        subdomainRequested: "",
        paymentType: "full",
    });

    useEffect(() => {
        fetch("/api/packages")
            .then((res) => res.json())
            .then((data) => setPackages(data));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const order = await res.json();
            if (order.id) {
                router.push(`/order/${order.id}`);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to create order");
        } finally {
            setLoading(false);
        }
    };

    const selectedPackage = packages.find(p => p.id === formData.packageId);

    return (
        <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
            {/* Steps Indicator */}
            <div className="bg-slate-950 px-6 py-4 border-b border-white/10">
                <nav aria-label="Progress">
                    <ol role="list" className="flex items-center">
                        {steps.map((step, stepIdx) => (
                            <li key={step.name} className={cn(stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "", "relative")}>
                                {stepIdx < currentStep ? (
                                    <div className="group flex items-center w-full">
                                        <span className="flex items-center px-6 py-4 text-sm font-medium">
                                            <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-amber-500 rounded-full group-hover:bg-amber-600 transition-colors">
                                                <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                            <span className="ml-4 text-sm font-medium text-white">{step.name}</span>
                                        </span>
                                    </div>
                                ) : stepIdx === currentStep ? (
                                    <div className="flex items-center px-6 py-4 text-sm font-medium" aria-current="step">
                                        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-amber-500 rounded-full">
                                            <span className="text-amber-500">{stepIdx + 1}</span>
                                        </span>
                                        <span className="ml-4 text-sm font-medium text-amber-500">{step.name}</span>
                                    </div>
                                ) : (
                                    <div className="group flex items-center">
                                        <span className="flex items-center px-6 py-4 text-sm font-medium">
                                            <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-gray-600 rounded-full group-hover:border-gray-500 transition-colors">
                                                <span className="text-gray-400 group-hover:text-gray-300">{stepIdx + 1}</span>
                                            </span>
                                            <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-400">{step.name}</span>
                                        </span>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>

            {/* Form Content */}
            <div className="p-8">
                {currentStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                onClick={() => setFormData({ ...formData, packageId: pkg.id })}
                                className={cn(
                                    "cursor-pointer p-6 rounded-xl border transition-all",
                                    formData.packageId === pkg.id
                                        ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                                        : "border-white/10 hover:border-white/20 bg-white/5"
                                )}
                            >
                                <h3 className="text-lg font-medium text-white">{pkg.name}</h3>
                                <p className="mt-2 text-2xl font-bold text-amber-500">{formatCurrency(pkg.price)}</p>
                                <div className="mt-4 space-y-2">
                                    {JSON.parse(pkg.features || "[]").map((f: string, i: number) => (
                                        <p key={i} className="text-sm text-gray-400">• {f}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="clientName" className="block text-sm font-medium text-gray-300">Nama Lengkap</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="clientName"
                                    id="clientName"
                                    value={formData.clientName}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-600 bg-slate-800 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-4 py-2"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-3">
                            <label htmlFor="brandName" className="block text-sm font-medium text-gray-300">Nama Bisnis / Bimbel</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="brandName"
                                    id="brandName"
                                    value={formData.brandName}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-600 bg-slate-800 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-4 py-2"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-3">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-600 bg-slate-800 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-4 py-2"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-3">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300">WhatsApp Number</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="phone"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-600 bg-slate-800 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-4 py-2"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="domainRequested" className="block text-sm font-medium text-gray-300">Domain Pilihan (opsional)</label>
                            <p className="text-xs text-gray-500 mb-2">Contoh: bimbeljuara.com</p>
                            <input
                                type="text"
                                name="domainRequested"
                                value={formData.domainRequested}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-600 bg-slate-800 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-4 py-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="subdomainRequested" className="block text-sm font-medium text-gray-300">Subdomain Sistem (wajib)</label>
                            <p className="text-xs text-gray-500 mb-2">Contoh: juara.bimbelpro.id</p>
                            <div className="flex rounded-md shadow-sm">
                                <input
                                    type="text"
                                    name="subdomainRequested"
                                    value={formData.subdomainRequested}
                                    onChange={handleChange}
                                    className="flex-1 rounded-none rounded-l-md border-gray-600 bg-slate-800 text-white focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-4 py-2"
                                />
                                <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-600 bg-slate-700 px-3 text-gray-300 sm:text-sm">
                                    .bimbelpro.id
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-white">Ringkasan Pesanan</h3>
                        <div className="bg-slate-800 rounded-lg p-6 space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Paket</span>
                                <span className="text-white font-medium">{selectedPackage?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Bisnis</span>
                                <span className="text-white font-medium">{formData.brandName}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/10 pt-4">
                                <span className="text-gray-400">Total Tagihan</span>
                                <span className="text-xl font-bold text-amber-500">{selectedPackage ? formatCurrency(selectedPackage.price) : '-'}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Metode Pembayaran</label>
                            <select
                                name="paymentType"
                                value={formData.paymentType}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-600 bg-slate-800 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-4 py-2"
                            >
                                <option value="full">Bayar Penuh (Transfer Bank)</option>
                                <option value="installment">Cicilan (Hubungi Admin)</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-950 px-6 py-4 flex justify-between border-t border-white/10">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        currentStep === 0
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                    )}
                >
                    Kembali
                </button>
                <button
                    onClick={handleNext}
                    disabled={loading || (currentStep === 0 && !formData.packageId)}
                    className="bg-amber-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Memproses..." : currentStep === steps.length - 1 ? "Buat Pesanan" : "Lanjut"}
                </button>
            </div>
        </div>
    );
}

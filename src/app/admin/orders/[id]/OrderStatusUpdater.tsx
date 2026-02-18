"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        setLoading(true);
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 shadow sm:rounded-lg border border-white/10">
            <div className="px-4 py-5 sm:px-6 border-b border-white/10">
                <h3 className="text-lg leading-6 font-medium text-white">Actions</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-wrap gap-2">
                    {currentStatus === "pending" && (
                        <button
                            onClick={() => handleStatusChange("paid")}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            Mark Paid
                        </button>
                    )}
                    {currentStatus === "paid" && (
                        <button
                            onClick={() => handleStatusChange("processing")}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            Start Processing
                        </button>
                    )}
                    {currentStatus === "processing" && (
                        <button
                            onClick={() => handleStatusChange("completed")}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                        >
                            Complete Order
                        </button>
                    )}
                    <button
                        onClick={() => handleStatusChange("cancelled")}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-300 bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                    >
                        Cancel Order
                    </button>
                </div>
            </div>
        </div>
    );
}

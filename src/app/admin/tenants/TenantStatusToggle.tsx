"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TenantStatusToggle({ tenantId, isActive }: { tenantId: string, isActive: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const toggleStatus = async () => {
        setLoading(true);
        try {
            await fetch(`/api/tenants/${tenantId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !isActive }),
            });
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to update tenant status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleStatus}
            disabled={loading}
            className="text-amber-500 hover:text-amber-400 disabled:opacity-50"
        >
            {isActive ? "Deactivate" : "Activate"}
        </button>
    );
}

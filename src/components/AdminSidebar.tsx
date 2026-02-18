"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navigation = [
    { name: "Dashboard", href: "/admin" },
    { name: "Orders", href: "/admin/orders" },
    { name: "Tenants", href: "/admin/tenants" },
    { name: "Payments", href: "/admin/payments" },
    { name: "Analytics", href: "/admin/analytics" },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
            <div className="flex-1 flex flex-col min-h-0 bg-slate-900 border-r border-white/10">
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-4">
                        <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                            BimbelPro Admin
                        </span>
                    </div>
                    <nav className="mt-8 flex-1 px-2 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        isActive
                                            ? "bg-amber-500 text-white"
                                            : "text-gray-300 hover:bg-white/10 hover:text-white",
                                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-white/10 p-4">
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex-shrink-0 w-full group block"
                    >
                        <div className="flex items-center">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-300 group-hover:text-white">
                                    Sign Out
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

import { cn } from "@/lib/utils";
import Link from "next/link";

interface PricingCardProps {
    name: string;
    price: string;
    features: string[];
    isPopular?: boolean;
    packageId?: string;
}

export default function PricingCard({ name, price, features, isPopular, packageId }: PricingCardProps) {
    return (
        <div className={cn(
            "relative p-8 border rounded-2xl shadow-sm flex flex-col",
            isPopular
                ? "bg-slate-900 border-amber-500 shadow-amber-500/20"
                : "bg-slate-900/50 border-white/10"
        )}>
            {isPopular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <span className="inline-flex rounded-full bg-amber-500 px-4 py-1 text-sm font-semibold text-white shadow-sm">
                        Most Popular
                    </span>
                </div>
            )}
            <div className="mb-4">
                <h3 className="text-lg font-semibold leading-8 text-white">{name}</h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                    <span className="text-4xl font-bold tracking-tight text-white">{price}</span>
                    <span className="text-sm font-semibold leading-6 text-gray-400">/one-time</span>
                </p>
            </div>
            <ul role="list" className="mb-8 space-y-4 text-sm leading-6 text-gray-300 flex-1">
                {features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                        <svg className="h-6 w-5 flex-none text-amber-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        {feature}
                    </li>
                ))}
            </ul>
            <Link
                href={`/order?packageId=${packageId}`}
                className={cn(
                    "mt-auto block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors",
                    isPopular
                        ? "bg-amber-500 text-white hover:bg-amber-400 focus-visible:outline-amber-500"
                        : "bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white"
                )}
            >
                Select {name}
            </Link>
        </div>
    );
}

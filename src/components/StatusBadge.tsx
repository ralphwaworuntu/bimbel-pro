import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
    const styles: Record<string, string> = {
        pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
        paid: "bg-green-500/20 text-green-400 border-green-500/50",
        processing: "bg-blue-500/20 text-blue-400 border-blue-500/50",
        completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
        cancelled: "bg-red-500/20 text-red-400 border-red-500/50",
        active: "bg-green-500/20 text-green-400 border-green-500/50",
        inactive: "bg-gray-500/20 text-gray-400 border-gray-500/50",
    };

    const defaultStyle = "bg-gray-500/20 text-gray-400 border-gray-500/50";

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize", styles[status.toLowerCase()] || defaultStyle, className)}>
            {status}
        </span>
    );
}

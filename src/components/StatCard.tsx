interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    trend?: "up" | "down" | "neutral";
    className?: string;
}

export default function StatCard({ title, value, description, trend }: StatCardProps) {
    return (
        <div className="bg-slate-900 overflow-hidden rounded-lg border border-white/10 shadow hover:shadow-lg transition-shadow">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-400 truncate">
                                {title}
                            </dt>
                            <dd>
                                <div className="text-lg font-medium text-white">
                                    {value}
                                </div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            {description && (
                <div className="bg-slate-800/50 px-5 py-3">
                    <div className="text-sm">
                        <span className="text-gray-400">
                            {description}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

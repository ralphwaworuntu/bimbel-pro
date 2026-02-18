"use client";
import { formatDate } from "@/lib/utils";

export default function TrafficList({ logs }: { logs: any[] }) {
    if (logs.length === 0) {
        return <p className="text-gray-400">No traffic data available yet.</p>;
    }

    return (
        <ul className="divide-y divide-gray-700">
            {logs.map((log) => (
                <li key={log.id} className="py-4 flex justify-between">
                    <div>
                        <p className="text-sm font-medium text-white">{log.tenant.subdomain}.bimbelpro.id</p>
                        <p className="text-xs text-gray-500">{formatDate(log.date)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-300">{log.pageViews} Views / {log.visitors} Visitors</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

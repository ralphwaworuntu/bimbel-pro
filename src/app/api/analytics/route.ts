import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export async function GET() {
    const tenants = await prisma.tenant.findMany({
        include: {
            trafficLogs: {
                orderBy: { date: 'desc' },
                take: 30,
            },
            order: { include: { package: true } },
        },
    });

    const analytics = tenants.map((t) => {
        const totalPageViews = t.trafficLogs.reduce((s, l) => s + l.pageViews, 0);
        const totalVisitors = t.trafficLogs.reduce((s, l) => s + l.visitors, 0);
        return {
            tenantId: t.id,
            brandName: t.brandName,
            subdomain: t.subdomain,
            domain: t.domain,
            isActive: t.isActive,
            packageName: t.order.package.name,
            totalPageViews,
            totalVisitors,
            dailyLogs: t.trafficLogs.map((l) => ({
                date: l.date,
                pageViews: l.pageViews,
                visitors: l.visitors,
            })),
        };
    });

    return NextResponse.json(analytics);
}

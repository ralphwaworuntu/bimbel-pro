import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export async function GET() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
        totalOrders,
        ordersThisMonth,
        ordersLastMonth,
        ordersThisWeek,
        pendingOrders,
        totalTenants,
        activeTenants,
        activeOrdersTotal,
        activeOrdersThisMonth,
        activeOrdersLastMonth,
        payments,
        recentOrders,
        trafficLogs,
        chartOrders,
    ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
        prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
        prisma.order.count({ where: { status: 'pending' } }),
        prisma.tenant.count(),
        prisma.tenant.count({ where: { isActive: true } }),
        prisma.order.count({ where: { status: 'active' } }),
        prisma.order.count({ where: { status: 'active', createdAt: { gte: startOfMonth } } }),
        prisma.order.count({ where: { status: 'active', createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
        prisma.payment.findMany({ where: { status: 'paid' } }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { package: true },
        }),
        prisma.trafficLog.findMany({
            where: { date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30) } },
            orderBy: { date: 'asc' },
        }),
        // Fetch raw orders for charts (last 12 months)
        prisma.order.findMany({
            where: {
                createdAt: {
                    gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                }
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                package: {
                    select: { price: true }
                }
            }
        }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Aggregate traffic by date
    const trafficByDate: Record<string, { pageViews: number; visitors: number }> = {};
    for (const log of trafficLogs) {
        const key = log.date.toISOString().split('T')[0];
        if (!trafficByDate[key]) trafficByDate[key] = { pageViews: 0, visitors: 0 };
        trafficByDate[key].pageViews += log.pageViews;
        trafficByDate[key].visitors += log.visitors;
    }

    // Revenue by month (last 6 months)
    const revenueByMonth: Record<string, number> = {};
    for (const p of payments) {
        if (p.paidAt) {
            const key = `${p.paidAt.getFullYear()}-${(p.paidAt.getMonth() + 1).toString().padStart(2, '0')}`;
            revenueByMonth[key] = (revenueByMonth[key] || 0) + p.amount;
        }
    }

    const response = NextResponse.json({
        stats: {
            totalOrders,
            ordersThisMonth,
            ordersLastMonth,
            ordersThisWeek,
            pendingOrders,
            totalTenants,
            activeTenants,
            activeOrdersTotal,
            activeOrdersThisMonth,
            activeOrdersLastMonth,
            inactiveTenants: totalTenants - activeTenants,
            totalRevenue,
        },
        recentOrders,
        trafficByDate,
        revenueByMonth,
        chartOrders,
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
}

export async function OPTIONS() {
    const response = new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
    return response;
}

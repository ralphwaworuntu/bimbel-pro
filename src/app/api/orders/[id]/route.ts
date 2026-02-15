import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: { package: true, payments: true, tenant: true },
    });

    if (!order) {
        // Try by orderNumber
        const byNumber = await prisma.order.findUnique({
            where: { orderNumber: params.id },
            include: { package: true, payments: true, tenant: true },
        });
        if (!byNumber) {
            return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json(byNumber);
    }

    return NextResponse.json(order);
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { status, notes } = body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;

        const order = await prisma.order.update({
            where: { id: params.id },
            data: updateData,
            include: { package: true, payments: true, tenant: true },
        });

        // Auto-create tenant when status becomes 'active'
        if (status === 'active' && !order.tenant) {
            await prisma.tenant.create({
                data: {
                    orderId: order.id,
                    subdomain: order.subdomainRequested || order.brandName.toLowerCase().replace(/\s+/g, ''),
                    domain: order.domainRequested,
                    brandName: order.brandName,
                    ownerName: order.clientName,
                    contactInfo: JSON.stringify({ email: order.email, phone: order.phone }),
                    isActive: true,
                },
            });
        }

        return NextResponse.json(order);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

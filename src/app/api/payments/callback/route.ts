import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Simulated payment gateway callback / webhook
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { gatewayRef, status, method } = body;

        if (!gatewayRef) {
            return NextResponse.json({ error: 'Missing gatewayRef' }, { status: 400 });
        }

        const payment = await prisma.payment.findFirst({
            where: { gatewayRef },
        });

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: status || 'paid',
                method: method || payment.method,
                paidAt: status === 'paid' ? new Date() : null,
            },
        });

        // Update order status if payment is successful
        if (status === 'paid') {
            await prisma.order.update({
                where: { id: payment.orderId },
                data: { status: 'processing' },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

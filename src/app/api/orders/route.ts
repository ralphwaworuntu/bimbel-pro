import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';
import { getActiveGateway } from '@/lib/payment-gateway';

export async function GET() {
    const orders = await prisma.order.findMany({
        include: { package: true, payments: true, tenant: true },
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            clientName,
            brandName,
            email,
            phone,
            address,
            village,
            district,
            city,
            province,
            postalCode,
            domainRequested,
            subdomainRequested,
            packageId,
            paymentType,
            notes,
        } = body;

        if (!clientName || !brandName || !email || !phone || !packageId) {
            return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
        }

        const pkg = await prisma.package.findUnique({ where: { id: packageId } });
        if (!pkg) {
            return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 404 });
        }

        const orderNumber = generateOrderNumber();
        const order = await prisma.order.create({
            data: {
                orderNumber,
                clientName,
                brandName,
                email,
                phone,
                address: address || '',
                village: village || '',
                district: district || '',
                city: city || '',
                province: province || '',
                postalCode: postalCode || '',
                domainRequested: domainRequested || '',
                subdomainRequested: subdomainRequested || '',
                packageId,
                paymentType: paymentType || 'full',
                notes: notes || '',
                status: 'pending',
            },
        });

        // Calculate amount
        const amount = paymentType === 'dp' ? Math.floor(pkg.price * 0.5) : pkg.price;

        // Create payment via gateway
        const gateway = await getActiveGateway();
        const result = await gateway.createPayment({
            orderId: order.id,
            orderNumber,
            amount,
            customerName: clientName,
            customerEmail: email,
            customerPhone: phone,
            description: `Order ${orderNumber} - Paket ${pkg.name}`,
            paymentType: paymentType || 'full',
        });

        // Save payment record
        const payment = await prisma.payment.create({
            data: {
                orderId: order.id,
                amount,
                status: 'pending',
                gatewayRef: result.gatewayRef || '',
                gatewayName: result.gatewayName,
                paymentUrl: result.paymentUrl || '',
            },
        });

        return NextResponse.json({
            order,
            payment,
            paymentUrl: result.paymentUrl,
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create order error:', error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}

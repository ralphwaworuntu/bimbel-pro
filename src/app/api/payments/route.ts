import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export async function GET() {
    const payments = await prisma.payment.findMany({
        include: { order: { include: { package: true } } },
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(payments);
}

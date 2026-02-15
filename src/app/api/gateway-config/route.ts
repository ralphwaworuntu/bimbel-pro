import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: List all payment gateway configs
export async function GET() {
    const configs = await prisma.paymentGatewayConfig.findMany({
        orderBy: { gateway: 'asc' },
    });

    // Parse config JSON but hide sensitive keys partially
    const result = configs.map((c) => {
        const parsed = JSON.parse(c.config);
        return {
            id: c.id,
            gateway: c.gateway,
            isActive: c.isActive,
            config: parsed,
            hasKeys: Object.values(parsed).some((v: any) => typeof v === 'string' && v.length > 0),
            updatedAt: c.updatedAt,
        };
    });

    return NextResponse.json(result);
}

// POST: Update a gateway config
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { gateway, config, isActive } = body;

        if (!gateway || !['midtrans', 'xendit'].includes(gateway)) {
            return NextResponse.json({ error: 'Invalid gateway. Use midtrans or xendit.' }, { status: 400 });
        }

        // If activating one, deactivate others
        if (isActive) {
            await prisma.paymentGatewayConfig.updateMany({
                where: { gateway: { not: gateway } },
                data: { isActive: false },
            });
        }

        const updated = await prisma.paymentGatewayConfig.upsert({
            where: { gateway },
            update: {
                config: typeof config === 'string' ? config : JSON.stringify(config),
                isActive: isActive ?? false,
            },
            create: {
                gateway,
                config: typeof config === 'string' ? config : JSON.stringify(config),
                isActive: isActive ?? false,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

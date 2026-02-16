import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Get app config
export async function GET() {
    try {
        const config = await prisma.appConfig.findFirst();

        if (!config) {
            return NextResponse.json({
                appName: 'Bimbel Pro',
                appLogo: '/images/logo.png',
                companyName: 'PT Bimbel Pro',
                address: '',
                contactEmail: '',
                contactPhone: ''
            });
        }

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch app config' }, { status: 500 });
    }
}

// POST: Update app config
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { appName, appLogo, companyName, address, contactEmail, contactPhone } = body;

        const existing = await prisma.appConfig.findFirst();

        if (existing) {
            const updated = await prisma.appConfig.update({
                where: { id: existing.id },
                data: { appName, appLogo, companyName, address, contactEmail, contactPhone },
            });
            return NextResponse.json(updated);
        } else {
            const created = await prisma.appConfig.create({
                data: { appName, appLogo, companyName, address, contactEmail, contactPhone },
            });
            return NextResponse.json(created);
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to update app config' }, { status: 500 });
    }
}

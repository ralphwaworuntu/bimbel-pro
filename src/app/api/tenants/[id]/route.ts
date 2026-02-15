import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const updateData: any = {};

        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.domain !== undefined) updateData.domain = body.domain;
        if (body.config !== undefined) updateData.config = typeof body.config === 'string' ? body.config : JSON.stringify(body.config);
        if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl;

        const tenant = await prisma.tenant.update({
            where: { id: params.id },
            data: updateData,
            include: { order: { include: { package: true } } },
        });

        return NextResponse.json(tenant);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

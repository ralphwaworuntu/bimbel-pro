import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH - update domain price, promo, toggle active
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { price, promoPrice, promoActive, isActive, label, description, sortOrder } = body;

        const updateData: any = {};
        if (price !== undefined) updateData.price = Number(price);
        if (promoPrice !== undefined) updateData.promoPrice = promoPrice === null || promoPrice === '' ? null : Number(promoPrice);
        if (promoActive !== undefined) updateData.promoActive = Boolean(promoActive);
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);
        if (label !== undefined) updateData.label = label;
        if (description !== undefined) updateData.description = description;
        if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

        const domain = await prisma.domainPrice.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json(domain);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update domain price' }, { status: 500 });
    }
}

// DELETE - remove domain extension
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.domainPrice.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete domain price' }, { status: 500 });
    }
}

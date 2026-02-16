import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - list all active domain prices (public)
export async function GET() {
    try {
        const domains = await prisma.domainPrice.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
        return NextResponse.json(domains);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch domain prices' }, { status: 500 });
    }
}

// POST - admin: add new domain extension
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { extension, label, description, price, promoPrice, promoActive, sortOrder } = body;

        if (!extension || !label || !price) {
            return NextResponse.json({ error: 'Extension, label, and price are required' }, { status: 400 });
        }

        const domain = await prisma.domainPrice.create({
            data: {
                extension: extension.startsWith('.') ? extension : `.${extension}`,
                label,
                description: description || '',
                price: Number(price),
                promoPrice: promoPrice ? Number(promoPrice) : null,
                promoActive: promoActive || false,
                sortOrder: sortOrder || 0,
            },
        });

        return NextResponse.json(domain);
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'Extension already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create domain price' }, { status: 500 });
    }
}

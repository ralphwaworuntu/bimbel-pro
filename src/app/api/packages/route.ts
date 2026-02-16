import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export async function GET() {
    const packages = await prisma.package.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
    });

    const parsed = packages.map((p) => ({
        ...p,
        features: JSON.parse(p.features),
    }));

    return NextResponse.json(parsed);
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const where = isAdmin ? {} : { isActive: true };

    const packages = await prisma.package.findMany({
        where,
        orderBy: [
            { sortOrder: 'asc' },
            { price: 'asc' },
        ],
    });

    const parsed = packages.map((p) => ({
        ...p,
        features: JSON.parse(p.features),
    }));

    const response = NextResponse.json(parsed);

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
}

export async function OPTIONS() {
    const response = new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
    return response;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, tier, price, monthlyFee, description, features, badge, isActive, sortOrder } = body;

        const newPackage = await prisma.package.create({
            data: {
                name,
                tier,
                price: parseInt(price),
                monthlyFee: parseInt(monthlyFee || 0),
                description,
                features: JSON.stringify(features), // Expecting array
                badge,
                isActive: isActive ?? true,
                sortOrder: parseInt(sortOrder || 0),
            },
        });

        const response = NextResponse.json(newPackage);
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
    } catch (error) {
        console.error("Error creating package:", error);
        return NextResponse.json({ error: "Failed to create package" }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
}

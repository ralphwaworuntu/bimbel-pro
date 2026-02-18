import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, tier, price, monthlyFee, description, features, badge, isActive, sortOrder } = body;

        const updatedPackage = await prisma.package.update({
            where: { id },
            data: {
                name,
                tier,
                price: parseInt(price),
                monthlyFee: parseInt(monthlyFee || 0),
                description,
                features: JSON.stringify(features),
                badge,
                isActive,
                sortOrder: parseInt(sortOrder || 0),
            },
        });

        const response = NextResponse.json(updatedPackage);
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
    } catch (error: any) {
        console.error("Error updating package:", error);
        return NextResponse.json({ error: "Failed to update package", details: error.message || String(error) }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.package.delete({
            where: { id },
        });

        const response = NextResponse.json({ success: true });
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
    } catch (error) {
        console.error("Error deleting package:", error);
        return NextResponse.json({ error: "Failed to delete package" }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
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

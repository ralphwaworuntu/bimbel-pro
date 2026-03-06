import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    try {
        switch (type) {
            case 'provinces':
                const provinces = await prisma.province.findMany({
                    orderBy: { name: 'asc' }
                });
                return NextResponse.json(provinces);

            case 'cities':
                const provinceId = searchParams.get('provinceId');
                if (!provinceId) return NextResponse.json({ error: 'Missing provinceId' }, { status: 400 });
                const cities = await prisma.city.findMany({
                    where: { provinceId },
                    orderBy: { name: 'asc' }
                });
                return NextResponse.json(cities);

            case 'districts':
                const cityId = searchParams.get('cityId');
                if (!cityId) return NextResponse.json({ error: 'Missing cityId' }, { status: 400 });
                const districts = await prisma.district.findMany({
                    where: { cityId },
                    orderBy: { name: 'asc' }
                });
                return NextResponse.json(districts);

            case 'villages':
                const districtIdForVillages = searchParams.get('districtId');
                if (!districtIdForVillages) return NextResponse.json({ error: 'Missing districtId' }, { status: 400 });
                const villages = await prisma.village.findMany({
                    where: { districtId: districtIdForVillages },
                    orderBy: { name: 'asc' }
                });
                return NextResponse.json(villages);

            case 'postal_codes':
                const districtIdForPostal = searchParams.get('districtId');
                if (!districtIdForPostal) return NextResponse.json({ error: 'Missing districtId' }, { status: 400 });
                const postalCodes = await prisma.districtPostalCode.findMany({
                    where: { districtId: districtIdForPostal },
                    select: { code: true }
                });
                return NextResponse.json(postalCodes.map(pc => pc.code));

            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }
    } catch (error) {
        console.error("Location API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

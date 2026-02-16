import { NextRequest, NextResponse } from 'next/server';
import { provisionTenant } from '@/services/provisioning';

export async function POST(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const result = await provisionTenant(params.id);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

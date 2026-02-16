import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Get email config
export async function GET() {
    try {
        const config = await prisma.emailConfig.findFirst();

        if (!config) {
            return NextResponse.json({
                host: '',
                port: 587,
                secure: false,
                user: '',
                fromName: 'Bimbel Pro Admin',
                fromEmail: ''
            });
        }

        // Return config with masked password
        return NextResponse.json({
            ...config,
            password: config.password ? '********' : '',
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch email config' }, { status: 500 });
    }
}

// POST: Update email config
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { host, port, secure, user, password, fromName, fromEmail } = body;

        // Basic validation
        if (!host || !user || !fromEmail) {
            return NextResponse.json({ error: 'Host, User, and From Email are required' }, { status: 400 });
        }

        const existing = await prisma.emailConfig.findFirst();

        let dataToUpdate: any = {
            host,
            port: Number(port),
            secure: Boolean(secure),
            user,
            fromName,
            fromEmail,
        };

        // Only update password if provided (not empty and not masked)
        if (password && password !== '********') {
            dataToUpdate.password = password;
        }

        if (existing) {
            const updated = await prisma.emailConfig.update({
                where: { id: existing.id },
                data: dataToUpdate,
            });
            return NextResponse.json(updated);
        } else {
            // Require password for new config
            if (!password) {
                return NextResponse.json({ error: 'Password is required for initial setup' }, { status: 400 });
            }
            dataToUpdate.password = password;
            const created = await prisma.emailConfig.create({
                data: dataToUpdate,
            });
            return NextResponse.json(created);
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to update email config' }, { status: 500 });
    }
}

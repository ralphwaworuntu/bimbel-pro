import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const orderNumber = formData.get('orderNumber') as string;
        const file = formData.get('proof') as File;

        if (!orderNumber || !file) {
            return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File harus berupa gambar' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 });
        }

        // Find order
        const order = await prisma.order.findUnique({
            where: { orderNumber },
        });

        if (!order) {
            return NextResponse.json({ error: 'Nomor Order tidak ditemukan' }, { status: 404 });
        }

        // Prepare upload directory
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'payment-proofs');
        await mkdir(uploadDir, { recursive: true });

        // Generate filename
        const ext = file.name.split('.').pop();
        const filename = `${orderNumber}-${Date.now()}.${ext}`;
        const filepath = join(uploadDir, filename);

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Create Payment Record
        const proofUrl = `/uploads/payment-proofs/${filename}`;

        await prisma.payment.create({
            data: {
                orderId: order.id,
                amount: 0, // Amount unconfirmed yet
                method: 'bank_transfer',
                status: 'pending',
                proofFile: proofUrl,
                gatewayName: 'manual_transfer',
            },
        });

        // Update Order Status
        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'processing' }, // Should actually be 'payment_verification' but using existing status for now
        });

        return NextResponse.json({ success: true, message: 'Bukti pembayaran berhasil diupload' });
    } catch (err) {
        console.error('Upload Error:', err);
        return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
    }
}

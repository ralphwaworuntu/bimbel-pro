import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Seed admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@bimbelpro.com' },
        update: {},
        create: {
            email: 'admin@bimbelpro.com',
            passwordHash,
            name: 'Admin Bimbel Pro',
            role: 'admin',
        },
    });
    console.log('✅ Admin user created: admin@bimbelpro.com / admin123');

    // Seed packages
    const packages = [
        {
            name: 'Basic',
            tier: 'basic',
            price: 2500000,
            monthlyFee: 150000,
            description: 'Paket dasar untuk memulai bisnis bimbel online Anda',
            features: JSON.stringify([
                'Website bimbel responsive',
                'Halaman beranda & profil',
                'Sistem pendaftaran siswa online',
                'Manajemen siswa dasar (max 100)',
                'Bank soal (max 500 soal)',
                'Tryout online (max 10 paket)',
                'Dashboard admin sederhana',
                'Subdomain gratis (nama.bimbelpro.com)',
                'Support via WhatsApp',
            ]),
            sortOrder: 1,
        },
        {
            name: 'Professional',
            tier: 'pro',
            price: 5000000,
            monthlyFee: 300000,
            description: 'Solusi lengkap untuk bisnis bimbel yang berkembang',
            features: JSON.stringify([
                'Semua fitur Basic',
                'Manajemen siswa unlimited',
                'Bank soal unlimited',
                'Tryout online unlimited',
                'Analitik & laporan performa siswa',
                'Sistem pembayaran online',
                'Notifikasi WhatsApp otomatis',
                'Custom domain',
                'Branding kustom (logo, warna)',
                'Support prioritas',
            ]),
            sortOrder: 2,
        },
        {
            name: 'Premium',
            tier: 'premium',
            price: 10000000,
            monthlyFee: 500000,
            description: 'Paket premium all-in-one untuk bimbel skala besar',
            features: JSON.stringify([
                'Semua fitur Professional',
                'Multi-cabang support',
                'Sistem live class / video conference',
                'Marketplace soal & materi',
                'API integration',
                'Aplikasi mobile (PWA advanced)',
                'Analitik lanjutan & prediksi',
                'Dedicated account manager',
                'Setup & training langsung',
                'SLA uptime 99.9%',
            ]),
            sortOrder: 3,
        },
    ];

    for (const pkg of packages) {
        await prisma.package.upsert({
            where: { id: pkg.tier },
            update: pkg,
            create: { id: pkg.tier, ...pkg },
        });
    }
    console.log('✅ 3 packages seeded');

    // Seed payment gateway configs
    await prisma.paymentGatewayConfig.upsert({
        where: { gateway: 'midtrans' },
        update: {},
        create: {
            gateway: 'midtrans',
            config: JSON.stringify({
                serverKey: '',
                clientKey: '',
                isProduction: false,
            }),
            isActive: false,
        },
    });

    await prisma.paymentGatewayConfig.upsert({
        where: { gateway: 'xendit' },
        update: {},
        create: {
            gateway: 'xendit',
            config: JSON.stringify({
                secretKey: '',
                publicKey: '',
                webhookToken: '',
            }),
            isActive: false,
        },
    });
    console.log('✅ Payment gateway configs seeded');

    // Seed sample orders
    const sampleOrders = [
        {
            orderNumber: 'ORD-2601-DEMO1',
            clientName: 'Budi Santoso',
            brandName: 'Bimbel Garuda Jaya',
            email: 'budi@garudajaya.com',
            phone: '081234567890',
            address: 'Jl. Merdeka No. 1, Jakarta',
            domainRequested: 'garudajaya.com',
            subdomainRequested: 'garudajaya',
            packageId: 'pro',
            status: 'active',
            paymentType: 'full',
        },
        {
            orderNumber: 'ORD-2601-DEMO2',
            clientName: 'Siti Nurhaliza',
            brandName: 'Bimbel Patriot',
            email: 'siti@patriot.id',
            phone: '081298765432',
            address: 'Jl. Diponegoro No. 5, Bandung',
            domainRequested: '',
            subdomainRequested: 'patriot',
            packageId: 'basic',
            status: 'processing',
            paymentType: 'dp',
        },
        {
            orderNumber: 'ORD-2601-DEMO3',
            clientName: 'Ahmad Fauzi',
            brandName: 'Bimbel Prajurit Cerdas',
            email: 'ahmad@prajuritcerdas.com',
            phone: '087712345678',
            address: 'Jl. Sudirman No. 10, Surabaya',
            domainRequested: 'prajuritcerdas.com',
            subdomainRequested: 'prajuritcerdas',
            packageId: 'premium',
            status: 'pending',
            paymentType: 'full',
        },
    ];

    for (const order of sampleOrders) {
        const existing = await prisma.order.findUnique({ where: { orderNumber: order.orderNumber } });
        if (!existing) {
            const created = await prisma.order.create({ data: order });

            // Create payment for active/processing orders
            if (order.status !== 'pending') {
                const pkg = await prisma.package.findUnique({ where: { id: order.packageId } });
                await prisma.payment.create({
                    data: {
                        orderId: created.id,
                        amount: order.paymentType === 'dp' ? Math.floor((pkg?.price || 0) * 0.5) : (pkg?.price || 0),
                        method: 'bank_transfer',
                        status: 'paid',
                        gatewayRef: `SBX-DEMO-${Math.random().toString(36).substr(2, 6)}`,
                        gatewayName: 'sandbox',
                        paidAt: new Date(),
                    },
                });
            }

            // Create tenant for active orders
            if (order.status === 'active') {
                const tenant = await prisma.tenant.create({
                    data: {
                        orderId: created.id,
                        subdomain: order.subdomainRequested,
                        domain: order.domainRequested,
                        brandName: order.brandName,
                        ownerName: order.clientName,
                        contactInfo: JSON.stringify({ email: order.email, phone: order.phone }),
                        isActive: true,
                    },
                });

                // Create sample traffic
                const today = new Date();
                for (let i = 30; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    await prisma.trafficLog.create({
                        data: {
                            tenantId: tenant.id,
                            pageViews: Math.floor(Math.random() * 500) + 50,
                            visitors: Math.floor(Math.random() * 200) + 20,
                            date,
                        },
                    });
                }
            }
        }
    }
    console.log('✅ Sample orders seeded');
    console.log('\n🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

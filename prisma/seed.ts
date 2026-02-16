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

    // Seed domain prices (harga asli / original prices)
    const domainPrices = [
        { extension: '.com', label: 'Domain .com', description: 'Domain terpopuler untuk segala kebutuhan website Anda', price: 199000, sortOrder: 1 },
        { extension: '.id', label: 'Domain .id', description: 'Domain resmi ekstensi terpopuler untuk website di dalam Indonesia', price: 360000, sortOrder: 2 },
        { extension: '.co.id', label: 'Domain .co.id', description: 'Domain komersial resmi Indonesia', price: 250000, sortOrder: 3 },
        { extension: '.web.id', label: 'Domain .web.id', description: 'Domain murah untuk kebutuhan website secara general dan universal', price: 99000, sortOrder: 4 },
        { extension: '.biz.id', label: 'Domain .biz.id', description: 'Domain bisnis ekstensi domain Indonesia yang terpercaya untuk UKM dan UMKM', price: 55000, sortOrder: 5 },
        { extension: '.my.id', label: 'Domain .my.id', description: 'Domain personal dan portfolio, cocok untuk website personal atau pribadi', price: 30000, sortOrder: 6 },
        { extension: '.com', label: 'Domain .com', description: 'Domain terpopuler', price: 199000, sortOrder: 1 },
        { extension: '.net', label: 'Domain .net', description: 'Domain untuk website IT, networking, dan komputer', price: 250000, sortOrder: 7 },
        { extension: '.org', label: 'Domain .org', description: 'Domain populer untuk kebutuhan yayasan, organisasi, forum dan perkumpulan', price: 215000, sortOrder: 8 },
        { extension: '.xyz', label: 'Domain .xyz', description: 'Domain dengan registrasi sederhana toll yang cocok untuk semua kebutuhan website', price: 110000, sortOrder: 9 },
        { extension: '.click', label: 'Domain .click', description: 'Domain unik yang cocok untuk meningkatkan kunjungan ke landing website', price: 150000, sortOrder: 10 },
        { extension: '.co', label: 'Domain .co', description: 'Domain untuk kebutuhan website bisnis atau perusahaan', price: 350000, sortOrder: 11 },
        { extension: '.biz', label: 'Domain .biz', description: 'Domain yang cocok untuk kebutuhan website bisnis Asia-Pasifik', price: 350000, sortOrder: 12 },
        { extension: '.asia', label: 'Domain .asia', description: 'Domain untuk regional Asia-Pasifik', price: 199000, sortOrder: 13 },
        { extension: '.site', label: 'Domain .site', description: 'Domain untuk bisnis, portfolio yang fleksibel dan profesional', price: 350000, sortOrder: 14 },
        { extension: '.online', label: 'Domain .online', description: 'Cocok untuk hadirkan produk digital, toko, blog atau portofolio', price: 350000, sortOrder: 15 },
        { extension: '.cc', label: 'Domain .cc', description: 'Fleksibel dan serbaguna, cocok untuk komunitas, perusahaan atau brand', price: 300000, sortOrder: 16 },
        { extension: '.info', label: 'Domain .info', description: 'Cocol untuk situs informatif, panduan, atau sumber referensi online', price: 250000, sortOrder: 17 },
        { extension: '.top', label: 'Domain .top', description: 'Menunjukkan keunggulan, ideal untuk startup, bisnis atau situs profesional', price: 120000, sortOrder: 18 },
        { extension: '.pw', label: 'Domain .pw', description: 'Domain serbaguna, cocok untuk blog, startup atau website profesional', price: 115000, sortOrder: 19 },
        { extension: '.cloud', label: 'Domain .cloud', description: 'Ideal untuk layanan berbasis awan, teknologi, atau situs digital', price: 130000, sortOrder: 20 },
        { extension: '.io', label: 'Domain .io', description: 'Ideal untuk startup Samudera Hindia Britania', price: 899000, sortOrder: 21 },
        { extension: '.space', label: 'Domain .space', description: 'Cocok untuk bisnis, komunitas dalam membangun ruang online yang unik', price: 250000, sortOrder: 22 },
        { extension: '.website', label: 'Domain .website', description: 'Cocok untuk situs apa saja, orang yang ingin identitas website yang jelas dan mudah diingat', price: 350000, sortOrder: 23 },
        { extension: '.store', label: 'Domain .store', description: 'Cocok untuk toko online, masalkan brand Anda lebih profesional dan mudah dikenali', price: 600000, sortOrder: 24 },
        { extension: '.fun', label: 'Domain .fun', description: 'Domain untuk hiburan, komunitas, dan hobi', price: 250000, sortOrder: 25 },
        { extension: '.se', label: 'Domain .se', description: 'Domain resmi Swedia, cocok untuk bisnis dan identitas digital', price: 200000, sortOrder: 26 },
    ];

    // Remove duplicate .com entry (first one wins)
    const uniqueDomains = domainPrices.filter((d, i, arr) =>
        arr.findIndex(x => x.extension === d.extension) === i
    );

    for (const dp of uniqueDomains) {
        await prisma.domainPrice.upsert({
            where: { extension: dp.extension },
            update: { price: dp.price, label: dp.label, description: dp.description, sortOrder: dp.sortOrder },
            create: dp,
        });
    }
    console.log(`✅ ${uniqueDomains.length} domain prices seeded`);

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

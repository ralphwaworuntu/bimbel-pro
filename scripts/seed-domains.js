const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // First, clear all existing domain prices to re-seed fresh
    await prisma.domainPrice.deleteMany({});
    console.log('Cleared existing domain prices.');

    const domains = [
        // Row 1
        { extension: '.web.id', label: 'Promo Domain .web.id', description: 'Domain page untuk kebutuhan website secara general dan umum.', price: 50000, promoPrice: 20000, promoActive: true, sortOrder: 1 },
        { extension: '.id', label: 'Promo Domain .id', description: 'Punya domain dengan ekstensi terpopuler untuk website di seluruh Indonesia.', price: 500000, promoPrice: 300000, promoActive: true, sortOrder: 2 },

        // Row 2
        { extension: '.biz.id', label: 'Promo Domain .biz.id', description: 'Pilih domain dengan ekstensi domain Indonesia yang terjangkau untuk UKM dan UMKM.', price: 35000, promoPrice: 9500, promoActive: true, sortOrder: 3 },
        { extension: '.my.id', label: 'Promo Domain .my.id', description: 'Domain yang bisa digunakan untuk kebutuhan website personal atau pribadi.', price: 30000, promoPrice: 9500, promoActive: true, sortOrder: 4 },

        // Row 3
        { extension: '.com', label: 'Promo Domain .com', description: 'Punya domain ekstensi terpopuler untuk segala kebutuhan website Anda.', price: 250000, promoPrice: 180000, promoActive: true, sortOrder: 5 },
        { extension: '.net', label: 'Promo Domain .net', description: 'Domain yang antik untuk website IT, networking, dan komputasi.', price: 250000, promoPrice: 215000, promoActive: true, sortOrder: 6 },

        // Row 4
        { extension: '.org', label: 'Promo Domain .org', description: 'Domain populer untuk kebutuhan yayasan, organisasi, forum, dan perkumpulan.', price: 250000, promoPrice: 150000, promoActive: true, sortOrder: 7 },
        { extension: '.xyz', label: 'Promo Domain .xyz', description: 'Domain dengan registrasi rendah yang cocok untuk segala kebutuhan website.', price: 75000, promoPrice: 38000, promoActive: true, sortOrder: 8 },

        // Row 5
        { extension: '.click', label: 'Promo Domain .click', description: 'Domain unik yang cocok untuk meningkatkan traffic landing website.', price: 75000, promoPrice: 45000, promoActive: true, sortOrder: 9 },
        { extension: '.co', label: 'Promo Domain .co', description: 'Domain yang cocok untuk kebutuhan website bisnis atau perusahaan.', price: 250000, promoPrice: 150000, promoActive: true, sortOrder: 10 },

        // Row 6
        { extension: '.biz', label: 'Promo Domain .biz', description: 'Domain yang cocok untuk kebutuhan website yang menunjukkan profesionalitas tinggi.', price: 350000, promoPrice: 300000, promoActive: true, sortOrder: 11 },
        { extension: '.asia', label: 'Promo Domain .asia', description: 'Domain unik regional Asia-Pasifik.', price: 85000, promoPrice: 55000, promoActive: true, sortOrder: 12 },

        // Row 7
        { extension: '.site', label: 'Promo Domain .site', description: 'Domain unik untuk bisnis, atau portofolio yang fleksibel dan profesional.', price: 75000, promoPrice: 30000, promoActive: true, sortOrder: 13 },
        { extension: '.online', label: 'Promo Domain .online', description: 'Cocok untuk bisnis proses digital, cocok untuk toko, blog, atau portofolio.', price: 75000, promoPrice: 30000, promoActive: true, sortOrder: 14 },

        // Row 8
        { extension: '.cc', label: 'Promo Domain .cc', description: 'Fleksibel dan terjangkau, cocok untuk komunitas, penjualan, atau startup kecil.', price: 350000, promoPrice: 250000, promoActive: true, sortOrder: 15 },
        { extension: '.info', label: 'Promo Domain .info', description: 'Cocok untuk situs informatif, panduan, atau sumber informasi.', price: 125000, promoPrice: 85000, promoActive: true, sortOrder: 16 },

        // Row 9
        { extension: '.top', label: 'Promo Domain .top', description: 'Merupakan rangkaian ideal untuk website bisnis, situs, dan partner lain.', price: 75000, promoPrice: 45000, promoActive: true, sortOrder: 17 },
        { extension: '.pw', label: 'Promo Domain .pw', description: 'Domain terjangkau, cocok untuk bisnis, startup, atau proyek pribadi.', price: 75000, promoPrice: 45000, promoActive: true, sortOrder: 18 },

        // Row 10
        { extension: '.cloud', label: 'Promo Domain .cloud', description: 'Cocok untuk layanan berbasis cloud, teknologi, atau situs digital.', price: 65000, promoPrice: 39900, promoActive: true, sortOrder: 19 },
        { extension: '.il.com', label: 'Promo Domain .il.com', description: 'Cocok untuk bisnis teknologi, IT, atau individu dengan branding yang fleksibel.', price: 99000, promoPrice: 65000, promoActive: true, sortOrder: 20 },

        // Row 11
        { extension: '.io', label: 'Promo Domain .io', description: 'Cocok untuk startup teknologi & media digital. ccTLD untuk British Indian Ocean Territory.', price: 999000, promoPrice: 769000, promoActive: true, sortOrder: 21 },
        { extension: '.space', label: 'Promo Domain .space', description: 'Cocok untuk bisnis, komunitas, dan hubungan yang unik dan kreatif tanpa batas.', price: 75000, promoPrice: 40000, promoActive: true, sortOrder: 22 },

        // Row 12
        { extension: '.website', label: 'Promo Domain .website', description: 'Domain untuk situs apa saja, dari bisnis hingga portofolio dengan nama yang jelas dan mudah diingat.', price: 65000, promoPrice: 38000, promoActive: true, sortOrder: 23 },
        { extension: '.store', label: 'Promo Domain .store', description: 'Cocok untuk toko online, menjadikan brand Anda lebih profesional dan mudah dicari.', price: 99000, promoPrice: 60000, promoActive: true, sortOrder: 24 },

        // Row 13
        { extension: '.fun', label: 'Promo Domain .fun', description: 'Domain untuk hiburan, komunitas, dan bisnis yang unik dan kreatif.', price: 99000, promoPrice: 65000, promoActive: true, sortOrder: 25 },
        { extension: '.ac', label: 'Promo Domain .ac', description: 'Domain cocok untuk institusi, bisnis, dan organisasi di Indonesia dengan identitas resmi.', price: 250000, promoPrice: 160000, promoActive: true, sortOrder: 26 },
    ];

    for (const d of domains) {
        await prisma.domainPrice.create({ data: d });
        console.log(`  ✓ ${d.extension.padEnd(10)} Rp ${d.promoPrice.toLocaleString('id-ID').padStart(10)}/thn (asli: Rp ${d.price.toLocaleString('id-ID')})`);
    }

    console.log(`\nDone! Seeded ${domains.length} domain prices.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const domains = [
        { extension: '.com', label: 'Domain .com', description: 'Ekstensi paling populer di dunia', price: 150000, promoPrice: 99000, promoActive: true, sortOrder: 1 },
        { extension: '.id', label: 'Domain .id', description: 'Ekstensi resmi Indonesia', price: 250000, promoPrice: 199000, promoActive: true, sortOrder: 2 },
        { extension: '.co.id', label: 'Domain .co.id', description: 'Untuk perusahaan Indonesia', price: 275000, promoPrice: null, promoActive: false, sortOrder: 3 },
        { extension: '.net', label: 'Domain .net', description: 'Alternatif populer untuk .com', price: 175000, promoPrice: null, promoActive: false, sortOrder: 4 },
        { extension: '.org', label: 'Domain .org', description: 'Untuk organisasi dan komunitas', price: 175000, promoPrice: null, promoActive: false, sortOrder: 5 },
        { extension: '.info', label: 'Domain .info', description: 'Domain untuk website informasi', price: 125000, promoPrice: null, promoActive: false, sortOrder: 6 },
        { extension: '.biz', label: 'Domain .biz', description: 'Domain untuk bisnis', price: 150000, promoPrice: null, promoActive: false, sortOrder: 7 },
        { extension: '.xyz', label: 'Domain .xyz', description: 'Domain modern dan kreatif', price: 99000, promoPrice: 49000, promoActive: true, sortOrder: 8 },
        { extension: '.online', label: 'Domain .online', description: 'Untuk bisnis online', price: 125000, promoPrice: null, promoActive: false, sortOrder: 9 },
        { extension: '.site', label: 'Domain .site', description: 'Domain untuk website', price: 99000, promoPrice: null, promoActive: false, sortOrder: 10 },
    ];

    for (const d of domains) {
        await prisma.domainPrice.upsert({
            where: { extension: d.extension },
            update: d,
            create: d,
        });
        console.log('Seeded:', d.extension);
    }
    console.log('Done! Seeded', domains.length, 'domain prices.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

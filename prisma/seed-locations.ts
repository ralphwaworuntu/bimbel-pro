import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper for concurrency
async function pMap<T, R>(
    array: T[],
    mapper: (item: T) => Promise<R>,
    concurrency: number
): Promise<R[]> {
    const results: R[] = [];
    const active: Promise<any>[] = [];

    for (const item of array) {
        const p = mapper(item).then(res => {
            results.push(res);
            active.splice(active.indexOf(p), 1);
        });
        active.push(p);
        if (active.length >= concurrency) {
            await Promise.race(active);
        }
    }
    await Promise.all(active);
    return results;
}

async function main() {
    console.log('Start seeding locations...');

    // 1. Fetch Provinces
    const provinces = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json').then(r => r.json());
    console.log(`Fetched ${provinces.length} provinces.`);

    for (const p of provinces) {
        await prisma.province.upsert({
            where: { id: p.id },
            create: { id: p.id, name: p.name },
            update: { name: p.name }
        });
    }

    // 2. Fetch Cities (Concurrent)
    console.log('Fetching cities...');
    await pMap(provinces, async (p: any) => {
        const cities = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${p.id}.json`).then(r => r.json());
        for (const c of cities) {
            await prisma.city.upsert({
                where: { id: c.id },
                create: { id: c.id, provinceId: p.id, name: c.name },
                update: { name: c.name }
            });
        }
    }, 1); // Reduced to 1 for SQLite

    // 3. Fetch Districts (Concurrent)
    // Get all cities from DB to ensure we have IDs
    const allCities = await prisma.city.findMany();
    console.log(`Fetching districts for ${allCities.length} cities...`);

    let districtCount = 0;
    await pMap(allCities, async (c) => {
        try {
            const districts = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${c.id}.json`).then(r => r.json());
            for (const d of districts) {
                await prisma.district.upsert({
                    where: { id: d.id },
                    create: { id: d.id, cityId: c.id, name: d.name },
                    update: { name: d.name }
                });
                districtCount++;
            }
        } catch (e) {
            console.error(`Failed to fetch districts for city ${c.id}:`, e);
        }
    }, 1); // Reduced to 1 for SQLite

    console.log(`Seeded ${districtCount} districts. Fetching villages...`);

    // 4. Fetch Villages (Concurrent)
    // Get all districts
    const allDistricts = await prisma.district.findMany();
    console.log(`Fetching villages for ${allDistricts.length} districts...`);

    let villageCount = 0;
    // Increase concurrency slightly?
    await pMap(allDistricts, async (d) => {
        try {
            const villages = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${d.id}.json`).then(r => r.json());
            if (villages.length > 0) {
                await prisma.village.createMany({
                    data: villages.map((v: any) => ({
                        id: v.id,
                        districtId: d.id,
                        name: v.name
                    })),
                    skipDuplicates: true
                });
                villageCount += villages.length;
            }
        } catch (e) {
            console.error(`Failed to fetch villages for district ${d.id}:`, e);
        }
        // Progress log every 500 districts
        if (parseFloat(d.id) % 500 === 0) console.log(`Processed district ${d.id}...`);
    }, 1); // Reduced to 1 for SQLite

    console.log(`Seeded ${villageCount} villages.`);

    // 5. Postal Codes
    console.log('Fetching & Seeding Postal Codes...');
    try {
        const postalData = await fetch('https://raw.githubusercontent.com/ewwink/kode-pos-indonesia/master/kodepos.json').then(r => r.json());
        const entries = Object.entries(postalData);
        console.log(`Found ${entries.length} postal codes to process.`);

        // Parallel insert is risky for SQLite locking? 
        // Prisma manages connection pool.
        // But `DistrictPostalCode` matches.
        // We can pre-fetch all districts into Map for fast lookup.

        // Map: CityId -> [District]
        const districtsByCity = new Map<string, any[]>();
        for (const d of allDistricts) {
            if (!districtsByCity.has(d.cityId)) districtsByCity.set(d.cityId, []);
            districtsByCity.get(d.cityId)?.push(d);
        }

        const postalInserts = [];

        for (const [code, info] of entries) {
            const { bps: cityId, nama: districtName } = info as any;
            // bps is usually City Code.
            // Check map
            const candidates = districtsByCity.get(cityId);
            if (candidates) {
                // Find fuzzy match
                const match = candidates.find(d =>
                    d.name.toLowerCase() === districtName.toLowerCase() ||
                    d.name.toLowerCase().includes(districtName.toLowerCase())
                );

                if (match) {
                    postalInserts.push({
                        code: code,
                        districtId: match.id
                    });
                }
            }
        }

        console.log(`Mapped ${postalInserts.length} postal codes to districts. Inserting...`);

        // Batch insert
        const batchSize = 1000;
        for (let i = 0; i < postalInserts.length; i += batchSize) {
            const batch = postalInserts.slice(i, i + batchSize);
            await prisma.districtPostalCode.createMany({
                data: batch,
                skipDuplicates: true
            });
            if (i % 5000 === 0) console.log(`Inserted ${i} postal codes...`);
        }
    } catch (e) {
        console.error("Failed to seed postal codes", e);
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

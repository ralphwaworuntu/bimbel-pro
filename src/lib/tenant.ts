import { prisma } from './prisma'; // Assuming prisma client is exported from here or similar

export async function getTenant(subdomain: string) {
    const tenant = await prisma.tenant.findUnique({
        where: { subdomain },
        include: {
            order: {
                include: {
                    package: true
                }
            }
        }
    });
    return tenant;
}

export async function getTenantByDomain(domain: string) {
    const tenant = await prisma.tenant.findFirst({
        where: { domain },
        include: {
            order: {
                include: {
                    package: true
                }
            }
        }
    });
    return tenant;
}

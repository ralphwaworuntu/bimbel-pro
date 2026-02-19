import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getCredentialsHtml } from '@/lib/templates';
import bcrypt from 'bcryptjs';

export async function provisionTenant(orderId: string) {
    try {
        // 1. Fetch Order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { package: true },
        });

        if (!order) throw new Error('Order not found');
        if (!order.subdomainRequested) throw new Error('Order does not request a subdomain');

        // 2. Check if Tenant exists
        const existingTenant = await prisma.tenant.findUnique({
            where: { subdomain: order.subdomainRequested },
        });

        if (existingTenant) {
            // Check if it belongs to this order
            if (existingTenant.orderId === orderId) {
                return { success: true, tenant: existingTenant, message: 'Tenant already exists for this order' };
            }
            throw new Error(`Subdomain ${order.subdomainRequested} is already taken`);
        }

        // 3. Create Tenant
        // For MVP, we assume Single DB Multi-Tenant, so we just create the record.
        // In a real isolated setup, we would spin up a new DB here.
        const tenant = await prisma.tenant.create({
            data: {
                orderId: order.id,
                subdomain: order.subdomainRequested,
                brandName: order.brandName,
                ownerName: order.clientName,
                isActive: true,
                config: JSON.stringify({ theme: 'default' }), // Default config
            },
        });

        // 4. Update Order Status
        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'active' },
        });

        // 5. Handle User & Credentials
        // Check if user exists with this email
        let user = await prisma.user.findUnique({ where: { email: order.email } });
        let passwordInfo = 'Gunakan password akun Anda saat mendaftar';
        let generatedPassword = '';

        if (!user) {
            // Create new user if not exists (e.g. order via Admin)
            generatedPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);

            user = await prisma.user.create({
                data: {
                    email: order.email,
                    name: order.clientName,
                    passwordHash: hashedPassword,
                    role: 'client', // New role? Or 'admin' for their tenant?
                },
            });
            passwordInfo = generatedPassword;
        }

        // 6. Send Email
        const dbConfig = await prisma.appConfig.findFirst();
        const appConfig = {
            appName: dbConfig?.appName || 'Bimbel Pro',
            appLogo: dbConfig?.appLogo || '',
            companyName: dbConfig?.companyName || 'PT Bimbel Pro',
            address: dbConfig?.address || '',
            contact: dbConfig ? `${dbConfig.contactEmail || ''} ${dbConfig.contactPhone ? '| ' + dbConfig.contactPhone : ''}` : ''
        };

        const adminUrl = `https://${tenant.subdomain}.bimbelpro.com/admin`; // Mock URL scheme
        const publicUrl = `https://${tenant.subdomain}.bimbelpro.com`;

        const emailHtml = getCredentialsHtml({
            appConfig,
            order,
            credentials: {
                url: publicUrl,
                adminUrl: adminUrl,
                email: order.email,
                password: passwordInfo,
            }
        });

        await sendEmail({
            to: order.email,
            subject: `[${appConfig.appName}] Website Bimbel Anda Telah Aktif!`,
            html: emailHtml,
        });

        return { success: true, tenant };

    } catch (error: any) {
        console.error('Provisioning Error:', error);
        return { success: false, error: error.message };
    }
}

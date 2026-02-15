/**
 * Payment Gateway Abstraction Layer
 * Supports: Midtrans, Xendit, Sandbox (dummy)
 * Admin can configure API keys via admin panel
 */

import prisma from './prisma';

export interface CreatePaymentRequest {
    orderId: string;
    orderNumber: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    description: string;
    paymentType: 'full' | 'dp';
}

export interface PaymentResult {
    success: boolean;
    paymentUrl?: string;
    gatewayRef?: string;
    gatewayName: string;
    error?: string;
}

export interface PaymentGateway {
    name: string;
    createPayment(req: CreatePaymentRequest): Promise<PaymentResult>;
    verifyPayment(gatewayRef: string): Promise<{ paid: boolean; method?: string }>;
}

// ============ SANDBOX (Dummy) ============
class SandboxGateway implements PaymentGateway {
    name = 'sandbox';

    async createPayment(req: CreatePaymentRequest): Promise<PaymentResult> {
        const ref = `SBX-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        return {
            success: true,
            paymentUrl: `/payment/sandbox?ref=${ref}&amount=${req.amount}&order=${req.orderNumber}`,
            gatewayRef: ref,
            gatewayName: this.name,
        };
    }

    async verifyPayment(_gatewayRef: string) {
        return { paid: true, method: 'sandbox' };
    }
}

// ============ MIDTRANS ============
class MidtransGateway implements PaymentGateway {
    name = 'midtrans';
    private serverKey: string;
    private clientKey: string;
    private isProduction: boolean;

    constructor(config: { serverKey: string; clientKey: string; isProduction: boolean }) {
        this.serverKey = config.serverKey;
        this.clientKey = config.clientKey;
        this.isProduction = config.isProduction;
    }

    private get baseUrl() {
        return this.isProduction
            ? 'https://app.midtrans.com/snap/v1'
            : 'https://app.sandbox.midtrans.com/snap/v1';
    }

    async createPayment(req: CreatePaymentRequest): Promise<PaymentResult> {
        try {
            const authString = Buffer.from(`${this.serverKey}:`).toString('base64');
            const response = await fetch(`${this.baseUrl}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${authString}`,
                },
                body: JSON.stringify({
                    transaction_details: {
                        order_id: req.orderNumber,
                        gross_amount: req.amount,
                    },
                    customer_details: {
                        first_name: req.customerName,
                        email: req.customerEmail,
                        phone: req.customerPhone,
                    },
                    callbacks: {
                        finish: `${process.env.NEXTAUTH_URL}/order/${req.orderId}`,
                    },
                }),
            });

            const data = await response.json();

            if (data.token && data.redirect_url) {
                return {
                    success: true,
                    paymentUrl: data.redirect_url,
                    gatewayRef: data.token,
                    gatewayName: this.name,
                };
            }

            return { success: false, gatewayName: this.name, error: data.error_messages?.join(', ') || 'Midtrans error' };
        } catch (err: any) {
            return { success: false, gatewayName: this.name, error: err.message };
        }
    }

    async verifyPayment(gatewayRef: string) {
        try {
            const statusUrl = this.isProduction
                ? 'https://api.midtrans.com/v2'
                : 'https://api.sandbox.midtrans.com/v2';
            const authString = Buffer.from(`${this.serverKey}:`).toString('base64');
            const res = await fetch(`${statusUrl}/${gatewayRef}/status`, {
                headers: { 'Authorization': `Basic ${authString}` },
            });
            const data = await res.json();
            const paidStatuses = ['capture', 'settlement'];
            return {
                paid: paidStatuses.includes(data.transaction_status),
                method: data.payment_type || '',
            };
        } catch {
            return { paid: false };
        }
    }
}

// ============ XENDIT ============
class XenditGateway implements PaymentGateway {
    name = 'xendit';
    private secretKey: string;

    constructor(config: { secretKey: string }) {
        this.secretKey = config.secretKey;
    }

    async createPayment(req: CreatePaymentRequest): Promise<PaymentResult> {
        try {
            const authString = Buffer.from(`${this.secretKey}:`).toString('base64');
            const response = await fetch('https://api.xendit.co/v2/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${authString}`,
                },
                body: JSON.stringify({
                    external_id: req.orderNumber,
                    amount: req.amount,
                    payer_email: req.customerEmail,
                    description: req.description,
                    success_redirect_url: `${process.env.NEXTAUTH_URL}/order/${req.orderId}`,
                    failure_redirect_url: `${process.env.NEXTAUTH_URL}/order/${req.orderId}`,
                }),
            });

            const data = await response.json();

            if (data.id && data.invoice_url) {
                return {
                    success: true,
                    paymentUrl: data.invoice_url,
                    gatewayRef: data.id,
                    gatewayName: this.name,
                };
            }

            return { success: false, gatewayName: this.name, error: data.message || 'Xendit error' };
        } catch (err: any) {
            return { success: false, gatewayName: this.name, error: err.message };
        }
    }

    async verifyPayment(gatewayRef: string) {
        try {
            const authString = Buffer.from(`${this.secretKey}:`).toString('base64');
            const res = await fetch(`https://api.xendit.co/v2/invoices/${gatewayRef}`, {
                headers: { 'Authorization': `Basic ${authString}` },
            });
            const data = await res.json();
            return {
                paid: data.status === 'PAID' || data.status === 'SETTLED',
                method: data.payment_method || '',
            };
        } catch {
            return { paid: false };
        }
    }
}

// ============ FACTORY ============
export async function getActiveGateway(): Promise<PaymentGateway> {
    // Check database config first
    const configs = await prisma.paymentGatewayConfig.findMany({ where: { isActive: true } });
    const activeConfig = configs[0];

    if (activeConfig) {
        const parsed = JSON.parse(activeConfig.config);

        if (activeConfig.gateway === 'midtrans' && parsed.serverKey) {
            return new MidtransGateway({
                serverKey: parsed.serverKey,
                clientKey: parsed.clientKey || '',
                isProduction: parsed.isProduction || false,
            });
        }

        if (activeConfig.gateway === 'xendit' && parsed.secretKey) {
            return new XenditGateway({ secretKey: parsed.secretKey });
        }
    }

    // Fallback: check env vars
    const envGateway = process.env.ACTIVE_PAYMENT_GATEWAY;

    if (envGateway === 'midtrans' && process.env.MIDTRANS_SERVER_KEY) {
        return new MidtransGateway({
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
        });
    }

    if (envGateway === 'xendit' && process.env.XENDIT_SECRET_KEY) {
        return new XenditGateway({ secretKey: process.env.XENDIT_SECRET_KEY });
    }

    // Default: sandbox
    return new SandboxGateway();
}

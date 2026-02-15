export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

export function generateOrderNumber(): string {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const d = now.getDate().toString().padStart(2, '0');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${y}${m}${d}-${rand}`;
}

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: 'Menunggu Pembayaran', color: '#f59e0b' },
    processing: { label: 'Dalam Pengerjaan', color: '#3b82f6' },
    ready: { label: 'Siap Digunakan', color: '#8b5cf6' },
    active: { label: 'Aktif', color: '#10b981' },
    inactive: { label: 'Nonaktif', color: '#ef4444' },
};

export const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: 'Menunggu', color: '#f59e0b' },
    paid: { label: 'Lunas', color: '#10b981' },
    failed: { label: 'Gagal', color: '#ef4444' },
    expired: { label: 'Kadaluarsa', color: '#6b7280' },
};

export const PAYMENT_TYPE_MAP: Record<string, string> = {
    full: 'Pembayaran Penuh',
    dp: 'Down Payment (DP)',
};

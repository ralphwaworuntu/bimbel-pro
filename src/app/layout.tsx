import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Bimbel Pro - Platform Website Bimbel White-Label',
    description: 'Solusi pembuatan website bimbel terlengkap. Pesan website bimbel TNI & POLRI siap pakai dengan fitur tryout online, bank soal, dan manajemen siswa.',
    keywords: 'bimbel, website bimbel, white label, TNI, POLRI, tryout online, bank soal',
    authors: [{ name: 'Bimbel Pro' }],
    openGraph: {
        title: 'Bimbel Pro - Platform Website Bimbel White-Label',
        description: 'Solusi pembuatan website bimbel terlengkap',
        type: 'website',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0a0e1a',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="id">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>
            <body>{children}</body>
        </html>
    );
}

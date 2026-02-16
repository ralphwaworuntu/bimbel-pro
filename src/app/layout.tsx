import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import ScrollAnimation from '@/components/ScrollAnimation';
import ToastProvider from '@/components/ToastProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import RouteProgress from '@/components/RouteProgress';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'BimbelPro - Platform Website Bimbel No.1 untuk TNI & POLRI',
    description: 'Solusi pembuatan website bimbel profesional dengan fitur tryout online, bank soal, dan manajemen siswa. Khusus untuk bimbel TNI, POLRI, dan Kedinasan.',
    keywords: 'website bimbel, buat website bimbel, sistem tryout online, bimbel tni polri, aplikasi bimbel',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'BimbelPro',
    },
};

export const viewport: Viewport = {
    themeColor: '#0a0e1a',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="id">
            <head>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
                <meta name="mobile-web-app-capable" content="yes" />
            </head>
            <body className={inter.className}>
                <AuthProvider>
                    <ThemeProvider>
                        <Suspense fallback={null}>
                            <RouteProgress />
                        </Suspense>
                        <FloatingWhatsApp />
                        <ToastProvider>
                            {children}
                            <ScrollAnimation />
                        </ToastProvider>
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    );
}

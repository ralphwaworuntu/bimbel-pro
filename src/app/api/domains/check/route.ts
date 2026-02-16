import { NextResponse } from 'next/server';

// GET - check domain availability via WhoisXMLAPI
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.WHOIS_API_KEY;

    if (!apiKey || apiKey === 'your_whoisxmlapi_key_here') {
        // Fallback: simulate availability check (for development/demo)
        const isAvailable = !['google.com', 'facebook.com', 'youtube.com', 'twitter.com', 'instagram.com', 'amazon.com', 'apple.com', 'microsoft.com', 'netflix.com', 'bimbelpro.com'].includes(domain.toLowerCase());
        return NextResponse.json({
            domain,
            available: isAvailable,
            source: 'sandbox',
            message: isAvailable ? 'Domain tersedia!' : 'Domain sudah terdaftar',
        });
    }

    try {
        const res = await fetch(
            `https://domain-availability.whoisxmlapi.com/api/v1?apiKey=${apiKey}&domainName=${encodeURIComponent(domain)}&credits=DA`,
            { next: { revalidate: 0 } }
        );

        if (!res.ok) {
            throw new Error(`WhoisXMLAPI returned ${res.status}`);
        }

        const data = await res.json();
        const availability = data?.DomainInfo?.domainAvailability;

        return NextResponse.json({
            domain,
            available: availability === 'AVAILABLE',
            source: 'whoisxmlapi',
            message: availability === 'AVAILABLE' ? 'Domain tersedia!' : 'Domain sudah terdaftar',
            raw: data?.DomainInfo,
        });
    } catch (error) {
        console.error('WhoisXMLAPI error:', error);
        return NextResponse.json(
            { error: 'Gagal memeriksa ketersediaan domain. Coba lagi nanti.' },
            { status: 502 }
        );
    }
}

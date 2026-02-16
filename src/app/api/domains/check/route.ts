import { NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const resolveDns = promisify(dns.resolve);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);
const resolveSoa = promisify(dns.resolveSoa);

/**
 * Perform a comprehensive DNS lookup to check if a domain has ANY records.
 * Returns true if domain has DNS records (meaning it's registered/in-use).
 */
async function hasDnsRecords(domain: string): Promise<{ exists: boolean; details: string[] }> {
    const details: string[] = [];
    const checks = [
        { name: 'A', fn: () => resolve4(domain) },
        { name: 'AAAA', fn: () => resolve6(domain) },
        { name: 'MX', fn: () => resolveMx(domain) },
        { name: 'NS', fn: () => resolveNs(domain) },
        { name: 'SOA', fn: () => resolveSoa(domain) },
    ];

    // Run all DNS lookups in parallel
    const results = await Promise.allSettled(checks.map(c => c.fn()));

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'fulfilled' && result.value) {
            const val = result.value;
            const hasData = Array.isArray(val) ? val.length > 0 : !!val;
            if (hasData) {
                details.push(checks[i].name);
            }
        }
    }

    return { exists: details.length > 0, details };
}

/**
 * Check via RDAP (Registration Data Access Protocol) - free, no API key needed.
 * RDAP is the successor to WHOIS and is provided by registries.
 */
async function checkRdap(domain: string): Promise<{ registered: boolean; source: string } | null> {
    try {
        // Try RDAP bootstrap to find the right server
        const res = await fetch(
            `https://rdap.org/domain/${encodeURIComponent(domain)}`,
            {
                signal: AbortSignal.timeout(5000),
                headers: { 'Accept': 'application/rdap+json' }
            }
        );

        if (res.status === 200) {
            return { registered: true, source: 'rdap' };
        }
        if (res.status === 404) {
            return { registered: false, source: 'rdap' };
        }
        // Other status codes - inconclusive
        return null;
    } catch {
        return null;
    }
}

/**
 * Check domain via WhoisXMLAPI (if API key is configured).
 */
async function checkWhoisApi(domain: string, apiKey: string): Promise<{ registered: boolean; source: string } | null> {
    try {
        const res = await fetch(
            `https://domain-availability.whoisxmlapi.com/api/v1?apiKey=${apiKey}&domainName=${encodeURIComponent(domain)}&credits=DA`,
            { signal: AbortSignal.timeout(8000) }
        );

        if (!res.ok) return null;

        const data = await res.json();
        const availability = data?.DomainInfo?.domainAvailability;

        if (availability === 'AVAILABLE' || availability === 'UNAVAILABLE') {
            return {
                registered: availability === 'UNAVAILABLE',
                source: 'whoisxmlapi',
            };
        }
        return null;
    } catch {
        return null;
    }
}

// GET - check domain availability using DNS + RDAP + optional WhoisXMLAPI
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain')?.toLowerCase().trim();

    if (!domain) {
        return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
    }

    // Basic validation
    const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/;
    if (!domainRegex.test(domain)) {
        return NextResponse.json({
            domain,
            available: false,
            message: 'Format domain tidak valid',
            source: 'validation',
        }, { status: 400 });
    }

    const apiKey = process.env.WHOIS_API_KEY;
    const hasApiKey = apiKey && apiKey !== 'your_whoisxmlapi_key_here';

    // Run all checks in parallel for speed
    const [dnsResult, rdapResult, whoisResult] = await Promise.all([
        hasDnsRecords(domain),
        checkRdap(domain),
        hasApiKey ? checkWhoisApi(domain, apiKey) : Promise.resolve(null),
    ]);

    console.log(`[Domain Check] ${domain}:`, {
        dns: dnsResult,
        rdap: rdapResult?.registered,
        whois: whoisResult?.registered,
    });

    // Decision logic: combine all signals
    const sources: string[] = [];
    let isRegistered = false;

    // 1. DNS records found = definitely registered
    if (dnsResult.exists) {
        isRegistered = true;
        sources.push(`DNS (${dnsResult.details.join(', ')})`);
    }

    // 2. RDAP says registered = definitely registered
    if (rdapResult?.registered === true) {
        isRegistered = true;
        sources.push('RDAP');
    }

    // 3. WhoisXMLAPI says registered = definitely registered
    if (whoisResult?.registered === true) {
        isRegistered = true;
        sources.push('WHOIS');
    }

    // 4. If no signal says it's registered, check if any source gave a definitive "not registered"
    if (!isRegistered) {
        // If RDAP explicitly says not registered (404), that's a strong signal
        if (rdapResult?.registered === false) {
            sources.push('RDAP (not found)');
        }
        // If WhoisXMLAPI says available
        if (whoisResult?.registered === false) {
            sources.push('WHOIS (available)');
        }
        // If DNS found nothing
        if (!dnsResult.exists) {
            sources.push('DNS (no records)');
        }
    }

    // If we have NO successful lookups at all (all failed), be cautious
    const hasAnyResult = dnsResult.exists || rdapResult !== null || whoisResult !== null || !dnsResult.exists;

    if (!hasAnyResult) {
        return NextResponse.json({
            domain,
            available: false,
            message: 'Tidak dapat memeriksa domain saat ini. Coba lagi nanti.',
            source: 'error',
        }, { status: 502 });
    }

    const available = !isRegistered;

    return NextResponse.json({
        domain,
        available,
        source: sources.join(' + '),
        message: available
            ? '✅ Domain tersedia! Anda bisa mendaftarkan domain ini.'
            : '❌ Domain sudah terdaftar dan tidak tersedia.',
        checks: {
            dns: { hasRecords: dnsResult.exists, recordTypes: dnsResult.details },
            rdap: rdapResult ? { registered: rdapResult.registered } : null,
            whois: whoisResult ? { registered: whoisResult.registered } : null,
        },
    });
}

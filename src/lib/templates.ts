
interface EmailTemplateData {
    appConfig: {
        appName: string;
        appLogo: string;
        companyName: string;
        address: string;
        contactEmail?: string;
        contactPhone?: string;
    };
    order?: any;
    payment?: any;
    credentials?: any; // For login info
}

function formatRp(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const baseStyle = `
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6f8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 30px 20px; text-align: center; }
    .logo { max-height: 50px; }
    .content { padding: 40px 30px; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; background: #f97316; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .btn:hover { background: #ea580c; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th { text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #e2e8f0; color: #0f172a; }
    .info-box { background: #f1f5f9; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #3b82f6; }
    .highlight { color: #f97316; font-weight: bold; }
    h1 { color: #0f172a; margin-top: 0; font-size: 24px; }
    h2 { color: #334155; font-size: 18px; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    p { margin-bottom: 15px; }
`;

export function getInvoiceHtml(data: EmailTemplateData) {
    const { appConfig, order } = data;
    const logoUrl = appConfig.appLogo.startsWith('http') ? appConfig.appLogo : `https://bimbel-pro-demo.vercel.app${appConfig.appLogo}`; // Fallback host

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>${baseStyle}</style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logoUrl}" alt="${appConfig.appName}" class="logo">
            </div>
            <div class="content">
                <h1>Invoice #${order.orderNumber}</h1>
                <p>Halo <strong>${order.clientName}</strong>,</p>
                <p>Terima kasih telah memesan layanan pembuatan website bimbel di <strong>${appConfig.appName}</strong>. Berikut adalah rincian pesanan Anda:</p>

                <div class="info-box">
                    <p style="margin:0"><strong>Status:</strong> <span style="color:${order.status === 'active' ? '#22c55e' : '#f59e0b'}">${order.status.toUpperCase()}</span></p>
                    <p style="margin:5px 0 0"><strong>Tanggal:</strong> ${new Date(order.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th>Layanan</th>
                            <th style="text-align:right">Harga</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>Paket ${order.package.name}</strong><br>
                                <span style="font-size:12px;color:#64748b">Website Bimbel Pro Tier ${order.package.tier}</span>
                            </td>
                            <td style="text-align:right">${formatRp(order.package.price)}</td>
                        </tr>
                        ${order.domainRequested ? `
                        <tr>
                            <td>
                                <strong>Domain (${order.domainRequested})</strong><br>
                                <span style="font-size:12px;color:#64748b">Biaya registrasi domain per tahun</span>
                            </td>
                            <td style="text-align:right">Termasuk / Extra</td> 
                        </tr>
                        ` : ''}
                        <tr class="total-row">
                            <td>Total Pembayaran</td>
                            <td style="text-align:right">${formatRp(order.package.price)}</td> 
                        </tr>
                    </tbody>
                </table>

                ${order.status === 'pending' ? `
                    <p>Silakan selesaikan pembayaran Anda agar kami dapat segera memproses website Anda.</p>
                    <center>
                        <a href="#" class="btn">💳 Bayar Sekarang</a>
                    </center>
                ` : `
                    <p>Pembayaran Anda telah kami terima. Tim kami sedang memproses website Anda.</p>
                `}
                
                <p style="margin-top: 30px;">Jika ada pertanyaan, jangan ragu untuk menghubungi kami.</p>
            </div>
            <div class="footer">
                <p style="margin:0"><strong>${appConfig.companyName}</strong></p>
                <p style="margin:5px 0">${appConfig.address}</p>
                <p style="margin:5px 0">${appConfig.contactEmail || ''} ${appConfig.contactPhone ? '| ' + appConfig.contactPhone : ''}</p>
                <p style="margin-top:15px">&copy; ${new Date().getFullYear()} ${appConfig.appName}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function getCredentialsHtml(data: EmailTemplateData) {
    const { appConfig, order, credentials } = data;
    const logoUrl = appConfig.appLogo.startsWith('http') ? appConfig.appLogo : `https://bimbel-pro-demo.vercel.app${appConfig.appLogo}`; // Fallback

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>${baseStyle}</style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logoUrl}" alt="${appConfig.appName}" class="logo">
            </div>
            <div class="content">
                <h1>Website Anda Siap! 🚀</h1>
                <p>Halo <strong>${order.clientName}</strong>,</p>
                <p>Selamat! Website bimbel Anda <strong>${order.brandName}</strong> sudah aktif dan siap digunakan.</p>

                <div class="info-box">
                    <p style="margin:0 0 10px"><strong>URL Website:</strong> <br><a href="${credentials.url}" style="font-size:18px;color:#3b82f6;text-decoration:none">${credentials.url}</a></p>
                    <p style="margin:0 0 10px"><strong>Admin Panel:</strong> <br><a href="${credentials.adminUrl}" style="color:#3b82f6">${credentials.adminUrl}</a></p>
                </div>

                <h2>Detail Login Admin</h2>
                <div style="background:#f8fafc;padding:20px;border-radius:6px;border:1px dashed #cbd5e1">
                    <p style="margin:0 0 10px"><strong>Email:</strong> ${credentials.email}</p>
                    <p style="margin:0"><strong>Password Sementara:</strong> <span style="background:#e2e8f0;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:16px">${credentials.password}</span></p>
                </div>

                <p style="margin-top:20px;font-size:13px;color:#64748b">
                    ⚠️ Demi keamanan, mohon segera ganti password Anda setelah login pertama kali.
                </p>

                <center>
                    <a href="${credentials.adminUrl}" class="btn">Login ke Dashboard Admin</a>
                </center>
            </div>
            <div class="footer">
                <p style="margin:0"><strong>${appConfig.companyName}</strong></p>
                <p style="margin:5px 0">${appConfig.address}</p>
                <p style="margin-top:15px">&copy; ${new Date().getFullYear()} ${appConfig.appName}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

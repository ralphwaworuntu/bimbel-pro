# Bimbel Pro PWA 🚀

**Bimbel Pro** is a comprehensive Progressive Web App (PWA) designed for tutoring businesses ("Bimbel"). It serves as a white-label platform allowing clients to order their own bimbel websites, while providing a powerful admin panel for management.

## ✨ Features

### 🌍 Public Side
- **Landing Page**: Modern, responsive design with hero section, features, portfolio, and pricing.
- **Order Wizard**: 5-step guided flow for clients to order a website:
  1.  **Select Package**: Choose from Basic, Pro, or Premium tiers.
  2.  **Business Data**: Input owner and brand details.
  3.  **Domain Selection**: Subdomain or custom domain.
  4.  **Payment**: Full payment or Down Payment (DP) options.
  5.  **Confirmation**: Success page with order tracking.
- **Order Tracking**: Check order status via Order ID (Timeline view).
- **Sandbox Payment**: Simulation page for testing payment flows.

### 🔐 Admin Panel
- **Dashboard**: Real-time overview of revenue, orders, and traffic (Chart.js).
- **Order Management**: View, filter, and update order statuses (Pending, Processing, Ready, Active).
- **Tenant Management**: Manage ordered websites (tenants), toggle activation.
- **Payments**: Track transaction history and revenue.
- **Traffic Analytics**: Monitor page views per tenant.
- **Gateway Configuration**: Manage API keys for Midtrans and Xendit directly from the UI.

### 📱 PWA & Tech
- **Installable**: `manifest.json` and Service Worker for "Add to Home Screen" capability.
- **Offline Support**: Basic caching strategies.
- **Responsive**: Fully optimized for Mobile, Tablet, and Desktop.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Variables, Glassmorphism, Dark Theme)
- **Database**: SQLite (Dev) / PostgreSQL (Prod ready)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Charts**: Chart.js + react-chartjs-2
- **Payment**: Custom abstraction layer (Midtrans, Xendit, Sandbox)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ralphwaworuntu/bimbel-pro.git
    cd bimbel-pro
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Database**
    ```bash
    # Push schema to database
    npx prisma db push

    # Seed initial data (Admin user, Packages, etc.)
    npx tsx prisma/seed.ts
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

    > **Network Access**: To access from other devices on the same WiFi, use:
    > `npm run dev -- --hostname 0.0.0.0` available at `http://YOUR_LOCAL_IP:3000`

## 🔑 Default Credentials

**Admin Panel**: [http://localhost:3000/login](http://localhost:3000/login)

- **Email**: `admin@bimbelpro.com`
- **Password**: `admin123`

## 📂 Project Structure

```bash
bimbel-pro/
├── prisma/
│   ├── schema.prisma      # Database Schema
│   └── seed.ts            # Seed Data
├── public/                # Static assets & PWA files
├── src/
│   ├── app/
│   │   ├── admin/         # Admin Panel Routes
│   │   ├── api/           # Backend API Routes
│   │   ├── order/         # Order Wizard Routes
│   │   └── globals.css    # Global Styles (Design System)
│   ├── components/        # Reusable Components
│   └── lib/               # Utilities (Auth, Payment, Prisma)
└── ...
```

## 📜 License

MIT

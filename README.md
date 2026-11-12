# ZUVI — Anti-Tarnish Jewelry Storefront

Live at **[zuvis.in](https://zuvis.in)**

Built and maintained by **[Chitranjan Vikram Singh](https://github.com/chitranjanvrd-win)** for **ZUVI** (founded by **Anant Pratap Singh**).

A fast, single-product e-commerce storefront featuring the flagship **Imperial Emerald Ring** (18k vacuum-plated gold with dual emerald stones). Designed for mobile-first speed, real-world social proof, and frictionless UPI checkout.

---

## Features

- **Multi-Angle Product Inspector:** Interactive view switcher showcasing high-resolution studio angles (`Top View`, `Front Angle`, `Side Profile`, `Stone Detail`).
- **IMS Ghaziabad Event Proof:** Embedded HTML5 video player and fullscreen reel modal highlighting live student try-ons and 80+ units sold in 2 hours.
- **Direct UPI Checkout Flow:** Validated shipping form (10-digit mobile & 6-digit pincode checks), QR code payment screen, and automated order capture via Web3Forms.
- **Responsive Dark Aesthetic:** Built with deep emerald, slate, and gold accents optimized for campus and mobile traffic.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Form & Order Capture:** Web3Forms API
- **Deployment:** Vercel (`zuvis.in`)

---

## Project Structure

```text
zuvi-store/
├── public/
│   ├── images/          # Product photos (ring1.jpeg - ring4.jpeg) & UPI QR (qr.png)
│   └── videos/          # IMS Ghaziabad event reels (video1.mp4 - video3.mp4)
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx     # Main storefront, inspector, reels & UPI checkout modal
│   └── components/
│       └── SmoothScroll.tsx
└── package.json

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

/**
 * Font configuration for the application
 */
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: {
    default: 'Logiker Menza - Online rendelés',
    template: '%s | Logiker Menza'
  },
  description:
    'Rendelje meg étkezését kényelmesen online. Friss, minőségi ételek a Logiker Menzából. Gyors kiszolgálás, biztonságos fizetés.',
  keywords: [
    'menza',
    'étterem',
    'online rendelés',
    'étel rendelés',
    'Logiker',
    'ebéd',
    'vacsora',
    'gyorsétterem'
  ],
  authors: [{ name: 'Logiker Menza' }],
  creator: 'Logiker Menza',
  publisher: 'Logiker Menza',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://canteen.kenderesi.hu'
  ),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'hu_HU',
    url: '/',
    siteName: 'Logiker Menza',
    title: 'Logiker Menza - Online rendelés',
    description:
      'Rendelje meg étkezését kényelmesen online. Friss, minőségi ételek a Logiker Menzából.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Logiker Menza'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Logiker Menza - Online rendelés',
    description:
      'Rendelje meg étkezését kényelmesen online. Friss, minőségi ételek a Logiker Menzából.',
    images: ['/og-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/site.webmanifest'
};

/**
 * Root Layout Component
 * Sets up HTML structure, fonts, and global scripts
 * Includes Cloudflare Turnstile script for CAPTCHA functionality
 */
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}

        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Script from "next/script";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.sarahlawsonimports.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sarah Lawson Imports | Premium Quality Mannequins & Home Essentials in Ghana",
    template: "%s | Sarah Lawson Imports"
  },
  description: "Ghana's trusted source for premium quality mannequins, home essentials, electronics, and fashion. Sourced directly from China with verified quality. Fast delivery across Ghana.",
  keywords: [
    "Sarah Lawson Imports",
    "Mannequins Ghana",
    "Home Essentials Ghana", 
    "China Sourcing Ghana",
    "Electronics Ghana",
    "Wholesale Ghana",
    "Premium Quality Products",
    "Fashion Accessories Ghana",
    "Buy Mannequins Online Ghana",
    "Accra Shopping"
  ],
  authors: [{ name: "Sarah Lawson" }],
  creator: "Sarah Lawson",
  publisher: "Sarah Lawson Imports",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/sarahlawson.png',
    apple: '/sarahlawson.png',
  },
  verification: {
    // Add your Google Search Console verification code here
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: siteUrl,
    title: "Sarah Lawson Imports | Premium Quality Mannequins & Home Essentials in Ghana",
    description: "Ghana's trusted source for premium quality mannequins, home essentials, electronics, and fashion. Direct from China with fast delivery.",
    siteName: "Sarah Lawson Imports",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sarah Lawson Imports - Premium Quality Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarah Lawson Imports | Premium Quality in Ghana",
    description: "Ghana's trusted source for mannequins, home essentials & electronics. Fast delivery!",
    images: ["/og-image.jpg"],
    creator: "@sarahlawsonimports",
  },
  alternates: {
    canonical: siteUrl,
  },
};

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Sarah Lawson Imports",
              "url": "https://www.sarahlawsonimports.com",
              "logo": "https://www.sarahlawsonimports.com/sarahlogo.png",
              "description": "Ghana's trusted source for premium quality mannequins, home essentials, electronics, and fashion.",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "GH",
                "addressLocality": "Accra"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": "English"
              }
            })
          }}
        />
      </head>
      
      {/* Google Analytics */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
      
      <body className="antialiased font-sans overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-6 focus:py-3 focus:bg-emerald-700 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <CartProvider>
          <WishlistProvider>
            <div id="main-content">
              {children}
            </div>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

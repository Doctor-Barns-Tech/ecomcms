import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://standardstore.vercel.app'),
  title: {
    default: "Sarah Lawson Imports | Premium Quality, Unbeatable Prices",
    template: "%s | Sarah Lawson Imports"
  },
  description: "Your trusted source for verified quality mannequins, home essentials, electronics, and fashion. Sourced directly from China by Sarah Lawson.",
  keywords: ["Sarah Lawson Imports", "Mannequins", "China Sourcing", "Electronics", "Home Essentials", "Premium Quality", "Wholesale"],
  authors: [{ name: "Sarah Lawson" }],
  creator: "Sarah Lawson",
  publisher: "Sarah Lawson Imports",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/sarahlawson.png',
    apple: '/sarahlawson.png',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://standardstore.vercel.app",
    title: "Sarah Lawson Imports | Premium Quality, Unbeatable Prices",
    description: "Shop verified quality mannequins, home essentials, electronics, and fashion. Direct from source.",
    siteName: "Sarah Lawson Imports",
    images: [
      {
        url: "/sarah-lawson.jpeg",
        width: 1200,
        height: 630,
        alt: "Sarah Lawson Imports",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarah Lawson Imports",
    description: "Premium quality products, sourced with care.",
    images: ["/sarah-lawson.jpeg"],
  },
};

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
      </head>
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

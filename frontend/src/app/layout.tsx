import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";
import "../styles/globals.css";
import { generateMetadata, generateViewport } from "../lib/generateMetadata";
import ClientLayout from "./components/layout/ClientLayout";

// Font configurations
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// PWA and app metadata
export const metadata = generateMetadata();
export const viewport = generateViewport();

// PWA manifest and icon links
const PWAMetaTags = () => (
  <>
    <link rel="manifest" href="/pwa/manifest.json" />
    <link rel="apple-touch-icon" href="/pwa/icons/apple-icon-180.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="4SYZ - B2B" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="msapplication-TileColor" content="#3b82f6" />
    <meta name="msapplication-tileimage" content="/pwa/icons/manifest-icon-192.maskable.png" />
  </>
);

// Favicon and icon links
const IconLinks = () => (
  <>
    <link rel="icon" type="image/png" sizes="196x196" href="/pwa/icons/favicon-196.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/pwa/icons/favicon-196.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/pwa/icons/favicon-196.png" />
    <link rel="mask-icon" href="/pwa/icons/icon.svg" color="#3b82f6" />
  </>
);

// External font and icon resources
const ExternalResources = () => (
  <>
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Geist:wght@700&display=swap"
      rel="stylesheet"
    />
  </>
);

// Main layout component
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <PWAMetaTags />
        <IconLinks />
        <ExternalResources />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

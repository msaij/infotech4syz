import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/(access-providers)/auth-context";
import { PWAInstallPrompt, ServiceWorkerRegistration } from "./components/pwa";
import { generateMetadata, generateViewport } from "./utils/generateMetadata";
import { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Generate metadata dynamically from manifest.json
export const metadata = generateMetadata();
export const viewport = generateViewport();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <html lang="en">
        <head>
          <link rel="manifest" href="/pwa/manifest.json" />
          <link rel="apple-touch-icon" href="/pwa/icons/apple-icon-180.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="4SYZ - B2B" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-TileColor" content="#3b82f6" />
          <meta name="msapplication-tileimage" content="/pwa/icons/manifest-icon-192.maskable.png" />
          <link rel="icon" type="image/png" sizes="196x196" href="/pwa/icons/favicon-196.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/pwa/icons/favicon-196.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/pwa/icons/favicon-196.png" />
          <link rel="mask-icon" href="/pwa/icons/icon.svg" color="#3b82f6" />
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
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <PWAInstallPrompt />
          <ServiceWorkerRegistration />
        </body>
      </html>
    </AuthProvider>
  );
}

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Toaster } from 'sonner';
import Link from 'next/link';
import Script from 'next/script';
import ClarityAnalytics from '@/components/ClarityAnalytics';
// import { ClientAuthCheck } from '@/components/ClientAuthCheck';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Image Detector',
  description: 'Detect if an image is AI-generated or real.',
  icons: {
    icon: '/applogoo.png',
    shortcut: '/applogoo.png',
    apple: '/applogoo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col h-full`}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17342336520"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17342336520');
          `}
        </Script>

        {/* Microsoft Clarity */}
        <ClarityAnalytics />

        <AuthProvider>
          <Header />
          {/* <ClientAuthCheck> */}
            <main className="flex-grow">{children}</main>
          {/* </ClientAuthCheck> */}
          <Toaster richColors />
          <footer className="bg-white border-t mt-auto">
            <div className="container mx-auto py-6 px-4 flex flex-col sm:flex-row justify-between items-center">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <span className="text-xl font-bold bg-clip-text text-transparent animate-text-gradient">
                  AI Image or Not
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  © {new Date().getFullYear()} All Rights Reserved.
                </p>
              </div>
              <div className="flex space-x-4">
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition">
                  Terms
                </Link>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition">
                  Privacy
                </Link>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
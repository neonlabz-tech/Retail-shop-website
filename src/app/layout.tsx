import type { Metadata } from 'next';
import { Albert_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { SearchDrawer } from '@/features/search/components/SearchDrawer';
import { QuickViewModal } from '@/features/quickview/components/QuickViewModal';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { CompareBar } from '@/components/shared/CompareBar';
// import { NewsletterPopup } from '@/components/shared/NewsletterPopup';

const albertSans = Albert_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-albert-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={albertSans.variable}>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />

          {/* Global overlays */}
          <MobileBottomNav />
          <CartDrawer />
          <SearchDrawer />
          <QuickViewModal />
          <CompareBar />
          <WhatsAppButton />
          {/* <NewsletterPopup /> */}
        </Providers>
      </body>
    </html>
  );
}

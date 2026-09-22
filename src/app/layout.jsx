import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/redux/StoreProvider';
import Snackbar from '@/components/ui/Snackbar';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'QuickBuy — Fast & Smart Shopping',
  description:
    'QuickBuy is a modern e-commerce platform with lightning-fast checkout, personalized recommendations, and seamless order management.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* LCP: Preconnect to image CDN for faster first image load */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      </head>
      <body>
        <StoreProvider>
          {children}
          <Snackbar />
        </StoreProvider>
      </body>
    </html>
  );
}

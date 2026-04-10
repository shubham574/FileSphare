import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FileSphere — Free Online PDF Tools',
  description:
    'A powerful suite of free online PDF tools. Merge, split, compress, convert, rotate, watermark, and add page numbers to your PDFs — fast and secure.',
  keywords: ['PDF tools', 'merge PDF', 'split PDF', 'compress PDF', 'PDF to Word', 'online PDF editor'],
  openGraph: {
    title: 'FileSphere — Free Online PDF Tools',
    description: 'Merge, split, compress, convert and edit PDFs for free.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#080c14] text-white antialiased min-h-screen">
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

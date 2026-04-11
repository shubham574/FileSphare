import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

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
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background antialiased min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

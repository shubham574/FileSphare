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
  title: 'FileSphere — All-in-One PDF, Image & Video Tools',
  description:
    'A powerful suite of free online tools. Merge, split, compress, and convert PDFs, Images, and Videos — fast, free, and secure.',
  keywords: ['PDF tools', 'image compression', 'video converter', 'image converter', 'video compression', 'merge PDF', 'split PDF'],
  openGraph: {
    title: 'FileSphere — All-in-One File Processing',
    description: 'Merge, split, compress, and convert PDFs, Images, and Videos for free.',
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

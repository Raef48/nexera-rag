import type { ReactNode } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Nexera Labs - Dental Clinic AI',
  description: 'AI-powered dental clinic assistant for appointment booking and patient support.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 px-4 py-4 md:px-8 md:py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}


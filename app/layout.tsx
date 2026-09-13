// app/layout.tsx - Mission Control Layout with Tailwind + Sidebar
import './globals.css';
import type { Metadata } from 'next';
import Sidebar from './components/Sidebar';

export const metadata: Metadata = {
  title: 'Mission Control — Hermes',
  description: 'Hermes Operations Dashboard',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="m-0 p-0 flex min-h-screen bg-white antialiased">
        <Sidebar />
        <main className="flex-1 lg:ml-56 min-h-screen p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </main>
      </body>
    </html>
  );
}

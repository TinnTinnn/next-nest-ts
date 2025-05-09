import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/sidebar-provider';
import { Sidebar } from '@/components/sidebar';
import { UserProvider } from '@/context/UserContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className={inter.className}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <UserProvider>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1">{children}</div>
          </div>
        </SidebarProvider>
      </UserProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}

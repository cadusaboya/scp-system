"use client";

import "./globals.css";
import '@mantine/core/styles.css';
import Sidebar from "@/components/layout/sidebar";
import { MantineProvider } from "@mantine/core";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex">
        <MantineProvider>
          <Sidebar />
          <main className="flex-1 p-6 bg-gray-50 min-h-screen">{children}</main>
        </MantineProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import Sidebar from "@/components/layout/sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">{children}</main>
      </body>
    </html>
  );
}

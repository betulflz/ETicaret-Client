import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // <-- 1. Bunu import et
import { AppNavbar } from "@/components/AppNavbar";
import { AppFooter } from "@/components/AppFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TeknoStore E-Ticaret",
  description: "En iyi teknolojik ürünler",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr"> 
      <body className={inter.className + " bg-[#fafbfc] text-gray-900 antialiased"}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <AppNavbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">
              {children}
            </main>
            <AppFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}

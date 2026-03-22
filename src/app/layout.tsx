import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "App Pitcher — Marketing Command Center",
  description: "AI-powered marketing automation for Land to Yield and Professional Scheduler",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex h-full flex-col bg-background text-foreground lg:flex-row">
        <TooltipProvider>
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          {/* Mobile nav */}
          <MobileNav />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">{children}</div>
          </main>
        </TooltipProvider>
      </body>
    </html>
  );
}
